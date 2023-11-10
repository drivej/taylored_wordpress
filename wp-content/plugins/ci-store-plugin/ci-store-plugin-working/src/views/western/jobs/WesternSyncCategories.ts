import { JobManager } from '../../../jobs/JobManager';
import { JobRunner } from '../../../jobs/JobRunner';
import { chunkArray } from '../../../utils/chunkArray';
import { lookup } from '../../../utils/lookup';
import { fetchWooAPI } from '../../woo/useWoo';
import { Job_getWesternCategories, Job_getWesternCategories_payload } from '../tasks/Job_getWesternCategories';
import { Job_getWooCategories, Job_getWooCategories_payload } from '../tasks/Job_getWooCategories';
import { Job_logInput } from '../tasks/Job_logInput';

export interface IWesternSyncCategoriesPayload extends Partial<Job_getWesternCategories_payload>, Partial<Job_getWooCategories_payload> {}

// bring all WPS categories into Woo before assigning categories - rather than do discovery product by product

class Job_analyzeCategories extends JobRunner<IWesternSyncCategoriesPayload> {
  name = 'Job_analyzeCategories';
  skip = false;

  async doRun() {
    const { wooCategories, wpsCategories } = this.input;
    console.log({ wooCategories });
    const lookupWooCatBySlug = lookup(wooCategories, 'slug');
    const inserts = wpsCategories.filter((wpsCat) => !lookupWooCatBySlug[wpsCat.slug]).map((cat) => ({ slug: cat.slug, name: cat.name }));
    console.log({ inserts });

    if (inserts.length > 0) {
      this.log(`Insert ${inserts.length.toLocaleString()} new categories.`); //{ newCats: inserts });
      const chunks = chunkArray(inserts, 20);

      if (!this.skip) {
        for (let i = 0; i < chunks.length; i++) {
          const createCats = await fetchWooAPI(`/products/categories/batch`, { create: chunks[i] }, 'post');
          console.log({ createCats });
          this.log(`chunk ${i}: ${chunks[i].length.toLocaleString()} categories`);
        }
      }
    }
    this.onComplete({ ...this.input });
  }
}

export const WesternSyncCategoriesJobManager = new JobManager<IWesternSyncCategoriesPayload>({
  name: 'Sync Western Categories',
  stages: [
    new Job_getWesternCategories(), //
    new Job_getWooCategories(),
    new Job_logInput(),
    new Job_analyzeCategories()
  ]
});
