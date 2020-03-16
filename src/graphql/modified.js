export const getMarket = /* GraphQL */ `
  query GetMarket($id: ID!) {
    getMarket(id: $id) {
      id
      name
      products(sortDirection: DESC, limit: 999) {
        items {
          id
          description
          price
          shipped
          owner
          createdAt
          file {
            key
          }
        }
        nextToken
      }
      tags
      owner
      createdAt
    }
  }
`;

export const searchMarkets = /* GraphQL */ `
  query SearchMarkets(
    $filter: SearchableMarketFilterInput
    $sort: SearchableMarketSortInput
    $limit: Int
    $nextToken: String
  ) {
    searchMarkets(
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        name
        products {
          items {
            id
            description
            price
            shipped
            owner
            createdAt
            file {
              key
            }
          }
          nextToken
        }
        tags
        owner
        createdAt
      }
      nextToken
      total
    }
  }
`;

export const listMarkets = /* GraphQL */ `
  query ListMarkets(
    $filter: ModelMarketFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMarkets(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        products {
          items {
            id
            description
            price
            shipped
            owner
            createdAt
            file {
              bucket
              region
              key
            }
          }
          nextToken
        }
        tags
        owner
        createdAt
      }
      nextToken
    }
  }
`;

export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      userName
      email
      registered
      orders(sortDirection: DESC, limit: 999) {
        items {
          id
          createdAt
          product {
            id
            owner
            price
            createdAt
            description
          }
          shippingAddress {
            city
            country
            address_line1
            address_state
            address_zip
          }
        }
        nextToken
      }
    }
  }
`;