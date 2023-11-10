import { JobManager } from '../../../jobs/JobManager';
import { JobRunner } from '../../../jobs/JobRunner';
import { formatDuration } from '../../../utils/formatDuration';
import { lookup } from '../../../utils/lookup';
import { fetchWooAPI } from '../../woo/useWoo';
import { IWesternProductExt } from '../IWestern';
import { IWooSimpleProduct, IWooVariable } from '../IWoo';
import { wooListDb, wpsListDb } from '../IndexedDatabase';
import { getSupplierId, getTotalWPSProducts, importWesternProduct, isWestern } from '../WPSJobUtils';
import { getSupplierIdFromWoo } from '../WesternDifJob';
import { isValidProduct } from '../WesternProducts';
import { Job_loadAllWooProducts_payload } from '../tasks/Job_loadAllWooProducts';
import { Job_loadAllWpsProducts_payload } from '../tasks/Job_loadAllWpsProducts';
import { fetchWesternAPI } from '../useWestern';

export interface IWesternInsertPayload extends Job_start_payload, Job_loadAllWooProducts_payload, Job_loadAllWpsProducts_payload {
  startTime: number;
  cursor?: string;
  inserts: { id: number; sku: string }[];
  deletes: { id: number; sku: string }[];
}

const TestProduct1 = {
  type: 'simple',
  sku: 'MASTER_WPS_24',
  name: 'Thread Chasers',
  description: '<ul><li>Thread Chasers are designed to clean and re-cut damaged aluminum threads</li><li>Kit contains the two sizes most common on metric motorcycles - M6x1.0 and M8x1.25</li><li>Removes dirt and metal shavings that become captured in the thread groove</li><li>Uses 8mm or 10mm hex socket</li></ul>',
  meta_data: [
    {
      key: '_ci_additional_images',
      value: 'http://cdn.wpsstatic.com/images/500_max/bc16-5d9651496f416.jpg'
    },
    {
      key: '_ci_data',
      value: '{"id":24,"supplier":"WPS"}'
    }
  ],
  regular_price: '4.99',
  images: [
    {
      name: '',
      src: 'http://cdn.wpsstatic.com/images/500_max/bc16-5d9651496f416.jpg'
    },
    {
      name: '',
      src: 'http://cdn.wpsstatic.com/images/500_max/bc16-592dca650c261.jpg'
    }
  ],
  stock_quantity: 78,
  stock_status: 'instock'
};

const TestProduct2 = {
  type: 'variable',
  sku: 'MASTER_WPS_423322',
  name: 'Seizmik UTV Soft Doors',
  description:
    "<p>Been feeling the wind in your face and the rain in your hair? Not having the best time of it? Don't worry, we've got you covered! Seizmik soft enclosures give you extra protection, whether it's from wind, rain, debris or brush - and no matter what season it is. Plus, dual zipper pulls let you open and close it easily from inside or outside your UTV, and the windows and doors can be rolled up or removed altogether. Get the comfort and flexibility you need - with all the hardware and instructions you need to install it easily</p><ul><li>Professional marine grade 11 ounce polyester canvas that is completely waterproof, puncture resistant, tear resistant AND abrasion resistant.</li><li>Winter season won't stand a chance against our 30 mil tinted Aqua-View Vinyl door windows and rear window - they're crack-resistant all the way down to -20 degrees!</li><li>What's the most convenient way to bring your doors anywhere you go? Roll-away doors and windows! These easy-to-use solutions let you take your doors with you and stow them away when not in use. No more hassle - time to travel with ease!</li><li>Full length double pull YKK marine grade zippers</li><li>Ready for the best installation experience ever? It's official—we're providing all the hardware, installation and care instructions you need to install with confidence!</li></ul>",
  meta_data: [
    {
      key: '_ci_additional_images',
      value: ''
    },
    {
      key: '_ci_data',
      value: '{"id":423322,"supplier":"WPS"}'
    },
    {
      key: '_supplier_class',
      value: 'WooDropship\\Suppliers\\Western'
    }
  ],
  attributes: [
    {
      name: 'Position',
      slug: 'position',
      options: ['Rear'],
      position: 0,
      visible: true,
      variation: true
    },
    {
      name: 'Product Type',
      slug: 'product-type',
      options: ['UTV Cab/Roof/Door', 'Windshield/Windscreen'],
      position: 0,
      visible: true,
      variation: true
    },
    {
      name: 'Lens Color',
      slug: 'lens-color',
      options: ['Clear'],
      position: 0,
      visible: true,
      variation: true
    },
    {
      name: 'sku',
      slug: 'sku',
      options: ['63-06025KIT', '63-20982', '63-20983', '63-20984', '63-20985', '63-20986', '63-20987', '63-20988', '63-20989', '63-20991', '63-20992', '63-20993', '63-20994'],
      position: 0,
      visible: true,
      variation: true
    }
  ]
};

