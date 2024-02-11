type BoolInt = 0 | 1;

export const CATEGORY_DELETE = 'DELETE';

type IWooProductType = 'variable' | 'variation' | 'simple' | 'grouped' | 'external';

export interface IWooProductCSV {
  // ID: string;
  Type: IWooProductType; //'variable' | 'variation' | 'simple';
  SKU: string;
  Name: string;
  Published: BoolInt;
  'Is featured?': BoolInt;
  'Visibility in catalog': 'visible' | 'hidden';
  'Short description': string;
  Description: string;
  'Date sale price starts': string;
  'Date sale price ends': string;
  'Tax status': 'taxable' | '';
  'Tax class': string;
  'In stock?': BoolInt;
  Stock: number;
  'Low stock amount': number;
  'Backorders allowed?': BoolInt;
  'Sold individually?': BoolInt;
  'Weight (lbs)': number;
  'Length (in)': number;
  'Width (in)': number;
  'Height (in)': number;
  'Allow customer reviews?': BoolInt;
  'Purchase note': string;
  'Sale price': number;
  'Regular price': number;
  Categories: string;
  Tags: string;
  'Shipping class': string;
  Images: string;
  'Download limit': string;
  'Download expiry days': string;
  Parent: string;
  'Grouped products': string;
  Upsells: string;
  'Cross-sells': string;
  'External URL': string;
  'Button text': string;
  Position: number;
  'Attribute 1 name': string;
  'Attribute 1 value(s)': string;
  'Attribute 1 visible': BoolInt;
  'Attribute 1 global': BoolInt;
  'Attribute 1 default': string;
  'Attribute 2 name': string;
  'Attribute 2 value(s)': string;
  'Attribute 2 visible': BoolInt;
  'Attribute 2 global': BoolInt;
  'Attribute 2 default': string;
  'Attribute 3 name': string;
  'Attribute 3 value(s)': string;
  'Attribute 3 visible': BoolInt;
  'Attribute 3 global': BoolInt;
  'Attribute 3 default': string;
  'Attribute 4 name': string;
  'Attribute 4 value(s)': string;
  'Attribute 4 visible': BoolInt;
  'Attribute 4 global': BoolInt;
  'Attribute 4 default': string;
  'Attribute 5 name': string;
  'Attribute 5 value(s)': string;
  'Attribute 5 visible': BoolInt;
  'Attribute 5 global': BoolInt;
  'Attribute 5 default': string;
  'Attribute 6 name': string;
  'Attribute 6 value(s)': string;
  'Attribute 6 visible': BoolInt;
  'Attribute 6 global': BoolInt;
  'Attribute 6 default': string;
  'Meta: _supplier_class': string;
  'Meta: _wc_additional_variation_images': string;
  'Meta: _ci_additional_images': string;
  'Meta: _ci_data': string;
}

export const WooProductDefault: IWooProductCSV = {
  // ID: '0',
  Type: 'simple',
  SKU: '0',
  Name: 'Product Name',
  Published: 1,
  'Is featured?': 0,
  'Visibility in catalog': 'visible',
  'Short description': '',
  Description: '',
  'Date sale price starts': '',
  'Date sale price ends': '',
  'Tax status': 'taxable',
  'Tax class': 'parent',
  'In stock?': 1,
  Stock: 10,
  'Low stock amount': 0,
  'Backorders allowed?': 0,
  'Sold individually?': 1,
  'Weight (lbs)': null,
  'Length (in)': null,
  'Width (in)': null,
  'Height (in)': null,
  'Allow customer reviews?': 1,
  'Purchase note': null,
  'Sale price': null,
  'Regular price': 0,
  Categories: '',
  Tags: '',
  'Shipping class': null,
  Images: '',
  'Download limit': null,
  'Download expiry days': null,
  Parent: '',
  'Grouped products': '',
  Upsells: null,
  'Cross-sells': null,
  'External URL': null,
  'Button text': null,
  Position: 0,
  'Attribute 1 name': '',
  'Attribute 1 value(s)': '',
  'Attribute 1 visible': null,
  'Attribute 1 global': null,
  'Attribute 1 default': '',
  'Attribute 2 name': '',
  'Attribute 2 value(s)': '',
  'Attribute 2 visible': null,
  'Attribute 2 global': null,
  'Attribute 2 default': '',
  'Attribute 3 name': '',
  'Attribute 3 value(s)': '',
  'Attribute 3 visible': null,
  'Attribute 3 global': null,
  'Attribute 3 default': '',
  'Attribute 4 name': '',
  'Attribute 4 value(s)': '',
  'Attribute 4 visible': null,
  'Attribute 4 global': null,
  'Attribute 4 default': '',
  'Attribute 5 name': '',
  'Attribute 5 value(s)': '',
  'Attribute 5 visible': null,
  'Attribute 5 global': null,
  'Attribute 5 default': '',
  'Attribute 6 name': '',
  'Attribute 6 value(s)': '',
  'Attribute 6 visible': null,
  'Attribute 6 global': null,
  'Attribute 6 default': '',
  'Meta: _supplier_class': 'WooDropshipSuppliersWestern',
  'Meta: _wc_additional_variation_images': null,
  'Meta: _ci_additional_images': '',
  'Meta: _ci_data': ''
};

