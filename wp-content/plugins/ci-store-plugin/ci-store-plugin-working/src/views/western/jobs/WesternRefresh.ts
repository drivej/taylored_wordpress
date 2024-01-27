import { JobManager } from '../../../__old/jobs/JobManager';
import { JobRunner } from '../../../__old/jobs/JobRunner';
import { Product } from '../../../components/woo/Product';
import { chunkArray } from '../../../utils/chunkArray';
import { lookup } from '../../../utils/lookup';
import { fetchWooAPI } from '../../woo/useWoo';
import { IWesternProductExt } from '../IWestern';
import { IWooVariable, IWooVariation } from '../IWoo';
import { getSupplierId, getWPSProduct, getWooProductVariations } from '../WPSJobUtils';

export interface IWesternRefreshPayload {} //extends Job_getWooCategories_payload {}

interface IVariationDelta {
  deletes: IWooVariation[];
  inserts: Partial<IWooVariation>[];
  updates: Partial<IWooVariation>[];
  error: string;
  wooProduct: IWooVariable;
  wpsProduct: IWesternProductExt;
  product: Product;
}

class Job_refreshProduct extends JobRunner<IWesternRefreshPayload> {
  name = 'Refresh Product Variations/Attributes';

  async doRun() {
    const getWooProducts = async (page = 1) => {
      return await fetchWooAPI<IWooVariable[]>(`/products`, { _fields: 'id,sku', type: 'variable', per_page: 50, page }, 'get');
    };

    const deleteWooVariations = async (product: IWooVariable, variations: Partial<IWooVariation>[]) => {
      if (variations.length > 0) {
        variations = variations.map((v) => ({ id: v.id }));
        const chunks = chunkArray(variations, 50);
        let i = chunks.length;
        while (i--) {
          const doDelete = await fetchWooAPI<IWooVariation[]>(`/products/${product.id}/variations/batch`, { delete: chunks[i] }, 'post');
          console.log({ doDelete });
        }
      }
    };

    const insertWooVariations = async (product: IWooVariable, variations: Partial<IWooVariation>[]) => {
      if (variations.length > 0) {
        const chunks = chunkArray(variations, 50);
        let i = chunks.length;
        while (i--) {
          const doInsert = await fetchWooAPI<IWooVariation[]>(`/products/${product.id}/variations/batch`, { create: chunks[i] }, 'post');
          console.log({ doInsert });
        }
      }
    };

    const updateWooVariations = async (product: IWooVariable, variations: Partial<IWooVariation>[]) => {
      if (variations.length > 0) {
        const chunks = chunkArray(variations, 50);
        let i = chunks.length;
        while (i--) {
          const doUpdate = await fetchWooAPI<IWooVariation[]>(`/products/${product.id}/variations/batch`, { update: chunks[i] }, 'put');
          console.log({ doUpdate });
        }
      }
    };

    const getWooProductVariationDeltas = async (wooProduct: IWooVariable, wpsProduct: IWesternProductExt): Promise<IVariationDelta> => {
      const result: IVariationDelta = { deletes: [], inserts: [], updates: [], error: null, wooProduct, wpsProduct, product: null };

      if (!wooProduct) {
        result.error = 'No wooProduct';
        return result;
      }
      if (!wpsProduct) {
        result.error = 'No wpsProduct';
        return result;
      }

      const wooId = wooProduct.id;
      const product = (result.product = Product.fromWesternProduct(wpsProduct));
      product.variations.forEach((v) => v.attribute('sku', v.sku)); // add sku as attribute for UI select
      product.cleanVariations();

      let wooVariations: IWooVariation[];
      try {
        wooVariations = await getWooProductVariations(wooId);
      } catch (err) {
        result.error = 'Error getting Variations';
        return result;
      }

      const lookupVariation = lookup(wooVariations, 'sku');
      const newWooVariations = product.variations.map((p) => p.toWoo());
      const lookupNewVariation = lookup(newWooVariations, 'sku');

      // update variations (delete, insert, update)
      const f = wooVariations.filter((v) => !lookupNewVariation[v.sku]);
      result.deletes = wooVariations.filter((v) => !lookupNewVariation[v.sku]);
      result.inserts = newWooVariations.filter((v) => !lookupVariation[v.sku]);
      result.updates = newWooVariations
        .filter((v) => lookupVariation?.[v.sku]?.id)
        .filter((v) => {
          // console.log({ v });
          const currentVariation = lookupVariation[v.sku];
          // console.log({ currentVariation });
          const a1 = currentVariation?.attributes ?? [];
          const a2 = v.attributes;

          const key1 = a1
            .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
            .map((a) => `${a.name}:${a.option}`)
            .join('|');

          const key2 = a2
            .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
            .map((a) => `${a.name}:${a.option}`)
            .join('|');

          // console.log({ a1, a2 });
          if (key1 !== key2) console.log(currentVariation.id, v.sku, { key1, key2 });
          return key1 !== key2;
        })
        .map((v) => ({
          id: lookupVariation[v.sku]?.id,
          attributes: v.attributes
        }));

      return result;
    };

    const commitVariationDeltas = async (deltas: IVariationDelta) => {
      const { deletes, inserts, updates, product, wooProduct } = deltas;
      if (updates.length > 0 || deletes.length > 0 || inserts.length > 0) {
        const wooData = product.toWoo() as IWooVariable;
        const updateProduct = await fetchWooAPI<IWooVariation[]>(`/products/${wooProduct.id}`, { attributes: wooData.attributes }, 'post');
        // console.log({ updateProduct });

        if (deletes.length > 0) {
          await deleteWooVariations(wooProduct, deletes);
        }
        if (inserts.length > 0) {
          await insertWooVariations(wooProduct, inserts);
        }
        if (updates.length > 0) {
          await updateWooVariations(wooProduct, updates);
        }
        console.log({ deletes, inserts, updates });
      } else {
        // console.log(`No changes for wooId:${wooId}`);
        report.skip += 1;
      }
    };

    this.onProgress(0);
    const report = { updates: 0, inserts: 0, deletes: 0, skip: 0 };

    const processPage = async (page = 1) => {
      const wooProductsPage = await getWooProducts(page);
      console.log({ page, wooProductsPage });
      this.log(`Loaded ${wooProductsPage.data.length} Woo Products`);
      let i = wooProductsPage.data.length;

      while (i--) {
        if (this.paused === true) {
          break;
        }
        const wooProduct = wooProductsPage.data[i];
        const wooId = wooProduct.id;
        const wpsId = getSupplierId(wooProduct);
        let wpsProduct: IWesternProductExt;
        try {
          wpsProduct = await getWPSProduct(wpsId);
        } catch (err) {
          console.log('Error: WPS product not found', { wpsId, wooId });
          continue;
        }

        if (!wpsProduct) {
          console.log('WPS product not found', { wpsId, wooId });
          continue;
        }

        const deltas = await getWooProductVariationDeltas(wooProduct, wpsProduct);
        console.log({ deltas });

        const commit = await commitVariationDeltas(deltas);
        console.log({ commit });

        report.deletes += deltas.deletes.length;
        report.updates += deltas.updates.length;
        report.inserts += deltas.inserts.length;
        this.log(JSON.stringify(report));
      }

      this.onProgress(wooProductsPage.meta.page / wooProductsPage.meta.totalPages);
      this.log(`Completed page ${page}/${wooProductsPage.meta.totalPages}`);
      if (wooProductsPage.meta.totalPages > page) {
        if (this.paused === true) {
          console.log('paused');
          this.onResume = () => processPage(page + 1);
        } else {
          processPage(page + 1);
        }
      } else {
        this.onComplete(this.input);
      }
    };

    processPage(1);
  }
}

export const WesternRefreshJobManager = new JobManager<IWesternRefreshPayload>({
  name: 'Refresh Woo/WPS Product Variations/Attributes',
  description: 'Step through Woo products and validate variations',
  stages: [
    new Job_refreshProduct()
  ]
});
