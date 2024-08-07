import { wooKeys } from './consts.js';
import { ProductType, TuckerProduct } from './TuckerProduct.js';

interface TuckerProductsOptions {
  imageRoot?: string;
}

export type ImportReport = { product: TuckerProduct; note: string }[];

interface IRepair {
  match(p: TuckerProduct): boolean;
  repair(p: TuckerProduct): unknown;
  note: string;
}

const RepairMap: IRepair[] = [
  {
    match: (p) => /Hydration Bladder/.test(p.properties.type),
    repair: (p) => (p.properties.type = 'hydration bladder'),
    note: 'Fixed Hydration Bladder type values'
  },
  {
    match: (p) => /Helmet Replacement Parts/.test(p.properties.product_name),
    repair: (p) => {
      p.properties.product_name = `Helmet Replacement ${p.properties.type}`;
      p.properties.style = '';
    },
    note: 'Combine Helmet Parts into variations by type'
  },
  {
    match: (p) => /Youth Helmet Replacement Parts/.test(p.properties.product_name),
    repair: (p) => {
      p.properties.product_name = `Youth Helmet Replacement ${p.properties.type}`;
      p.properties.style = '';
    },
    note: 'Combine Youth Helmet Parts into variations by type'
  },
  {
    match: (p) => /(1.5 liter)|(1.5L)/.test(p.properties.size),
    repair: (p) => (p.properties.size = '1.5 L'),
    note: 'Size values for 1.5 L normalized'
  },
  {
    match: (p) => /(3 liter)|(3L)/.test(p.properties.size),
    repair: (p) => (p.properties.size = '3 L'),
    note: 'Size values for 3 L normalized'
  },
  {
    match: (p) => /Banner/.test(p.properties.product_name),
    repair: (p) => (p.properties.size = '3 L'),
    note: 'Combined Banners'
  },
  {
    match: (p) => p.sku == '446128' && p.properties.image_main.indexOf('446128AR1YthBoldVsrMatWht') > -1,
    repair: (p) => (p.properties.image_main = p.properties.image_main.replace('446128AR1YthBoldVsrMatWht', '446124AR1YthBoldVsrMatBlk')),
    note: 'Matte Black visor needs correct image'
  },
  {
    match: (p) => p.sku == '446124' && p.properties.image_main.indexOf('446124AR1YthBoldVsrMatBlk') > -1,
    repair: (p) => (p.properties.image_main = p.properties.image_main.replace('446124AR1YthBoldVsrMatBlk', '446128AR1YthBoldVsrMatWht')),
    note: 'Reflex/White visor needs correct image'
  }
];

export class TuckerProducts {
  products: TuckerProduct[];
  uniqueNames: Record<string, { ids: string[] }>;
  masterProducts: TuckerProduct[] = [];
  variations: TuckerProduct[] = [];
  simpleProducts: TuckerProduct[] = [];
  cache = {};
  columnKeys = [];
  lookupId: Record<string, TuckerProduct> = {};
  options: TuckerProductsOptions = { imageRoot: '' };
  importReport: ImportReport = [];

  constructor(data: TuckerProduct[], options: TuckerProductsOptions = {}) {
    this.importReport = [];
    this.products = data;
    this.updateOptions(options);
    //
    // START: Monkey Patch
    //
    this.products.forEach((p) => {
      p.parent = this;
      const repairs = RepairMap.filter((repair) => repair.match(p));
      repairs.forEach((repair) => {
        this.importReport.push({ product: p, note: repair.note });
        repair.repair(p);
      });
      if (repairs.length) {
        p.updateAttributes();
      }
    });
    //
    // END: Monkey Patch
    //
    this.lookupId = data.reduce((o, p) => ({ ...o, [p.properties.tucker_item]: p }), {});
    this.uniqueNames = this.getUniqueProductNames();
    const masterNames = Object.keys(this.uniqueNames).filter((k) => this.uniqueNames[k].ids.length > 1);

    this.masterProducts = masterNames.map((k) => {
      const ids = this.uniqueNames[k].ids;
      const id = ids[0];
      const p = this.lookupId[id].clone();
      this.products.push(p);
      p.variations = ids.map((id) => this.lookupId[id]);
      return p;
    });

    this.simpleProducts = this.products.filter((p) => p.type === ProductType.SIMPLE);
    this.variations = this.products.filter((p) => p.type === ProductType.VARIATION);

    const columnKeys = [...wooKeys];
    // make the number of attribute column groups flex to fit the data
    let maxAttributes = this.masterProducts.reduce((n, p) => Math.max(p.attributes.length, n), 0);
    while (maxAttributes--) Array.prototype.push.apply(columnKeys, this.getWooAttributeKeys(maxAttributes + 1));
    this.columnKeys = columnKeys;
  }

