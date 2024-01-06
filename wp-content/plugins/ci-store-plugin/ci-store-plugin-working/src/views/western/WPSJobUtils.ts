import { Product } from '../../components/woo/Product';
import { SUPPLIER } from '../../utils/SUPPLIER_INFO';
import { chunkArray } from '../../utils/chunkArray';
import { lookup } from '../../utils/lookup';
import { IWooAPIResponse, fetchWooAPI } from '../woo/useWoo';
import { IWesternParams, IWesternProductExt, IWesternTaxonomyTerm } from './IWestern';
import { IWooCategory, IWooSimpleProduct, IWooVariable, IWooVariation } from './IWoo';
import { wooProductsIDb, wpsProductsIDb } from './IndexedDatabase';
import { isValidProduct } from './WesternProducts';
import { fetchWesternAPI, fetchWesternProduct } from './useWestern';

// const wpsProductsIDb = new IndexedDBHandler<IWesternProductExt>('wpsProducts');
// const wooProductsIDb = new IndexedDBHandler<IWooVariable>('wooProducts');
// const wooCategoriesIDb = new IndexedDBHandler<IWooCategory>('wooCategories');

export function isWestern(e: Partial<IWooSimpleProduct>) {
  if (e.sku.indexOf('_WPS_') > 0) return true;
  const supplierClass = e?.meta_data?.find((m) => m.key === '_supplier_class') ?? { value: '' };
  return supplierClass?.value === SUPPLIER.WPS.supplierClass;
}

export function getSupplierId(p: { sku?: string }) {
  return p.sku.indexOf('_') ? parseInt(p.sku.split('_').pop()) : null;
}

export async function getTotalWPSProducts(lastUpdate: string = '') {
  const countResponse = await fetchWesternAPI<{ count: number }>(`/products`, { countOnly: true, ...(lastUpdate ? { 'filter[updated_at][gt]': lastUpdate } : {}) });
  return countResponse.data.count;
}

export async function get_western_products_page(lastUpdate: string, cursor: string, pageSize = 100, params: IWesternParams = {}) {
  const data = await fetchWesternAPI<IWesternProductExt[]>('/products', {
    ...(cursor ? { 'page[cursor]': cursor } : {}), //
    'page[size]': pageSize,
    include: 'items:filter(status_id|NLA|ne)',
    'fields[items]': 'id,updated_at',
    'fields[products]': 'id,updated_at',
    ...(lastUpdate ? { 'filter[updated_at][gt]': lastUpdate } : {}),
    ...params
  });
  data.data = data.data.filter(isValidProduct);
  return data;
}

export async function getWPSProduct(productId: number): Promise<IWesternProductExt> {
  const liveProduct = await fetchWesternAPI<IWesternProductExt>(`/products/${productId}`);
  let wpsProduct: IWesternProductExt = null;
  //   console.log('getWPSProduct', { liveProduct });

  if (!liveProduct?.error) {
    wpsProduct = (await wpsProductsIDb.retrieveData(productId)) as IWesternProductExt;
    let refreshData = false;

    if (wpsProduct) {
      const liveExpiry = new Date(Date.parse(liveProduct.data.created_at));
      const localExpiry = new Date(Date.parse(wpsProduct.created_at));
      refreshData = liveExpiry > localExpiry; // local data is expired
    } else {
      refreshData = true; // local data no exist
    }
    // console.log('getWPSProduct', { refreshData });

    if (refreshData) {
      wpsProduct = await fetchWesternProduct(productId); // get fresh data
      //   console.log('getWPSProduct', { wpsProduct });
      await wpsProductsIDb.addData([wpsProduct]);
    }
  }
  return wpsProduct;
}

export async function getWpsProductsById(ids: (number | string)[]) {
  return await fetchWesternAPI<IWesternProductExt[]>(`/products/${ids.join()}`, { 'page[size]': 100 });
}

export async function getWooIdFromSku(sku: string) {
  return (await fetchWooAPI<IWooVariable[]>(`/products`, { sku, _fields: 'id' }))?.data?.[0]?.id;
}

