import { FormMethod } from 'react-router-dom';
import { JobManager } from '../../__old/jobs/JobManager';
import { JobRunner } from '../../__old/jobs/JobRunner';
import { formatDuration } from '../../common/utils/formatDuration';
import { Product } from '../../components/woo/Product';
import { SUPPLIER } from '../../utils/SUPPLIER_INFO';
import { chunkArray } from '../../utils/chunkArray';
import { lookup } from '../../utils/lookup';
import { fetchWooAPI, fetchWooProducts } from '../woo/useWoo';
import { IWesternProductExt } from './IWestern';
import { IWooMetaData, IWooParams, IWooVariable } from './IWoo';
import { wooProductsIDb, wpsProductsIDb } from './IndexedDatabase';
import { isValidItem, isValidProduct } from './WesternProducts';
import { isProductAvailable } from './WesternUtils';
import { getWooMetaValue } from './WooUtils';
import { fetchWesternAPI, fetchWesternProduct } from './useWestern';

function stopWatch(f: () => unknown, name: string) {
  const start = Date.now();
  const result = f();
  console.log(`${name} took ${formatDuration((Date.now() - start) / 1000)}`);
  return result;
}

function duff(arr: unknown[], func: (i: unknown) => void) {
  let index = 0;
  const where = arr.length % 8;
  while (index < where) {
    func(arr[index++]);
    func(arr[index++]);
    func(arr[index++]);
    func(arr[index++]);
    func(arr[index++]);
    func(arr[index++]);
    func(arr[index++]);
    func(arr[index++]);
  }
  while (index < arr.length) {
    func(arr[index++]);
  }
}

const isWestern = (e: { meta_data?: IWooMetaData[] }) => {
  return (`${getWooMetaValue(e, '_supplier_class')}`?.indexOf('Western') ?? -1) > -1;
};

export const getSupplierIdFromWoo = (p: { sku?: string }) => {
  // extract supplier id from woo sku MASTER_{supplier}_{id}
  return p.sku.indexOf('_') ? parseInt(p.sku.split('_').pop()) : null;
};

export interface IWesternDifJobPayload {
  lastUpdate?: string;
  wooProducts?: Partial<IWooVariable>[];
  wpsProducts?: Partial<IWesternProductExt>[];
  updates: Partial<IWooVariable>[];
}

interface IWooDelta<D = unknown> {
  path: string;
  params: IWooParams;
  method: FormMethod;
  data: D;
}

const processDeltas = async (config: { deltas: IWooDelta[]; onComplete: () => void; onSuccess: (data: unknown, length: number) => void; onError: (delta: unknown, result: unknown) => void; onResume: () => void; jobRef: JobRunner }) => {
  if (config.jobRef.paused === true) {
    config.jobRef.onResume = () => {
      config.onResume();
      processDeltas(config);
    };
    return;
  }
  console.log('processDeltas', config.deltas.length);
  const delta = config.deltas.pop();
  const result = await fetchWooAPI(delta.path, delta.params, delta.method);

  if ((result?.data as any)?.error) {
    config.onError(delta, result);
  } else {
    config.onSuccess(delta, config.deltas.length);
  }

  if (config.deltas.length > 0) {
    processDeltas({ ...config });
  } else {
    config.onComplete();
  }
};

class Job_loadWPSProducts extends JobRunner<IWesternDifJobPayload> {
  name = 'Load WPS Products';

  async doRun() {
    this.onProgress(0);
    const totalProducts = (await fetchWesternAPI<{ count: number }>(`/products`, { countOnly: true, ...(this.input?.lastUpdate ? { 'filter[updated_at][gt]': this.input?.lastUpdate } : {}) })).data.count || 0;
    // const dbHandler = new IndexedDBHandler<Partial<IWesternProductExt>>('wpsProducts');
    const count = await wpsProductsIDb.getRecordCount();
    console.log({ count, totalProducts });

    if (count === totalProducts) {
      const allData = await wpsProductsIDb.retrieveAllData();
      this.log(`Found ${allData.length.toLocaleString()} WPS Products (cache)`);
      this.onComplete({ ...this.input, wpsProducts: allData });
      return;
    }
    await wpsProductsIDb.deleteAllRecords();

    if (count === 0) {
      this.onComplete({ ...this.input, wpsProducts: [] });
      return;
    }

    const wpsProducts: Partial<IWesternProductExt>[] = [];
    const loadNext = async (cursor: string = null) => {
      if (this.paused === true) {
        this.onResume = () => loadNext(cursor);
        return;
      }
      const page = await fetchWesternAPI<Partial<IWesternProductExt>[]>(`/products`, {
        include: 'items',
        'page[size]': 1000,
        'page[cursor]': cursor,
        'filter[updated_at][gt]': this.input?.lastUpdate
      });

      wpsProducts.push(...page.data);
      await wpsProductsIDb
        .addData(
          page.data.map((p) => ({
            id: p.id,
            // sku: p.sku,
            name: p.name,
            date_modified: p.updated_at,
            items: p.items
            // items: { data: p.items.data.map((item) => ({ sku: item.sku, updated_at: item.updated_at })) }
            // meta_data: p.meta_data
          }))
        )
        .catch((err) => console.log(err));

      this.onProgress(wpsProducts.length / count);

      if (page.meta.cursor.next) {
        loadNext(page.meta.cursor.next);
      } else {
        this.log(`Found ${wpsProducts.length.toLocaleString()} WPS Products`);
        this.onComplete({ ...this.input, wpsProducts });
      }
    };

    loadNext();
  }
}

