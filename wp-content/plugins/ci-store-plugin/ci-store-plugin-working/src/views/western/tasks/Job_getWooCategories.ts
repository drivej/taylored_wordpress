import { JobRunner } from '../../../jobs/JobRunner';
import { fetchWooAPI } from '../../woo/useWoo';
import { IWooCategory } from '../IWoo';

export interface Job_getWooCategories_payload {
  wooCategories: IWooCategory[];
}

export class Job_getWooCategories extends JobRunner<Job_getWooCategories_payload> {
  name = 'Job_getWooCategories';

  async doRun() {
    const wooCategories: IWooCategory[] = [];
    let page = 1;
    let q = await fetchWooAPI<IWooCategory[]>(`/products/categories`, { per_page: 100, page }, 'get');
    wooCategories.push(...q.data);
    while (page < q.meta.totalPages) {
      page++;
      q = await fetchWooAPI<IWooCategory[]>(`/products/categories`, { per_page: 100, page }, 'get');
      wooCategories.push(...q.data);
      this.onProgress(page / q.meta.totalPages);
    }
    wooCategories.forEach((c) => {
      try {
        c.acf = JSON.parse(c.description);
      } catch (err) {
        c.acf = { supplier_id: '', supplier_key: '' };
      }
    });
    this.onComplete({ ...this.input, wooCategories });
  }
}
