import { useWordpressAjax } from '../utils/useWordpressAjax';

export const useTotalProducts = (supplier_key: string) => {
  return useWordpressAjax<number>(
    {
      action: 'ci_api_handler', //
      cmd: 'supplier_action',
      func: 'get_total_products',
      supplier_key
    },
    { enabled: !!supplier_key }
  );
};
