import { IAjaxQuery } from '../common/hooks/useJob';
import { useWordpressAjax } from '../common/hooks/useWordpressAjax';

interface IImportStatus {
  supplier: string;
  is_stalled: boolean;
  is_running: boolean;
  is_scheduled: boolean;
  is_cancelled: boolean;
  should_cancel_import: boolean;
  now: string;
  next_import: string;
  report: {
    products_count: number;
    processed: number;
    delete: number;
    update: number;
    ignore: number;
    insert: number;
    error: string;
    cursor: null;
    page_size: string;
    updated: string;
    started: string;
    stopped: string;
    completed: string;
  };
}

export const useImportStatus = (supplier_key: string, isPolling = false) => {
  const query: IAjaxQuery & Record<string, string | number> = { action: 'ci_api_handler', cmd: 'get_import_status', supplier_key };
  const data = useWordpressAjax<IImportStatus>(query, { enabled: !!supplier_key, refetchInterval: isPolling ? 60000 : null });
  return data;
};
