import urlJoin from 'url-join';
import { IWesternImage, IWesternItemExt, IWesternItemStatus, IWesternProductExt } from './IWestern';

export const buildWesternImage = (img: IWesternImage, size: 200 | 500 | 1000 | 'full' = 200): string => {
  if (!img) return '';
  return urlJoin('http://', img.domain, img.path, `${size}_max`, img.filename);
};

// const convertWesternItemToWooProduct = (item: IWesternItemExt): IWooProduct => {
//   const smallImgs = item?.images?.data.map((img) => buildWesternImage(img, 200)) ?? [];
//   const largeImgs = item?.images?.data.map((img) => buildWesternImage(img, 500)) ?? [];
//   return {
//     ...WooProductDefault,
//     ...WesternWooProductDefaults,
//     SKU: item.sku,
//     'Regular price': parseFloat(item.list_price),
//     Name: item.name,
//     Images: smallImgs[0],
//     'Meta: _ci_additional_images': largeImgs.join(', '),
//     'Meta: _ci_data': JSON.stringify({
//       created: new Date().toISOString(), //
//       id: item.id,
//       status_id: item.status_id
//     }),
//     // 'Meta: _wc_additional_variation_images': smallImgs.slice(1).join(', '),
//     'In stock?': item.status_id === IWesternItemStatus.DSC || item.status_id === IWesternItemStatus.NA || item.status_id === IWesternItemStatus.NLA || item.status_id === IWesternItemStatus.PRE ? 0 : 1,
//     Stock: item?.inventory?.data?.total ?? 0,
//     'Weight (lbs)': item.weight,
//     'Length (in)': item.length,
//     'Width (in)': item.width,
//     'Height (in)': item.height
//   };
// };

export const getWesterItemDescription = (input: IWesternProductExt): string => {
  const featuresHTML = input?.features?.data?.length
    ? `<ul>${input.features.data
        .sort((a, b) => (a.sort < b.sort ? -1 : a.sort > b.sort ? 1 : 0))
        .map((f) => `<li>${f.name}</li>`)
        .join('')}</ul>`
    : '';
  const DescriptionHTML = input?.description ? `<p>${input.description}</p>` : '';
  return DescriptionHTML + featuresHTML;
};

const isItemAvailable = (item: IWesternItemExt) => item.status_id !== IWesternItemStatus.NLA;

export const isProductAvailable = (product: Partial<IWesternProductExt>) => product?.items?.data.length > 0 && product.items.data.filter(isItemAvailable).length > 0;

// export const convertWesternProductToWooProduct = (input: IWesternProductExt): IWooProduct[] => {
//   let p: IWooProduct;
//   const products: IWooProduct[] = [];

//   if (input) {
//     // stub attributes if they dont exist
//     if (!input?.attributekeys?.data) input.attributekeys = { data: [] };
//     input.items.data?.forEach((item) => {
//       if (!item?.attributevalues?.data) item.attributevalues = { data: [] };
//       if (!item?.images?.data) item.images = { data: [] };
//     });

//     const MasterSku = `MASTER_${input.id}`;

//     if (input.items?.data?.length > 0) {
//       //
//       // START: build attributes object
//       //
//       const attrKeyLookup: Record<number, IWesternAttributeKey & { values: string[] }> = input.attributekeys.data.reduce((o, a) => ({ ...o, [a.id]: { ...a, values: [] } }), {});
//       input.items.data[0].attributevalues.data.forEach((av) => {
//         if (attrKeyLookup[av.attributekey_id]) {
//           attrKeyLookup[av.attributekey_id].sort = av.sort;
//         }
//       });
//       // clean sort values - just in case
//       Object.values(attrKeyLookup)
//         .sort((a, b) => (a.sort < b.sort ? -1 : a.sort > b.sort ? 1 : 0))
//         .forEach((e, i) => (e.sort = i));

