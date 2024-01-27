import { JobManager } from '../../__old/jobs/JobManager';
import { JobRunner } from '../../__old/jobs/JobRunner';
import { formatDuration } from '../../common/utils/formatDuration';
import { lookup } from '../../utils/lookup';
import { IWesternProductExt } from './IWestern';
import { getTotalWPSProducts, getWPSProduct, get_western_products_page, importWesternProduct, syncWooProduct, wooIsOutdated } from './WPSJobUtils';
import { isValidProduct } from './WesternProducts';
import { Job_loadAllWooProducts, Job_loadAllWooProducts_payload } from './tasks/Job_loadAllWooProducts';
import { Job_loadAllWpsProducts, Job_loadAllWpsProducts_payload } from './tasks/Job_loadAllWpsProducts';

/*
TODO: MASTER_WPS_31846 has an attribute that seems unnecessary - electrical - if all sku's have the same attribute - remove it
*/

export interface IWesternBigImportPayload extends Job_loadAllWpsProducts_payload, Job_loadAllWooProducts_payload {
  // lastUpdate?: string;
  // wooProducts?: IWooVariable[];
  // wpsProducts?: IWesternProductExt[];
  // useCache?: boolean;
  // useWooCache?: boolean;
  // useWpsCache?: boolean;
}

class Job_difProducts extends JobRunner<IWesternBigImportPayload> {
  name = 'Job_difProducts';
  async doRun() {
    console.log(this.input);

    const deletes = this.input.wpsProducts.filter((p) => p.items.data.length === 0);
    console.log({ deletes });
    this.log(`deletes: ${deletes.length}`);

    const wooLookup = lookup(this.input.wooProducts, 'sku');

    // const updates = this.input.wpsProducts.reduce((a, wpsProduct) => {
    //   const sku = `MASTER_WPS_${wpsProduct.id}`;
    //   const wooProduct = wooLookup[sku];
    //   if (wooProduct) {
    //     const wooUpdated = new Date(Date.parse(wooProduct?.date_modified));
    //     const wpsUpdated = new Date(Date.parse(wpsProduct?.updated_at));
    //     if (wooUpdated < wpsUpdated) {
    //       a.push({ reason: 'updated', wooProduct, wpsProduct });
    //       // needsUpdate = true;
    //       // console.log('need to sync - expired');
    //     }
    //     // const wpsProduct = p;

    //     // if (wooNeedsUpdate(wooLookup[sku], wpsProduct)) {
    //     //   return true;
    //     // }
    //   }
    //   return a;
    //   // return !!wooLookup[sku];
    // }, []);

    // const updates2 = this.input.wpsProducts.filter((wpsProduct) => {
    //   const sku = `MASTER_WPS_${wpsProduct.id}`;
    //   const wooProduct = wooLookup[sku];
    //   return wooNeedsUpdate(wooProduct, wpsProduct);
    // });

    const updates = this.input.wpsProducts.filter((wpsProduct) => {
      const sku = `MASTER_WPS_${wpsProduct.id}`;
      const wooProduct = wooLookup[sku];
      return wooProduct ? wooIsOutdated(wooProduct, wpsProduct) : false;
    });

    // const updates = this.input.wpsProducts.filter((wpsProduct) => {
    //   const sku = `MASTER_WPS_${wpsProduct.id}`;
    //   const wooProduct = wooLookup[sku];
    //   if(wooProduct){
    //   const wooUpdated = new Date(Date.parse(wooProduct?.date_modified));
    //   const wpsUpdated = new Date(Date.parse(wpsProduct?.updated_at));
    //   if (wooUpdated < wpsUpdated) {
    //     return {reason:'updated', wooProduct, wpsProduct};
    //     // needsUpdate = true;
    //     // console.log('need to sync - expired');
    //   }
    //   // const wpsProduct = p;

    //     if(wooNeedsUpdate(wooLookup[sku], wpsProduct)){
    //       return true;
    //     }

    // }
    //   return false;
    //   // return !!wooLookup[sku];
    // });
    this.log(`updates: ${updates.length}`);
    console.log({ updates });

    const inserts = this.input.wpsProducts.filter((p) => {
      const sku = `MASTER_WPS_${p.id}`;
      return !wooLookup[sku];
    });
    this.log(`inserts: ${inserts.length}`);
    console.log({ inserts });

    this.onComplete(this.input);
  }
}

class Job_updateProducts extends JobRunner<IWesternBigImportPayload> {
  name = 'Job_updateProducts';

  async doRun() {
    // const wooLookup = lookup(this.input.wooProducts, 'sku');
    const wooLookup = lookup(this.input.wooProducts, 'sku');

    const updates = this.input.wpsProducts.filter((wpsProduct) => {
      const sku = `MASTER_WPS_${wpsProduct.id}`;
      const wooProduct = wooLookup[sku];
      return wooProduct ? wooIsOutdated(wooProduct, wpsProduct) : false;
    });

    console.log({ updates });
    const totalUpdates = updates.length;

    const updateNext = async (updates: IWesternProductExt[]) => {
      if (this.paused === true) {
        console.log('paused');
        this.onResume = () => updateNext(updates);
        return;
      }
      const product = updates.pop();
      // const result = await importWesternProduct(product.id);

      const wpsProduct = await getWPSProduct(product.id);
      const wooProduct = wooLookup[`MASTER_WPS_${wpsProduct.id}`];
      console.log({ update: { wpsProduct: wpsProduct.id, wooProduct: wooProduct.id } });

      await syncWooProduct(wooProduct, wpsProduct);

      this.onProgress((totalUpdates - updates.length) / totalUpdates);
      console.log(totalUpdates - updates.length, 'of', totalUpdates);

      if (updates.length === 0) {
        this.onComplete(this.input);
      } else {
        updateNext(updates);
      }

      // console.log({ result });
    };

    updateNext(updates);
  }
}

