# Shopify Return Creator

Small take-home project built with Next.js, TypeScript, and the App Router.

The app lets a user enter:

- Order ID
- Customer Email

It then calls an internal server-side API route that:

1. Looks up the Shopify order
2. Verifies the submitted email matches the order email
3. Queries Shopify for returnable fulfillment line items
4. Creates a Shopify return for the first eligible line item

## Why Next.js

Next.js was a good fit here because it gives:

- App Router pages for the form and result screens
- A built-in route handler for the server-side Shopify mutation
- A clean client/server boundary so Shopify credentials stay private
- A very small amount of setup for a simple interview project

## What Was Implemented

- `app/page.tsx`
  Simple form with inline validation
- `app/return/page.tsx`
  Result screen that reads search params and renders the return flow
- `app/api/returns/route.ts`
  Server-side POST endpoint that communicattes to Shopify
- `lib/shopify.ts`
  Shopify GraphQL helper built on `@shopify/admin-api-client`
- `lib/validation.ts`
  Shared validation for client and server
- `.env.example`
  Placeholder environment variables
- `README.md`
  Setup, assumptions, and limitations

## Setup

1. Install dependencies:

```bash
pnpm install
```

This project now depends on:

- `@shopify/admin-api-client`
- `@shopify/shopify-api`

2. Copy the example env file into `.env.local` and fill in real values:

```bash
cp .env.example .env.local
```

3. Required environment variables:

- `SHOPIFY_SHOP_DOMAIN`
  Example: `your-store.myshopify.com`
- `SHOPIFY_ACCESS_TOKEN`
  Shopify Admin API access token for the store
  I've used the ENV you've provided

4. Start the app:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## How It Works

1. The form validates the order ID and email in the browser.
2. The app navigates to `/return?orderId=...&email=...`.
3. The result page posts those values to `POST /api/returns`.
4. The API route:
   - validates the payload again
   - fetches the order by ID
   - checks the order email
   - fetches `returnableFulfillments`
   - picks the first returnable fulfillment line item
   - calls `returnCreate`
   - looks up the created return with the Shopify Admin API client
5. The UI shows success details or a clean error state with expandable raw details.

## Assumptions

- Order ID input is a numeric Shopify order ID or a full `gid://shopify/Order/...` value.
- Email matching is enforced. If the submitted email does not match Shopify's order email, the return is not created.
- The return is created for the first eligible returnable fulfillment line item only.
- The return quantity is fixed to `1`.
- `notifyCustomer` is set to `false` to keep the demo simple and avoid sending email from this flow.
- The app uses Shopify's official Admin API client with `ApiVersion.October25` (`2025-10`) because that is the version requested for the custom app token flow.

## Limitations

- This is intentionally minimal and does not include authentication or merchant-specific access control.
- There is no order preview or line-item picker before creating the return.
- It does not calculate return financials before calling `returnCreate`.
- It does not support exchanges, restocking fees, return shipping fees, or custom return reasons.
- The UI only targets one return line item instead of letting the user choose quantity or multiple items, i was a bit confused if i should return whole order or just single item.
- Some Shopify return behavior can vary by store configuration, permissions, and API version.

## Error Handling Covered

- Missing order ID
- Invalid order ID format
- Missing customer email
- Invalid email format
- Invalid JSON request body
- Missing Shopify environment variables
- Shopify network/API failures
- Order not found
- Missing Shopify order email
- Customer email mismatch
- No returnable fulfillment line items
- `returnCreate` user errors
- Unexpected server errors

## Creating A Test Order

You can create a test order with any GraphQL client such as Altair or Yaak.

Set the header:

- `X-Shopify-Access-Token: <your access token>`

In Altair, use auth type `API Key`, set the header name to `X-Shopify-Access-Token`, and use the app access token as the value.

Example mutation:

```graphql
mutation createSimpleOrder {
  orderCreate(
    order: {
      financialStatus: PAID
      fulfillmentStatus: FULFILLED
      lineItems: [
        {
          productId: "gid://shopify/Product/9195039260908"
          quantity: 1
          requiresShipping: true
          priceSet: { shopMoney: { amount: "629.95", currencyCode: USD } }
        }
      ]
      transactions: [
        {
          kind: SALE
          status: SUCCESS
          amountSet: { shopMoney: { amount: "629.95", currencyCode: USD } }
          gateway: "manual"
        }
      ]
      fulfillment: {
        locationId: "gid://shopify/Location/91152417004"
        trackingCompany: "manual"
        trackingNumber: "manual123"
        notifyCustomer: false
      }
    }
  ) {
    order {
      id
      name
      displayFinancialStatus
      displayFulfillmentStatus
    }
    userErrors {
      field
      message
    }
  }
}
```

## With More Time

- Create order from the client
- Add an order lookup confirmation step before creating the return
- Let the user pick which returnable line item to return
- Let the user choose quantity and return reason
- Add stronger idempotency protection for repeated submissions
- Add lightweight loading skeletons and slightly better UX polish