//       // get unique values from each attribute
//       // product variations
//       input.items.data.forEach((item) => {
//         item?.attributevalues?.data?.forEach((attr) => {
//           const attrKey = attrKeyLookup[attr.attributekey_id];
//           if (attrKey) {
//             if (!attrKey.values.includes(attr.name)) attrKey.values.push(attr.name);
//           }
//         });
//       });

//       // remove attributes that have <1 value for this item - i.e. it should not be a selector in the UI
//       Object.values(attrKeyLookup).forEach((e, i) => {
//         if (e.values.length <= 1) {
//           delete attrKeyLookup[e.id];
//         }
//       });
//       // renumber attributes
//       Object.values(attrKeyLookup)
//         .sort((a, b) => (a.sort < b.sort ? -1 : a.sort > b.sort ? 1 : 0))
//         .forEach((e, i) => (e.sort = i + 1));
//       //
//       // END: build attributes object
//       //
//       const masterImages = new Set<string>();
//       // master product
//       const master: IWooProduct = {
//         ...WooProductDefault,
//         Name: input.name,
//         Description: getWesterItemDescription(input),
//         SKU: MasterSku,
//         Type: 'variable',
//         'Meta: _ci_data': JSON.stringify({ created: new Date().toISOString(), id: input.id }),
//         ...(isProductAvailable(input) ? {} : WooProductDeleteDefaults)
//       };

//       // product variations
//       input.items.data.forEach((item) => {
//         p = {
//           ...convertWesternItemToWooProduct(item),
//           Description: getWesterItemDescription(input),
//           Type: 'variation',
//           Parent: MasterSku
//         };
//         item.attributevalues.data.forEach((attr) => {
//           const attrKey = attrKeyLookup[attr.attributekey_id];
//           if (attrKey) {
//             p[`Attribute ${attrKey.sort} name`] = attrKey.name;
//             p[`Attribute ${attrKey.sort} value(s)`] = attr.name;
//             p[`Attribute ${attrKey.sort} global`] = 1;
//           }
//         });
//         if (!isItemAvailable(item)) {
//           Object.assign(p, WooProductDeleteDefaults);
//         }
//         products.push(p);
//       });
//       // master attribute defs
//       Object.values(attrKeyLookup).map((attrKey) => {
//         master[`Attribute ${attrKey.sort} name`] = attrKey.name;
//         master[`Attribute ${attrKey.sort} value(s)`] = attrKey.values.join(', ');
//         master[`Attribute ${attrKey.sort} visible`] = 1;
//         master[`Attribute ${attrKey.sort} global`] = 1;
//         master[`Attribute ${attrKey.sort} default`] = attrKey.values[0];
//       });
//       // add all items first image to master
//       input.items.data.forEach((item) => masterImages.add(buildWesternImage(item.images.data[0])));
//       // don't pollute WP with a million images
//       master.Images = Array.from(masterImages)[0];
//       // actual variation images are here
//       master['Meta: _ci_additional_images'] = Array.from(masterImages).join(', ');
//       products.push(master);
//     } else if (input.items?.data?.length === 1 && isProductAvailable(input)) {
//       // export simple
//       const item = { ...input, ...(input?.items?.data?.[0] ?? {}) } as IWesternItemExt;
//       p = {
//         ...convertWesternItemToWooProduct(item),
//         Description: getWesterItemDescription(input),
//         Type: 'simple'
//         // Images: input.items.data.forEach((item) => masterImages.add(buildWesternImage(item.images.data[0])));
//       };
//       products.push(p);
//     } else {
//       // this product has no valid items so it should be deleted
//       p = {
//         ...WooProductDefault,
//         ...WesternWooProductDefaults,
//         ...WooProductDeleteDefaults,
//         Type: 'simple',
//         Name: input.name,
//         SKU: MasterSku,
//         'Meta: _ci_data': JSON.stringify({ id: input.id })
//       };
//       products.push(p);
//     }
//     return products;
//   }
//   return products;
// };
