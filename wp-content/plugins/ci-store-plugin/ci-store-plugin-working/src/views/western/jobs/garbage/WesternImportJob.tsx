import { JobManager } from "../../../../jobs/JobManager";
import { JobRunner } from "../../../../jobs/JobRunner";
import { IWesternItemStatus, IWesternProduct, IWesternProductExt } from "../../IWestern";
import { IWooProduct } from "../../IWoo";
// import { convertWesternProductToWooProduct } from "../../WesternUtils";
import { fetchWesternAPI, westernProductIncludes } from "../../useWestern";

export interface IWesternJobInput {
  lastUpdate: string;
  includeNLA: boolean;
  currentProducts?: Partial<IWooProduct>[];
}

export interface IWesternJobOutput {
  // csv: string;
  products: IWooProduct[];
}

class WesternImportJob_0 extends JobRunner<IWesternJobInput, IWesternJobInput & { totalProducts: number }> {
  name = 'Get Total Products';

  async run(input: IWesternJobInput) {
    super.run(input);
    const count = await fetchWesternAPI<{ count: number }>(`/products`, { countOnly: true, 'filter[updated_at][gt]': input?.lastUpdate });
    this.onComplete({ ...input, totalProducts: count.data.count });
  }
}

class WesternImportJob_1 extends JobRunner<IWesternJobInput & { totalProducts: number }, IWesternJobInput & { products: IWesternProductExt[] }> {
  name = 'Load Product Details';
  cursor = '';

  onResume() {
    console.log('onResume child');
  }

  reset() {
    super.reset();
    this.cursor = '';
  }

  async run(input: IWesternJobInput & { totalProducts: number }) {
    super.run(input);
    this.onProgress(0);
    const products: IWesternProductExt[] = [];

    const loadNext = async (cursor: string = null) => {
      if (this.paused === true) {
        this.onResume = () => loadNext(cursor);
        return;
      }
      const page = await fetchWesternAPI<IWesternProductExt[]>(`/products`, {
        include: westernProductIncludes, //productIncludesExcludeNLA,//input.includeNLA ? productIncludes : productIncludesExcludeNLA, //
        'page[size]': 1000,
        'page[cursor]': cursor,
        'filter[updated_at][gt]': input?.lastUpdate
      });
      // only keep products wiuth valid items
      const importProducts = page.data.filter((p) => p.items.data.filter((item) => item.status_id !== IWesternItemStatus.NLA).length > 0);
      console.log('page of', page.data.length, 'need to keep', importProducts.length);
      // products.push(...importProducts);

      products.push(...page.data);

      this.onProgress(products.length / input.totalProducts);

      if (page.meta.cursor.next) {
        loadNext(page.meta.cursor.next);
      } else {
        this.onProgress(1);
        this.onComplete({ ...input, products });
      }
    };

    loadNext();
  }
}

class WesternImportJob_2 extends JobRunner<IWesternJobInput & { products: IWesternProductExt[] }, IWesternJobOutput> {
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

  async run(input: IWesternJobInput & { products: IWesternProductExt[] }) {
    super.run(input);
    // Duff's Device wins again... ~140s -> ~3.5
    const where = input.products.length % 8;
    const all: IWooProduct[] = [];
    // while (this.index < where) {
    //   all.push.apply(all, convertWesternProductToWooProduct(input.products[this.index++]));
    //   all.push.apply(all, convertWesternProductToWooProduct(input.products[this.index++]));
    //   all.push.apply(all, convertWesternProductToWooProduct(input.products[this.index++]));
    //   all.push.apply(all, convertWesternProductToWooProduct(input.products[this.index++]));
    //   all.push.apply(all, convertWesternProductToWooProduct(input.products[this.index++]));
    //   all.push.apply(all, convertWesternProductToWooProduct(input.products[this.index++]));
    //   all.push.apply(all, convertWesternProductToWooProduct(input.products[this.index++]));
    //   all.push.apply(all, convertWesternProductToWooProduct(input.products[this.index++]));
    // }
    // while (this.index < input.products.length) {
    //   all.push.apply(all, convertWesternProductToWooProduct(input.products[this.index++]));
    // }
    // const csv = convertWooProductsToCSV(all);
    console.log('line items', all.length);
    this.onComplete({ ...input, products: all });
  }
}

export const WesternJobManager = new JobManager<IWesternJobInput, IWesternJobOutput>({
  stages: [
    new WesternImportJob_0(), //
    new WesternImportJob_1(),
    new WesternImportJob_2()
  ]
});