class Job_getWooProducts extends JobRunner<IWesternDifJobPayload> {
  name = 'Get Woo Products';
  key = 'woo_products';
  _fields = 'id,sku,meta_data,name,date_modified';

  async doRun() {
    const totalProducts = (await fetchWooProducts({ page: 1, per_page: 1, _fields: 'id' })).meta.totalPages;
    // const wooProductsIDb = new IndexedDBHandler<Partial<IWooVariable>>('wooProducts');
    const count = await wooProductsIDb.getRecordCount();
    console.log({ count, totalProducts });

    if (count === totalProducts) {
      const allData = await wooProductsIDb.retrieveAllData();
      this.log(`Found ${allData.length.toLocaleString()} Woo Products (cache)`);
      this.onComplete({ ...this.input, wooProducts: allData });
      return;
    }
    await wooProductsIDb.deleteAllRecords();

    const wooProducts = [];
    let result: { data: IWooVariable[]; meta: any };

    const loadNext = async (page: number = 1, attempt = 1) => {
      if (this.paused === true) {
        this.onResume = () => {
          super.onResume();
          loadNext(page).catch((err) => {
            console.log({ page }, err);
          });
        };
        return;
      }

      try {
        result = await fetchWooProducts({ page, per_page: 100, _fields: this._fields });
      } catch (err) {
        console.log('attempt 1', err);
        try {
          result = await fetchWooProducts({ page, per_page: 100, _fields: this._fields });
        } catch (err) {
          console.log('attempt 2', err);
        }
      }

      if (result.data.length === 0) {
        this.log(`Found ${wooProducts.length.toLocaleString()} Woo Products (fresh)`);
        this.onComplete({ ...this.input, wooProducts });
      } else {
        try {
          wooProducts.push(...result.data);
          await wooProductsIDb
            .addData(
              result.data.map((p) => ({
                id: p.id,
                sku: p.sku,
                name: p.name,
                date_modified: p.date_modified,
                meta_data: p.meta_data
              }))
            )
            .catch((err) => console.log(err));
          this.onProgress(page / result.meta.totalPages);
          loadNext(page + 1);
        } catch (err) {
          console.log({ err, result });
        }
      }
    };

    loadNext();
  }
}

class Job_deleteDuplicateWooProducts extends JobRunner<IWesternDifJobPayload> {
  // it appears that products are showing up in multiple places in the paginated pull of the woo products
  name = 'Delete Duplicate Woo Products';
  _fields = 'id';

  async doRun() {
    const wooIds = new Set();
    const wooSkus = new Set();
    const duplicateIds = new Set();

    this.input.wooProducts.forEach((p) => {
      if (wooIds.has(p.id) || wooSkus.has(p.sku)) {
        duplicateIds.add(p.id);
      }
      wooIds.add(p.id);
      wooSkus.has(p.sku);
    });

    this.log(`${duplicateIds.size} duplicate ids found in Woo`);

    const dupes = Array.from(duplicateIds);

    for (let i = 0; i < dupes.length; i++) {
      const result = await fetchWooAPI<IWooVariable>(`/products/${dupes[i]}`, { force: true }, 'delete');
      console.log({ result });
      this.onProgress(i / dupes.length);
    }

    const wooProducts = this.input.wooProducts.filter((p) => dupes.indexOf(p.id) === -1);
    this.onComplete({ ...this.input, wooProducts });
  }
}

class Job_deleteSupplierProducts extends JobRunner<IWesternDifJobPayload> {
  name = 'Delete Orphaned Supplier Products in Woo';
  supplier = '';

  constructor(supplier: string) {
    super();
    this.supplier = supplier;
  }

  async doRun() {
    const deltas: { path: string; params: IWooParams & { update?: Partial<IWooVariable>[] }; method: FormMethod; data: Partial<IWooVariable> }[] = [];
    const wpsLookup = lookup(this.input.wpsProducts, 'id');
    // const wpsNameLookup = lookup(this.input.wpsProducts, 'name');
    let i = this.input.wooProducts.length;
    let wooProduct: Partial<IWooVariable>;
    let wpsProduct: Partial<IWesternProductExt>;
    let supplierId: number;

    stopWatch(() => {
      while (i--) {
        wooProduct = this.input.wooProducts[i];
        if (getWooMetaValue(wooProduct, '_supplier_class') === this.supplier) {
          supplierId = getSupplierIdFromWoo(wooProduct);
          wpsProduct = wpsLookup?.[supplierId];
          if (!wpsProduct) {
            deltas.push({ path: `/products/${wooProduct.id}`, params: { _fields: 'id' }, method: 'delete', data: wooProduct });
          }
        }
      }
    }, 'Filter products for delete');

    const totalDeltas = deltas.length;
    // const forDelete = deltas.filter((d) => d.method === 'delete');
    // const forUpdate = deltas.filter((d) => d.method === 'put');
    this.log(`Found ${deltas.length} WPS products for delete in Woo`);
    // this.log(`Found ${forUpdate.length} WPS products for update in Woo`);
    // console.log({ forDelete });
    // console.log({ forUpdate });

    // deltas = forUpdate.slice(0, 1);

    if (totalDeltas > 0) {
      // const wooProductsIDb = new IndexedDBHandler<Partial<IWooVariable>>('wooProducts');
      this.manager.pause();
      if (deltas.length > 0) {
        console.log(`DELETE FROM wp_posts WHERE \`wp_posts\`.\`ID\` IN (${deltas.map((d) => d.data.id).join()})`);
        this.log('Optionally use the following SQL:');
        this.log(`DELETE FROM wp_posts WHERE \`wp_posts\`.\`ID\` IN (${deltas.map((d) => d.data.id).join()})`);
      }

      processDeltas({
        deltas,
        onSuccess: async (delta: IWooDelta<IWooVariable>, length: number) => {
          this.onProgress(length / totalDeltas);
          if (delta.method === 'delete') {
            await wooProductsIDb.deleteRecordById(delta.data.id);
          }
          if (delta.method === 'put') {
            await wooProductsIDb.deleteRecordById(delta.data.id);
          }
        },
        onComplete: () => {
          this.onComplete(this.input);
        },
        onError: (delta) => {
          console.error(delta);
        },
        onResume: () => {
          super.onResume();
        },
        jobRef: this
      });
    } else {
      this.onComplete(this.input);
    }
  }
}