export async function getWooProduct(productId: number) {
  const liveProduct = (await fetchWooAPI<IWooVariable>(`/products/${productId}`, { _fields: 'date_modified,variations' }))?.data;
  let wooProduct: IWooVariable = null;
  // console.log('getWooProduct', { liveProduct });

  if (!liveProduct?.error) {
    wooProduct = (await wooProductsIDb.retrieveData(productId)) as IWooVariable;
    // console.log('db', { wooProduct });
    let refreshData = false;

    if (wooProduct) {
      if (liveProduct.variations.length !== wooProduct?.variations?.length) {
        refreshData = true;
      } else {
        const liveExpiry = new Date(Date.parse(liveProduct.date_modified));
        const localExpiry = new Date(Date.parse(wooProduct.date_modified));
        if (liveExpiry > localExpiry) {
          refreshData = true; // local data is expired
        }
      }
    } else {
      refreshData = true; // local data no exist
    }
    // console.log('getWooProduct', { refreshData });

    if (refreshData) {
      // NOTE: this endpoint can not be trusted to return the correct variations data (cache? demonic possession?)
      wooProduct = (await fetchWooAPI<IWooVariable>(`/products/${productId}`))?.data; // get fresh data
      //   const variations = await fetchWooAPI<number[]>(`/products/${productId}/variations`, { _fields: 'id' }); // get fresh variation data
      wooProduct.variations = liveProduct.variations;
      //   console.log('getWooProduct', { wooProduct });
      await wooProductsIDb.deleteRecordById(wooProduct.id);
      await wooProductsIDb.addData([wooProduct]);
      console.log('getWooProduct', 'fresh', productId, wooProduct.sku);
    }
  } else {
    console.log('getWooProduct()', 'cache', productId, wooProduct.sku);
  }
  return wooProduct;
}

export async function getWooProductBySku(sku: string) {
  const wooId = await getWooIdFromSku(sku);
  //   console.log('getWooProductBySku', { wooId });
  return wooId ? await getWooProduct(wooId) : null;
}

export async function getWooProductVariations(productId: number, throwError = false) {
  let p1: IWooAPIResponse<IWooVariation[]>;
  if (throwError) {
    p1 = await fetchWooAPI<IWooVariation[]>(`/error`, { per_page: 50, page: 1, _fields: 'id,sku,date_modified,attributes' });
  } else {
    p1 = await fetchWooAPI<IWooVariation[]>(`/products/${productId}/variations`, { per_page: 50, page: 1, _fields: 'id,sku,date_modified,attributes' });
  }
  if (p1?.error) {
    throw new Error(`getWooProductVariations failed on product ${productId}`);
  }
  const variations = [...p1.data];
  let i = 2;
  const totalPages = p1.meta?.totalPages ?? 1;
  while (i <= totalPages) {
    const p = await fetchWooAPI<IWooVariation[]>(`/products/${productId}/variations`, { per_page: 50, page: i });
    variations.push(...(p?.data ?? []));
    i++;
  }
  return variations;
}

export async function deleteWooProductVariations(product: IWooVariable) {
  if (product.variations.length > 0) {
    const chunks = chunkArray(product.variations, 50);
    let i = chunks.length;
    while (i--) {
      const doDelete = await fetchWooAPI<IWooVariation[]>(`/products/${product.id}/variations/batch`, { delete: chunks[i] }, 'post');
      //   console.log({ doDelete });
    }
  }
}

export async function insertWooProductVariations(productId: number, variations: Partial<IWooVariation>[]) {
  if (variations.length > 0) {
    const chunks = chunkArray(variations, 50);
    let i = chunks.length;
    while (i--) {
      const doInsert = await fetchWooAPI<IWooVariation[]>(`/products/${productId}/variations/batch`, { create: chunks[i] }, 'post');
      //   console.log({ doInsert });
    }
  }
}

export function wooIsOutdated(wooProduct: IWooVariable, wpsProduct: IWesternProductExt) {
  const wooUpdated = new Date(Date.parse(wooProduct.date_modified));
  const wpsUpdated = new Date(Date.parse(wpsProduct.updated_at));
  return wooUpdated < wpsUpdated;
}

