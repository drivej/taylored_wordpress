import { default as urlJoin } from 'url-join';

// const AUTH = { headers: { Authorization: 'Bearer aybfeye63PtdiOsxMbd5f7ZAtmjx67DWFAQMYn6R' } };

import { useQuery } from '@tanstack/react-query';
import fetch from 'cross-fetch';
import { FormMethod } from 'react-router-dom';
import { IWooParams, IWooVariable, IWooVariation } from '../western/IWoo';

export interface IWooAPIResponse<D> extends Partial<IWooAPIResponseError> {
  meta: {
    total: number;
    totalPages: number;
    page: number;
    per_page: number;
  };
  data: D;
}

interface IWooAPIResponseError {
  error: {
    code: string;
    message: string;
    name: string;
    stack: string;
    config: unknown;
  };
}

export async function fetchWooAPI<T, I = IWooParams>(path: string, delta: I = null, method: FormMethod | string = 'get'): Promise<IWooAPIResponse<T>> {
  // console.log('fetchWooAPI', { path, method });
  const url = new URL(location.origin);
  url.pathname = urlJoin('wooapi', path);
  let body = {};
  // console.log('fetchWooAPI', { path, delta, method });

  if (delta) {
    if (method === 'get') {
      url.search = new URLSearchParams(delta as Record<string, string>).toString();
    } else {
      body = { body: JSON.stringify(delta) };
    }
  }
  // console.log('fetchWooAPI', url.href);
  const res = await fetch(url, { method, headers: { 'content-type': 'application/json' }, ...body });
  if (!res.ok) {
    const info = { code: res.status, message: 'ERROR', description: 'There was a problem' };
    try {
      const err = await res.json();
      info.code = res.status;
      info.message = err?.message ?? '';
      info.description = err?.description ?? '';
    } catch (e) {}
    return Promise.reject(info);
  }
  const data: T & IWooAPIResponseError = await res.json();

  if (data?.error) {
    return Promise.reject({ code: data?.error?.code ?? res.status, message: 'xERROR', description: data?.error?.message ?? 'unknown' });
  }
  const total = res.headers.has('X-Wp-Total') ? parseInt(res.headers.get('X-Wp-Total')) : 0;
  const totalPages = res.headers.has('X-Wp-Totalpages') ? parseInt(res.headers.get('X-Wp-Totalpages')) : 0;
  const meta = { total, totalPages, page: (delta as IWooParams)?.page, per_page: (delta as IWooParams)?.per_page };
  return { meta, data };
}

export type IWooProductListItem = Pick<IWooVariation, 'id' | 'sku' | 'name' | 'meta_data' | 'tags'>;

export const useWooProducts = (params: Partial<IWooParams> = {}) => {
  return useQuery({
    queryKey: ['woo-api', JSON.stringify(params)],
    queryFn: async () => await fetchWooProducts(params)
  });
};

export const useWooProduct = (id: number) => {
  return useQuery({
    queryKey: ['woo-api', 'products', id],
    enabled: !!id,
    queryFn: async () => {
      return await fetchWooAPI<IWooVariation>(`/products/${id}`);
    }
  });
};

export const useWooProductBySku = (sku: string) => {
  return useQuery({
    queryKey: ['woo-api', 'product-by-sku', sku],
    enabled: !!sku,
    queryFn: async () => {
      return await fetchWooProductBySku(sku);
    }
  });
};

export async function fetchWooProducts(params: Partial<IWooParams> = {}) {
  return fetchWooAPI<IWooVariable[]>(`/products`, { _fields: 'id,sku,name', ...params }, 'get');
}

export async function fetchWooProductBySku(sku: string, params: { [key: string]: string | number } = {}) {
  const p = await fetchWooAPI<IWooVariable[]>(`products`, { sku, ...params });
  return p.data?.[0];
}

export async function fetchWooProduct<T = IWooVariation | IWooVariable>(id: string | number, params: { [key: string]: string | number } = null) {
  return await fetchWooAPI<T>(`products/${id}`, params);
}

export async function fetchWooProductVariations(id: string | number, params: { [key: string]: string | number } = null) {
  return await fetchWooAPI<IWooVariable[]>(`products/${id}/variations`, params);
}

export async function fetchWooProductVariation(productId: string | number, variationId: string | number, params: { [key: string]: string | number } = null) {
  return await fetchWooAPI<IWooVariation>(`products/${productId}/variations/${variationId}`, params);
}

export async function fetchWooProductExists(sku: string, params: { [key: string]: string | number } = null) {
  const p = await fetchWooAPI<IWooVariation[]>(`products`, { sku, _fields: 'sku', ...params });
  return !!p.data?.[0]?.sku;
}

export async function fetchIsWooProductVariationBySku(productId: string | number, sku: string, params: { [key: string]: string | number } = null) {
  const p = await fetchWooAPI<IWooVariation[]>(`products/${productId}/variations`, { sku, _fields: 'sku', ...params });
  return p.data?.[0]?.sku === sku;
}

export async function fetchWooProductsBySku(_skus: string[], _fields = 'id,sku,date_modified,type,variations') {
  const maxChars = 2048 - 200; //  200 is a healthy buffer for url
  // need to separate masters from variations due to wp limitation
  const skus = Array.from(new Set(_skus));
  const masters = skus.filter((sku) => sku.indexOf('MASTER') === 0);
  const others = skus.filter((sku) => sku.indexOf('MASTER') !== 0);
  // use set to make sure sku's don't repeat
  const masterPages = masters.reduce((a, sku) => {
    if (a.length > 0 && a[a.length - 1].length + sku.length < maxChars) {
      a[a.length - 1] += `,${sku}`;
    } else {
      a.push(sku);
    }
    return a;
  }, []);

  const otherPages = others.reduce((a, sku) => {
    if (a.length > 0 && a[a.length - 1].length + sku.length < maxChars) {
      a[a.length - 1] += `,${sku}`;
    } else {
      a.push(sku);
    }
    return a;
  }, []);

  // const pages = [...masterPages, ...otherPages];

  // console.log('fetchWooProductsBySku', { pages });
  // console.log({ skus });

  const results = await Promise.all(skus.map((p) => fetchWooAPI<IWooVariation[]>(`/products`, { sku: p, _fields })));
  // const results = await Promise.all(pages.map((p) => fetchWooAPI<IWooVariation[]>(`/products`, { sku: p, _fields })));
  const all = results.reduce((a, p) => [...a, ...p.data], []);

  // const l1 = lookup(all, 'sku');
  // skus.forEach((sku) => {
  //   console.log('look for:', sku, 'found', !!l1?.[sku]);
  // });
  // console.log({ all });
  return all;
}