//
//
//
//
//

// class Job_deleteSupplierProducts extends JobRunner<IWesternDifJobPayload> {
//   name = 'Job_deleteSupplierProducts';

//   async doRun() {
//     const wooLookup = {};
//     const wooNameLookup = {};

//     let i = this.input.wooProducts.length;
//     let p: Partial<IWooVariable>;

//     while (i--) {
//       p = this.input.wooProducts[i];
//       wooLookup[getSupplierIdFromWoo(p)] = p;
//       wooNameLookup[p.name] = p;
//     }

//     const wpsLookup = lookup(this.input.wpsProducts, 'id');
//     const wpsNameLookup = lookup(this.input.wpsProducts, 'name');

//     console.log({ wooLookup });
//     // duff(this.input.wooProducts, (p) => (wooLookup[getSupplierIdFromWoo(p)] = p));
//     // const wooLookup = new Set(this.input.wooProducts.map(getSupplierIdFromWoo));
//     console.log('wpsProducts', this.input.wpsProducts.length);
//     console.log('wooProducts', this.input.wooProducts.length);
//     const inserts = this.input.wpsProducts.filter((p) => !wooLookup[p.id]);
//     const updates = [];
//     const deletes = this.input.wooProducts.filter((p) => {
//       const supplierId = getSupplierIdFromWoo(p);
//       if (!wpsLookup[supplierId]) {
//         if (wpsNameLookup[p.name]) {
//           // updates.push({ woo: p, wps: wpsNameLookup[p.name] });
//           updates.push({ id: p.id, sku: `MASTER_WPS_${wpsNameLookup[p.name].id}` });
//           return false;
//         }
//         return true;
//       }
//     });
//     console.log({ inserts });
//     console.log({ deletes });
//     console.log({ updates });

//     const dbHandler = new IndexedDBHandler<Partial<IWooVariable>>('wooProducts');

//     const deltas: { path: string; params: IWooParams; method: FormMethod; data: unknown }[] = deletes.map((d) => ({ path: `/products/${d.id}`, params: { _fields: 'id' }, method: 'delete', data: d }));
//     const totalDeltas = deltas.length;

//     if (totalDeltas > 0) {
//       this.log('Start deletes...');
//       console.log(`DELETE FROM wp_posts WHERE \`wp_posts\`.\`ID\` IN (${deletes.map((d) => d.id).join()})`);
//       this.manager.pause();
//       this.log('Optionally use the following SQL:');
//       this.log(`DELETE FROM wp_posts WHERE \`wp_posts\`.\`ID\` IN (${deletes.map((d) => d.id).join()})`);

//       processDeltas({
//         deltas,
//         onSuccess: async (data: IWooVariable, length: number) => {
//           this.onProgress(length / totalDeltas);
//           await dbHandler.deleteRecordById(data.id);
//         },
//         onComplete: () => {
//           this.onComplete(this.input);
//         },
//         onError: (err) => {
//           console.log(err);
//         },
//         onResume: () => {
//           super.onResume();
//         },
//         jobRef: this
//       });
//     } else {
//       this.onComplete(this.input);
//     }

//     // for (let i = 0; i < deletes.length; i++) {
//     //   const result = await fetchWooAPI(`/products/${deletes[i].id}`, { _fields: 'id' }, 'delete');
//     //   console.log(result);
//     //   await dbHandler.deleteRecordById(deletes[i].id);
//     //   this.onProgress((base_i + i) / totalDeltas);
//     // }
//     // base_i += deletes.length;

//     // const chunks = chunkArray(updates, 50);

//     // //   const loadNext = async (chunkIndex: number) => {
//     // //     if (this.paused === true) {
//     // //       this.onResume = () => {
//     // //         super.onResume();
//     // //         loadNext(chunkIndex);
//     // //       };
//     // //       return;
//     // //     }
//     // //     const update = chunks[chunkIndex];
//     // //     await fetchWooAPI(`/products/batch`, { update }, 'put').catch(async (err) => {
//     // //       this.log(err);
//     // //       const chunks = chunkArray(update, 10);
//     // //       this.log('break into smaller chunks');
//     // //       await Promise.all(chunks.map((update) => fetchWooAPI(`/products/batch`, { update }, 'put'))).catch((err) => {
//     // //         this.log(err);
//     // //       });
//     // //     });

//     // for (let i = 0; i < chunks.length; i++) {
//     //   const result = await fetchWooAPI(`/products/batch`, { update: chunks[i] }, 'put');
//     //   console.log(result);
//     //   this.onProgress((base_i + i) / totalDeltas);
//     // }