export function wooNeedsUpdate(wooProduct: IWooVariable, wpsProduct: IWesternProductExt) {
  let needsUpdate = false;

  if (wooProduct) {
    // check variations count
    //   const wooVars = wooProduct?.variations?.length;
    //   const wpsVars = wpsProduct?.items?.data?.length;
    // console.log({wooVars, wpsVars, wooProduct:wooProduct.type})
    if (wooProduct.type !== 'simple' && wooProduct?.variations?.length !== wpsProduct?.items?.data?.length) {
      // console.log('need to sync variations');
      needsUpdate = true;
    }

    // check changed dates
    const wooUpdated = new Date(Date.parse(wooProduct?.date_modified));
    const wpsUpdated = new Date(Date.parse(wpsProduct?.updated_at));
    //   console.log({ wooUpdated, wpsUpdated, test: wooUpdated < wpsUpdated });

    if (wooUpdated < wpsUpdated) {
      needsUpdate = true;
      // console.log('need to sync - expired');
    }
  }
  return needsUpdate;
}

export async function syncWooProduct(wooProduct: IWooVariable, wpsProduct: IWesternProductExt) {
  const product = Product.fromWesternProduct(wpsProduct as IWesternProductExt);
  const hasVariations = product.variations.length > 1;
  product.variations.forEach((v) => {
    v.attribute('sku', v.sku);
  });
  const update = product.toWoo();
  //   console.log({ update });
  const doUpdate = await fetchWooAPI<IWooVariation[]>(`/products/${wooProduct.id}`, update, 'post');
  //   console.log({ doUpdate });

  if (hasVariations) {
    await deleteWooProductVariations(wooProduct);
    await insertWooProductVariations(
      wooProduct.id,
      product.variations.map((p) => p.toWoo())
    );
  }
}

export async function insertWooProduct(wpsProduct: IWesternProductExt) {
  const product = Product.fromWesternProduct(wpsProduct as IWesternProductExt, { useSkuAttribute: true });
  const update = product.toWoo();
  const doInsert = await fetchWooAPI<IWooVariable>(`/products`, update, 'post');

  if (product.variations.length > 1) {
    await insertWooProductVariations(
      doInsert.data.id,
      product.variations.map((p) => p.toWoo())
    );
  }
  return doInsert.data.id;
}

export async function deleteWooProduct(id: number) {
  return fetchWooAPI<IWooVariable>(`/products/${id}`, { force: true }, 'delete');
}

export async function importWesternProduct(id: number) {
  const result = { action: 'none', wpsId: id, wooId: null };
  const wpsProduct = await getWPSProduct(id);
  const wooSku = `MASTER_${SUPPLIER.WPS.key}_${id}`; // this should is predictable
  const wooBasic = await fetchWooAPI<IWooVariation[]>(`products`, { sku: wooSku, _fields: 'id' });
  result.wooId = wooBasic?.data?.[0]?.id;
  const wooExists = !!result.wooId;
  const isValid = isValidProduct(wpsProduct);
  console.log('importWesternProduct', id, { wpsProduct, wooExists, wooId: result.wooId });

  if (wooExists) {
    const wooProduct = await getWooProduct(result.wooId);
    console.log('importWesternProduct', id, { wooProduct });
    const needsUpdate = wooNeedsUpdate(wooProduct, wpsProduct);
    console.log('importWesternProduct', id, { needsUpdate, isValid });

    if (!isValid) {
      result.action = 'delete';
      await deleteWooProduct(wooProduct.id);
    } else if (needsUpdate) {
      result.action = 'update';
      await syncWooProduct(wooProduct, wpsProduct);
    } else {
      result.action = 'skip';
    }
  } else {
    if (isValid) {
      result.action = 'insert';
      result.wooId = await insertWooProduct(wpsProduct);
    }
  }
  console.log('importWesternProduct', id, { result });
  return result;
}

