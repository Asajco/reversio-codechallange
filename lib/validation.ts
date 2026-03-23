export type ReturnRequestInput = {
  orderId?: string;
  customerEmail?: string;
};

export type ReturnRequestFieldErrors = {
  orderId?: string;
  customerEmail?: string;
};

type ReturnRequestValidationResult =
  | {
      success: true;
      data: {
        orderId: string;
        normalizedOrderId: string;
        customerEmail: string;
      };
    }
  | {
      success: false;
      fieldErrors: ReturnRequestFieldErrors;
    };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizeOrderId(orderId: string) {
  const trimmed = orderId.trim();

  if (/^gid:\/\/shopify\/Order\/\d+$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d+$/.test(trimmed)) {
    return `gid://shopify/Order/${trimmed}`;
  }

  return null;
}

export function validateReturnRequest(
  input: ReturnRequestInput,
): ReturnRequestValidationResult {
  const orderId = input.orderId?.trim() ?? "";
  const customerEmail = input.customerEmail?.trim() ?? "";
  const fieldErrors: ReturnRequestFieldErrors = {};

  if (!orderId) {
    fieldErrors.orderId = "Order ID is required.";
  } else if (!normalizeOrderId(orderId)) {
    fieldErrors.orderId =
      "Use a numeric Shopify order ID or a full gid://shopify/Order/... value.";
  }

  if (!customerEmail) {
    fieldErrors.customerEmail = "Customer email is required.";
  } else if (!EMAIL_PATTERN.test(customerEmail)) {
    fieldErrors.customerEmail = "Enter a valid email address.";
  }

  if (fieldErrors.orderId || fieldErrors.customerEmail) {
    return {
      success: false,
      fieldErrors,
    };
  }

  return {
    success: true,
    data: {
      orderId,
      normalizedOrderId: normalizeOrderId(orderId)!,
      customerEmail: normalizeEmail(customerEmail),
    },
  };
}
