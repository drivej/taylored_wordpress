import * as React from 'react';
import { formatTimeAgo } from '../common/utils/formatDuration';
import { useImportStatus } from '../utilities/useImportStatus';
import { ISupplier, useSuppliers } from '../utilities/useSuppliers';
import { useTotalProducts } from '../utilities/useTotalProducts';

export const Overview = () => {
  // const data = useImportStatus();
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

  // return (
  //   <div className='p-3'>
  //     <h3>Welcome!</h3>
  //     <Pre data={data?.data} />
  //     <DebugLog />
  //   </div>
  // );
};

const SupplierImportStatus = ({ supplier }: { supplier: ISupplier }) => {
  const status = useImportStatus(supplier.key, true);
  const totalProducts = useTotalProducts(supplier.key);

  const getAgo = (dateStr: string) => {
    if (dateStr) {
      const t = new Date(Date.parse(dateStr)).getTime();
      return formatTimeAgo((Date.now() - t) / 1000);
    }
    return '-';
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
        </div>
      </div>
    );
  }
  return null;
};
