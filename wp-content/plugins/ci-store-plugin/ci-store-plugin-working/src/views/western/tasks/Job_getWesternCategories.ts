import { JobRunner } from '../../../__old/jobs/JobRunner';
import { getStore } from '../../../utils/getStore';
import { lookup } from '../../../utils/lookup';
import { IWesternTaxonomyTerm } from '../IWestern';
import { fetchWesternAPI } from '../useWestern';

export interface Job_getWesternCategories_payload {
  wpsCategories: IWesternTaxonomyTerm[];
}

export class Job_getWesternCategories extends JobRunner<Job_getWesternCategories_payload> {
  name = 'Job_getWesternCategories';

  async doRun() {
    const storeKey = 'WesternCategories';
    const store = getStore<{ created: string; data: IWesternTaxonomyTerm[] }>(storeKey, null);
    if (store && store.data) {
      console.log({ store });
      this.onComplete({ ...this.input, wpsCategories: store.data });
      return;
    }

    let total = (await fetchWesternAPI<{ count: number }>(`/taxonomyterms`, { countOnly: true })).data.count;

    const wpsCategories: IWesternTaxonomyTerm[] = [];

    let r = await fetchWesternAPI<IWesternTaxonomyTerm[]>(`/taxonomyterms`, { 'page[size]': 50 });
    wpsCategories.push(...(r?.data ? (Array.isArray(r.data) ? r.data : [r.data]) : []));
    while (r?.meta?.cursor?.next) {
      r = await fetchWesternAPI<IWesternTaxonomyTerm[]>(`/taxonomyterms`, { 'page[size]': 50, 'page[cursor]': r.meta.cursor.next });
      wpsCategories.push(...(r?.data ? (Array.isArray(r.data) ? r.data : [r.data]) : []));
      this.onProgress(wpsCategories.length / total);
    }

    // this isn't tree builder really needed because we're merging all on the slug value but keep it just in case
    const lookupWpsCat = lookup(wpsCategories, 'id');
    wpsCategories.forEach((c) => {
      let depth = 0;
      let path = [];
      let p = c.parent_id;
      while (p) {
        path.unshift(lookupWpsCat[p].slug);
        p = lookupWpsCat[p]?.parent_id;
        depth++;
      }
      c.__path = path;
      c.depth = depth;
    });
    wpsCategories.sort((a, b) => (a.depth < b.depth ? -1 : a.depth > b.depth ? 1 : 0));
    window.localStorage.setItem(storeKey, JSON.stringify({ created: new Date().toISOString(), data: wpsCategories }));
    this.onComplete({ ...this.input, wpsCategories });
  }
}