//     // await Promise.all(
//     //   chunks.map((update, i) => {
//     //     return fetchWooAPI(`/products/batch`, { update }, 'put').then(() => {
//     //       this.onProgress(i / chunks.length);
//     //     });
//     //   })
//     // );

//     // this.onComplete(this.input);

//     // let now = Date.now();
//     // const wooProducts = this.input.wooProducts.filter(isWestern);
//     // const wpsProducts = this.input.wpsProducts.filter(isValidProduct);
//     // console.log({ wooProducts });
//     // console.log({ wpsProducts });
//     // console.log({ all_wooProducts: this.input.wooProducts });
//     // console.log({ all_wpsProducts: this.input.wpsProducts });
//     // const wooLookup = new Set(wooProducts.map(getSupplierIdFromWoo));
//     // const wpsLookup = new Set(wpsProducts.map((p) => p.id));

//     // const wpsProductsIds = wpsProducts.map((p) => p.id);
//     // const wooProductIds = wooProducts.map((p) => getSupplierIdFromWoo(p));

//     // const inserts = [];
//     // const deletes = [1];

//     // // Comparing the arrays
//     // for (const id of wpsProductsIds) {
//     //   if (!wooProductIds.includes(id)) {
//     //     inserts.push(id);
//     //   }
//     // }

//     // for (const id of wooProductIds) {
//     //   if (!wpsProductsIds.includes(id)) {
//     //     deletes.push(id);
//     //   }
//     // }
//     // console.log({ deletes, inserts });

//     // const insertProducts = [];
//     // wpsLookup.forEach((wpsId) => {
//     //   if (!wooLookup.has(wpsId)) insertProducts.push(wpsId);
//     // });

//     // const deleteProducts: Partial<IWooVariable>[] = [];
//     // wooProducts.forEach((p) => {
//     //   // console.log(p.sku,'=>',getSupplierIdFromWoo(p), 'wpsLookup.has:',wpsLookup.has(getSupplierIdFromWoo(p)));
//     //   const i = wpsProducts.findIndex((w) => w.id === getSupplierIdFromWoo(p));
//     //   if (i === -1) {
//     //     // if (!wpsProducts.find((w) => w.id === getSupplierIdFromWoo(p))) {
//     //     deleteProducts.push(p);
//     //   }
//     // });

//     // deleteProducts.forEach((p) => {
//     //   const f = wpsProducts.find((w) => w.id === getSupplierIdFromWoo(p));
//     //   if (f) {
//     //     console.log('failed', p.sku, f);
//     //   }
//     // });

//     // (window as any).wpsProducts = wpsProducts;
//     // (window as any).wooProducts = wooProducts;

//     // // wooLookup.forEach((wpsId) => {
//     // //   if (!wpsLookup.has(wpsId)) deleteProducts.push(wpsId);
//     // // });
//     // // const insertProducts = wpsProducts.filter((p) => !wooLookup.has(p.id));
//     // // const deleteProducts = wooProducts.filter((p) => !wpsLookup.has(p.id));

//     // console.log({ insertProducts, deleteProducts }, formatDuration((Date.now() - now) / 1000));
//     // this.onComplete(this.input);

//     // // deleteProducts.slice(0, 3).forEach((id, i) => {
//     // //   console.log(
//     // //     'delete',
//     // //     id,
//     // //     wpsProducts.find((w) => w.id === id)
//     // //   );
//     // // });

//     // // if (this.input.updates.length > 0) {
//     // //   const chunks = chunkArray(this.input.updates, 50);

//     // //   const loadNext = async (chunkIndex: number) => {
//     // //     if (this.paused === true) {
//     // //       this.onResume = () => {
//     // //         super.onResume();
//     // //         loadNext(chunkIndex);
//     // //       };
//     // //       return;
//     // //     }
//     // //     const update = chunks[chunkIndex];
//     // //     await fetchWooAPI(`/products/batch`, { update }, 'put').catch(async (err) => {
//     // //       this.log(err);
//     // //       const chunks = chunkArray(update, 10);
//     // //       this.log('break into smaller chunks');
//     // //       await Promise.all(chunks.map((update) => fetchWooAPI(`/products/batch`, { update }, 'put'))).catch((err) => {
//     // //         this.log(err);
//     // //       });
//     // //     });
//     // //     chunkIndex++;
//     // //     this.onProgress(chunkIndex / chunks.length);
//     // //     if (chunkIndex < chunks.length) {
//     // //       loadNext(chunkIndex);
//     // //     } else {
//     // //       this.onComplete();
//     // //     }
//     // //   };

//     // //   loadNext(0);
//     // // } else {
//     // //   this.onComplete();
//     // // }
//   }
// }

class Job_insertSupplierProducts extends JobRunner<IWesternDifJobPayload> {
  name = 'Insert New Supplier Products';

