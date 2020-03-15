export const getMarket = /* GraphQL */ `
  query GetMarket($id: ID!) {
    getMarket(id: $id) {
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