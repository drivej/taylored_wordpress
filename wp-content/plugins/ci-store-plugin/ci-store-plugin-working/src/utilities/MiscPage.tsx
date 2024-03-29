import * as React from 'react';
import { AdminForm, CSVTable, CheckboxInput, ErrorLogs, ProductInput, SelectSupplier, TextInput } from './UtilitiesPage';

export const MiscPage = () => {
  return (
    <>
      {/* <AdminForm name='Set Product Visibility' cmd='product_visibility'>
        <ProductInput />
        <SelectInput
          name='visible'
          options={[
            { name: 'visible', value: '1' },
            { name: 'hidden', value: '0' }
          ]}
          initialValue='visible'
        />
      </AdminForm> */}

      <AdminForm name='Stall Import Test' cmd='stall_import'>
        <SelectSupplier />
      </AdminForm>

      <AdminForm name='Expire Product' cmd='expire_product'>
        <SelectSupplier />
        <ProductInput />
      </AdminForm>

      <AdminForm name='View Attributes' cmd='view_attributes' RenderResult={CSVTable}>
        <SelectSupplier />
        <ProductInput />
      </AdminForm>

      <AdminForm name='Get Log' cmd='get_log' allowPolling={true} RenderResult={ErrorLogs}>
        <SelectSupplier />
      </AdminForm>

      <AdminForm name='Clear Error Log' cmd='clear_log'>
        <SelectSupplier />
      </AdminForm>

      <AdminForm name='WPS API' cmd='western_api' allowPolling={true}>
        <TextInput name='url' defaultValue='/' />
      </AdminForm>

      <AdminForm name='Stock Update' cmd='update_products_stock_status' allowPolling={true}>
        <SelectSupplier />
      </AdminForm>

      <AdminForm name='Schedule Daily Import' cmd='schedule_daily_import'>
        <SelectSupplier />
      </AdminForm>

      <AdminForm name='Unschedule Daily Import' cmd='unschedule_daily_import'>
        <SelectSupplier />
      </AdminForm>

      {/* <AdminForm name='Update Product' cmd='update_product' RenderResult={ErrorLogs}>
        <SelectSupplier />
        <ProductInput />
      </AdminForm> */}

      <AdminForm name='Import Product' cmd='import_product'>
        <SelectSupplier />
        <ProductInput />
      </AdminForm>

      <AdminForm name='Get Product Status' cmd='get_product_status' allowPolling={true}>
        <SelectSupplier />
        <ProductInput />
      </AdminForm>

      <AdminForm name='Get Product' cmd='get_product'>
        <SelectSupplier />
        <ProductInput />
        <CheckboxInput name='light' checked={false} />
      </AdminForm>

      <AdminForm name='Import Product Status' cmd='get_import_product_status' allowPolling={true}>
        <SelectSupplier />
        <ProductInput />
      </AdminForm>

      <AdminForm name='Get Products Count' cmd='get_products_count'>
        <SelectSupplier />
        <TextInput name='updated' defaultValue='2020-01-01' type='date' style={{ width: 150 }} />
      </AdminForm>
    </>
  );
};