  async doRun() {
    const wpsLookup = lookup(this.input.wpsProducts, 'id');
    const wooLookup = lookup(this.input.wooProducts, 'id', (p) => getSupplierIdFromWoo(p));

    // let i = this.input.wooProducts.length;
    // let p: Partial<IWooVariable>;

    // while (i--) {
    //   p = this.input.wooProducts[i];
    //   wooLookup[getSupplierIdFromWoo(p)] = p;
    // }

    console.log({ wpsLookup });
    console.log({ wooLookup });
    // duff(this.input.wooProducts, (p) => (wooLookup[getSupplierIdFromWoo(p)] = p));
    // const wooLookup = new Set(this.input.wooProducts.map(getSupplierIdFromWoo));
    console.log('wpsProducts', this.input.wpsProducts.length);
    console.log('wooProducts', this.input.wooProducts.length);

    const inserts = this.input.wpsProducts.filter((p) => !wooLookup[p.id] && isProductAvailable(p) && p.items.data.filter(isValidItem).length > 1).slice(0, 1);
    // console.log({ inserts });
    this.log('Start inserts...');

    const insertProduct = async (index: number) => {
      const wpsId = inserts[index].id;
      const wpsProduct = await fetchWesternProduct(wpsId);
      console.log(index, 'wpsProduct', wpsProduct);
      const product = Product.fromWesternProduct(wpsProduct);
      console.log({ product });
      const wooProduct = product.toWoo();
      console.log('insert', { ...wooProduct });

      // const result = await fetchWooAPI(`/products`, wooProduct, 'post');
      this.manager.pause();
      return;

      const result = await fetchWooAPI<{ create: IWooVariable[] }>(`/products/batch`, { create: [wooProduct] }, 'post');
      console.log({ result: result });
      let resultRow: IWooVariable = result.data?.create?.[0];
      return;
      if (resultRow?.error && resultRow?.error?.data?.resource_id) {
        const wooP = await fetchWooAPI<IWooVariable>(`/products/${resultRow?.error?.data?.resource_id}`, { _fields: 'id,sku,name' }, 'get');
        console.log({ wooP });
        if (wooP?.data?.id) {
          resultRow = wooP.data;
          console.log('after checking, this product already exists');
          // we should check for the current variations
        }
      }

      if (resultRow?.error) {
        console.error(resultRow?.error);
      } else if (resultRow?.id) {
        if (product.variations.length > 1) {
          const wooVariations = product.variations.map((v) => v.toWoo());
          console.log({ wooVariations });
          const result2 = await fetchWooAPI(`/products/${resultRow.id}/variations/batch`, { create: wooVariations }, 'post');
          console.log({ result2: result2.data });
        }
      } else {
        console.log('Problems...');
      }
      index++;

      if (index < inserts.length) {
        insertProduct(index);
      } else {
        this.onComplete(this.input);
      }
    };

    if (inserts.length > 0) {
      insertProduct(0);
    } else {
      this.onComplete(this.input);
    }

    // const totalDeltas = inserts.length + deletes.length + updates.length;
    // let base_i = 0;

    // const dbHandler = new IndexedDBHandler<Partial<IWooVariable>>('wooProducts');

    // const deltas: { path: string; params: IWooParams; method: FormMethod; data: unknown }[] = deletes.map((d) => ({ path: `/products/${d.id}`, params: { _fields: 'id' }, method: 'delete', data: d }));
    // const totalDeltas = deltas.length;

    // if (totalDeltas > 0) {

    //   processDeltas({
    //     deltas,
    //     onSuccess: async (data: IWooVariable, length: number) => {
    //       this.onProgress(length / totalDeltas);
    //       await dbHandler.deleteRecordById(data.id);
    //     },
    //     onComplete: () => {
    //       this.onComplete(this.input);
    //     },
    //     onError: (err) => {
    //       console.log(err);
    //     },
    //     onResume: () => {
    //       super.onResume();
    //     },
    //     jobRef: this
    //   });
    // } else {
    //   this.onComplete(this.input);
    // }

    // for (let i = 0; i < deletes.length; i++) {
    //   const result = await fetchWooAPI(`/products/${deletes[i].id}`, { _fields: 'id' }, 'delete');
    //   console.log(result);
    //   await dbHandler.deleteRecordById(deletes[i].id);
    //   this.onProgress((base_i + i) / totalDeltas);
    // }
    // base_i += deletes.length;

    // const chunks = chunkArray(updates, 50);

    // //   const loadNext = async (chunkIndex: number) => {
    // //     if (this.paused === true) {
    // //       this.onResume = () => {
    // //         super.onResume();
    // //         loadNext(chunkIndex);
    // //       };
    // //       return;
    // //     }
    // //     const update = chunks[chunkIndex];
    // //     await fetchWooAPI(`/products/batch`, { update }, 'put').catch(async (err) => {
    // //       this.log(err);
    // //       const chunks = chunkArray(update, 10);
    // //       this.log('break into smaller chunks');
    // //       await Promise.all(chunks.map((update) => fetchWooAPI(`/products/batch`, { update }, 'put'))).catch((err) => {
    // //         this.log(err);
    // //       });
    // //     });

    // for (let i = 0; i < chunks.length; i++) {
    //   const result = await fetchWooAPI(`/products/batch`, { update: chunks[i] }, 'put');
    //   console.log(result);
    //   this.onProgress((base_i + i) / totalDeltas);
    // }

    // await Promise.all(
    //   chunks.map((update, i) => {
    //     return fetchWooAPI(`/products/batch`, { update }, 'put').then(() => {
    //       this.onProgress(i / chunks.length);
    //     });
    //   })
    // );

    // this.onComplete(this.input);

    // let now = Date.now();
    // const wooProducts = this.input.wooProducts.filter(isWestern);
    // const wpsProducts = this.input.wpsProducts.filter(isValidProduct);
    // console.log({ wooProducts });
    // console.log({ wpsProducts });
    // console.log({ all_wooProducts: this.input.wooProducts });
    // console.log({ all_wpsProducts: this.input.wpsProducts });
    // const wooLookup = new Set(wooProducts.map(getSupplierIdFromWoo));
    // const wpsLookup = new Set(wpsProducts.map((p) => p.id));

    // const wpsProductsIds = wpsProducts.map((p) => p.id);
    // const wooProductIds = wooProducts.map((p) => getSupplierIdFromWoo(p));

    // const inserts = [];
    // const deletes = [1];

    // // Comparing the arrays
    // for (const id of wpsProductsIds) {
    //   if (!wooProductIds.includes(id)) {
    //     inserts.push(id);
    //   }
    // }

    // for (const id of wooProductIds) {
    //   if (!wpsProductsIds.includes(id)) {
    //     deletes.push(id);
    //   }
    // }
    // console.log({ deletes, inserts });

    // const insertProducts = [];
    // wpsLookup.forEach((wpsId) => {
    //   if (!wooLookup.has(wpsId)) insertProducts.push(wpsId);
    // });

    // const deleteProducts: Partial<IWooVariable>[] = [];
    // wooProducts.forEach((p) => {
    //   // console.log(p.sku,'=>',getSupplierIdFromWoo(p), 'wpsLookup.has:',wpsLookup.has(getSupplierIdFromWoo(p)));
    //   const i = wpsProducts.findIndex((w) => w.id === getSupplierIdFromWoo(p));
    //   if (i === -1) {
    //     // if (!wpsProducts.find((w) => w.id === getSupplierIdFromWoo(p))) {
    //     deleteProducts.push(p);
    //   }
    // });

    // deleteProducts.forEach((p) => {
    //   const f = wpsProducts.find((w) => w.id === getSupplierIdFromWoo(p));
    //   if (f) {
    //     console.log('failed', p.sku, f);
    //   }
    // });

    // (window as any).wpsProducts = wpsProducts;
    // (window as any).wooProducts = wooProducts;

    // // wooLookup.forEach((wpsId) => {
    // //   if (!wpsLookup.has(wpsId)) deleteProducts.push(wpsId);
    // // });
    // // const insertProducts = wpsProducts.filter((p) => !wooLookup.has(p.id));
    // // const deleteProducts = wooProducts.filter((p) => !wpsLookup.has(p.id));

    // console.log({ insertProducts, deleteProducts }, formatDuration((Date.now() - now) / 1000));
    // this.onComplete(this.input);

    // // deleteProducts.slice(0, 3).forEach((id, i) => {
    // //   console.log(
    // //     'delete',
    // //     id,
    // //     wpsProducts.find((w) => w.id === id)
    // //   );
    // // });

    // // if (this.input.updates.length > 0) {
    // //   const chunks = chunkArray(this.input.updates, 50);

    // //   const loadNext = async (chunkIndex: number) => {
    // //     if (this.paused === true) {
    // //       this.onResume = () => {
    // //         super.onResume();
    // //         loadNext(chunkIndex);
    // //       };
    // //       return;
    // //     }
    // //     const update = chunks[chunkIndex];
    // //     await fetchWooAPI(`/products/batch`, { update }, 'put').catch(async (err) => {
    // //       this.log(err);
    // //       const chunks = chunkArray(update, 10);
    // //       this.log('break into smaller chunks');
    // //       await Promise.all(chunks.map((update) => fetchWooAPI(`/products/batch`, { update }, 'put'))).catch((err) => {
    // //         this.log(err);
    // //       });
    // //     });
    // //     chunkIndex++;
    // //     this.onProgress(chunkIndex / chunks.length);
    // //     if (chunkIndex < chunks.length) {
    // //       loadNext(chunkIndex);
    // //     } else {
    // //       this.onComplete();
    // //     }
    // //   };

    // //   loadNext(0);
    // // } else {
    // //   this.onComplete();
    // // }
  }
}

