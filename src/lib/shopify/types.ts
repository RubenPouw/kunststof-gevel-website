export type ShopifyMoney = {
  amount: string;
  currencyCode: string;
};

export type ShopifyImage = {
  url: string;
  altText: string | null;
};

export type ShopifySelectedOption = {
  name: string;
  value: string;
};

export type ShopifyVariant = {
  id: string;
  title: string;
  sku: string | null;
  availableForSale: boolean;
  price: ShopifyMoney;
  selectedOptions: ShopifySelectedOption[];
  image: ShopifyImage | null;
};

export type ShopifyProduct = {
  handle: string;
  title: string;
  description: string;
  productType: string;
  vendor: string;
  tags: string[];
  availableForSale: boolean;
  options: { name: string }[];
  featuredImage: ShopifyImage | null;
  images: { nodes: ShopifyImage[] };
  variants: { nodes: ShopifyVariant[] };
};

export type ShopifyCollection = {
  handle: string;
  title: string;
  description: string;
  products: { nodes: ShopifyProduct[] };
};

export type ShopifyPageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};