class Job_insertNewProducts extends JobRunner<IWesternBigImportPayload> {
  name = 'Job_insertNewProducts';

  async doRun() {
    const wooLookup = lookup(this.input.wooProducts, 'sku');
    const inserts = this.input.wpsProducts.filter((p) => {
      const sku = `MASTER_WPS_${p.id}`;
      return !wooLookup[sku];
    });
    console.log({ inserts });
    const totalInserts = inserts.length;

    const insertNext = async (inserts: IWesternProductExt[]) => {
      if (this.paused === true) {
        console.log('paused');
        this.onResume = () => insertNext(inserts);
        return;
      }
      const product = inserts.pop();
      const result = await importWesternProduct(product.id);
      console.log({ insert: result });
      this.onProgress((totalInserts - inserts.length) / totalInserts);
      console.log(totalInserts - inserts.length, 'of', totalInserts);

      if (inserts.length === 0) {
        this.onComplete(this.input);
      } else {
        insertNext(inserts);
      }

      console.log({ result });
    };

    insertNext(inserts);
  }
}

class Job_importWPSProducts extends JobRunner<IWesternBigImportPayload> {
  name = 'Job_importWPSProducts';
  async doRun() {
    const importInfo = JSON.parse(window.localStorage.getItem('importInfo') || JSON.stringify({ cursor: null, currentIndex: 0, lastUpdate: new Date().toISOString() }));
    const count = await getTotalWPSProducts(this.input?.lastUpdate);
    this.log(`${count.toLocaleString()} WPS products`);
    const times = [];
    console.log({ importInfo });

    const loadNext = async (cursor: string = null) => {
      if (this.paused === true) {
        console.log('paused');
        this.onResume = () => loadNext(cursor);
        return;
      }
      // most unavailable products are weeded out in the get page phase
      const page = await get_western_products_page(this.input?.lastUpdate, cursor, 10);
      importInfo.cursor = cursor;
      window.localStorage.setItem('importInfo', JSON.stringify(importInfo));
      console.log({ page });

      let i = page.data.length;
      while (i--) {
        const startTime = Date.now();
        const listProduct = page.data[i];
        const wpsId = listProduct.id;
        const isValid = isValidProduct(listProduct);

        if (isValid) {
          const result = await importWesternProduct(wpsId);
          this.log(`${importInfo.currentIndex} ${result.action}: wpsId=${result.wpsId} wooId=${result.wooId}`);
        } else {
          this.log(`${importInfo.currentIndex} invalid: wpsId=${listProduct.id}`);
        }
        importInfo.currentIndex++;
        this.onProgress(importInfo.currentIndex / count);
        times.push(Date.now() - startTime);
      }

      const perProduct = times.reduce((s, t) => s + t) / times.length / 1000;
      console.log('products/s', perProduct.toFixed(2), 'left:', formatDuration((count - importInfo.currentIndex) * perProduct));

      if (page.meta.cursor.next) {
        loadNext(page.meta.cursor.next);
        // this.onComplete(this.input);
      } else {
        this.onProgress(1);
        this.onComplete(this.input);
      }

      // // only keep products wiuth valid items
      // const importProducts = page.data.filter((p) => p.items.data.filter((item) => item.status_id !== IWesternItemStatus.NLA).length > 0);
      // console.log('page of', page.data.length, 'need to keep', importProducts.length);
      // // products.push(...importProducts);

      // products.push(...page.data);

      // page.meta.cursor.count

      // this.onProgress(products.length / count);

      // if (page.meta.cursor.next) {
      //   loadNext(page.meta.cursor.next);
      // } else {
      //   this.onProgress(1);
      //   this.onComplete({ ...input, products });
      // }
    };
    loadNext(importInfo.cursor);
  }
}

// class Job_loadWPSProduct extends JobRunner<IWesternSingleImportPayload> {
//   name = 'Load WPS Product';

//   async doRun() {
//     const wpsProduct = await getWPSProduct(this.input.supplierProductId);
//     console.log({ wpsProduct });
//     this.onComplete({ ...this.input, wpsProduct });
//   }
// }

// class Job_getWooProduct extends JobRunner<IWesternSingleImportPayload> {
//   name = 'Get Woo Product';

//   async doRun() {
//     const wooProduct = await getWooProductBySku(`MASTER_${WESTExRN_KEY}_${this.input.supplierProductId}`);
//     console.log({ wooProduct });
//     this.onComplete({ ...this.input, wooProduct });
//   }
// }

// class Job_analyze extends JobRunner<IWesternSingleImportPayload> {
//   name = 'Analyze';

//   async doRun() {
//     const { wooProduct, wpsProduct } = this.input;
//     const needsUpdate = wooNeedsUpdate(wooProduct, wpsProduct);
//     this.log(`needsUpdate=${needsUpdate.toString()}`);
//     if (needsUpdate) {
//       await syncWooProduct(wooProduct, wpsProduct);
//     }
//     this.onComplete(this.input);
//   }
// }

// class Job_complete extends JobRunner<IWesternSingleImportPayload> {
//   name = 'Complete';

//   async doRun() {
//     console.log({ input: this.input });
//     this.onComplete(this.input);
//   }
// }

export const WesternBigImportJobManager = new JobManager<IWesternBigImportPayload>({
  name: 'Western Import',
  stages: [
    new Job_loadAllWpsProducts(),
    new Job_loadAllWooProducts(),
    new Job_difProducts(),
    new Job_insertNewProducts(),
    new Job_updateProducts()
    // new Job_importWPSProducts() //
    // new Job_complete()
  ]
});
