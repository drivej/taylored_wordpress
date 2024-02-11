import { SUPPLIER } from '../../utils/SUPPLIER_INFO';
import { lookup } from '../../utils/lookup';
import { IWesternProductExt, stockStatusMap } from '../../views/western/IWestern';
import { IWooProductWPS, IWooSimpleProduct, IWooVariable, IWooVariation, IWooVariationAttribute } from '../../views/western/IWoo';
import { buildWesternImage, getWesterItemDescription } from '../../views/western/WesternUtils';
import { getWooMetaValue } from '../../views/western/WooUtils';
import { fetchWooAPI } from '../../views/woo/useWoo';
import { slugify } from '../store/slugify';

interface PriceRange {
  min: number;
  max: number;
}

export interface MasterPrices {
  wholesale: PriceRange;
  regular: PriceRange;
  sale: PriceRange;
}

export class Price {
  currency: string = 'USD';
  wholesale: PriceRange = { min: 0, max: 0 }; //number = -1;
  regular: PriceRange = { min: 0, max: 0 }; //number = -1;
  sale: PriceRange = { min: 0, max: 0 }; //number = -1;

  constructor(config: Partial<Price> = {}) {
    Object.assign(this, config);
  }

  toJSON() {
    return {
      currency: this.currency,
      wholesale: { ...this.wholesale },
      regular: { ...this.regular },
      sale: { ...this.sale }
    };
  }
}

export class Product {
  supplier: string = 'UNKNOWN';
  updated: Date = new Date(0);
  woo: Partial<Pick<IWooVariation, 'date_modified' | 'sku' | 'id' | 'variations'>> = {};
  id = null;
  sku = '';
  name = '';
  description = '';
  price: Price = new Price();
  images: string[] = [];
  thumbnail: string;
  attributes: ProductAttribute[] = [];
  attributeLookup: { [key: string]: ProductAttribute } = {};
  variations: ProductVariation[] = [];
  variationsLookup: { [key: string]: ProductVariation } = {};
  useSkuAttribute = false;

  constructor(config: Partial<Product> = {}) {
    Object.assign(this, config);
  }

  attribute(name: string) {
    let attr = this.attributeLookup?.[name];
    if (!attr) {
      attr = new ProductAttribute({ name, values: [], sort: 0 });
      this.attributeLookup[name] = attr;
      this.attributes.push(attr);
    }
    return attr;
  }

  hasVariation(sku: string) {
    return !!this.variationsLookup?.[sku];
  }

  deleteAttribute(name: string) {
    delete this.attributeLookup[name];
    const i = this.attributes.findIndex((a) => a.name === name);
    this.attributes.splice(i, 1);
    this.variations.forEach((v) => v.deleteAttribute(name));
  }

  variation(sku: string, insertOnNoExist = true) {
    let v = this.variationsLookup?.[sku];
    if (insertOnNoExist && !v) {
      v = new ProductVariation({ sku, master: this });
      this.variations.push(v);
      this.variationsLookup[sku] = v;
      if (this.useSkuAttribute) v.attribute('sku', v.sku);
    }
    return v;
  }

  filterVariations(filters: { [key: string]: string }) {
    const filterKeys = Object.keys(filters);
    const matches = this.variations.filter((v) => {
      return filterKeys.filter((k) => filters[k] === WILDCARD_ATTRIBUTE_VALUE || v.attributes[k] === filters[k]).length === filterKeys.length;
    });
    return matches;
  }

  buildSkuAttribute() {
    this.variations.forEach((v) => v.attribute('sku', v.sku));
  }