export const WooProductDeleteDefaults: Partial<IWooProductCSV> = {
  Published: 0,
  'Is featured?': 0,
  'Visibility in catalog': 'hidden',
  Categories: CATEGORY_DELETE,
  'In stock?': 0,
  Stock: 0
};
/*

WOO API

*/
export interface IWooParams extends Partial<IWooProduct> {
  // [key: string]: string | number;
  page?: number;
  offset?: number;
  per_page?: number;
  _fields?: string;
  force?: boolean;
  update?: Partial<IWooProduct | IWooVariation>[];
  delete?: unknown;
  create?: Partial<IWooProduct | IWooVariation | IWooCategory>[];
}

export interface IWooProduct {
  error?: { code: string; message: string; data?: { resource_id: number; status: number; unique_sku: string } };
  attributes: IWooVariableAttribute[]; // variable
  average_rating: string;
  backordered: boolean;
  backorders_allowed: boolean;
  backorders: string;
  button_text: string;
  catalog_visibility: 'visible' | 'hidden';
  categories: IWooCategory[];
  cross_sell_ids: number[];
  date_created_gmt: string;
  date_created: string;
  date_modified_gmt: string;
  date_modified: string;
  date_on_sale_from_gmt: any;
  date_on_sale_from: any;
  date_on_sale_to_gmt: any;
  date_on_sale_to: any;
  default_attributes: string[];
  description: string;
  dimensions: IWooDimensions;
  download_expiry: number;
  download_limit: number;
  downloadable: boolean;
  downloads: any[];
  external_url: string;
  featured: boolean;
  grouped_products: number[];
  has_options: boolean;
  id: number;
  images: IWooImage[];
  low_stock_amount: number;
  manage_stock: boolean;
  menu_order: number;
  meta_data: IWooMetaData[];
  name: string;
  on_sale: boolean;
  parent_id: number;
  permalink: string;
  post_password: string;
  price_html: string;
  price: string;
  purchasable: boolean;
  purchase_note: string;
  rating_count: number;
  regular_price: number | string; // why in the ever loving FUCK is price a string?!! Fuck you WooCommerce. Fuck it.
  related_ids: number[];
  reviews_allowed: boolean;
  sale_price: number | string;
  shipping_class_id: number;
  shipping_class: string;
  shipping_required: boolean;
  shipping_taxable: boolean;
  short_description: string;
  sku: string;
  slug: string;
  sold_individually: boolean;
  status: string;
  stock_quantity: number;
  // stock_status: 'in_stock' | 'on_backorder' | 'out_of_stock';
  stock_status: 'instock' | 'onbackorder' | 'outofstock';
  tags: IWooTag[];
  tax_class: string;
  tax_status: string;
  total_sales: number;
  type: IWooProductType;
  upsell_ids: number[];
  variations: number[];
  virtual: boolean;
  weight: string;
  _links: IWooLinks;
}

export interface IWooVariation extends Omit<IWooProduct, 'attributes'> {
  attributes: IWooVariationAttribute[];
  image: IWooImage;
  _ci_additional_images: string[];
  _ci_data: string;
}

export interface IWooSimpleProduct extends Omit<IWooProduct, 'attributes'> {
  image: IWooImage;
  _ci_data: string;
}

export interface IWooVariationAttribute {
  id: number;
  name: string;
  option: string;
}

export interface IWooVariableAttribute {
  id: number;
  name: string;
  options: string[];
  position: number;
  variation: boolean;
  visible: boolean;
}

export interface IWooDimensions {
  length: string;
  width: string;
  height: string;
}

export interface IWooImage {
  id: number;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  src: string;
  name: string;
  alt: string;
}

export interface IWooMetaData {
  id?: number;
  key: string;
  value: string;
}

export interface IWooLinks {
  self: IWooSelf[];
  collection: IWooCollection[];
  up: IWooUp[];
}

export interface IWooSelf {
  href: string;
}

export interface IWooCollection {
  href: string;
}

export interface IWooUp {
  href: string;
}

export interface IWooTag {
  id: number;
  name: string;
  slug: string;
}

export interface IWooCategory {
  id: number;
  name: string;
  slug: string;
  parent: number; //
  description: string; //
  display: string; // default,
  image: string;
  menu_order: number;
  count: number;
  _links: {
    self: { href: string }[];
    collection: { href: string }[];
  };
  meta_data: IWooMetaData[];
  acf: {
    supplier_id: string;
    supplier_key: string;
  };
}
