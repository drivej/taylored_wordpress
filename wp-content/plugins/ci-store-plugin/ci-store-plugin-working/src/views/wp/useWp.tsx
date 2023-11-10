import fetch from 'cross-fetch';
import { FormMethod } from 'react-router-dom';
import urlJoin from 'url-join';

interface IWpParams {
  [key: string]: unknown;
}

interface IWpAPIResponse {
  [key: string]: unknown;
}

interface IWpAPIResponseError {
  code: string;
  message: string;
  description: string;
  data: { status: number };
}

export async function fetchWp<T, I = IWpParams>(path: string, payload: I = null, method: FormMethod | string = 'get'): Promise<T | IWpAPIResponseError> {
  // console.log('fetchWooAPI', { path, method });
  const url = new URL(location.origin);
  url.pathname = urlJoin('wpapi', path);
  let body = {};
  // console.log('fetchWooAPI', { path, delta, method });

  if (payload) {
    if (method === 'get') {
      url.search = new URLSearchParams(payload as Record<string, string>).toString();
    } else {
      body = { body: JSON.stringify(payload) };
    }
  }
  console.log('fetchWooAPI',method, url.pathname);
  const res = await fetch(url, { method, headers: { 'content-type': 'application/json' }, ...body });
  if (!res.ok) {
    const info = { message: 'ERROR', description: 'There was a problem' };
    try {
      const err = await res.json();
      info.message = err?.message ?? '';
      info.description = err?.description ?? '';
    } catch (e) {}
    return Promise.reject(info);
  }
  const data: T & IWpAPIResponseError = await res.json();

  if (data?.code) {
    return Promise.reject({ message: data.description, description: data.message });
  }
  // const total = res.headers.has('X-Wp-Total') ? parseInt(res.headers.get('X-Wp-Total')) : 0;
  // const totalPages = res.headers.has('X-Wp-Totalpages') ? parseInt(res.headers.get('X-Wp-Totalpages')) : 0;
  // const meta = { total, totalPages, page: (payload as IWooParams)?.page, per_page: (payload as IWooParams)?.per_page };
  return data;
}
