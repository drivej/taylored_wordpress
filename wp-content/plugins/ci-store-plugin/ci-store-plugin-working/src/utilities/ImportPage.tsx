import * as React from 'react';
import { AdminForm, ErrorLogs, SelectInput, SelectSupplier, TextInput } from './UtilitiesPage';

export const ImportPage = () => {
  return (
    <>
      <AdminForm name='Import Status' cmd='get_import_status' allowPolling={true}>
        <SelectSupplier />
      </AdminForm>

      <AdminForm name='Import Products' cmd='import_products'>
        <SelectSupplier />
        {/* <SelectImportType /> */}
        <TextInput name='updated' defaultValue='2020-01-01' type='date' style={{ width: 150 }} />
        {/* <div className='input-group'>
          <label className='input-group-text'>Cursor</label>
          <TextInput name='cursor' defaultValue='' style={{ width: 150 }} />
        </div> */}
        {/* <PageSizeInput /> */}
        {/* <CheckboxInput name='reset' checked={false} /> */}

        <SelectInput
          name='import_type'
          options={[
            { name: 'resume', value: 'resume' },
            { name: 'reset', value: 'reset' }
          ]}
          initialValue='resume'
        />
      </AdminForm>

      <AdminForm name='Cancel Import Products' cmd='cancel_import_products'>
        <SelectSupplier />
      </AdminForm>

      <AdminForm name='Clear Import Report' cmd='clear_import_report'>
        <SelectSupplier />
      </AdminForm>

      <AdminForm name='Get Log' cmd='get_log' allowPolling={true} RenderResult={ErrorLogs}>
        <SelectSupplier />
      </AdminForm>

      <AdminForm name='Clear Error Log' cmd='clear_log'>
        <SelectSupplier />
      </AdminForm>
    </>
  );
};
