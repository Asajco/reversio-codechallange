import { NextResponse } from "next/server";
import {
  ORDER_LOOKUP_QUERY,
  RETURN_CREATE_MUTATION,
  RETURN_GET_QUERY,
  RETURNABLE_FULFILLMENTS_QUERY,
} from "./graphql";
import type {
  OrderLookupResponse,
  ReturnCreateResponse,
  ReturnLookupResponse,
  ReturnableFulfillmentsResponse,
} from "@/lib/types/returns-api";
import { ShopifyApiError, shopifyAdminRequest } from "@/lib/shopify";
import { normalizeEmail, validateReturnRequest } from "@/lib/validation";

function orderEmail(order: NonNullable<OrderLookupResponse["order"]>) {
  return order.email ?? order.customer?.email ?? null;
}

function lineItemSnapshot(node: {
  quantity: number;
  fulfillmentLineItem: {
    id: string;
    lineItem: { name: string } | null;
  };
}) {
  const item = node.fulfillmentLineItem;
  return {
    name: item.lineItem?.name ?? "Unknown item",
    fulfillmentLineItemId: item.id,
    availableQuantity: node.quantity,
  };
}

export async function POST(request: Request) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Request body must be valid JSON.",
      },
      { status: 400 },
    );
  }

  const fields =
    typeof rawBody === "object" && rawBody !== null
      ? (rawBody as Record<string, unknown>)
      : {};

  const validation = validateReturnRequest({
    orderId: typeof fields.orderId === "string" ? fields.orderId : undefined,
    customerEmail:
      typeof fields.customerEmail === "string"
        ? fields.customerEmail
        : undefined,
  });

  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Order ID and customer email are required.",
        details: { fieldErrors: validation.fieldErrors },
      },
      { status: 400 },
    );
  }

  const { normalizedOrderId, customerEmail } = validation.data;

  try {
    const { order } = await shopifyAdminRequest<OrderLookupResponse>(
      ORDER_LOOKUP_QUERY,
      { id: normalizedOrderId },
    );

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found in Shopify." },
        { status: 404 },
      );
    }

    const shopifyEmail = orderEmail(order);
    if (!shopifyEmail) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Order found, but Shopify did not return an email to verify against.",
          orderName: order.name,
          details: {
            orderId: order.id,
            lineItems: order.lineItems.nodes,
          },
        },
        { status: 409 },
      );
    }

    if (normalizeEmail(shopifyEmail) !== customerEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer email does not match the Shopify order email.",
          orderName: order.name,
          matchedEmail: shopifyEmail,
        },
        { status: 409 },
      );
    }

    const fulfillments =
      await shopifyAdminRequest<ReturnableFulfillmentsResponse>(
        RETURNABLE_FULFILLMENTS_QUERY,
        { orderId: normalizedOrderId },
      );

    const line = fulfillments.returnableFulfillments.edges
      .flatMap((f) =>
        f.node.returnableFulfillmentLineItems.edges.map((e) => e.node),
      )
      .find((n) => n.quantity > 0) ?? null;
    if (!line) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No returnable fulfillment line items were found for this order.",
          orderName: order.name,
          matchedEmail: shopifyEmail,
          details: fulfillments,
        },
        { status: 409 },
      );
    }

    const { returnCreate } = await shopifyAdminRequest<ReturnCreateResponse>(
      RETURN_CREATE_MUTATION,
      {
        returnInput: {
          orderId: normalizedOrderId,
          notifyCustomer: false,
          returnLineItems: [
            {
              fulfillmentLineItemId: line.fulfillmentLineItem.id,
              quantity: 1,
              returnReason: "UNKNOWN",
            },
          ],
        },
      },
    );

    const created = returnCreate.return;
    if (!created || returnCreate.userErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Shopify rejected the return creation request.",
          orderName: order.name,
          matchedEmail: shopifyEmail,
          selectedLineItem: lineItemSnapshot(line),
          userErrors: returnCreate.userErrors,
        },
        { status: 422 },
      );
    }

    let returnId = created.id;
    let returnName: string | null = null;
    let status = created.status;
    let orderName = created.order?.name ?? order.name;

    try {
      const { return: fresh } = await shopifyAdminRequest<ReturnLookupResponse>(
        RETURN_GET_QUERY,
        { id: created.id },
      );
      if (fresh) {
        returnId = fresh.id;
        returnName = fresh.name;
        status = fresh.status;
        orderName = fresh.order?.name ?? orderName;
      }
    } catch {
      // Create mutation already gave us id/status; lookup is only for display fields.
    }

    return NextResponse.json(
      {
        success: true,
        message: "Shopify return created successfully.",
        orderName,
        matchedEmail: shopifyEmail,
        returnId,
        returnName,
        status,
        selectedLineItem: lineItemSnapshot(line),
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ShopifyApiError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          details: error.details,
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected server error occurred while creating the return.",
      },
      { status: 500 },
    );
  }
}
