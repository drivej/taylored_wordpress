// TODO: deprecated
import { wooKeysMap, wooRowDefaults } from './consts';
import { TuckerProducts } from './TuckerProducts';

const TuckerCSVMap = {
  tucker_item: '"Tucker Item"',
  vendor_part: '"Vendor Part"',
  oem: 'OEM',
  upc: 'UPC',
  product_name: '"Product Name"',
  desc: 'DESC',
  brand: 'BRAND',
  category: 'CATEGORY',
  segment: 'SEGMENT',
  dealer_price: '"Dealer Price"',
  peak_item_surcharge: '"Peak Item Surcharge "',
  retail_price: '"Retail Price"',
  sell_uom: '"Sell UOM"',
  retail_uom: '"Retail UOM"',
  retail_conversion_f_actor: '"Retail Conversion F actor"',
  map_policy: '"Map Policy"',
  map_price: '"Map Price"',
  closeoutdiscontinu_ed_status: '"Closeout/Discontinu ed Status"',
  superceded_to_item: '"Superceded To Item"',
  ships_from_supplier: '"Ships From Supplier "',
  size: 'SIZE',
  weight: 'WEIGHT',
  depth: 'DEPTH',
  width: 'WIDTH',
  height: 'HEIGHT',
  hazardous_flag: '"Hazardous Flag"',
  oversize: 'OVERSIZE',
  drop_ship_freight_c_lass: '"Drop Ship Freight C lass"',
  tire_size: '"Tire Size"',
  country_of_origin: '"Country of Origin"',
  carb_restricted: '"Carb Restricted"',
  proposition_65_flag: '"Proposition 65 Flag "',
  prop_65_product_war_ning: '"Prop 65 Product War ning"',
  copy_text: '"Copy Text"',
  bullet_text: '"Bullet Text"',
  include_text: '"Include Text"',
  type: 'TYPE',
  style: 'STYLE',
  color: 'COLOR',
  image_main: '"Image Main"',
  image_proxy: '"Image Proxy"',
  image_alternate_1: '"Image Alternate 1"',
  image_alternate_2: '"Image Alternate 2"',
  image_alternate_3: '"Image Alternate 3"',
  image_action_1: '"Image Action 1"',
  image_action_2: '"Image Action 2"',
  image_detail_1: '"Image Detail 1"',
  image_detail_2: '"Image Detail 2"'
};

export enum ProductType {
  SIMPLE = 'simple',
  VARIATION = 'variation',
  VARIABLE = 'variable'
}

interface Attribute {
  values?: string[];
  value: string;
  slug: string;
  default: string;
}

export class TuckerProduct {
  properties: Partial<typeof TuckerCSVMap> = {};
  type = ProductType.SIMPLE;
  master: TuckerProduct = null;
  attributes: Attribute[] = [];
  _variations: TuckerProduct[] = [];
  parent: TuckerProducts = null;

  constructor(json: Record<string, string>) {
    Object.keys(TuckerCSVMap).forEach((k) => (this.properties[k] = json?.[TuckerCSVMap[k]] ?? ''));
    this.updateAttributes();
  }

  set variations(products: TuckerProduct[]) {
    this._variations = products;
    if (products.length > 0) {
      this.type = ProductType.VARIABLE;
      products.forEach((p) => {
        p.master = this;
        p.type = ProductType.VARIATION;
      });
      this.updateAttributes();
    } else {
      this.type = ProductType.SIMPLE;
    }
  }

  get variations() {
    return this._variations;
  }

  get isMaster() {
    return this.type === ProductType.VARIABLE;
  }

  get isVariation() {
    return this.type === ProductType.VARIATION;
  }

  get isSimple() {
    return this.type === ProductType.SIMPLE;
  }

  updateAttributes() {
    if (this.isMaster) {
      const attr = this._variations.reduce((o, v) => {
        v.attributes.forEach((a) => {
          o[a.slug] = o?.[a.slug] ?? { values: new Set() };
          o[a.slug].values.add(a.value);
        });
        return o;
      }, {});
      this.attributes = Object.keys(attr)
        .filter((k) => Array.from(attr[k].values).length > 1)
        .map((slug) => ({
          slug,
          value: Array.from(attr[slug].values).join(', '),
          values: Array.from(attr[slug].values),
          default: this._variations[0].getAttributeValue(slug)
        }));
    } else {
      this.attributes = this.getAttributes();
    }
  }

