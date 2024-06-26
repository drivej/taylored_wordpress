import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { IAjaxQuery } from '../models';
import { ISupplierActionQuery } from '../utilities/StockPage';
import { useImportStatus } from '../utilities/useImportStatus';
import { ISupplier, useSuppliers } from '../utilities/useSuppliers';
import { useTotalProducts } from '../utilities/useTotalProducts';
import { fetchWordpressAjax } from '../utils/fetchWordpressAjax';
import { formatTimeAgo } from '../utils/formatDuration';
import { useWordpressAjax } from '../utils/useWordpressAjax';

export const Overview = () => {
  const suppliers = useSuppliers();

  if (suppliers.isSuccess) {
    return (
      <div className='p-3 d-flex flex-column gap-2'>
        {suppliers.data.map((supplier) => (
          <SupplierImportStatus supplier={supplier} />
        ))}
      </div>
    );
  }

  return null;
};

export const useSupplierLogStatus = (supplier_key: string) => {
  const queryClient = useQueryClient();
  const query: IAjaxQuery & ISupplierActionQuery = { action: 'ci_api_handler', cmd: 'supplier_action', supplier_key, func: 'allow_logging', args: [] };
  const data = useWordpressAjax<{ data: boolean }>(query, { enabled: !!supplier_key });

  const mutation = useMutation({
    mutationFn: (allow: boolean) => fetchWordpressAjax<{ data: boolean }, IAjaxQuery & ISupplierActionQuery>({ ...query, args: [allow] }),
    onSuccess: (data) => {
      queryClient.setQueryData([query], data);
    }
  });

  const isLogging = data.data?.data ?? false;

  return { ...data, isLogging, update: mutation.mutate };
};

const SupplierImportStatus = ({ supplier }: { supplier: ISupplier }) => {
  const status = useImportStatus(supplier.key, true);
  const totalProducts = useTotalProducts(supplier.key);
  const logging = useSupplierLogStatus(supplier.key);

  const getAgo = (dateStr: string) => {
    if (dateStr) {
      const t = new Date(Date.parse(dateStr)).getTime();
      return formatTimeAgo((Date.now() - t) / 1000);
    }
    return '-';
  };

  const toggleLogging = () => {
    logging.update(!logging.isLogging);
  };

  const patch = status.data?.report?.patch;
  const lastStarted = status.isSuccess ? getAgo(status.data?.report?.started) : '...';
  const lastCompleted = status.isSuccess ? getAgo(status.data?.report?.completed) : '...';
  const nextImport = status.isSuccess ? getAgo(status.data?.next_import) : '...';
  const lastStopped = getAgo(status.data?.report?.stopped);
  const percent_complete = (100 * (status.data?.report?.processed ?? 0)) / (status.data?.report?.products_count ?? 1);
  const is_running = status.isSuccess ? status.data.is_running || status.data.is_scheduled : false;

  if (status.isSuccess) {
    return (
      <div className='p-3 border rounded d-flex gap-3 w-100 shadow-sm'>
        <div className='w-100'>
          <div className='w-100 d-flex align-items-center gap-3'>
            <h3 className='m-0'>{supplier.name}</h3>
            <div style={{ flex: '1 1 min-content' }}>
              {is_running ? (
                <div className='spinner-border spinner-border-sm' role='status'>
                  <span className='visually-hidden'>Loading...</span>
                </div>
              ) : null}
            </div>
          </div>
          <hr />
          <div className='progress' role='progressbar'>
            <div className={`progress-bar ${is_running ? 'progress-bar-striped progress-bar-animated' : 'bg-secondary'}`} style={{ width: `${percent_complete}%` }}></div>
          </div>
          <div className='d-flex justify-content-between'>
            <div></div>
            <small>
              {status.data.report.processed} / {status.data.report.products_count}
            </small>
          </div>
          <p>Currently Importing: {is_running ? 'Yes' : 'No'}</p>
          <p>
            Products Processed: {status.data.report.processed} of {status.data.report.products_count}
          </p>
          {patch ? (
            <>
              <p>Patch: {patch}</p>
              <p>Patched: {status.data.report.patched}</p>
            </>
          ) : (
            <>
              <p>Updated: {status.data.report.update}</p>
              <p>Deleted: {status.data.report.delete}</p>
              <p>Inserted: {status.data.report.insert}</p>
              <p>Ignored: {status.data.report.ignore}</p>
            </>
          )}

          <p>Last Started: {lastStarted}</p>
          <p>Last Completed: {lastCompleted}</p>
          <p>Last Stopped: {lastStopped}</p>
          <p>Next Import: {nextImport}</p>
          <p>Total Products: {totalProducts.isLoading ? '...' : totalProducts.data.data.toLocaleString()}</p>
          <p>
            Logging: {logging.isLogging ? 'Yes' : 'No'}{' '}
            <a className='link-underline-secondary' onClick={toggleLogging}>
              {logging.isLogging ? 'Deactivate' : 'Activate'}
            </a>
          </p>
        </div>
      </div>
    );
  }
  return null;
};
