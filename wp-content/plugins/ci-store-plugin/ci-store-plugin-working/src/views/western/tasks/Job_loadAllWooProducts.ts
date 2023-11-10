import { JobRunner } from '../../../jobs/JobRunner';
import { IWooAPIResponse, fetchWooAPI } from '../../woo/useWoo';
import { IWooVariable } from '../IWoo';
import { IndexedDBHandler } from '../IndexedDatabase';

const wooListDb = new IndexedDBHandler<{ page: number; result: IWooAPIResponse<IWooVariable[]> }>('wooListProducts', { version: 4, primary: 'page' });

export interface Job_loadAllWooProducts_payload {
  lastUpdate: string;
  useWooCache: boolean;
  wooProducts: IWooVariable[];
}

export class Job_loadAllWooProducts extends JobRunner<Job_loadAllWooProducts_payload> {
  name = 'Job_loadAllWooProducts';

  async doRun() {
    const products: IWooVariable[] = [];

    const loadNext = async (page = 1) => {
      if (this.paused === true) {
        console.log('paused');
        this.onResume = () => loadNext(page);
        return;
      }
      let result: IWooAPIResponse<IWooVariable[]>;

      if (this.input.useWooCache && page) {
        const cached = await wooListDb.retrieveData(page);
        if (cached) {
          result = cached.result;
        }
      }
      if (!result) {
        result = await fetchWooAPI<IWooVariable[]>(`/products`, { _fields: 'id,sku,variations,date_modified', per_page: 100, page }, 'get');
        if (page) await wooListDb.addRow({ page, result });
      }
      products.push(...result.data);
      this.onProgress(result.meta.page / result.meta.totalPages);

      if (result.data.length === 0) {
        this.onComplete({ ...this.input, wooProducts: products });
      } else {
        loadNext(page + 1);
      }
    };

    loadNext();
  }
}
