export type ShopifyUserError = {
  field: string[] | null;
  message: string;
};

export type OrderLookupResponse = {
  order: {
    id: string;
    name: string;
    email: string | null;
    customer: {
      email: string | null;
    } | null;
    lineItems: {
      nodes: Array<{
        id: string;
        name: string;
        quantity: number;
      }>;
    };
  } | null;
};

export type ReturnableFulfillmentsResponse = {
  returnableFulfillments: {
    edges: Array<{
      node: {
        id: string;
        returnableFulfillmentLineItems: {
          edges: Array<{
            node: {
              quantity: number;
              fulfillmentLineItem: {
                id: string;
                lineItem: {
                  id: string;
                  name: string;
                } | null;
              };
            };
          }>;
        };
      };
    }>;
  };
};

export type ReturnCreateResponse = {
  returnCreate: {
    return: {
      id: string;
      status: string | null;
      order: {
        id: string;
        name: string;
      } | null;
    } | null;
    userErrors: ShopifyUserError[];
  };
};

export type ReturnLookupResponse = {
  return: {
    id: string;
    name: string | null;
    status: string | null;
    order: {
      id: string;
      name: string;
    } | null;
  } | null;
};
