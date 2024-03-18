import { IAjaxQuery } from '../common/hooks/useJob';
import { useWordpressAjax } from '../common/hooks/useWordpressAjax';

interface IImportStatus {
  supplier: string;
  is_import_scheduled: boolean;
  is_import_running: boolean;
  is_stalled: boolean;
  should_cancel_import: boolean;
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
    import_type: string;
    completed: string;
  };
}

export const useImportStatus = (supplier_key: string) => {
  const query: IAjaxQuery & Record<string, string | number> = { action: 'ci_api_handler', cmd: 'get_import_status', supplier_key };
  const data = useWordpressAjax<IImportStatus>(query, { enabled: !!supplier_key });
  return data;
};
