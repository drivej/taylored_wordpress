import { JobManager } from '../../../__old/jobs/JobManager';
import { JobRunner } from '../../../__old/jobs/JobRunner';
import { chunkArray } from '../../../utils/chunkArray';
import { lookup } from '../../../utils/lookup';
import { fetchWooAPI } from '../../woo/useWoo';
import { IWesternItemExt, IWesternProductExt, IWesternTaxonomyTerm } from '../IWestern';
import { IWooCategory, IWooVariable, IWooVariation } from '../IWoo';
import { getSupplierId, isWestern } from '../WPSJobUtils';
import { Job_getWooCategories, Job_getWooCategories_payload } from '../tasks/Job_getWooCategories';
import { fetchWesternAPI } from '../useWestern';

export interface IWesternUpdateProductCategoriesPayload extends Job_getWooCategories_payload {}

class Job_analyzeProductCategories extends JobRunner<IWesternUpdateProductCategoriesPayload> {
  name = 'Analyze Categories';

  async doRun() {
    const { wooCategories } = this.input;
    const lookupWooCat = lookup(wooCategories, 'slug');
    const report = { skips: 0, updates: 0, fails: 0 };

    const extractProductCategoryInfo = (wpsProduct: IWesternProductExt) => {
      let item: IWesternItemExt, i: number, ii: number, term: IWesternTaxonomyTerm, wooCat: IWooCategory, wooCatId: number;
      const productsCats: number[] = [];
      const info = { id: wpsProduct.id, create: [], slugs: [], lookup: {} };
      const createSlugs = {};

      for (i = 0; i < wpsProduct.items.data.length; i++) {
        item = wpsProduct.items.data[i];
        for (ii = 0; ii < item.taxonomyterms.data.length; ii++) {
          term = item.taxonomyterms.data[ii];
          wooCat = lookupWooCat[term.slug];
          info.slugs.push(term.slug);

          if (!wooCat) {
            if (!createSlugs[term.slug]) {
              info.create.push({ name: term.name, slug: term.slug });
              createSlugs[term.slug] = true;
            }
          } else {
            wooCatId = wooCat.id;
            info.lookup[term.slug] = wooCat;
          }
          productsCats.push(wooCatId);
        }
      }
      return info;
    };

    const getWpsProducts = async (ids: (number | string)[]) => {
      return await fetchWesternAPI<IWesternProductExt[]>(`/products/${ids.join()}`, {
        include: 'items:filter(status_id|NLA|ne),items.taxonomyterms',
        'fields[items]': 'taxonomyterms',
        'page[size]': 100
      });
    };

    const getWooProducts = async (page = 1) => {
      return await fetchWooAPI<IWooVariable[]>(`/products`, { _fields: 'id,sku,categories,meta_data', per_page: 100, page }, 'get');
    };

    const createCategories = async (inserts: { name: string; slug: string }[]) => {
      if (!inserts || inserts.length === 0) return [];
      // make these unique
      inserts = inserts.filter((e, i) => inserts.findIndex((a) => a.slug === e.slug) === i);
      const chunks = chunkArray(inserts, 32);
      const created = [];
      for (let i = 0; i < chunks.length; i++) {
        const createCats = await fetchWooAPI<IWooCategory[]>(`/products/categories/batch`, { create: chunks[i] }, 'post');
        if (createCats?.data?.length > 0) {
          created.push(...createCats.data);
        } else {
          console.log('createCategories issue', { createCats });
        }
      }
      console.log({ created });
      created.forEach((c) => {
        wooCategories.push(c);
        lookupWooCat[c.slug] = c;
      });
      this.log(`Create catagories: ${created.map((c) => c.slug).join()}`);
      return created;
    };

    const getWpsCategoryIds = (wpsProduct: IWesternProductExt) => {
      const catIds = [];
      wpsProduct.items.data.forEach((item) => {
        item.taxonomyterms.data.forEach((term) => {
          const wooCat = lookupWooCat[term.slug];
          if (wooCat && catIds.indexOf(wooCat.id) === -1) {
            catIds.push(wooCat.id);
          }
        });
      });
      return catIds;
    };

    const updateProducts = async (deltas: Partial<IWooVariable | IWooVariation>[]) => {
      console.log({ deltas });
      const chunks = chunkArray(deltas, 32);
      console.log({ chunks });
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log({ chunk });
        const update = await fetchWooAPI<IWooVariable[]>(`/products/batch`, { update: chunk, _fields: 'id,sku,name,categories' }, 'put');
        console.log({ update });
      }
    };

    const processPage = async (page = 1) => {
      if (this.paused === true) {
        console.log('paused');
        this.onResume = () => processPage(page);
        return;
      }

      const wooProductsPage = await getWooProducts(page);
      const wpsIds = wooProductsPage.data.filter(isWestern).map(getSupplierId);
      const wpsProductsPage = await getWpsProducts(wpsIds);
      const lookupWpsProduct = lookup(wpsProductsPage.data, 'id');
      // console.log({ wooProductsPage });
      // console.log({ wpsProductsPage });
      const info = wpsProductsPage.data.map(extractProductCategoryInfo);
      // console.log({ info });
      createCategories(info.reduce((a, e) => [...a, ...e.create], []));

      const update: (Partial<IWooVariable> | Partial<IWooVariation>)[] = [];

      for (let i = 0; i < wooProductsPage.data.length; i++) {
        const wooProduct = wooProductsPage.data[i];
        const wpsProduct = lookupWpsProduct[getSupplierId(wooProduct)];
        // console.log({ wooProduct });
        // console.log({ wpsProduct });
        if (wpsProduct) {
          const wooCats = wooProduct.categories
            .filter((c) => c.slug !== 'uncategorized')
            .map((c) => c.id)
            .sort();
          const categories = getWpsCategoryIds(wpsProduct).sort();
          if (wooCats.join() !== categories.join()) {
            // console.log('update woo', wooProduct.id, { wooCats, categories });
            update.push({ id: wooProduct.id, categories: categories.map((id) => ({ id } as IWooCategory)) });
            report.updates++;
          } else {
            // console.log('skip woo', wooProduct.id, { wooCats, categories });
            report.skips++;
          }
        } else {
          // console.log('skip  - no wps product found');
          report.skips++;
        }
      }
      if (update.length > 0) {
        console.log({ update });
        await updateProducts(update);
      }

      this.log(JSON.stringify({ ...report, page, totalPages: wooProductsPage.meta.totalPages }));

      if (wooProductsPage.meta.totalPages > page) {
        this.onProgress(page / wooProductsPage.meta.totalPages);
        processPage(page + 1);
      } else {
        this.onComplete(this.input);
      }
    };

    processPage();
  }
}

export const WesternUpdateProductCategoriesJobManager = new JobManager<IWesternUpdateProductCategoriesPayload>({
  name: 'Update Product Categories',
  stages: [
    // new Job_getWesternCategories(), //
    new Job_getWooCategories(),
    // new Job_loadAllWooProducts(),
    // new Job_loadAllWpsProducts(),
    // new Job_logInput(),
    new Job_analyzeProductCategories()
  ]
});
