export const PRODUCT_FIELDS = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    updatedAt
    productType
    vendor
    tags
    availableForSale
    options {
      name
    }
    featuredImage {
      url
      altText
    }
    images(first: 8) {
      nodes {
        url
        altText
      }
    }
    collections(first: 10) {
      nodes {
        handle
      }
    }
    variants(first: 100) {
      nodes {
        id
        title
        sku
        availableForSale
        price {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
        image {
          url
          altText
        }
      }
    }
  }
`;

export const PRODUCTS_PAGE_QUERY = /* GraphQL */ `
  ${PRODUCT_FIELDS}
  query ProductsPage($cursor: String) {
    products(first: 100, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...ProductFields
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  ${PRODUCT_FIELDS}
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductFields
    }
  }
`;

export const COLLECTIONS_QUERY = /* GraphQL */ `
  query CollectionsPage($cursor: String) {
    collections(first: 50, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        handle
        title
        description
      }
    }
  }
`;

export const COLLECTION_BY_HANDLE_QUERY = /* GraphQL */ `
  ${PRODUCT_FIELDS}
  query CollectionByHandle($handle: String!, $cursor: String) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(first: 100, after: $cursor) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          ...ProductFields
        }
      }
    }
  }
`;

export const SEARCH_PRODUCTS_QUERY = /* GraphQL */ `
  query SearchProducts($query: String!) {
    search(first: 50, query: $query, types: PRODUCT, unavailableProducts: SHOW) {
      nodes {
        ... on Product {
          handle
        }
      }
    }
  }
`;
