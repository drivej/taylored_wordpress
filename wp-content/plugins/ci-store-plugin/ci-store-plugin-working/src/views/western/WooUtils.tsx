import { IWooMetaData, IWooProduct, WooProductDefault } from './IWoo';

export const WooColumnKeys = Object.keys(WooProductDefault);

const convertWooProductToCSVRow = (data: IWooProduct, columnKeys: string[]) => {
  return columnKeys
    .map((k) => {
      if (Object.prototype.hasOwnProperty.call(data, k)) {
        if (typeof data[k] === 'string') {
          return `"${data[k].replace(/"/g, '""')}"`;
        }
        if (data[k] === null) {
          return '';
        }
        return data[k];
      }
      return '';
    })
    .join();
};

const sortProductType = (a: IWooProduct, b: IWooProduct) => {
  const av = a.Type === 'variable';
  const bv = b.Type === 'variable';
  return av && !bv ? -1 : !av && bv ? 1 : 0;
};

export const convertWooProductsToCSV = (data: IWooProduct[], columnKeys: string[] = WooColumnKeys) => {
  return [columnKeys.map((k) => `"${k}"`).join(','), ...data.sort(sortProductType).map((r) => convertWooProductToCSVRow(r, columnKeys))].join('\n');
};

export const getWooMetaValue = (product: { meta_data?: IWooMetaData[] }, key: string) => {
  return product?.meta_data.find((m) => m.key === key)?.value;
};