class Job_findDif extends JobRunner<IWesternDifJobPayload> {
  name = 'Dif';

  async doRun() {
    let now = Date.now();
    const wooProducts = this.input.wooProducts.filter(isWestern);
    const wpsProducts = this.input.wpsProducts.filter(isValidProduct);
    console.log({ wooProducts });
    console.log({ wpsProducts });
    console.log({ all_wooProducts: this.input.wooProducts });
    console.log({ all_wpsProducts: this.input.wpsProducts });
    const wooLookup = new Set(wooProducts.map(getSupplierIdFromWoo));
    const wpsLookup = new Set(wpsProducts.map((p) => p.id));

    const wpsProductsIds = wpsProducts.map((p) => p.id);
    const wooProductIds = wooProducts.map((p) => getSupplierIdFromWoo(p));

    const inserts = [];
    const deletes = [1];

    // Comparing the arrays
    for (const id of wpsProductsIds) {
      if (!wooProductIds.includes(id)) {
        inserts.push(id);
      }
    }

    for (const id of wooProductIds) {
      if (!wpsProductsIds.includes(id)) {
        deletes.push(id);
      }
    }
    console.log({ deletes, inserts });

    const insertProducts = [];
    wpsLookup.forEach((wpsId) => {
      if (!wooLookup.has(wpsId)) insertProducts.push(wpsId);
    });

    const deleteProducts: Partial<IWooVariable>[] = [];
    wooProducts.forEach((p) => {
      // console.log(p.sku,'=>',getSupplierIdFromWoo(p), 'wpsLookup.has:',wpsLookup.has(getSupplierIdFromWoo(p)));
      const i = wpsProducts.findIndex((w) => w.id === getSupplierIdFromWoo(p));
      if (i === -1) {
        // if (!wpsProducts.find((w) => w.id === getSupplierIdFromWoo(p))) {
        deleteProducts.push(p);
      }
    });

    deleteProducts.forEach((p) => {
      const f = wpsProducts.find((w) => w.id === getSupplierIdFromWoo(p));
      if (f) {
        console.log('failed', p.sku, f);
      }
    });

    (window as any).wpsProducts = wpsProducts;
    (window as any).wooProducts = wooProducts;

    // wooLookup.forEach((wpsId) => {
    //   if (!wpsLookup.has(wpsId)) deleteProducts.push(wpsId);
    // });
    // const insertProducts = wpsProducts.filter((p) => !wooLookup.has(p.id));
    // const deleteProducts = wooProducts.filter((p) => !wpsLookup.has(p.id));

    console.log({ insertProducts, deleteProducts }, formatDuration((Date.now() - now) / 1000));
    this.onComplete(this.input);

    // deleteProducts.slice(0, 3).forEach((id, i) => {
    //   console.log(
    //     'delete',
    //     id,
    //     wpsProducts.find((w) => w.id === id)
    //   );
    // });

    // if (this.input.updates.length > 0) {
    //   const chunks = chunkArray(this.input.updates, 50);

    //   const loadNext = async (chunkIndex: number) => {
    //     if (this.paused === true) {
    //       this.onResume = () => {
    //         super.onResume();
    //         loadNext(chunkIndex);
    //       };
    //       return;
    //     }
    //     const update = chunks[chunkIndex];
    //     await fetchWooAPI(`/products/batch`, { update }, 'put').catch(async (err) => {
    //       this.log(err);
    //       const chunks = chunkArray(update, 10);
    //       this.log('break into smaller chunks');
    //       await Promise.all(chunks.map((update) => fetchWooAPI(`/products/batch`, { update }, 'put'))).catch((err) => {
    //         this.log(err);
    //       });
    //     });
    //     chunkIndex++;
    //     this.onProgress(chunkIndex / chunks.length);
    //     if (chunkIndex < chunks.length) {
    //       loadNext(chunkIndex);
    //     } else {
    //       this.onComplete();
    //     }
    //   };

    //   loadNext(0);
    // } else {
    //   this.onComplete();
    // }
  }
}

