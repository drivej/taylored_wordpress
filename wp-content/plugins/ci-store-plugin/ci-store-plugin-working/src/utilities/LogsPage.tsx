import * as React from 'react';
import { AdminForm, ErrorLogs, SelectSupplier } from './UtilitiesPage';

export const LogsPage = () => {
  return (
    <>
      <AdminForm name='Get Log' cmd='get_log' allowPolling={true} RenderResult={ErrorLogs}>
        <SelectSupplier />
      </AdminForm>

      <AdminForm name='Clear Log' cmd='clear_log'>
        <SelectSupplier />
      </AdminForm>
    </>
  );
};