async function runTest(p) {
  console.log({ p });
  const wpsId = getSupplierId(p);
  await importWesternProduct(wpsId);
  // const exists = await fetchWooProductExists(p.sku);
  // console.log({ wpsId, exists });
  // if (!exists) {
  //   const wpsProduct = await getWPSProduct(wpsId);
  //   const wooId = await insertWooProduct(wpsProduct);
  //   console.log({ wooId });
  // }
}

// runTest(TestProduct2);
// { id: number; updated_at: string; items: { data: { id: number; sku: string; status_id: string }

// "id": 353266,
// "sku": "MASTER_WPS_423421",
// "date_modified": "2023-10-24T17:33:10"

interface Job_start_payload {
  startTime: number;
}

class Job_start extends JobRunner<Job_start_payload> {
  name = 'Start Job';

  async doRun() {
    this.log(`Start at ${new Date().toISOString()}`);
    this.onComplete({ ...this.input, startTime: Date.now() });
  }
}

interface Job_end_payload extends Job_start_payload {
  endTime: number;
}

class Job_end extends JobRunner<Job_end_payload> {
  name = 'End Job';

  async doRun() {
    const endTime = Date.now();
    this.log(formatDuration((endTime - this.input.startTime) * 0.001));
    console.log({ input: this.input, endTime });
    this.onComplete({ ...this.input, endTime });
  }
}

class Job_loadAllWooProducts extends JobRunner<Job_loadAllWooProducts_payload> {
  name = 'Job_loadAllWooProducts';

  async doRun() {
    const getPage = async (page: number = 1) => {
      return await fetchWooAPI<Partial<IWooVariable>[]>(`/products`, { _fields: 'id,sku,date_modified', per_page: 100, page }, 'get');
    };

    const processPage = async (pageNumber = 1) => {
      let nextPage: number;
      let totalPages: number;
      const row = await wooListDb.retrieveData(pageNumber);

      if (row) {
        wooProducts.push(...row.data);
        totalPages = row.totalPages;
      } else {
        const page = await getPage(pageNumber);
        totalPages = page.meta.totalPages;
        wooProducts.push(...page.data);
        await wooListDb.addData([{ page: pageNumber, totalPages, data: page.data }]);
      }
      this.onProgress(pageNumber / totalPages);

      nextPage = pageNumber + 1;

      if (nextPage < totalPages) {
        if (this.paused === true) {
          console.log('paused');
          this.onResume = () => processPage(nextPage);
        } else {
          processPage(nextPage);
        }
      } else {
        this.onComplete({ ...this.input, wooProducts });
      }
    };

    const wooProducts = [];
    processPage();
  }
}

class Job_loadAllWpsProducts extends JobRunner<Job_loadAllWpsProducts_payload> {
  name = 'Job_loadAllWpsProducts';