class Job_analyze extends JobRunner<IWesternDifJobPayload> {
  name = 'Analyze';

  async doRun() {
    // const wooLookup = lookup(this.input.wooProducts, 'id');
    // const wpsLookup = lookup(this.input.wpsProducts, 'id');
    // const wooNameLookup = lookup(this.input.wooProducts, 'name');

    // const wpsNameLookup = stopWatch(() => lookup(this.input.wpsProducts, 'name'), 'build wpsNameLookup');

    const wpsNameLookup = {};
    const dupes = {};
    // let index = 0;
    const arr = this.input.wpsProducts;
    const func = (p: IWesternProductExt) => {
      if (wpsNameLookup[p.name]) {
        if (!dupes[p.name]) dupes[p.name] = [];
        dupes[p.name].push(p);
      }
      wpsNameLookup[p.name] = p;
    };

    stopWatch(() => {
      duff(arr, func);
    }, 'duffy func');

    // stopWatch(() => {
    //   const where = arr.length % 8;
    //   while (index < where) {
    //     func(arr[index++]);
    //     func(arr[index++]);
    //     func(arr[index++]);
    //     func(arr[index++]);
    //     func(arr[index++]);
    //     func(arr[index++]);
    //     func(arr[index++]);
    //     func(arr[index++]);
    //   }
    //   while (index < arr.length) {
    //     func(arr[index++]);
    //   }
    // }, 'duffy');

    // stopWatch(() => lookup(this.input.wpsProducts, 'name'), 'build wpsNameLookup');

    // const wpsLookup = lookup(this.input.wpsProducts, 'name'); //  new Set(this.input.wpsProducts.map((p) => p.name));
    const updates = [];
    console.log({ wpsNameLookup });
    console.log({ dupes });
    console.log({ wooProducts: this.input.wooProducts });

    stopWatch(() => {
      for (let i = 0; i < this.input.wooProducts.length; i++) {
        const wooProduct = this.input.wooProducts[i];
        const wpsProduct = wpsNameLookup[wooProduct.name];

        if (wpsProduct) {
          const oldSku = wooProduct.sku;
          const newWooSku = `MASTER_WPS_${wpsProduct.id}`;
          if (oldSku !== newWooSku) {
            updates.push({
              // name: wooProduct.name,
              id: wooProduct.id, //
              // oldSku,
              // wpsId: wpsProduct.id,
              sku: newWooSku
            });
          }
        }
      }
    }, 'find updates');
    // const wpsId = getSupplierIdFromWoo(p);
    // if (isWestern(p) && !wpsLookup.has(wpsId)) {
    //   deletes.push(wpsId);
    // }

    console.log({ updates });

    // let index = 0;
    // const deleteNextProduct = async () => {
    //   const result = await fetchWooAPI<IWooVariable>(`/products/${deletes[index]}`, {}, 'delete');
    //   console.log({ result });
    //   index++;
    //   this.onComplete(this.input);
    // };
    // deleteNextProduct();

    this.onComplete({ ...this.input, updates });
  }
}

class Job_updateSkus extends JobRunner<IWesternDifJobPayload> {
  name = 'Update Skus';

