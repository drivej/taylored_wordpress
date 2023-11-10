import { JobManager } from '../../../../jobs/JobManager';
import { JobRunner } from '../../../../jobs/JobRunner';
import { SUPPLIER } from '../../../../utils/SUPPLIER_INFO';
import { mergeArraysOn } from '../../../../utils/mergeArraysOn';
import { IWooProductListItem, fetchWooAPI } from '../../../woo/useWoo';
import { IWooVariable } from '../../IWoo';
import { isWestern } from '../../WPSJobUtils';

export interface WesternCleanupJobManagerPayload {
  startPage: number;
}

const needsSkuUpdate = (e: IWooProductListItem) => {
  return e.sku.indexOf('_WPS_') === -1;
};

const getSkuDelta = (e: IWooProductListItem) => {
  const id = e.sku.split('_').pop();
  return `MASTER_WPS_${id}`;
};

const needsSupplierClassUpdate = (e: IWooProductListItem) => {
  const supplier = e.meta_data.find((m) => m.key === '_supplier_class');
  return supplier?.value !== SUPPLIER.WPS.supplierClass;
};

const needsUpdate = (e: IWooProductListItem) => {
  return isWestern(e) && (needsSkuUpdate(e) || needsSupplierClassUpdate(e));
};

const getDelta = (e: IWooProductListItem) => {
  const delta: Record<string, unknown> = { id: e.id };
  if (needsSupplierClassUpdate(e)) {
    delta.meta_data = mergeArraysOn(e.meta_data, [{ key: '_supplier_class', value: SUPPLIER.WPS.supplierClass }], 'key');
  }
  if (needsSkuUpdate(e)) {
    delta.sku = getSkuDelta(e);
  }
  return delta;
};

class Job_cleanUpWooProducts extends JobRunner<WesternCleanupJobManagerPayload> {
  name = 'Cleanup Woo Products';

  async doRun() {
    this.onProgress(0);
    const report = { updates: 0 };

    const loadNext = async (page: number = 1) => {
      if (this.paused === true) {
        this.onResume = () => {
          super.onResume();
          loadNext(page);
        };
        return;
      }
      const result = await fetchWooAPI<IWooVariable[]>(`/products`, { _fields: 'id,sku,meta_data', per_page: 50, page }, 'get');
      const update = [];

      for (let i = 0; i < result.data.length; i++) {
        const wooProduct = result.data[i];
        if (needsUpdate(wooProduct)) {
          update.push(getDelta(wooProduct));
        }
      }

      if (update.length > 0) {
        console.log({ update });
        report.updates += update.length;
        const updateResult = await fetchWooAPI(`/products/batch`, { update }, 'put');
        console.log({ updateResult });
      }

      this.onProgress(result.meta.page / result.meta.totalPages);

      this.log(`complete ${page}/${result.meta.totalPages}`);

      if (result.meta.totalPages > page) {
        loadNext(page + 1);
      } else {
        this.log(JSON.stringify(report));
        this.onComplete();
      }
    };

    loadNext(this.input?.startPage ?? 1);
  }
}

export const WesternCleanupJobManager = new JobManager<WesternCleanupJobManagerPayload>({
  name: 'Cleanup Woo Products',
  stages: [
    // new Job_getTotalWooProducts(), //
    new Job_cleanUpWooProducts()
    // new Job_pushWooDeltas()
  ]
});