  getAttributeValue(slug: string) {
    return this.attributes.find((a) => a.slug === slug)?.value ?? '';
  }

  getAttributes() {
    return [
      { value: this.properties.size.trim(), slug: 'size', default: '' },
      { value: this.properties.color.trim(), slug: 'color', default: '' },
      { value: this.properties.style.trim(), slug: 'style', default: '' },
      { value: this.properties.type.trim(), slug: 'producttype', default: '' }
    ]
      .filter((a) => !!a.value)
      .map((a) => {
        return { ...a };
      });
  }

  getAttribute(slug: string) {
    return this.attributes.find((a) => a.slug === slug);
  }

  getImagesArray() {
    return [
      this.properties.image_main, //
      this.properties.image_proxy,
      this.properties.image_detail_1,
      this.properties.image_detail_2,
      this.properties.image_alternate_1,
      this.properties.image_alternate_2,
      this.properties.image_alternate_3
    ].filter((src) => !!src && src.indexOf('AnswerImagePlaceCard') === -1);
  }

  getFTPImages() {
    return this.getImagesArray().map((src, i) => {
      // if imageRoot is not set, assume we just want the filename
      const filename = src.split('/').pop();
      if (this.parent.options.imageRoot) {
        return `${this.parent.options.imageRoot}/${filename}`;
      }
      return filename;
    });
  }

  getCategories() {
    return [[this.properties.category, this.properties.segment].join(' > '), ['Brand', this.properties.brand].join(' > ')];
  }

  get sku() {
    if (this.type === ProductType.VARIABLE) {
      return `MASTER_${this.properties.tucker_item}`;
    }
    return this.properties.tucker_item;
  }

  get images() {
    return this.getFTPImages();
  }

  formatBulletText(bullet_text: string) {
    if (bullet_text) {
      return (
        '<ul><li>' +
        bullet_text
          .split('<br>')
          .map((s) => s.trim())
          .filter((s) => !!s)
          .join('</li><li>') +
        '</li></ul>'
      );
    }
    return '';
  }

  getBulletHTML() {
    return this.formatBulletText(this.properties.bullet_text);
  }

  toWooRow() {
    const res = {
      ...wooRowDefaults,
      [wooKeysMap.type]: this.type,
      [wooKeysMap.sku]: this.sku,
      [wooKeysMap.name]: this.properties.product_name || this.properties.desc,
      [wooKeysMap.short_description]: this.properties.desc || this.properties.copy_text, // TODO: verify
      [wooKeysMap.description]: [this.properties.copy_text, this.formatBulletText(this.properties.bullet_text)].filter((t) => !!t).join('<br><br>'), // TODO: verify
      [wooKeysMap.parent]: this.isVariation ? this.master.sku : '',
      [wooKeysMap.tax_class]: this.isVariation ? 'parent' : '',
      [wooKeysMap.regular_price]: this.properties.retail_price,
      [wooKeysMap.weight_lbs]: this.properties.weight,
      [wooKeysMap.length_in]: this.properties.depth,
      [wooKeysMap.width_in]: this.properties.width,
      [wooKeysMap.height_in]: this.properties.height,
      [wooKeysMap.images]: this.images.length > 0 ? (this.images.length > 1 ? `"${this.images.join('","')}"` : this.images[0]) : '',
      [wooKeysMap.categories]: this.getCategories().join(',')
    };
    this.attributes.forEach((a, i) => {
      res[`Attribute ${i + 1} name`] = a.slug;
      res[`Attribute ${i + 1} value(s)`] = a.value;
      res[`Attribute ${i + 1} visible`] = 1;
      res[`Attribute ${i + 1} global`] = 1;
      res[`Attribute ${i + 1} default`] = a.default;
    });
    return res;
  }

  clone() {
    const p = new TuckerProduct({});
    p.properties = { ...this.properties };
    p.type = this.type;
    p.master = this.master;
    p.parent = this.parent;
    return p;
  }
}