export async function getWesternCategories() {
  const terms: IWesternTaxonomyTerm[] = [];
  let r = await fetchWesternAPI<IWesternTaxonomyTerm[]>(`/taxonomyterms`, { 'page[size]': 50 });
  terms.push(...(r?.data ? (Array.isArray(r.data) ? r.data : [r.data]) : []));
  while (r?.meta?.cursor?.next) {
    r = await fetchWesternAPI<IWesternTaxonomyTerm[]>(`/taxonomyterms`, { 'page[size]': 50, 'page[cursor]': r.meta.cursor.next });
    terms.push(...(r?.data ? (Array.isArray(r.data) ? r.data : [r.data]) : []));
  }
  // get path and sort by tree depth (depth from wps is incorrect for my purposes)
  const lookupWpsCat = lookup(terms, 'id');
  terms.forEach((c) => {
    let depth = 0;
    let path = [];
    let p = c.parent_id;
    while (p) {
      path.unshift(lookupWpsCat[p].slug);
      p = lookupWpsCat[p]?.parent_id;
      depth++;
    }
    c.__path = path;
    c.depth = depth;
  });
  terms.sort((a, b) => (a.depth < b.depth ? -1 : a.depth > b.depth ? 1 : 0));
  return terms;
}

export async function getWooCategories() {
  const wooCategories: IWooCategory[] = [];
  let page = 1;
  const _fields = 'id,slug,name,description,parent,supplier_id,supplier_key';
  let q = await fetchWooAPI<IWooCategory[]>(`/products/categories`, { per_page: 100, page }, 'get');
  wooCategories.push(...q.data);
  while (page < q.meta.totalPages) {
    page++;
    q = await fetchWooAPI<IWooCategory[]>(`/products/categories`, { per_page: 100, page }, 'get');
    wooCategories.push(...q.data);
  }
  wooCategories.forEach((c) => {
    try {
      c.acf = JSON.parse(c.description);
    } catch (err) {
      c.acf = { supplier_id: '', supplier_key: '' };
    }
  });
  return wooCategories;
}

/*

endpoints: 

/products/categories/{id}
/acf/v3/product_cat/1153
/wp/v2/posts/1

payload:

  acf: {
    supplier_id: 'xxx',
    supplier_key: 'wps'
  }

  meta_data: [
    { key: 'supplierId', value: c.id },
    { key: 'supplier', value: 'wps' }
  ]
*/

export async function syncCategories() {
  return;
  const wpsCategories = await getWesternCategories();
  console.log({ wpsCategories });
  // const lookupWpsCatBySlug = lookup(wpsCategories, 'slug');
  const wooCategories = await getWooCategories();
  console.log({ wooCategories });
  const lookupWooCatBySlug = lookup(wooCategories, 'slug');
  // const lookupWooCatBySupplierId = lookup(wooCategories, '', (p) => p.acf.supplier_id);
  // const lookupWooCatBySlug = lookup(wooCategories, 'slug');
  // console.log({ lookupWooCatBySupplierId });
  // const parentLookup = lookup(wpsParentCats, 'id');

  const inserts = wpsCategories.filter((wpsCat) => !lookupWooCatBySlug[wpsCat.slug]).map((cat) => ({ slug: cat.slug, name: cat.name }));
  console.log({ newCats: inserts });
  const chunks = chunkArray(inserts, 20);
  for (let i = 0; i < chunks.length; i++) {
    const createCats = await fetchWooAPI(`/products/categories/batch`, { create: chunks[i] }, 'post');
    console.log({ createCats });
  }
  return;
}

