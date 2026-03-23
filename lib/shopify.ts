import { createAdminApiClient } from "@shopify/admin-api-client";
import { ApiVersion } from "@shopify/shopify-api";

const SHOPIFY_API_VERSION = ApiVersion.October25;

type ShopifyClientError = {
  networkStatusCode?: number;
  message?: string;
  graphQLErrors?: unknown[];
};

type ShopifyClientResponse<T> = {
  data?: T;
  errors?: unknown;
};

export class ShopifyApiError extends Error {
  status: number;
  details?: unknown;

  constructor(
    message: string,
    options?: {
      status?: number;
      details?: unknown;
    },
  ) {
    super(message);
    this.name = "ShopifyApiError";
    this.status = options?.status ?? 500;
    this.details = options?.details;
  }
}

function normalizeShopDomain(domain: string) {
  return domain.trim().replace(/^https?:\/\//, "").split("/")[0] ?? "";
}

function isShopifyClientError(error: unknown): error is ShopifyClientError {
  return typeof error === "object" && error !== null;
}

function getErrorStatusCode(error: ShopifyClientError) {
  return typeof error.networkStatusCode === "number" &&
    error.networkStatusCode >= 400 &&
    error.networkStatusCode < 600
    ? error.networkStatusCode
    : 502;
}

function getShopifyConfig() {
  const shopDomain = process.env.SHOPIFY_SHOP_DOMAIN?.trim();
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN?.trim();

  if (!shopDomain || !accessToken) {
    throw new ShopifyApiError(
      "Missing Shopify environment variables. Add SHOPIFY_SHOP_DOMAIN and SHOPIFY_ACCESS_TOKEN to .env.local.",
    );
  }

  return {
    shopDomain: normalizeShopDomain(shopDomain),
    accessToken,
  };
}

export const createClient = (accessToken: string, storeDomain: string) =>
  createAdminApiClient({
    accessToken,
    storeDomain: normalizeShopDomain(storeDomain),
    apiVersion: SHOPIFY_API_VERSION,
    retries: 1,
  });

export async function shopifyAdminRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const { shopDomain, accessToken } = getShopifyConfig();
  const client = createClient(accessToken, shopDomain);
  let response: ShopifyClientResponse<T>;

  try {
    response = await client.request<T>(query, {
      variables,
    });
  } catch (error) {
    throw new ShopifyApiError(
      "Unable to reach Shopify. Check the shop domain, access token, and network connectivity.",
      {
        status: 502,
        details: error instanceof Error ? error.message : String(error),
      },
    );
  }

  if (response.errors) {
    const errorDetails = isShopifyClientError(response.errors)
      ? response.errors.graphQLErrors ?? response.errors
      : response.errors;

    throw new ShopifyApiError(
      isShopifyClientError(response.errors) && response.errors.message
        ? response.errors.message
        : "Shopify client request failed.",
      {
        status: isShopifyClientError(response.errors)
          ? getErrorStatusCode(response.errors)
          : 502,
        details: errorDetails,
      },
    );
  }

  if (!response.data) {
    throw new ShopifyApiError("Shopify GraphQL returned no data.", {
      status: 502,
      details: response,
    });
  }

  return response.data;
}

export { SHOPIFY_API_VERSION };
