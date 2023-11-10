// https://www.wps-inc.com/data-depot/v4/api/introduction

import { ProductVariation } from '../../components/woo/Product';
import { IWooVariation } from './IWoo';

export interface IWesternParams {
  [key: string]: string | number | boolean;
  'page[size]'?: string | number;
  'page[cursor]'?: string;
  countOnly?: boolean | string;
  ids?: string;
  route?: string;
  path?: string;
  include?: string;
}

export interface IWesternAPIQuery {
  service: string;
  pageSize: number;
  pageCursor: string;
  countOnly: boolean;
  ids: number[];
  route: string;
  path: string;
  include: string;
}

export interface IWesternProduct {
  id: number;
  designation_id: string;
  name: string;
  alternate_name: string;
  care_instructions: string;
  description: string;
  sort: string;
  image_360_id: string;
  image_360_preview_id: string;
  size_chart_id: string;
  created_at: string;
  updated_at: string;
}

export interface IWesternItem {
  id: number;
  brand_id: number;
  country_id: number;
  product_id: string;
  sku: string;
  name: string;
  list_price: string;
  standard_dealer_price: string;
  supplier_product_id: string;
  length: number;
  width: number;
  height: number;
  weight: number;
  upc: string;
  superseded_sku: string;
  status_id: IWesternItemStatus;
  status: IWesternItemStatus;
  unit_of_measurement_id: number;
  has_map_policy: boolean;
  sort: number;
  created_at: string;
  updated_at: string;
  published_at: string;
}

export interface IWesternInventory {
  id: number;
  item_id: number;
  sku: string;
  ca_warehouse: number;
  ga_warehouse: number;
  id_warehouse: number;
  in_warehouse: number;
  pa_warehouse: number;
  pa2_warehouse: number;
  tx_warehouse: number;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface IWesternItemExt extends IWesternItem {
  woo: Pick<IWooVariation, 'date_modified' | 'sku' | 'id'>;
  images: { data: IWesternImage[] };
  inventory: { data: IWesternInventory };
  attributevalues: { data: IWesternAttributeKey[] };
  taxonomyterms: { data: IWesternTaxonomyTerm[] };
}

export enum IWesternItemStatus {
  DIR = 'DIR', //'DIRECT SHIP FROM VENDOR', // available
  DSC = 'DSC', //'DISCONTINUED ITEM', // NOT available
  CLO = 'CLO', //'CLOSEOUT ITEM', // available
  NA = 'NA', //'NOT AVAILABLE AT THIS TIME', // NOT available
  NEW = 'NEW', //'NEW ITEM', // available
  NLA = 'NLA', //'NO LONGER AVAILABLE', // NOT available
  PRE = 'PRE', //'PRE -RELEASE ITEM (CONTACT REP TO ORDER)', // NOT available
  SPEC = 'SPEC', //'SPECIAL ORDER', // available
  STK = 'STK' //'STANDARD STOCKING ITEM' // available
}

export const stockStatusMap: Record<IWesternItemStatus, ProductVariation['stock_status']> = {
  [IWesternItemStatus.DIR]: 'instock',
  [IWesternItemStatus.DSC]: 'outofstock',
  [IWesternItemStatus.CLO]: 'instock',
  [IWesternItemStatus.NA]: 'outofstock',
  [IWesternItemStatus.NEW]: 'instock',
  [IWesternItemStatus.NLA]: 'outofstock',
  [IWesternItemStatus.PRE]: 'outofstock',
  [IWesternItemStatus.SPEC]: 'instock',
  [IWesternItemStatus.STK]: 'instock'
};

export interface IWesternAttributeKey {
  id: number;
  attributekey_id: number;
  name: string;
  sort: number;
  created_at: string;
  updated_at: string;
}

export interface IWesternImage {
  id: number;
  domain: string;
  path: string;
  filename: string;
  alt: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  signature: string;
  created_at: string;
  updated_at: string;
  parentItemId: number;
}

export interface IWesternFeature {
  id: number;
  product_id: number;
  icon_id: string;
  sort: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface IWesternCursor {
  current: string;
  prev: string;
  next: string;
  count: number;
}

export interface IWesternResponse<D> {
  data: D;
  meta: {
    cursor?: IWesternCursor;
  };
  query: IWesternAPIQuery;
  message?: string;
  status_code?: number;
  error?: { message?: string; status_code?: number };
}

export interface IWesternProductExt extends IWesternProduct {
  woo: Pick<IWooVariation, 'date_modified' | 'sku' | 'id'>;
  attributekeys: { data: IWesternAttributeKey[] };
  attributevalues: { data: string[] };
  items: {
    data: IWesternItemExt[];
    validItemsCount: number;
  };
  features: { data: IWesternFeature[] };
}

export interface IWesternError {
  message: string;
  status_code: string;
  cacheCreated?: string;
}

export interface IWesternTaxonomyTerm {
  __path?: string[];
  id: number;
  vocabulary_id: number;
  parent_id: number;
  name: string;
  slug: string;
  description: null;
  link: null;
  link_target_blank: boolean;
  left: number;
  right: number;
  depth: number;
  created_at: string;
  updated_at: string;
  vocabulary: {
    data: {
      id: number;
      name: string;
      description: string;
      created_at: string;
      updated_at: string;
    };
  };
}
