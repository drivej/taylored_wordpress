import { Field } from '../../utils/WooFieldImporter';

export const WesternWooMap = {
  ID: {},
  Type: {},
  SKU: {},
  Name: {},
  Published: {},
  'Is featured?': {},
  'Visibility in catalog': {},
  'Short description': {},
  Description: {},
  'Date sale price starts': {},
  'Date sale price ends': {},
  'Tax status': {},
  'Tax class': {},
  'In stock?': {},
  Stock: {},
  'Low stock amount': {},
  'Backorders allowed?': {},
  'Sold individually?': {},
  'Weight (lbs)': {},
  'Length (in)': {},
  'Width (in)': {},
  'Height (in)': {},
  'Allow customer reviews?': {},
  'Purchase note': {},
  'Sale price': {},
  'Regular price': {},
  Categories: {},
  Tags: {},
  'Shipping class': {},
  Images: {},
  'Download limit': {},
  'Download expiry days': {},
  Parent: {},
  'Grouped products': {},
  Upsells: {},
  'Cross-sells': {},
  'External URL': {},
  'Button text': {},
  Position: {},
  'Meta: _supplier_class': {},
  'Attribute 1 name': {},
  'Attribute 1 value(s)': {},
  'Attribute 1 visible': {},
  'Attribute 1 global': {},
  'Attribute 1 default': {},
  'Attribute 2 name': {},
  'Attribute 2 value(s)': {},
  'Attribute 2 visible': {},
  'Attribute 2 global': {},
  'Attribute 2 default': {},
  'Attribute 3 name': {},
  'Attribute 3 value(s)': {},
  'Attribute 3 visible': {},
  'Attribute 3 global': {},
  'Attribute 3 default': {}
};

interface IWesternProduct {
  id: string;
}

WesternWooMap.ID = new Field({ name: 'ID' });
