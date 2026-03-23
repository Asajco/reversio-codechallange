export const ORDER_LOOKUP_QUERY = `
  query OrderLookup($id: ID!) {
    order(id: $id) {
      id
      name
      email
      customer {
        email
      }
      lineItems(first: 10) {
        nodes {
          id
          name
          quantity
        }
      }
    }
  }
`;

export const RETURNABLE_FULFILLMENTS_QUERY = `
  query ReturnableFulfillments($orderId: ID!) {
    returnableFulfillments(orderId: $orderId, first: 10) {
      edges {
        node {
          id
          returnableFulfillmentLineItems(first: 20) {
            edges {
              node {
                quantity
                fulfillmentLineItem {
                  id
                  lineItem {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const RETURN_CREATE_MUTATION = `
  mutation CreateReturn($returnInput: ReturnInput!) {
    returnCreate(returnInput: $returnInput) {
      return {
        id
        status
        order {
          id
          name
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const RETURN_GET_QUERY = `
  query ReturnGet($id: ID!) {
    return(id: $id) {
      id
      name
      status
      order {
        id
        name
      }
    }
  }
`;
