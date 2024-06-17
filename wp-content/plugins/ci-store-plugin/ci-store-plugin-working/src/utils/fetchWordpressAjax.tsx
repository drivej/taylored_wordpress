import fetch from 'cross-fetch';
import { IWordpressAjaxParams } from '../models';

// export async function fetchWordpressAjax<T,P = unknown>(params: IWordpressAjaxParams & ICronJobParams = { action: '' }) {
export async function fetchWordpressAjax<T = Record<string, unknown>, P = Record<string, string>>(params: IWordpressAjaxParams & P) {
  const url = new URL(location.origin);
  url.pathname = window.ajaxurl; //'/wp-admin/admin-ajax.php';
  Object.keys(params).forEach((k) => {
    if (Array.isArray(params[k])) {
      params[k].forEach((val: string) => {
        url.searchParams.append(`${k}[]`, val);
      });
    } else {
      url.searchParams.set(k, params[k]);
    }
  });

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
