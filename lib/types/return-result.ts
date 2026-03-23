export type ReturnUserError = {
  field?: string[] | null;
  message: string;
};

export type ReturnApiResponse = {
  success: boolean;
  message: string;
  returnId?: string;
  returnName?: string | null;
  status?: string | null;
  orderName?: string;
  matchedEmail?: string | null;
  selectedLineItem?: {
    name: string;
    fulfillmentLineItemId: string;
    availableQuantity: number;
  };
  userErrors?: ReturnUserError[];
  details?: unknown;
};

export type CachedResponse = {
  status: number;
  body: ReturnApiResponse;
};

export type ResultState = {
  status: "loading" | "success" | "error";
  result: ReturnApiResponse | null;
};

export type ReturnResultProps = {
  orderId: string;
  customerEmail: string;
};