  renderPriceFromVariation(price: Price, variations: ProductVariation[]) {
    const wholesale = [];
    const regular = [];
    const sale = [];
    variations.forEach((v) => {
      if (v.price.wholesale.min) wholesale.push(v.price.wholesale.min);
      if (v.price.regular.min) regular.push(v.price.regular.min);
      if (v.price.sale.min) sale.push(v.price.sale.min);
    });
    wholesale.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    regular.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    sale.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

    price.wholesale.min = wholesale?.[0] ?? 0;
    price.wholesale.max = wholesale?.[wholesale.length - 1] ?? 0;

    price.regular.min = regular?.[0] ?? 0;
    price.regular.max = regular?.[regular.length - 1] ?? 0;

    price.sale.min = sale?.[0] ?? 0;
    price.sale.max = sale?.[sale.length - 1] ?? 0;
    return price;
  }

  renderPrices() {
    this.renderPriceFromVariation(this.price, this.variations);
  }

  _haystack = null;

  get haystack() {
    if (this._haystack === null) {
      this._haystack = [this.name, this.description, this.sku, ...this.attributes.map((a) => a.name), ...this.attributes.map((a) => a.values)].join(' ').toLowerCase();
    }
    return this._haystack;
  }

  _slug = null;

  get slug() {
    if (this._slug === null) {
      this._slug = slugify(this.name, this.sku);
    }
    return this._slug;
  }

  toJSON() {
    return {
      sku: this.sku,
      name: this.name,
      description: this.description,
      images: this.images,
      attributes: this.attributes.map((a) => ({ [a.name]: a.values })),
      variations: this.variations.map((v) => v.toJSON()),
      price: this.price.toJSON()
    };
  }

  static fromWooRows(products: IWooProductWPS[]): Product {
    const master = products.length === 1 ? products[0] : products.filter((p) => p.Type === 'variable')?.[0];
    const variations = products.filter((p) => p.Type === 'variation' || p.Type === 'simple');
    const product = new Product({ name: master.Name, sku: master.SKU, description: master.Description });
    const masterImages = new Set<string>();
    parseWooImages(master.Images).map((img) => masterImages.add(img));

    variations.forEach((item) => {
      const attr = parseWooAttributes(item);
      const v = product.variation(item.SKU);
      v.name = item.Name;
      v.description = item.Description;
      v.images = parseWooImages(item['Meta: _ci_additional_images']); // item.Images
      if (v.images?.[0]) masterImages.add(v.images[0]);
      v.price.regular.min = item['Regular price'] || 0;
      v.price.sale.min = item['Sale price'] || 0;

      Object.keys(attr).forEach((name) => {
        v.attribute(name, attr?.[name]);
      });
    });

    product.images = Array.from(masterImages);
    product.renderPrices();
    return product;
  }

  static async fromWooId(wooId: number | string) {
    // wooProduct:IWooVariable | IWooSimpleProduct
    const wooProduct = (await fetchWooAPI<IWooVariable>(`/products/${wooId}`))?.data;
    const wooVariations = (await fetchWooAPI<IWooVariation[]>(`/products/${wooId}/variations`))?.data;
    console.log({ wooProduct, wooVariations });
    const p = new Product({
      supplier: 'WPS',
      id: wooProduct.id, //
      sku: wooProduct.sku,
      name: wooProduct.name,
      description: wooProduct.description,
      updated: new Date(Date.parse(wooProduct.date_modified))
    });
    wooVariations.forEach((item) => {
      const v = p.variation(item.sku, true);
      item.attributes.filter((a) => a.name !== 'sku').forEach((a) => v.attribute(a.name, a.option));
      const additionalImages = getWooMetaValue(item, '_ci_additional_images');
      v.images = additionalImages.split(','); //[...(item?.images?.map(img => img.src) ?? []), item?.image?.src];
      v.price = new Price({ regular: { min: parseFloat('' + item.regular_price), max: -1 } }); // TODO: need wholesale price data
      v.stock_quantity = item.stock_quantity;
      v.stock_status = item.stock_status;
      v.size = {
        weight: { value: parseFloat(item.weight), units: 'lbs' },
        width: { value: parseFloat(item.dimensions.width), units: 'in' },
        height: { value: parseFloat(item.dimensions.height), units: 'in' },
        length: { value: parseFloat(item.dimensions.length), units: 'in' }
      };
      p.images.push(v.images[0]);
    });
    return p;
  }

