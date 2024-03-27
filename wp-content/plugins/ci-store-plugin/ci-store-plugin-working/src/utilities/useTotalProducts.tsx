import { IAjaxQuery } from '../common/hooks/useJob';
import { useWordpressAjax } from '../common/hooks/useWordpressAjax';

export const useTotalProducts = (supplier_key: string) => {
  const query: IAjaxQuery & Record<string, string | number> = { action: 'ci_api_handler', cmd: 'get_total_products', supplier_key };
  const data = useWordpressAjax<{data:number}>(query, { enabled: !!supplier_key });
  return data;
};