export async function XsyncCategories() {
  const wpsCategories = await getWesternCategories();
  console.log({ wpsCategories });
  const lookupWpsCatBySlug = lookup(wpsCategories, 'slug');
  let wooCategories = await getWooCategories();
  console.log({ wooCategories });
  const lookupWooCatBySlug = lookup(wooCategories, 'slug');
  const lookupWooCatBySupplierId = lookup(wooCategories, '', (p) => p.acf.supplier_id);
  // const lookupWooCatBySlug = lookup(wooCategories, 'slug');
  // console.log({ lookupWooCatBySupplierId });
  // const parentLookup = lookup(wpsParentCats, 'id');

  console.log(Object.keys(lookupWpsCatBySlug).length, { lookupWpsCatBySlug });
  return;

  const inserts = [];
  for (let i = 0; i < wpsCategories.length; i++) {
    const wpsCat = wpsCategories[i];
    const wooCat = lookupWooCatBySupplierId[wpsCat.id];
    if (!wooCat) {
      inserts.push({
        slug: [...wpsCat.__path, wpsCat.slug].join('-'),
        name: wpsCat.name,
        description: JSON.stringify({ supplier_id: wpsCat.id, supplier_key: 'wps' })
      });
    }
  }
  console.log({ inserts });

  // chunk and run inserts
  const chunks = chunkArray(inserts, 20);
  for (let i = 0; i < chunks.length; i++) {
    const createCats = await fetchWooAPI(`/products/categories/batch`, { create: chunks[i] }, 'post');
    console.log({ createCats });
  }
  // refresh woo data
  wooCategories = await getWooCategories();
  console.log({ wooCategories });

  return;

  const wpsParentCats = wpsCategories.filter((c) => c.parent_id === null);

  for (let i = 9990; i < wpsParentCats.length; i++) {
    const wpsCat = wpsParentCats[i];
    const wooCat = lookupWooCatBySupplierId[wpsCat.id]; // wooCategories.find((c) => c.acf.supplier_id.toString() === wpsCat.id.toString() && c.acf.supplier_key === 'wps');
    console.log(i, { wpsCat, wooCat });

    if (!wooCat) {
      console.log(wpsCat.slug, wpsCat.id, 'should be create');
      const createCat = await fetchWooAPI<{ id: number }[]>(
        `/products/categories/batch`,
        {
          create: [
            {
              parent: 0,
              slug: [...wpsCat.__path, wpsCat.slug].join('-'),
              name: wpsCat.name,
              description: JSON.stringify({ supplier_id: wpsCat.id, supplier_key: 'wps' })
            }
          ]
        },
        'post'
      );
      console.log({ createCat });
    }
  }

  // const wooChildCats = wooCategories.filter((c) => c.parent !== 0);
  // console.log({ wooChildCats });
  // for (let i = 0; i < wooChildCats.length; i++) {
  //   const wooCat = wooChildCats[i];
  //   const wpsCat = lookupWpsCat[wooCat.acf.supplier_id];
  //   console.log(i, { wpsCat, wooCat });
  //   if (wpsCat) {
  //     const slug = [...wpsCat.__path, wpsCat.slug].join('-');
  //     const updateCat = await fetchWooAPI(`/products/categories/${wooCat.id}`, { slug }, 'put');
  //     console.log({ updateCat });
  //   }
  // }
  // return;

  // create child cats
  const wpsChildCats = wpsCategories.filter((c) => c.parent_id !== null);
  console.log({ wpsChildCats });

  for (let i = 0; i < wpsChildCats.length; i++) {
    const wpsCat = wpsChildCats[i];
    const wooCat = lookupWooCatBySupplierId[wpsCat.id];
    console.log(i, { wpsCat, wooCat });
    if (!wooCat) {
      const slug = [...wpsCat.__path, wpsCat.slug].join('-');
      const createCat = await fetchWooAPI(
        `/products/categories`,
        {
          slug,
          name: wpsCat.name,
          description: JSON.stringify({ supplier_id: wpsCat.id, supplier_key: 'wps' })
        },
        'post'
      );
      console.log('child', { createCat });
    }
  }

  // link child cats to parent
  linkCategories();

  return;

  for (let i = 0; i < wpsCategories.length; i++) {
    const c = wpsCategories[i];
    if (!c.parent_id) {
      const matches = wooCategories.filter((wc) => wc.parent === 0 && wc.slug === c.slug);
      console.log(c.slug, { matches });
      if (matches.length === 1) {
        const updateMeta = await fetchWooAPI<
          IWooCategory,
          {
            description: string; //
            // supplier_id: string;
            // supplier_key: string;
            // acf: { supplier_id: string; supplier_key: string };
          }
        >(
          `/products/categories/${matches[0].id}`,
          {
            description: JSON.stringify({ supplier_id: c.id, supplier_key: 'wps' })
            // supplier_id: c.id + '',
            // supplier_key: 'wps',
            // acf: {
            //   supplier_id: c.id + '',
            //   supplier_key: 'wps'
            // }
            // meta_data: [
            //   { key: 'supplierId', value: c.id },
            //   { key: 'supplier', value: 'wps' }
            // ]
          },
          'put'
        );

        console.log({ updateMeta });
      }
    }
  }
  return;
  const existingParentCats = wpsCategories.filter((c) => !c.parent_id && wooCategories.findIndex((wc) => wc.parent === 0 && wc.slug === c.slug) > -1);
  console.log(existingParentCats);

  // insert parent categories
  const parentCats = wpsCategories.filter((c) => !c.parent_id && wooCategories.findIndex((wc) => wc.parent === 0 && wc.slug === c.slug) === -1);
  console.log({ parentCats });
  if (parentCats.length > 0) {
    const chunks = chunkArray(parentCats, 50);
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      // const parents = await fetchWooAPI<{ id: number }[]>(
      //   `/products/categories/batch`,
      //   {
      //     create: chunk.map((c) => ({
      //       slug: c.slug,
      //       name: c.name,
      //       meta_data: [
      //         { key: 'supplierId', value: c.id },
      //         { key: 'supplier', value: 'wps' }
      //       ]
      //     }))
      //   },
      //   'post'
      // );
      // console.log({ parents });
    }
  }

  // insert child categories (gen 1)
  // const parentIds = wpsCategories.map((c) => c.parent_id);
  // const childCats = wpsCategories.filter((c) => parentIds.indexOf(c.parent_id)>0 && wooCategories.findIndex((wc) => wc.parent === 0 && wc.slug === c.slug) === -1);
  // const inserts = wpsCategories.filter((cat) => !lookupWooCat[cat.slug]);
  // console.log({ inserts });

  /*
  const terms: IWesternTaxonomyTerms[] = [];
  const termLookup = new Set<string>();
  wpsProduct.items.data.forEach((item) => {
    item.taxonomyterms.data.forEach((term) => {
      if (!termLookup.has(term.slug)) {
        terms.push(term);
        termLookup.add(term.slug);
      }
    });
  });

  const categories = {};

  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];
    const category = await fetchWooAPI<{ id: number }[]>(`/products/categories`, { slug: term.slug, _fields: 'id' }, 'get');
    if (category.data?.length > 0) {
      category.data.forEach((cat) => {
        categories[term.slug] = cat;
        console.log('found category', cat);
      });
    } else {
      const category = await fetchWooAPI<{ id: number }[]>(`/products/categories`, { slug: term.slug, name: term.name }, 'post');
      console.log('create category', category);
      categories[term.slug] = category.data;
    }
  }
  */

  // const product = Product.fromWesternProduct(wpsProduct as IWesternProductExt);
  // const hasVariations = product.variations.length > 1;
  // product.variations.forEach((v) => {
  //   v.attribute('sku', v.sku);
  // });
  // const update = product.toWoo();
  // //   console.log({ update });
  // const doUpdate = await fetchWooAPI<IWooVariation[]>(`/products/categories`, update, 'post');
  // //   console.log({ doUpdate });

  // if (hasVariations) {
  //   await deleteWooProductVariations(wooProduct);
  //   await insertWooProductVariations(
  //     wooProduct.id,
  //     product.variations.map((p) => p.toWoo())
  //   );
  // }
}

async function linkCategories() {
  const wpsCategories = await getWesternCategories();
  console.log({ wpsCategories });
  const lookupWpsCat = lookup(wpsCategories, 'id');
  const wooCategories = await getWooCategories();
  console.log({ wooCategories });
  const lookupWooCat = lookup(wooCategories, 'slug');
  const lookupWooCatBySupplierId = lookup(wooCategories, '', (p) => p.acf.supplier_id);
  const lookupWooCatBySlug = lookup(wooCategories, 'slug');
  console.log({ lookupWooCatBySupplierId });

  for (let i = 0; i < wooCategories.length; i++) {
    const wooCat = wooCategories[i];
    const wpsCat = lookupWpsCat[wooCat.acf.supplier_id];
    if (wpsCat && wooCat.acf.supplier_key === 'wps') {
      const wooParent = lookupWooCatBySupplierId[wpsCat.parent_id];
      if (wooParent) {
        const doUpdate = await fetchWooAPI(`/products/categories/${wooCat.id}`, { parent: wooParent.id }, 'put');
        console.log('linkcat', { doUpdate });
      }
    }
  }
}

syncCategories();
