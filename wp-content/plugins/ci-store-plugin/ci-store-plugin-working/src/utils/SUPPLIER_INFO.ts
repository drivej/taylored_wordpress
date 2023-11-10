import { lookup } from './lookup';

interface ISupplier {
  name: string;
  key: string;
  supplierClass: string;
  auth: string;
  api: string;
}

export enum SupplierKey {
  WPS = 'WPS'
}

export const SUPPLIER: Record<SupplierKey, ISupplier> = {
  [SupplierKey.WPS]: {
    name: 'Western Power Sports',
    key: SupplierKey.WPS,
    supplierClass: 'WooDropship\\Suppliers\\Western',
    auth: 'Bearer aybfeye63PtdiOsxMbd5f7ZAtmjx67DWFAQMYn6R',
    api: 'http://api.wps-inc.com'
  }
};

export const lookupSupplierClass = lookup(
  Object.keys(SUPPLIER).map((k) => SUPPLIER[k]),
  'supplierClass'
);