  async doRun() {
    const pageSize = 1000;

    const getPage = async (cursor: string = '') => {
      return await fetchWesternAPI<IWesternProductExt[]>(`/products/`, {
        'page[size]': pageSize, //
        'page[cursor]': cursor,
        include: 'items:filter(status_id|NLA|ne)',
        'fields[items]': 'sku,status_id',
        'fields[products]': 'id,updated_at'
      });
    };

    const processPage = async (cursor = '') => {
      let nextCursor: string;
      const row = await wpsListDb.retrieveData(cursor || 'init');

      if (row) {
        wpsProducts.push(...row.data);
        nextCursor = row.nextCursor;
        console.log('wps cache', cursor);
      } else {
        const page = await getPage(cursor);
        wpsProducts.push(...page.data);
        nextCursor = page?.meta?.cursor?.next ?? '';
        await wpsListDb.addData([{ cursor: cursor || 'init', nextCursor, data: page.data }]);
        console.log('wps fresh', cursor);
      }
      this.onProgress(wpsProducts.length / totalWpsProducts);

      if (nextCursor) {
        if (this.paused === true) {
          console.log('paused');
          this.onResume = () => processPage(nextCursor);
        } else {
          processPage(nextCursor);
        }
      } else {
        this.onComplete({ ...this.input, wpsProducts });
      }
    };

    const totalWpsProducts = await getTotalWPSProducts();
    const wpsProducts = [];
    processPage();
  }
}

// class Job_loadWpsProducts extends JobRunner<IWesternInsertPayload> {
//   // we do this because WPS loads much faster than Woo
//   name = 'Load WPS Products';

//   async doRun() {
//     const getWpsProductsPage = async (cursor: string = '') => {
//       return await fetchWesternAPI<IWesternProductExt[]>(`/products/`, {
//         'page[size]': 1000, //
//         'page[cursor]': cursor,
//         include: 'items:filter(status_id|NLA|ne)',
//         'fields[items]': 'sku,status_id',
//         'fields[products]': 'id,updated_at'
//       });
//     };

//     const processPage = async (cursor = '') => {
//       const page = await getWpsProductsPage(cursor);
//       wpsProducts.push(...page.data);
//       this.onProgress(wpsProducts.length / totalWpsProducts);
//       const nextCursor = page?.meta?.cursor?.next;

//       if (nextCursor) {
//         if (this.paused === true) {
//           console.log('paused');
//           this.onResume = () => processPage(nextCursor);
//         } else {
//           processPage(nextCursor);
//         }
//       } else {
//         this.onComplete({ ...this.input, wpsProducts });
//       }
//     };

//     const totalWpsProducts = await getTotalWPSProducts();
//     // let page = await getWpsProductsPage();
//     const wpsProducts = []; //...page.data];
//     processPage();
//     // while (page?.meta?.cursor?.next) {
//     //   page = await getWpsProductsPage(page.meta.cursor.next);
//     //   wpsProducts.push(...page.data);
//     //   this.onProgress(wpsProducts.length / totalWpsProducts);
//     // }
//     // this.onComplete({ ...this.input, wpsProducts });
//   }
// }

// class Job_insertProductsX extends JobRunner<IWesternInsertPayload> {
//   name = 'Find New Products for insert';

//   async doRun() {
//     const totalWpsProducts = await getTotalWPSProducts();
//     let loadedWpsProducts = 0;
//     const wooPageSize = 100;

//     const getWooProductsBySku = async (skus: string[]) => {
//       const chunks = chunkArray(skus, wooPageSize);
//       const products: IWooVariable[] = [];
//       let i = chunks.length;
//       while (i--) {
//         const result = await fetchWooAPI<IWooVariable[]>(`/products`, { per_page: wooPageSize, sku: chunks[i].join(), _fields: 'id,sku,date_modified' }, 'get');
//         products.push(...result.data);
//       }
//       return products;
//     };

//     // const getWpsProductsPage = async (cursor: string) => {
//     //   return await fetchWesternAPI<IWesternProductExt[]>(`/products/`, {
//     //     'page[size]': 100, //
//     //     'page[cursor]': cursor,
//     //     include: 'items:filter(status_id|NLA|ne)',
//     //     'fields[items]': 'sku,status_id',
//     //     'fields[products]': 'id,updated_at'
//     //   });
//     // };

