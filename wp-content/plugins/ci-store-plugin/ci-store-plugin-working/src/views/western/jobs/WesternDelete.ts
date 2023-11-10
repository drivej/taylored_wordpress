import { JobManager } from '../../../jobs/JobManager';
import { JobRunner } from '../../../jobs/JobRunner';
import { chunkArray } from '../../../utils/chunkArray';
import { lookup } from '../../../utils/lookup';
import { fetchWooAPI } from '../../woo/useWoo';
import { IWesternProductExt } from '../IWestern';
import { IWooVariable, IWooVariation } from '../IWoo';
import { getSupplierId, isWestern } from '../WPSJobUtils';
import { fetchWesternAPI, fetchWesternProduct } from '../useWestern';

export interface IWesternDeletePayload {
  page?: number;
  deletes: { id: number; sku: string }[];
}

class Job_deleteProducts extends JobRunner<IWesternDeletePayload> {
  name = 'Delete Products';
  key = 'delete';

  async doRun() {
    const getWooProducts = async (page = 1) => {
      return await fetchWooAPI<IWooVariable[]>(`/products`, { per_page: 100, page, _fields: 'id,sku' }, 'get');
    };

    const getWpsProducts = async (ids: (number | string)[]) => {
      return await fetchWesternAPI<IWesternProductExt[]>(`/products/${ids.join()}`, { 'page[size]': 100 });
    };

    this.onProgress(0);
    const deletes = [];
    const maxPage = 54;

    const processPage = async (page = 1) => {
      const wooProductsPage = await getWooProducts(page);
      const wpsIds = wooProductsPage.data.filter(isWestern).map(getSupplierId);
      const wpsProductsPage = await getWpsProducts(wpsIds);
      const lookupWpsProduct = lookup(wpsProductsPage.data, 'id');

      const _deletes = wooProductsPage.data.filter((p) => isWestern(p) && !lookupWpsProduct?.[getSupplierId(p)]);
      deletes.push(..._deletes);
      console.log({ page, deletes }, wooProductsPage.meta.page, '/', wooProductsPage.meta.totalPages);

      if (wooProductsPage.meta.totalPages > page && page < maxPage) {
        this.onProgress(wooProductsPage.meta.page / wooProductsPage.meta.totalPages);
        if (this.paused === true) {
          console.log('paused');
          this.onResume = () => processPage(page + 1);
        } else {
          processPage(page + 1);
        }
      } else {
        this.log(`Found ${deletes.length} products for delete`);
        this.onComplete({ ...this.input, deletes });
      }
    };

    processPage();
  }
}

class Job_commitDeletes extends JobRunner<IWesternDeletePayload> {
  name = 'Commit Deletes';

  async doRun() {
    const deleteWooProducts = async (products: { id: number | string }[]) => {
      const ids = new Set();
      products.forEach((p) => ids.add(p.id));
      const arr = Array.from(ids);

      if (arr.length > 0) {
        const chunks = chunkArray(arr, 50);
        let i = chunks.length;
        while (i--) {
          this.onProgress(i / chunks.length);
          const doDelete = await fetchWooAPI<IWooVariation[]>(`/products/batch`, { delete: chunks[i] }, 'post');
          console.log({ doDelete });
        }
      }
    };

    const removed = [];

    if (this.input.deletes.length > 0) {
      let i = this.input.deletes.length;
      while (i--) {
        const supplierId = getSupplierId(this.input.deletes[i]);
        let wpsProduct = null;
        // double check products for delete
        try {
          wpsProduct = await fetchWesternProduct(supplierId);
        } catch (err) {}

        if (wpsProduct) {
          removed.push(...this.input.deletes.splice(i, 1));
        }
      }
      if (removed.length) {
        this.log(`${removed.length} removed from delete list`);
      }
      console.log({ removed });
      console.log({ deletes: this.input.deletes });

      if (confirm(`Are you sure you want to delete ${this.input.deletes.length} products`)) {
        console.log('do delete', this.input);
        await deleteWooProducts(this.input.deletes);
        this.onComplete(this.input);
      } else {
        this.log('Delete cancelled');
        this.onComplete(this.input);
      }
    } else {
      this.log(`0 products found for delete`);
      this.onComplete(this.input);
    }
  }
}

export const WesternDeleteProductsJobManager = new JobManager<IWesternDeletePayload>({
  name: 'Delete Products',
  description: 'Delete WPS products in woo that do not exist in WPS Api. This does not acocunt for invalid/discontinued products.',
  stages: [new Job_deleteProducts(), new Job_commitDeletes()]
});
