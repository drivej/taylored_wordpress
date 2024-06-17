import { IAjaxQuery } from '../models';
import { useWordpressAjax } from '../utils/useWordpressAjax';

export interface ISupplier {
  key: string;
  name: string;
}

export const useSuppliers = () => {
  const query: IAjaxQuery & Record<string, string | number> = { action: 'ci_api_handler', cmd: 'get_suppliers' };
  const data = useWordpressAjax<ISupplier[]>(query);
  return data;
};
