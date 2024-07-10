import * as React from 'react';
import { AdminForm, CSVTable, CheckboxInput, ErrorLogs, ProductInput, SelectInput, SelectSupplier, TextInput } from './UtilitiesPage';

export const MiscPage = () => {
  return (
    <>
      <AdminForm name='Test Action' cmd='test_action' />

      <AdminForm name='Update Turn 14 Pricing' cmd='update_t14_pricing' />
      {/* <AdminForm name='Status Turn 14 Pricing' cmd='status_t14_pricing' allowPolling /> */}

      <AdminForm name='Delete All Products' cmd='delete_all_supplier_products'>
        <SelectSupplier />
      </AdminForm>

      <AdminForm name='Cron Job Status' cmd='get_cronjob_status' allowPolling>
        <SelectSupplier />
      </AdminForm>

      <AdminForm name='Start Cron Job' cmd='start_cronjob'>
        <SelectSupplier />
        <SelectInput
          name='cronjob_action'
          options={[
            { name: 'Prices', value: 'price_table' },
            { name: 'Prices (latest)', value: 'price_table_update' },
            { name: 'Categories', value: 'categories' },
            { name: 'Products', value: 'products' },
            { name: 'Images', value: 'images' }
          ]}
        />
      </AdminForm>

      <AdminForm name='Stop Cron Job' cmd='stop_cronjob'>
        <SelectSupplier />
      </AdminForm>

      <AdminForm name='Continue Cron Job' cmd='continue_cronjob'>
        <SelectSupplier />
      </AdminForm>

      <AdminForm name='Update Terms' cmd='update_terms'>
        <SelectSupplier />
        <ProductInput />
      </AdminForm>

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

      <AdminForm name='Get Products Page' cmd='get_products_page'>
        <SelectSupplier />
        <TextInput name='cursor' defaultValue='' />
      </AdminForm>

      <AdminForm name='T14 API' cmd='turn14_api' allowPolling={true}>
        <TextInput name='url' defaultValue='/' />
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
