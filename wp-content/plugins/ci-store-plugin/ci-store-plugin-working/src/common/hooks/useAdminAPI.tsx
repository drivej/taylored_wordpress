import { UseQueryOptions, keepPreviousData, useQuery } from '@tanstack/react-query';
import { ICronJobParams } from '../../views/jobs/Jobs';
import { fetchWordpressAjax } from '../utils/fetchWordpressAjax';
import { IWooProduct } from '../woo/IWoo';

export enum IWooProductStatus {
  PUBLISH = 'publish',
  TRASH = 'trash',
  DRAFT = 'draft',
  PENDING = 'pending'
}

export interface IWooProductQuery {
  page: number;
  limit: number;
  status: IWooProductStatus | IWooProductStatus[];
}

export interface IWooProductQueryMeta {
  args: Partial<IWooProductQuery>;
  total: number;
  pages: number;
  page: number;
  limit: number;
}

interface IAdminResponse<D = null, M = Record<string, string | number>> {
  data: D;
  meta?: M;
  error?: string;
}

interface ISupplier {
  key: string;
  name: string;
}

interface IWooStats {
  publish: string;
  future: number;
  draft: number;
  pending: number;
  private: number;
  trash: string;
  'auto-draft': number;
  inherit: number;
  'request-pending': number;
  'request-confirmed': number;
  'request-failed': number;
  'request-completed': number;
  'acf-disabled': number;
  'wc-pending': number;
  'wc-processing': number;
  'wc-on-hold': number;
  'wc-completed': number;
  'wc-cancelled': number;
  'wc-refunded': number;
  'wc-failed': number;
  'wc-checkout-draft': number;
  'wc-shipped': number;
  'wc-not-shipped': number;
}

export const useAdminAPI = <T, O = Record<string, string | number>>(cmd: string = '', options: Partial<O> = {}, queryProps: Partial<UseQueryOptions<T>> = {}) => {
  const action = 'admin_api';
  const query = { action, cmd, ...options };
  return useQuery({
    queryKey: [action, cmd, ...Object.values(options)],
    queryFn: () => fetchWordpressAjax<T, ICronJobParams>(query),
    placeholderData: keepPreviousData,
    ...queryProps
  });
};

export const useWooProducts = ({ limit, page, status }: Partial<IWooProductQuery> = { limit: 10, page: 1, status: IWooProductStatus.PUBLISH }) => {
  //page: number = 1, per_page: number = 10, status: IWooProductStatus = IWooProductStatus.PUBLISH) => {
  return useQuery({
    queryKey: ['admin_api', 'products', page, limit, status],
    queryFn: () => {
      return ProductAdmin.getProducts({ page, limit, status });
    },
    placeholderData: keepPreviousData
  });
};

export const useWooStats = () => {
  return useAdminAPI('stats');
  // return useQuery({
  //   queryKey: ['admin_api', 'stats'],
  //   queryFn: () => fetchWordpressAjax<IAdminResponse<IWooStats>>({ action: 'admin_api', cmd: 'stats' })
  // });
};

export const useSuppliers = () => {
  return useQuery({
    queryKey: ['admin_api', 'suppliers'],
    queryFn: () => fetchWordpressAjax<IAdminResponse<ISupplier[]>>({ action: 'admin_api', cmd: 'suppliers' })
  });
};

export class ProductAdmin {
  public static deleteProduct(product_id: number) {
    return fetchWordpressAjax<IAdminResponse<{ id: number; deleted: boolean }>, { product_id: number }>({ action: 'admin_api', cmd: 'delete_product', product_id });
  }

  public static getProducts({ limit, page, status }: Partial<IWooProductQuery> = { limit: 10, page: 1, status: IWooProductStatus.PUBLISH }) {
    return fetchWordpressAjax<IAdminResponse<Pick<IWooProduct, 'id' | 'name'>[], IWooProductQueryMeta>, IWooProductQuery>({ action: 'admin_api', cmd: 'products', page, limit, status });
  }
}
