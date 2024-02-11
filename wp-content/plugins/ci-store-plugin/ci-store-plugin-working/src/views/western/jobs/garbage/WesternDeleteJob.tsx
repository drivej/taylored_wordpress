import { JobManager } from '../../../../__old/jobs/JobManager';
import { JobRunner } from '../../../../__old/jobs/JobRunner';
import { IWesternProduct, IWesternProductExt } from '../../IWestern';
import { IWooProductWPS } from '../../IWoo';
// import { convertWesternProductToWooProduct } from '../../WesternUtils';
import { fetchWesternAPI, westernProductIncludes_ExcludeNLA } from '../../useWestern';

export interface IWesternDeleteJobInput {
  lastUpdate: string;
}

export interface IWesternDeleteJobOutput {
  // csv: string;
  products: IWooProductWPS[];
}

class WesternDeleteJob_0 extends JobRunner<IWesternDeleteJobInput, IWesternDeleteJobOutput & { totalProducts: number }> {
  name = 'Get Total Products';

  async run(input: IWesternDeleteJobInput) {
    super.run(input);
    const count = await fetchWesternAPI<{ count: number }>(`/products`, { countOnly: true, 'filter[updated_at][gt]': input?.lastUpdate });
    this.onComplete({ ...input, totalProducts: count.data.count, products: [] });
  }
}

class WesternDeleteJob_1 extends JobRunner<IWesternDeleteJobInput & { totalProducts: number }, IWesternProductExt[]> {
  name = 'Load Product Details';
  cursor = '';

  onResume() {
    console.log('onResume child');
  }

  reset() {
    super.reset();
    this.cursor = '';
  }

  async run(input: IWesternDeleteJobInput & { totalProducts: number }) {
    super.run(input);
    this.onProgress(0);
    const products: IWesternProductExt[] = [];

    const loadNext = async (cursor: string = null) => {
      if (this.paused === true) {
        this.onResume = () => loadNext(cursor);
        return;
      }
      const page = await fetchWesternAPI<IWesternProductExt[]>(`/products`, {
        include: westernProductIncludes_ExcludeNLA, //
        'page[size]': 1000,
        'page[cursor]': cursor,
        'filter[updated_at][gt]': input?.lastUpdate
      });
      // only collect invalid products - the products have all NLA items
      const deletedProducts = page.data.filter((p) => p.items.data.length === 0);
      console.log('page of', page.data.length, 'need to delete', deletedProducts.length);
      products.push(...deletedProducts);
      this.onProgress(products.length / input.totalProducts);
      if (page.meta.cursor.next) {
        loadNext(page.meta.cursor.next);
      } else {
        this.onProgress(1);
        this.onComplete(products);
      }
    };

    loadNext();
  }
}

class WesternDeleteJob_2 extends JobRunner<IWesternProductExt[], IWesternDeleteJobOutput> {
  name = 'Finish Load';
  products: IWesternProduct[] = [];
  index = 0;

  onResume() {
    console.log('onResume child');
  }

  reset() {
    super.reset();
    this.products = [];
  }

  async run(input: IWesternProductExt[]) {
    super.run(input);
    // Duff's Device wins again... ~140s -> ~3.5
    const where = input.length % 8;
    const all: IWooProductWPS[] = [];
    // while (this.index < where) {
    //   all.push.apply(all, convertWesternProductToWooProduct(input[this.index++]));
    //   all.push.apply(all, convertWesternProductToWooProduct(input[this.index++]));
    //   all.push.apply(all, convertWesternProductToWooProduct(input[this.index++]));
    //   all.push.apply(all, convertWesternProductToWooProduct(input[this.index++]));
    //   all.push.apply(all, convertWesternProductToWooProduct(input[this.index++]));
    //   all.push.apply(all, convertWesternProductToWooProduct(input[this.index++]));
    //   all.push.apply(all, convertWesternProductToWooProduct(input[this.index++]));
    //   all.push.apply(all, convertWesternProductToWooProduct(input[this.index++]));
    // }
    // while (this.index < input.length) {
    //   all.push.apply(all, convertWesternProductToWooProduct(input[this.index++]));
    // }
    // const csv = convertWooProductsToCSV(all);
    console.log('line items', all.length);
    this.onComplete({ products: all });
  }
}

export const WesternDeleteJobManager = new JobManager<IWesternDeleteJobInput, IWesternDeleteJobOutput>({
  stages: [new WesternDeleteJob_0(), new WesternDeleteJob_1(), new WesternDeleteJob_2()]
});
