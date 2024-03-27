import * as React from 'react';
import { AdminForm, ProductInput, SelectInput, SelectSupplier } from './UtilitiesPage';

export const MonkeyWrenchPage = () => {
  return (
    <>
      <AdminForm name='Monkey Wrench' cmd='monkey_wrench' allowPolling={true}>
        <SelectSupplier />
        <ProductInput />
        {/* <TextInput name='custom' placeholder='custom...' defaultValue='' /> */}
        <SelectInput
          name='custom'
          options={[
            { name: 'none', value: '' },
            { name: 'wp_get_schedules', value: 'wp_get_schedules' },
            { name: 'get_update_action', value: 'get_update_action' },
            { name: 'update_product_attributes', value: 'update_product_attributes' },
            { name: 'fix_attributes', value: 'fix_attributes' },
            { name: 'select', value: 'select' },
            { name: 'clean', value: 'clean' },
            { name: 'flush', value: 'flush' },
            { name: 'fix', value: 'fix' },
            { name: 'explore', value: 'explore' },
            { name: 'mock', value: 'mock' },
            { name: 'sync', value: 'sync' },
            { name: 'turn14', value: 'turn14' }
          ]}
          initialValue='none'
        />
      </AdminForm>
    </>
  );
};