//     this.onProgress(0);
//     const inserts = [];
//     const report = { insert: 0, invalid: 0, found: 0 };
//     // let wpsIndex = 0;

//     const processPage = async (wpsIndex = 0) => {
//       const wpsProductsPage = this.input.wpsProducts.slice(wpsIndex, wpsIndex + wooPageSize);
//       //  await getWpsProductsPage(cursor);
//       console.log({ wpsProductsPage });
//       const wooSkus = wpsProductsPage.map((p) => `MASTER_${WESTERxN_KEY}_${p.id}`);
//       const wooProductsPage = await getWooProductsBySku(wooSkus);
//       console.log({ wooProductsPage });
//       loadedWpsProducts += wpsProductsPage.length;
//       const lookupWooProduct = lookup(wooProductsPage, 'id', (p) => getSupplierIdFromWoo(p));
//       console.log({ lookupWooProduct });
//       const _inserts = wpsProductsPage.filter((p) => {
//         if (isValidProduct(p)) {
//           if (lookupWooProduct?.[p.id]?.id) {
//             report.found++;
//           } else {
//             report.insert++;
//             return true;
//           }
//         } else {
//           report.invalid++;
//         }
//         return false;
//       });
//       inserts.push(..._inserts);
//       this.onProgress(loadedWpsProducts / totalWpsProducts);
//       const nextIndex = wpsIndex + wooPageSize; //Cursor = wpsProductsPage?.meta?.cursor?.next;
//       // console.log({ nextCursor, cursor, inserts }, loadedWpsProducts, '/', totalWpsProducts);

//       if (nextIndex < this.input.wpsProducts.length) {
//         if (this.paused === true) {
//           console.log('paused');
//           this.onResume = () => processPage(nextIndex);
//         } else {
//           processPage(nextIndex);
//         }
//       } else {
//         this.log(`Found ${inserts.length} products for insert`);
//         this.onComplete({ ...this.input, inserts });
//       }
//     };

//     processPage();
//   }
// }

class Job_insertProducts extends JobRunner<IWesternInsertPayload> {
  name = 'Find New Products for insert';

  async doRun() {
    this.onProgress(0);
    const inserts = [];
    const report = { insert: 0, invalid: 0, found: 0 };
    const lookupWooProduct = lookup(this.input.wooProducts, 'id', (p) => getSupplierIdFromWoo(p));

    let i = this.input.wpsProducts.length;
    let p: IWesternProductExt;

    while (i--) {
      p = this.input.wpsProducts[i];
      if (isValidProduct(p)) {
        if (lookupWooProduct?.[p.id]?.id) {
          report.found++;
        } else {
          report.insert++;
          inserts.push(p);
        }
      } else {
        report.invalid++;
      }
    }
    this.log(`Insert ${inserts.length} products`);
    this.onComplete({ ...this.input, inserts });
  }
}

class Job_deleteProducts extends JobRunner<IWesternInsertPayload> {
  name = 'Find Products for delete';

  async doRun() {
    this.onProgress(0);
    const deletes = [];
    const lookupWpsProduct = lookup(this.input.wpsProducts);

    let i = this.input.wooProducts.length;
    let p: IWooVariable | Partial<IWooSimpleProduct>;

    while (i--) {
      p = this.input.wooProducts[i];
      if (isWestern(p)) {
        const supplierId = getSupplierId(p);
        if (!lookupWpsProduct?.[supplierId]?.id) {
          deletes.push(p);
        }
      }
    }
    this.log(`Delete ${deletes.length} products`);
    this.onComplete({ ...this.input, deletes });
  }
}

class Job_commitDeletes extends JobRunner<IWesternInsertPayload> {
  name = 'Commit Deletes';

