import { JobManager } from '../../../jobs/JobManager';
import { JobRunner } from '../../../jobs/JobRunner';
import { SUPPLIER, SupplierKey, lookupSupplierClass } from '../../../utils/SUPPLIER_INFO';
import { lookup } from '../../../utils/lookup';
import { fetchWooAPI } from '../../woo/useWoo';
import { IWesternProductExt } from '../IWestern';
import { IWooVariable } from '../IWoo';
import { getSupplierId, getWpsProductsById, isWestern, wooIsOutdated } from '../WPSJobUtils';
import { getWooMetaValue } from '../WooUtils';
import { Job_logInput } from '../tasks/Job_logInput';

interface IReportInfo {
  supplier_key: string;
  supplier_id: number;
  wooId: number;
}

export interface IWesternCheckUpdatesPayload {
  startPage: number;
  report: {
    updates: IReportInfo[]; //
    inserts: IReportInfo[];
    deletes: IReportInfo[];
    skip: IReportInfo[];
    ok: IReportInfo[];
  };
} //extends Job_getWooCategories_payload {}

class Job_checkUpdates extends JobRunner<IWesternCheckUpdatesPayload> {
  name = 'Check Updates';

  async doRun() {
    const getWooProducts = async (page = 1) => {
      return await fetchWooAPI<IWooVariable[]>(`/products`, { _fields: 'id,sku,date_modified,meta_data', per_page: 50, page }, 'get');
    };

    this.onProgress(0);

    const report: IWesternCheckUpdatesPayload['report'] = { updates: [], inserts: [], deletes: [], ok: [], skip: [] };

    const processProduct = (wooProduct: IWooVariable, lookupWpsProduct: Record<string, IWesternProductExt>) => {
      const wooId = wooProduct.id;
      const supplierClass = getWooMetaValue(wooProduct, '_supplier_class');
      const supplier = lookupSupplierClass[supplierClass];

      if (supplier?.key === SupplierKey.WPS) {
        const wpsId = getSupplierId(wooProduct);
        const wpsProduct = lookupWpsProduct[wpsId];
        const supplier_key = SUPPLIER.WPS.key;
        const supplier_id = getSupplierId(wooProduct);
        const info = { supplier_key, wooId, supplier_id };

        if (!wpsProduct) {
          console.log('WPS product not found', { wpsId, wooId });
          report.deletes.push(info);
        } else {
          if (wooIsOutdated(wooProduct, wpsProduct)) {
            report.updates.push(info);
          } else {
            report.ok.push(info);
          }
        }
      } else {
        console.log('Not a western product', { wooId });
        report.skip.push({ supplier_id: -1, supplier_key: 'unknown', wooId });
      }
    };

    const processPage = async (page = 1) => {
      const wooProductsPage = await getWooProducts(page);
      const wpsIds = wooProductsPage.data.filter(isWestern).map(getSupplierId);
      const wpsProductsPage = await getWpsProductsById(wpsIds);
      const lookupWpsProduct = lookup(wpsProductsPage.data);

      let i = wooProductsPage.data.length;

      while (i--) {
        processProduct(wooProductsPage.data[i], lookupWpsProduct);
      }

      this.onProgress(wooProductsPage.meta.page / wooProductsPage.meta.totalPages);
      this.log(
        `page ${wooProductsPage.meta.page}/${wooProductsPage.meta.totalPages}) (${wooProductsPage.meta.total}) ` +
          Object.keys(report)
            .map((k) => `${k}:${report[k].length}`)
            .join(', ')
      );

      if (wooProductsPage.meta.totalPages > page) {
        if (this.paused === true) {
          console.log('paused');
          this.onResume = () => processPage(page + 1);
        } else {
          processPage(page + 1);
        }
      } else {
        this.onComplete({ ...this.input, report });
      }
    };

    processPage(this.input?.startPage ?? 1);
  }
}

export const WesternCheckUpdatesJobManager = new JobManager<IWesternCheckUpdatesPayload>({
  name: 'Check Updates',
  description: 'Compare updated dates between WPS and Woo products.',
  stages: [new Job_checkUpdates(), new Job_logInput()]
});
