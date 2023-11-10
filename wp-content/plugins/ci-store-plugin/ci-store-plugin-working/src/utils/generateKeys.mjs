import csv from 'csvtojson';

const src_woo = new URL('../data/wc-product-export.csv', import.meta.url);
const src_tucker = new URL('../data/tuckerproducts.csv', import.meta.url);

// this is used to build the product class based on cvs headers

export function keyify(key) {
  return key
    .trim()
    .replace(/["':\(\)\?\/]/g, '')
    .replace(/\-/g, '_')
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/_$/g, '');
}

function generateKeyMaps() {
  csv()
    .fromFile(src_tucker)
    .then((jsonObj) => {
      const keyMap = {};
      const r = jsonObj[0];
      Object.keys(r).forEach((k) => {
        keyMap[keyify(k)] = k;
      });
      console.log('export const tuckerKeysMap =', keyMap);
    });

  csv()
    .fromFile(src_woo)
    .then((jsonObj) => {
      const keyMap = {};
      const r = jsonObj[0];
      Object.keys(r).forEach((k) => {
        keyMap[keyify(k)] = k;
      });
      console.log('export const wooKeysMap =', keyMap);
    });
}

// generateKeyMaps();
