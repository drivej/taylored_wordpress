import { QueryKey, UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { default as urljoin } from 'url-join';
import { IWesternAPIQuery, IWesternAttributeKey, IWesternError, IWesternImage, IWesternItem, IWesternItemStatus, IWesternParams, IWesternProductExt, IWesternResponse } from './IWestern';

const WESTERN_API_URL = 'http://api.wps-inc.com';

import fetch from 'cross-fetch';
import { isset } from '../../utils/isset';
import { isValidItem, isValidProduct } from './WesternProducts';

export async function fetchWesternAPI<T>(path: string, params: IWesternParams = {}) {
  const url = new URL(location.origin);
  // url.pathname = urlJoin('/proxy/western', path);
  url.pathname = '/wp-admin/admin-ajax.php';
  url.searchParams.set('action', 'forward_data');
  url.searchParams.set('key', 'WPS');
  url.searchParams.set('path', path);

  // url.searchParams.set('cachebust', datestamp()); // let's bust this cache each day
  Object.keys(params)
    .filter((p) => params[p] !== null && params[p] !== '' && params[p] !== undefined)
    .map((p) => url.searchParams.set(p, params?.[p]?.toString() ?? ''));
  // console.log('fetchWesternAPI', url.href);
  // return fetch(url).catch(err => {error: err})
  console.log('fetchWesternAPI', decodeURIComponent(url.href));
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
  const data: IWesternResponse<T> = await res.json();

  if (data?.status_code === 404) {
    data.error = { message: data?.message, status_code: data.status_code };
  }
  return data;
}

export const fetchWesternProductsPage = async (cursor: string, pageSize = 1000, params: IWesternParams = {}) => {
  const data = await fetchWesternAPI<IWesternProductExt[]>('/products', { 'page[cursor]': cursor, 'page[size]': pageSize, include: 'items:filter(status_id|NLA|ne)', ...params });
  data.data = data.data.filter(isValidProduct);
  data.data.forEach((p) => (p.items.data = p.items.data.filter(isValidItem)));
  return data;
};

type QueryOptions = Omit<UseQueryOptions<unknown, unknown, unknown, QueryKey>, 'initialData'> & {
  initialData?: () => undefined;
};

export function useWestern<T = unknown>(props: Partial<IWesternAPIQuery> = {}, options: Record<string, unknown> = {}): UseQueryResult<IWesternResponse<T> & { query: IWesternAPIQuery }, IWesternError> {
  return useQuery<unknown, IWesternError, IWesternResponse<T> & { query: IWesternAPIQuery }, QueryKey>({
    ...options,
    queryKey: ['western-api', props.service, props] as unknown as QueryKey,
    queryFn: async () => {
      const url = new URL(WESTERN_API_URL);
      url.pathname = props?.path ?? urljoin(props.service, props?.ids?.join() ?? '', props?.route ?? '');

      Object.keys(props)
        .filter((k) => isset(props, k))
        .forEach((k) => {
          switch (k) {
            case 'pageSize':
              url.searchParams.set('page[size]', props.pageSize.toString());
              break;
            case 'pageCursor':
              url.searchParams.set('page[cursor]', props.pageCursor);
              break;
            case 'path':
            case 'service':
              break;
            default:
              url.searchParams.set(k, props[k]);
          }
        });

      const params = Object.fromEntries(url.searchParams);
      const data = await fetchWesternAPI<T>(url.pathname, params);
      const query = { ...props, url: url.href };
      return { ...data, query };
    }
  });
}

export const _productIncludes = [
  'features', //
  'tags',
  'items',
  'items.images',
  'attributekeys',
  'attributevalues',
  'items.inventory',
  'items.attributevalues',
  'items.taxonomyterms',
  'taxonomyterms'
];

export const westernProductIncludes = _productIncludes.join();

export const westernProductIncludes_ExcludeNLA = _productIncludes
  .map((i) => {
    if (i === 'items') {
      return 'items:filter(status_id|NLA|ne)';
    }
    return i;
  })
  .join();

const AttrCache = {};

export function useWesternProduct(productId: number, enabled = true): UseQueryResult<IWesternProductExt, IWesternError> {
  return useQuery<IWesternProductExt, IWesternError>({
    queryKey: ['western-product', productId],
    enabled: enabled && !!productId,
    queryFn: () => fetchWesternProduct(productId)
  });
}

export const fetchWesternProduct = async (productId: number | string) => {
  const product = await fetchWesternAPI<IWesternProductExt>(`/products/${productId}`, { include: westernProductIncludes });
  console.log('fetchWesternProduct', { product });
  product.data.attributekeys = { data: [] };
  product.data.items.data = product.data.items.data.filter((item) => item.status_id !== IWesternItemStatus.NLA);
  const attrIds = product.data.items.data.reduce((attrIds, item) => [...attrIds, ...(item.attributevalues?.data?.map((attr) => attr.attributekey_id) ?? [])], []).filter((a) => !!a);
  const uniqueAttrIds = Array.from(new Set(attrIds));
  const newIds = uniqueAttrIds.filter((id) => !Object.prototype.hasOwnProperty.call(AttrCache, id));
  if (newIds.length > 0) {
    // must attribute paginate request
    const attributes: IWesternResponse<IWesternAttributeKey[]> = { meta: {}, data: [], query: null };
    let r = await fetchWesternAPI<IWesternAttributeKey | IWesternAttributeKey[]>(`/attributekeys/${newIds.join()}`, { 'page[size]': 50 });
    console.log({ r });
    attributes.data.push(...(r?.data ? (Array.isArray(r.data) ? r.data : [r.data]) : []));
    while (r?.meta?.cursor?.next) {
      r = await fetchWesternAPI<IWesternAttributeKey[]>(`/attributekeys/${newIds.join()}`, { 'page[size]': 50, 'page[cursor]': r.meta.cursor.next });
      console.log({ r });
      attributes.data.push(...(r?.data ? (Array.isArray(r.data) ? r.data : [r.data]) : []));
    }
    const a = Array.isArray(attributes.data) ? attributes.data : [attributes.data];
    a.forEach((attr) => (AttrCache[attr.id] = attr));
  }
  if (uniqueAttrIds.length) {
    product.data.attributekeys = { data: uniqueAttrIds.map((id) => AttrCache[id]) };
  }
  return product.data;
};

export function useWesternProducts({ ...props }: Partial<IWesternAPIQuery> = {}, enabled = true) {
  return useWestern<IWesternProductExt[]>({ include: westernProductIncludes, ...props, service: 'products' }, { enabled });
}

export function useWesternItems({ ...props }: Partial<IWesternAPIQuery> = {}, enabled = true) {
  return useWestern<IWesternItem[]>({ ...props, service: 'items' }, { enabled });
}

export function useWesternImages({ ...props }: Partial<IWesternAPIQuery> = {}, enabled = true) {
  return useWestern<IWesternImage[]>({ ...props, service: 'images' }, { enabled });
}

export const useWesternProductsPage = (cursor: string = null, pageSize = 1000) => {
  return useQuery({
    queryKey: ['western-products-page-api', cursor, pageSize],
    queryFn: async () => await fetchWesternProductsPage(cursor, pageSize)
  });
};