  cleanVariations() {
    // remove variations that don't affect to selection of products
    this.attributes.forEach((a) => {
      if (a.values.length === 1) {
        if (this.filterVariations({ [a.name]: a.values[0].value }).length === this.variations.length) {
          this.deleteAttribute(a.name);
        }
      }
    });
  }

  static fromWesternProduct(product: IWesternProductExt, config: Partial<Product> = {}): Product {
    // console.log('fromWesternProduct', product);
    const p = new Product({
      supplier: 'WPS',
      id: product.id, //
      sku: `MASTER_WPS_${product.id}`,
      name: product.name,
      description: getWesterItemDescription(product),
      updated: new Date(Date.parse(product.updated_at)),
      ...config
    });
    // strange case of the missing attribute - cause by the api returning an array OR and object depending on it's mood
    const lookupAttr = lookup(product?.attributekeys?.data ?? [], 'id');

    product.items.data.forEach((item) => {
      const v = p.variation(item.sku);
      const smallImgs = item?.images?.data.map((img) => buildWesternImage(img, 200)) ?? [];
      const largeImgs = item?.images?.data.map((img) => buildWesternImage(img, 500)) ?? [];
      v.updated = new Date(Date.parse(item.updated_at));
      v.id = item.id;
      v.sku = item.sku;
      v.price = new Price({
        regular: { min: parseFloat(item.list_price), max: -1 }, //
        wholesale: { min: parseFloat(item.standard_dealer_price), max: -1 }
      });
      v.name = item.name;
      v.thumbnail = smallImgs[0];
      v.images = largeImgs;
      v.size = {
        weight: { value: item.weight, units: 'lbs' },
        width: { value: item.width, units: 'in' },
        height: { value: item.height, units: 'in' },
        length: { value: item.length, units: 'in' }
      };
      v.stock_status = stockStatusMap[item.status_id];
      v.stock_quantity = item?.inventory?.data?.total ?? 0;

      item?.attributevalues?.data?.forEach((a) => {
        const attr = lookupAttr?.[a.attributekey_id];
        if (attr) v.attribute(attr.name, a.name, a.sort);
      });

      p.images.push(v.images[0]);
    });

    p.cleanVariations();
    p.images = Array.from(new Set(p.images));
    p.renderPrices();
    return p;
  }

  toWoo(): Partial<IWooSimpleProduct | IWooVariable> {
    let res: Partial<IWooSimpleProduct | IWooVariable> = {
      type: 'simple',
      sku: this.sku,
      name: this.name,
      description: this.description,
      meta_data: [
        { key: '_ci_additional_images', value: this.images.join('|') },
        { key: '_ci_data', value: JSON.stringify({ id: this.id, supplier: this.supplier }) },
        { key: '_supplier_class', value: SUPPLIER.WPS.supplierClass }
      ]
    };
    if (this.variations.length === 0) {
      // simple product
      console.log('ALERT!!! Simple product', this);
      return res;
    } else if (this.variations.length === 1) {
      // simple product
      const item = this.variations[0];
      Object.assign(res, {
        regular_price: item.price.regular.min.toString(),
        // images: item.images.map((src) => ({ name: '', src } as IWooImage)),
        stock_quantity: item.stock_quantity,
        stock_status: item.stock_status
      });
      if (item.price?.sale?.min) {
        res.sale_price = item.price?.sale?.min;
      }
    } else {
      // variable
      Object.assign(res, {
        type: 'variable',
        attributes: this.attributes.map((a, i) => ({ ...a.toWoo() }))
      });
    }
    return res;
  }
}

export class ProductAttribute {
  id = null;
  name = '';
  values: ProductAttributeValue[] = [];
  sort = 0;

