import fetch from 'cross-fetch';
import { ICronJobParams, IWordpressAjaxParams } from '../../views/jobs/Jobs';

export async function fetchWordpressAjax<T>(params: IWordpressAjaxParams & ICronJobParams = { action: '' }) {
  const url = new URL(location.origin);
  url.pathname = '/wp-admin/admin-ajax.php';
  Object.keys(params).forEach((k) => url.searchParams.set(k, params[k]));

  const res = await fetch(url);
  if (!res.ok) {
    const info = { message: 'ERROR', description: 'There was a problem' };
    try {
      const err = await res.json();
      info.message = err?.message ?? '';
      info.description = err?.description ?? '';
    } catch (e) {}
    return Promise.reject({ error: info });
  }

  const data: T = await res.json();
  return data;
}