  async doRun() {
    const ids = new Set<number>();
    this.input.deletes.forEach((p) => ids.add(p.id));
    const deleteIds = Array.from(ids);

    const deleteWooProducts = async (products: number[]) => {
      const arr = products.splice(0, 50);
      if (arr.length > 0) {
        console.log(arr);
        // const doDelete = await fetchWooAPI<IWooVariation[]>(`/products/batch`, { delete: arr }, 'post');
        // console.log({ doDelete });
      }
      if (products.length > 0) {
        if (this.paused === true) {
          console.log('paused');
          this.onResume = () => deleteWooProducts(products);
        } else {
          deleteWooProducts(products);
        }
      } else {
        if (deleteIds.length > 0) {
          wooListDb.deleteAllRecords();
        }
        this.onComplete({ ...this.input });
      }
    };

    deleteWooProducts(deleteIds);

    // const removed = [];

    // if (this.input.deletes.length > 0) {
    //   let i = this.input.deletes.length;
    //   while (i--) {
    //     const supplierId = getSupplierId(this.input.inserts[i]);
    //     let wpsProduct = null;
    //     // double check products for delete
    //     try {
    //       wpsProduct = await fetchWesternProduct(supplierId);
    //     } catch (err) {}

    //     if (wpsProduct) {
    //       removed.push(...this.input.inserts.splice(i, 1));
    //     }
    //   }
    //   if (removed.length) {
    //     this.log(`${removed.length} removed from delete list`);
    //   }
    //   console.log({ removed });
    //   console.log({ deletes: this.input.inserts });

    //   if (confirm(`Are you sure you want to delete ${this.input.inserts.length} products`)) {
    //     console.log('do delete', this.input);
    //     await deleteWooProducts(this.input.inserts);
    //     this.onComplete(this.input);
    //   } else {
    //     this.log('Delete cancelled');
    //     this.onComplete(this.input);
    //   }
    // } else {
    //   this.onComplete(this.input);
    // }
  }
}

class Job_commitInserts extends JobRunner<IWesternInsertPayload> {
  name = 'Commit Inserts';
  // 28

  async doRun() {
    console.log({ inserts: this.input.inserts });
    this.log(`Insert ${this.input.inserts.length} WPS products`);

    const doInsert = async (inserts: IWesternInsertPayload['inserts']) => {
      const insert = inserts.pop();
      // console.log({ insert });
      const wpsId = insert.id;
      // const wpsProduct = await getWPSProduct(wpsId);
      // const wooProduct = await fetchWooAPI<IWooVariable>(`/products`, { _fields: 'id', sku: insert.sku });
      // console.log({ wpsProduct, wooProduct });
      // if (wooProduct?.data?.id) {
      //   console.log('Product already exists');
      // } else {
      //   let wooId = null;
      //   try {
      //     wooId = await insertWooProduct(wpsProduct);
      //   } catch (err) {
      //     console.error(err);
      //   }
      //   console.log('insert', { wooId });
      //   this.log(`insert product wooId:${wooId} wpsId:${wpsId}`);
      // }
      try {
        const result = await importWesternProduct(wpsId);
        console.log('importWesternProduct', { result });
      } catch (err) {
        console.error(`Import failed for wps ${wpsId}`);
      }

      if (inserts.length === 0) {
        this.onComplete(this.input);
      } else {
        if (this.paused) {
          this.onResume = () => doInsert(inserts);
        } else {
          this.onProgress(inserts.length / this.input.inserts.length);
          doInsert(inserts);
        }
      }
    };

    if (this.input.inserts.length > 0) {
      wooListDb.deleteAllRecords();
    }

    doInsert([...this.input.inserts]);
  }
}

export const WesternInsertProductsJobManager = new JobManager<IWesternInsertPayload>({
  name: 'Insert Products Plus other stuff',
  description: 'Insert WPS products that do not exist in Woo',
  stages: [
    new Job_start(),
    new Job_loadAllWooProducts(),
    new Job_loadAllWpsProducts(),
    // new Job_loadWpsProducts(),
    new Job_insertProducts(),
    new Job_deleteProducts(),
    new Job_commitDeletes(),
    new Job_commitInserts(),
    // new Job_commitInserts()
    new Job_end()
  ]
});
