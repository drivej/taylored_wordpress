import * as React from 'react';
import { formatTimeAgo } from '../common/utils/formatDuration';
import { useImportStatus } from '../test_admin/useImportStatus';
import { ISupplier, useSuppliers } from '../test_admin/useSuppliers';

export const Overview = () => {
  // const data = useImportStatus();
  const suppliers = useSuppliers();

  if (suppliers.isSuccess) {
    return (
      <div>
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
  const status = useImportStatus(supplier.key);

  const lastImport = React.useMemo(() => {
    if (status.isSuccess) {
      const started = new Date(Date.parse(status.data.report.started)).getTime();
      const ago = formatTimeAgo((Date.now() - started) / 1000);
      return ago;
    }
    return '';
  }, [status.isSuccess]);

  const lastCompleted = React.useMemo(() => {
    if (status.isSuccess && status.data.report?.completed) {
      const completed = new Date(Date.parse(status.data.report.completed)).getTime();
      const ago = formatTimeAgo((Date.now() - completed) / 1000);
      return ago;
    }
    return '';
  }, [status.isSuccess]);

  if (status.isSuccess) {
    return (
      <div>
        <h3>{supplier.name}</h3>
        <p>Currently Importing: {status.data.is_import_running || status.data.is_import_scheduled ? 'Yes' : 'No'}</p>
        <p>Products Processed: {status.data.report.processed}</p>
        <p>Last Import Started: {lastImport}</p>
        <p>Last Import Completed: {lastCompleted}</p>
      </div>
    );
  }
  return null;
};
