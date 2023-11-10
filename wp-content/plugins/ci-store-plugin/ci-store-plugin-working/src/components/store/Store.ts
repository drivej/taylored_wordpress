import * as JsSearch from 'js-search';

export const users = new Set<User>();

export class Product {
  attributes: ProductAttribute[] = [];
  images: string[];
  name: string;
  description: string;
  id: string;
  items: ProductItem[];
  haystack: string = '';

  constructor(config: Partial<Product>) {
    Object.assign(this, config);
    this.haystack = [
      this.name, //
      this.description,
      this.id,
      ...this.attributes.map((a) => a.name),
      ...this.attributes.map((a) => a.values)
    ]
      .join(' ')
      .toLowerCase();
  }
}

export class ProductItem {
  productId: string;
  sku: string;
  attributes: Record<string, string> = {};
  images: string[];

  constructor(config: Partial<ProductItem>) {
    Object.assign(this, config);
  }
}

export class ItemAttribute {
  name: string;
  value: string;
}

export class ProductAttribute {
  name: string;
  values: { id: string; name: string }[];
}

export class User {
  id: string;
  cart: Cart = new Cart();
  firstname: string;
  lastname: string;
  address: string;
  city: string;
  state: string;
  email: string;

  constructor(config: Partial<User>) {
    Object.assign(this, config);
  }
}

export class Cart {
  items: CartItem[] = [];

  add(item: ProductItem) {
    this.items.push(new CartItem({ sku: item.sku }));
  }

  remove(item: ProductItem) {
    this.items = this.items.filter((i) => i.sku !== item.sku);
  }
}

export class CartItem extends Product {
  sku: string;
  quantity = 1;

  constructor(config: Partial<CartItem>) {
    super(config);
    Object.assign(this, config);
  }
}

export class Store {
  products: Product[];
  cart: Cart = new Cart();
  lookupProduct: Record<string, Product> = {};
  lookupItem: Record<string, ProductItem> = {};

  constructor(config: Partial<Store>) {
    Object.assign(this, config);

    const e = new JsSearch.Search('sku');
    e.indexStrategy = new JsSearch.AllSubstringsIndexStrategy();
    e.addIndex('haystack');
  }

  search(term: string) {}
}
