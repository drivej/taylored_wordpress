import * as React from 'react';
import { AdminForm, ProductInput, SelectInput, SelectSupplier, TextInput, WooIdInput } from './UtilitiesPage';

export const MiscPage = () => {
  return (
    <>
      <AdminForm name='Test Action' cmd='test_action' />

      {/* <AdminForm name='Update Turn 14 Pricing' cmd='update_t14_pricing' /> */}
      {/* <AdminForm name='Status Turn 14 Pricing' cmd='status_t14_pricing' allowPolling /> */}

      {/* <AdminForm name='get_import_info' cmd='supplier_action' allowPolling>
        <SelectSupplier />
        <TextInput name='func' defaultValue='get_import_info' hidden={true} />
      </AdminForm> */}

      {/* <AdminForm name='Supplier Import' label='Trigger' cmd='supplier_action'>
        <SelectSupplier />
        <SelectInput
          name='func'
          options={[
            { name: 'is_importing', value: 'is_importing' },
            { name: 'Start Import', value: 'start_import' },
            { name: 'Continue Import', value: 'continue_import' },
            { name: 'Stop Import', value: 'stop_import' },
            { name: 'Reset Import', value: 'reset_import' }
          ]}
        />
      </AdminForm> */}

      {/* <AdminForm name='Import next products page' cmd='supplier_action'>
        <SelectSupplier />
        <TextInput name='func' defaultValue='import_next_products_page' hidden={true} />
      </AdminForm> */}

      <AdminForm name='SQL Product Query' cmd='sql_product_query'>
        <WooIdInput />
      </AdminForm>

      <AdminForm name='Update PDP' cmd='supplier_action'>
        <SelectSupplier />
        <TextInput name='func' defaultValue='update_pdp_product' hidden={true} />
        <TextInput name='args[0]' defaultValue='' placeholder='Woo ID...' />
      </AdminForm>

      <AdminForm name='Get Supplier Product' cmd='supplier_action'>
        <SelectSupplier />
        <TextInput name='func' defaultValue='get_product' hidden={true} />
        <TextInput name='args[0]' defaultValue='' placeholder='Product ID...' />
        <SelectInput
          name='args[1]'
          options={[
            { name: 'basic', value: 'basic' },
            { name: 'price', value: 'price' },
            { name: 'pdp', value: 'pdp' },
            { name: 'stock', value: 'stock' }
          ]}
        />
      </AdminForm>

      <AdminForm name='Get Products Page' cmd='supplier_action'>
        <SelectSupplier />
        {/* <TextInput name='supplier_key' defaultValue='wps' hidden={true} /> */}
        <TextInput name='func' defaultValue='get_products_page' hidden={true} />
        <TextInput name='args[0]' defaultValue='' />
        <SelectInput
          name='args[1]'
          options={[
            { name: 'basic', value: 'basic' },
            { name: 'price', value: 'price' },
            { name: 'pdp', value: 'pdp' },
            { name: 'stock', value: 'stock' }
          ]}
        />
      </AdminForm>

      {/* <AdminForm name='Cron Job Status' cmd='get_cronjob_status' allowPolling>
        <SelectSupplier />
      </AdminForm> */}

      {/* <AdminForm name='Cron Job Status' cmd='get_cronjob_status' allowPolling>
        <SelectSupplier />
      </AdminForm> */}

      {/* <AdminForm name='Start Cron Job' cmd='start_cronjob'>
        <SelectSupplier />
        <SelectInput
          name='cronjob_action'
          options={[
            { name: 'Prices', value: 'price_table' },
            { name: 'Prices (latest)', value: 'price_table_update' },
            { name: 'Categories', value: 'categories' },
            { name: 'Products', value: 'products' },
            { name: 'Repair', value: 'repair' },
            { name: 'Images', value: 'images' }
          ]}
        />
      </AdminForm> */}

      {/* <AdminForm name='Stop Cron Job' cmd='stop_cronjob'>
        <SelectSupplier />
      </AdminForm> */}

      {/* <AdminForm name='Continue Cron Job' cmd='continue_cronjob'>
        <SelectSupplier />
      </AdminForm> */}

      {/* <AdminForm name='Update Terms' cmd='update_terms'>
        <SelectSupplier />
        <ProductInput />
      </AdminForm> */}

      {/* <AdminForm name='Stall Import Test' cmd='stall_import'>
        <SelectSupplier />
      </AdminForm> */}

      {/* <AdminForm name='Expire Product' cmd='expire_product'>
        <SelectSupplier />
        <ProductInput />
      </AdminForm> */}

      {/* <AdminForm name='View Attributes' cmd='view_attributes' RenderResult={CSVTable}>
        <SelectSupplier />
        <ProductInput />
      </AdminForm> */}

      {/* <AdminForm name='Get Log' cmd='get_log' allowPolling={true} RenderResult={ErrorLogs}>
        <SelectSupplier />
      </AdminForm> */}

      {/* <AdminForm name='Clear Error Log' cmd='clear_log'>
        <SelectSupplier />
      </AdminForm> */}

      {/* <AdminForm name='Get Products Page' cmd='get_products_page'>
        <SelectSupplier />
        <TextInput name='cursor' defaultValue='' />
      </AdminForm> */}

      {/* <AdminForm name='T14 API' cmd='turn14_api' allowPolling={true}>
        <TextInput name='url' defaultValue='/' />
      </AdminForm> */}

      <AdminForm name='WPS API' cmd='western_api' allowPolling={true}>
        <TextInput name='url' defaultValue='/' />
      </AdminForm>

      {/* <AdminForm name='Stock Update' cmd='update_products_stock_status' allowPolling={true}>
        <SelectSupplier />
      </AdminForm> */}

      {/* <AdminForm name='Schedule Daily Import' cmd='schedule_daily_import'>
        <SelectSupplier />
      </AdminForm> */}

      {/* <AdminForm name='Unschedule Daily Import' cmd='unschedule_daily_import'>
        <SelectSupplier />
      </AdminForm> */}

      <AdminForm name='Import Product' cmd='import_product'>
        <SelectSupplier />
        <ProductInput />
      </AdminForm>

      {/* <AdminForm name='Get Product Status' cmd='get_product_status' allowPolling={true}>
        <SelectSupplier />
        <ProductInput />
      </AdminForm> */}

      {/* <AdminForm name='Get Product' cmd='get_product'>
        <SelectSupplier />
        <ProductInput />
        <CheckboxInput name='light' checked={false} />
      </AdminForm> */}

      {/* <AdminForm name='Import Product Status' cmd='get_import_product_status' allowPolling={true}>
        <SelectSupplier />
        <ProductInput />
      </AdminForm> */}

      <AdminForm name='Supplier Products Count' cmd='supplier_action'>
        <SelectSupplier />
        <TextInput name='func' defaultValue='get_total_remote_products' hidden={true} />
        <TextInput name='args[0]' defaultValue='2020-01-01' type='date' style={{ width: 150 }} />
      </AdminForm>
    </>
  );
};