  constructor(config: Partial<ProductAttribute>) {
    Object.assign(this, config);
  }

  addValue(value: string, sort = 1) {
    if (this.values.findIndex((a) => a.value === value) === -1) {
      this.values.push(new ProductAttributeValue({ value, sort }));
      // sort by sort value and then string value
      this.values.sort((a, b) => (a.sort < b.sort ? -1 : a.sort > b.sort ? 1 : a.value < b.value ? -1 : a.value > b.value ? 1 : 0));
    }
    return this;
  }

  toWoo() {
    return {
      name: this.name,
      slug: slugify(this.name),
      options: this.values.map((v) => v.value),
      position: this.sort,
      visible: true,
      variation: true
    };
  }
}

class ProductAttributeValue {
  value: string;
  sort = 0;
  disabled = false;

  constructor(config: Partial<ProductAttributeValue>) {
    Object.assign(this, config);
  }
}

interface ISize {
  width: ISizeValue;
  length: ISizeValue;
  height: ISizeValue;
  weight: ISizeValue;
}

interface ISizeValue {
  value: number;
  units: string;
}

export class ProductVariation {
  master: Product = null;
  updated: Date = new Date(0);
  woo: Partial<Pick<IWooVariation, 'date_modified' | 'sku' | 'id'>> = {};
  id = null;
  sku = '';
  name = '';
  description = '';
  price: Price = new Price();
  thumbnail: string;
  images: string[] = [];
  attributes: { [key: string]: string } = {};
  size: Partial<ISize> = {};
  stock_status: IWooVariation['stock_status'] = 'instock';
  stock_quantity: IWooVariation['stock_quantity'] = 10;

  constructor(config: Partial<ProductVariation> = {}) {
    Object.assign(this, config);
  }

  attribute(name: string, value: string, sort = 0) {
    this.attributes[name] = value;
    this.master.attribute(name).addValue(value, sort);
  }

  hasAttribute(name: string) {
    return !!this.attributes?.[name];
  }

  deleteAttribute(name: string) {
    delete this.attributes[name];
  }

  toJSON() {
    return {
      sku: this.sku,
      name: this.name,
      description: this.description,
      images: this.images,
      attributes: this.attributes,
      price: this.price.toJSON()
    };
  }

  toWoo(): Partial<IWooVariation> {
    const result = {
      // id: this.id,
      // sku: this.sku,
      sku: `MASTER_${this.master.supplier}_${this.master.id}_VARIATION_${this.id}`,
      name: this.name,
      stock_status: this.stock_status,
      stock_quantity: this.stock_quantity,
      regular_price: this.price?.regular?.min || this.price?.regular?.max,
      sale_price: this.price?.sale?.min || this.price?.sale?.max,
      description: this.description,
      image: null, //{ name: '', src: this.images[0] } as IWooImage,
      meta_data: [
        { key: '_ci_additional_images', value: this.images.join('|') },
        { key: '_ci_data', value: JSON.stringify({ id: this.id }) }
      ],
      attributes: Object.keys(this.attributes).map(
        (name) =>
          ({
            // id: this.master.attributeLookup[name].id,
            name,
            option: this.attributes[name]
          } as IWooVariationAttribute)
      )
    };
    if (result.sale_price === 0) delete result.sale_price;
    return result;
  }
}

const WILDCARD_ATTRIBUTE_VALUE = '*any';

function parseWooAttributes(product: IWooProductWPS) {
  return [1, 2, 3, 4, 5, 6]
    .filter((n) => !!product?.[`Attribute ${n} name`])
    .reduce((o, n) => {
      const value = product[`Attribute ${n} value(s)`].trim();
      const name = product[`Attribute ${n} name`];
      return { ...o, [name]: value };
    }, {});
}

function parseWooImages(Images: string) {
  return Images.split(',').map((i) => i.trim());
}
