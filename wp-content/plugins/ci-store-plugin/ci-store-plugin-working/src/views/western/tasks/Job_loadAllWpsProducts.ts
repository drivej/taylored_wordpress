import { JobRunner } from '../../../__old/jobs/JobRunner';
import { IWesternProductExt, IWesternResponse } from '../IWestern';
import { IndexedDBHandler } from '../IndexedDatabase';
import { get_western_products_page } from '../WPSJobUtils';
import { fetchWesternAPI } from '../useWestern';

const wpsListDb = new IndexedDBHandler<{ cursor: string; result: IWesternResponse<IWesternProductExt[]> }>('wpsListProducts', { version: 1, primary: 'cursor' });

export interface Job_loadAllWpsProducts_payload {
  lastUpdate: string;
  useWpsCache: boolean;
  wpsProducts: IWesternProductExt[];
}

export class Job_loadAllWpsProducts extends JobRunner<Job_loadAllWpsProducts_payload> {
  name = 'Job_loadAllWpsProducts';

  async doRun() {
    console.log(this.name, this.input);
    const query = { countOnly: true, useCache: this.input.useWpsCache ? '1' : '0' };
    if (this.input?.lastUpdate) query['filter[updated_at][gt]'] = this.input.lastUpdate;
    const count = await fetchWesternAPI<{ count: number }>(`/products`, query);

    const products: IWesternProductExt[] = [];

    const loadNext = async (cursor: string = '') => {
      if (this.paused === true) {
        console.log('paused');
        this.onResume = () => loadNext(cursor);
        return;
      }
      let result: IWesternResponse<IWesternProductExt[]> = null;

      if (this.input.useWpsCache && cursor) {
        const cached = await wpsListDb.retrieveData(cursor);
        if (cached) {
          result = cached.result;
        }
      }

      if (!result) {
        result = await get_western_products_page(this.input?.lastUpdate, cursor, 500);
        if (cursor) await wpsListDb.addRow({ cursor, result });
      }
      products.push(...result.data);
      this.onProgress(products.length / count.data.count);

      if (result.meta.cursor.next) {
        loadNext(result.meta.cursor.next);
      } else {
        this.onProgress(1);
        console.log({ products });
        this.onComplete({ ...this.input, wpsProducts: products });
      }
    };

    loadNext();
  }
}