  async doRun() {
    // const wooLookup = lookup(this.input.wooProducts, 'id');
    // const wpsLookup = lookup(this.input.wpsProducts, 'id');
    // const wooNameLookup = lookup(this.input.wooProducts, 'name');
    const wpsNameLookup = lookup(this.input.wpsProducts, 'name');
    // const wpsLookup = lookup(this.input.wpsProducts, 'name'); //  new Set(this.input.wpsProducts.map((p) => p.name));
    const updates = [];
    console.log({ wpsNameLookup });
    console.log({ wooProducts: this.input.wooProducts });

    for (let i = 0; i < this.input.wooProducts.length; i++) {
      const wooProduct = this.input.wooProducts[i];
      const wpsProduct = wpsNameLookup[wooProduct.name];

      if (wpsProduct) {
        const oldSku = wooProduct.sku;
        const newWooSku = `MASTER_WPS_${wpsProduct.id}`;
        if (oldSku !== newWooSku) {
          updates.push({
            // name: wooProduct.name,
            id: wooProduct.id, //
            // oldSku,
            // wpsId: wpsProduct.id,
            sku: newWooSku
          });
        }
      }
      // const wpsId = getSupplierIdFromWoo(p);
      // if (isWestern(p) && !wpsLookup.has(wpsId)) {
      //   deletes.push(wpsId);
      // }
    }

    console.log({ updates });

    // let index = 0;
    // const deleteNextProduct = async () => {
    //   const result = await fetchWooAPI<IWooVariable>(`/products/${deletes[index]}`, {}, 'delete');
    //   console.log({ result });
    //   index++;
    //   this.onComplete(this.input);
    // };
    // deleteNextProduct();

    this.onComplete({ ...this.input, updates });
  }
}
// 8970 updates
class Job_wooBatchUpdates extends JobRunner<IWesternDifJobPayload> {
  name = 'Push Woo Deltas';

  async doRun() {
    if (this.input.updates.length > 0) {
      const chunks = chunkArray(this.input.updates, 50);

      const loadNext = async (chunkIndex: number) => {
        if (this.paused === true) {
          this.onResume = () => {
            super.onResume();
            loadNext(chunkIndex);
          };
          return;
        }
        const update = chunks[chunkIndex];
        let result: any;
        try {
          result = await fetchWooAPI(`/products/batch`, { update }, 'put');
        } catch (err) {
          console.log(err);
          const chunks = chunkArray(update, 10);
          this.log('break into smaller chunks');
          try {
            result = await Promise.all(chunks.map((update) => fetchWooAPI(`/products/batch`, { update }, 'put'))).catch((err) => {
              this.log(err);
            });
          } catch (err) {
            console.log(err);
          }
        }
        // set invalid skus to tmp value so we can change them to the correct sku on the next full job
        console.log({ result });
        if (result.data.update) {
          const update = result.data.update.filter((u) => u?.error?.code === 'product_invalid_sku').map((u) => ({ id: u.id, sku: `TEMP_WPS_${u.id}` }));
          console.log({ update });
          try {
            result = await fetchWooAPI(`/products/batch`, { update }, 'put');
          } catch (err) {
            console.log(err);
          }
          console.log({ result });
        }

        // await fetchWooAPI(`/products/batch`, { update }, 'put').catch(async (err) => {
        //   this.log(err);
        //   const chunks = chunkArray(update, 10);
        //   this.log('break into smaller chunks');
        //   await Promise.all(chunks.map((update) => fetchWooAPI(`/products/batch`, { update }, 'put'))).catch((err) => {
        //     this.log(err);
        //   });
        // });
        chunkIndex++;
        this.onProgress(chunkIndex / chunks.length);
        if (chunkIndex < chunks.length) {
          loadNext(chunkIndex);
        } else {
          this.onComplete(this.input);
        }
      };

      loadNext(0);
    } else {
      this.onComplete(this.input);
    }
  }
}

class Job_bulkDelete extends JobRunner<IWesternDifJobPayload> {
  name = 'Bulk Delete';

  async doRun() {
    const wpsLookup = new Set(this.input.wpsProducts.map((p) => p.id));
    const deletes = [];

    for (let i = 0; i < this.input.wooProducts.length; i++) {
      const p = this.input.wooProducts[i];
      const wpsId = getSupplierIdFromWoo(p);
      if (isWestern(p) && !wpsLookup.has(wpsId)) {
        deletes.push(wpsId);
      }
    }

    console.log({ deletes });

    // let index = 0;
    // const deleteNextProduct = async () => {
    //   const result = await fetchWooAPI<IWooVariable>(`/products/${deletes[index]}`, {}, 'delete');
    //   console.log({ result });
    //   index++;
    //   this.onComplete(this.input);
    // };
    // deleteNextProduct();

    this.onComplete(this.input);
  }
}

class Job_complete extends JobRunner<IWesternDifJobPayload> {
  name = 'Complete';

  async doRun() {
    console.log({ input: this.input });
    this.onComplete(this.input);
  }
}

export const WesternDifJobManager = new JobManager<IWesternDifJobPayload>({
  name: 'Western Dif',
  stages: [
    new Job_loadWPSProducts(),
    new Job_getWooProducts(),
    new Job_deleteDuplicateWooProducts(),
    // new Job_deleteSupplierProducts(),
    new Job_deleteSupplierProducts(SUPPLIER.WPS.supplierClass),
    new Job_insertSupplierProducts(),
    // new Job_analyze(),
    // new Job_getTotalWPSProducts(), //
    // new Job_testWooProducts(),
    // new Job_findDif(),
    // new Job_bulkDelete()
    // new Job_updateSkus(),
    // new Job_wooBatchUpdates(),
    new Job_complete()
  ]
});