  updateOptions(options: TuckerProductsOptions) {
    Object.assign(this.options, options);
  }

  getProductRows(id: string) {
    const name = this.products.find((p) => p.properties.tucker_item === id)?.properties?.product_name;
    if (name) {
      return this.products.filter((q) => q.properties.product_name === name);
    }
    return [];
  }

  getUniqueProductNames(): Record<string, { ids: string[] }> {
    // merge products on name - assume they are part of a variation group
    const names = this.products.reduce((o, p) => {
      const key = p.properties.product_name;
      o[key] = o?.[key] ?? { ids: [] };
      o[key].ids.push(parseInt(p.properties.tucker_item));
      o[key].ids.sort((a: number, b: number) => (a < b ? -1 : a > b ? 1 : 0));
      return o;
    }, {});
    return names;
  }

  getUniqueProductTypes(): Record<string, { ids: string[] }> {
    // merge products on name - assume they are part of a variation group
    const names = this.products.reduce((o, p) => {
      const key = p.properties.type;
      o[key] = o?.[key] ?? { ids: [] };
      o[key].ids.push(parseInt(p.properties.tucker_item));
      o[key].ids.sort((a: number, b: number) => (a < b ? -1 : a > b ? 1 : 0));
      return o;
    }, {});
    return names;
  }

  getFacetValues(id: string, key: string | number) {
    const rows = this.getProductRows(id);
    const a = rows.filter((r) => r[key] !== '');
    const b = a.reduce((o, r) => ({ ...o, [r[key]]: true }), {});
    return Object.keys(b);
  }

  getWooAttributeKeys(i: number) {
    return [
      `Attribute ${i} name`, //
      `Attribute ${i} value(s)`,
      `Attribute ${i} visible`,
      `Attribute ${i} global`,
      `Attribute ${i} default`
    ];
  }

  toWooCSV(filterTest: (p: TuckerProduct) => boolean = () => true, offset = 0, limit = 5000) {
    return this.toCSV(this.products.filter(filterTest).slice(offset, offset + limit));
  }

  toCSV(products: TuckerProduct[]) {
    // Maybe sorting so variations are last will allow a bulk import
    const wooData = products
      .sort((a, b) => {
        if (a.isSimple && !b.isSimple) return -1;
        if (!a.isSimple && b.isSimple) return 1;
        if (a.isMaster && !b.isMaster) return -1;
        if (!a.isMaster && b.isMaster) return 1;
        if (a.sku < b.sku) return -1;
        if (a.sku > b.sku) return 1;
        return 0;
      })
      .map((p) => p.toWooRow());
    return [
      this.columnKeys.map((k) => `"${k}"`).join(','), //
      ...wooData.map((data) =>
        this.columnKeys.map((k) => {
          if (Object.prototype.hasOwnProperty.call(data, k)) {
            if (typeof data[k] === 'string') {
              return `"${data[k].replace(/"/g, '""')}"`;
            }
            return data[k];
          }
          return '';
        })
      )
    ].join('\n');
  }

  getSingleProduct() {
    const master = this.masterProducts[0];
    return this.toCSV([master, ...master.variations]);
  }

  stats() {
    return {
      products: this.products.length,
      masterProducts: this.masterProducts.length,
      simpleProducts: this.simpleProducts.length,
      variations: this.variations.length
    };
  }

  public static fromJson(jsonObj: Record<string, string>[], options: TuckerProductsOptions = { imageRoot: '' }) {
    const products = jsonObj.map((p) => new TuckerProduct(p));
    return new TuckerProducts(products, options);
  }
}
