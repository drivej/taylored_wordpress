import * as React from 'react';
import { formatTimeAgo } from '../common/utils/formatDuration';
import { useImportStatus } from '../test_admin/useImportStatus';
import { ISupplier, useSuppliers } from '../test_admin/useSuppliers';
import { useTotalProducts } from '../test_admin/useTotalProducts';

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

  const lastImport = React.useMemo(() => {
    if (status.isSuccess) {
      const started = new Date(Date.parse(status.data.report.started)).getTime();
      const ago = formatTimeAgo((Date.now() - started) / 1000);
      return ago;
    }
    return '-';
  }, [status.isSuccess]);

  const lastCompleted = React.useMemo(() => {
    if (status.isSuccess && status.data.report?.completed) {
      const completed = new Date(Date.parse(status.data.report.completed)).getTime();
      const ago = formatTimeAgo((Date.now() - completed) / 1000);
      return ago;
    }
    return '-';
  }, [status.isSuccess]);

  const percent_complete = (100 * (status.data?.report?.processed ?? 0)) / (status.data?.report?.products_count ?? 1);
  const is_running = status.isSuccess ? status.data.is_running || status.data.is_scheduled : false;

  if (status.isSuccess) {
    return (
      <div className='p-3 border rounded d-flex gap-3 w-100 shadow-sm'>
        <div className='w-100'>
          <h3>{supplier.name}</h3>
          <hr />
          <div className='progress' role='progressbar'>
            <div className={`progress-bar ${is_running ? 'progress-bar-striped progress-bar-animated' : ''}`} style={{ width: `${percent_complete}%` }}></div>
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
          <p>Updated: {status.data.report.update}</p>
          <p>Deleted: {status.data.report.delete}</p>
          <p>Inserted: {status.data.report.insert}</p>
          <p>Ignored: {status.data.report.ignore}</p>
          <p>Last Import Started: {lastImport}</p>
          <p>Last Import Completed: {lastCompleted}</p>
          <p>Total Products: {totalProducts.isLoading ? '...' : totalProducts.data.data.toLocaleString()}</p>
        </div>
      </div>
    );
  }
  return null;
};
