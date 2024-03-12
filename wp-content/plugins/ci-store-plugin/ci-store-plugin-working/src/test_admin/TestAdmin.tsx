import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IAjaxQuery } from '../common/hooks/useJob';
import { useWordpressAjax } from '../common/hooks/useWordpressAjax';
import { slugify } from '../components/store/slugify';
import { IWordpressAjaxParams } from '../views/jobs/Jobs';

export const TestAdmin = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const supplier_key = searchParams.get('supplier_key');

  return (
    <div className='p-3 d-flex flex-column gap-2'>
      <h3>Test Admin</h3>

      <AdminForm name='Import Status' cmd='get_import_status' allowPolling={true}>
        <SelectSupplier />
      </AdminForm>

      <AdminForm name='Import Products' cmd='import_products'>
        <SelectSupplier />
        <SelectImportType />
        <TextInput name='updated' defaultValue='2020-01-01' type='date' style={{ width: 150 }} />
        <PageSizeInput />
        <CheckboxInput name='resume' checked={true} />
      </AdminForm>

      <AdminForm name='Cancel Import Products' cmd='cancel_import_products'>
        <SelectSupplier />
      </AdminForm>

      <AdminForm name='WPS API' cmd='western_api' allowPolling={true}>
        <TextInput name='url' defaultValue='/' />
      </AdminForm>
      {/* 
      <AdminForm name='Import Type' cmd='toggle_import_type' allowPolling={true}>
        <SelectSupplier />
        <SelectImportType />
      </AdminForm> */}

      {/* <AdminForm name='Monkey Wrench' cmd='monkey_wrench' allowPolling={true}></AdminForm> */}

      <AdminForm name='Stock Update' cmd='update_products_stock_status' allowPolling={true}>
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
      </AdminForm>

      <AdminForm name='Find Valid Product' cmd='find_valid_product'>
        <div className='d-flex flex-column gap-2'>
          <div>
            <SelectSupplier />
          </div>
          <div className='input-group'>
            <label className='input-group-text'>Max Pages</label>
            <TextInput name='max_pages' defaultValue='50' type='number' min={1} max={100} step={1} />
          </div>
          <PageSizeInput />
        </div>
      </AdminForm>

      {/* <AdminForm name='Is Importing Product?' cmd='is_importing_product' allowPolling={true}>
        <div className='input-group'>
          <SelectSupplier />
          <ProductInput />
        </div>
      </AdminForm> */}

      <AdminForm name='Import Product Status' cmd='get_import_product_status' allowPolling={true}>
        <SelectSupplier />
        <ProductInput />
      </AdminForm>

      <AdminForm name='Get Products Count' cmd='get_products_count'>
        <SelectSupplier />
        <TextInput name='updated' defaultValue='2020-01-01' type='date' style={{ width: 150 }} />
      </AdminForm>

      {/* <AdminForm name='Is Supplier Importing?' cmd='is_importing_products' allowPolling={true}>
        <div className='input-group'>
          <SelectSupplier />
        </div>
      </AdminForm> */}
    </div>
  );
};

const PageSizeInput = ({ initialValue = 20 }: { initialValue?: number }) => {
  return (
    <div className='input-group'>
      <label className='input-group-text'>Page Size</label>
      <TextInput name='page_size' defaultValue={`${initialValue}`} type='number' min={10} max={100} step={10} />
    </div>
  );
};

const SelectImportType = () => {
  return (
    <SelectInput
      name='import_type'
      options={[
        { name: 'Passive', value: 'passive' },
        { name: 'Aggressive', value: 'aggressive' }
      ]}
    />
  );
};

const SelectSupplier = ({ initialValue = null }: { initialValue?: string }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const suppliers = useSuppliers();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (suppliers.isSuccess) {
      setValue(initialValue || searchParams.get('supplier_key') || suppliers.data[0].key);
    }
  }, [suppliers.isSuccess]);

  const onChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    setValue(e.currentTarget.value);
  };

  if (suppliers.isSuccess) {
    return (
      <select name='supplier_key' className='form-select' value={value} onChange={onChange}>
        {suppliers.data.map((s, i) => (
          <option value={s.key}>{s.name}</option>
        ))}
      </select>
    );
  }
};

const SelectInput = ({ name, options, initialValue = null }: { name: string; options: { name: string; value: string }[]; initialValue?: string }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [value, setValue] = useState(initialValue ?? options[0].value);

  const onChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    setValue(e.currentTarget.value);
  };

  return (
    <select name={name} className='form-select' value={value} onChange={onChange}>
      {options.map((s, i) => (
        <option key={slugify(name, i)} value={s.value}>
          {s.name}
        </option>
      ))}
    </select>
  );
};

const ProductInput = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  return <TextInput name='product_id' defaultValue={searchParams.get('supplier_product_id')} />;
};

const TextInput = ({ name, defaultValue = '', type = 'text', ...props }: { name: string; defaultValue: string } & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) => {
  const [value, setValue] = useState(defaultValue);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setValue(e.currentTarget.value);
  };

  return <input {...props} type={type} className='form-control' name={name} value={value} onChange={onChange} />;
};

const CheckboxInput = ({ name, checked: isChecked = false, type = 'text' }: { name: string; checked: boolean } & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) => {
  const [value, setValue] = useState(isChecked ? '1' : '0');
  const [checked, setChecked] = useState(isChecked);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setChecked(e.currentTarget.checked);
    setValue(e.currentTarget.checked ? '1' : '0');
  };

  const uid = useRef(~~(Math.random() * 10000));
  const id = slugify(`${name}_checkbox`, uid.current);

  return (
    <label>
      <input type='checkbox' name={name} value={value} checked={checked} onChange={onChange} />
      {name}
    </label>
  );

  // return (
  //   <div className='btn-group' role='group'>
  //     <input type='checkbox' className='btn-check' id={id} autoComplete='off' name={name} value={value} checked={checked} onChange={onChange} />
  //     <label className='btn btn-outline-primary' htmlFor={id}>
  //       {name}
  //     </label>
  //   </div>
  // );
};

const useSuppliers = () => {
  return useWordpressAjax<{ key: string; name: string }[]>({ action: 'ci_api_handler', cmd: 'get_suppliers' });
};

const AdminForm = ({ name, cmd, allowPolling = false, children = null }: { name: string; cmd: string; allowPolling?: boolean; children?: React.ReactNode }) => {
  const $form = useRef<HTMLFormElement>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [enabled, setEnabled] = useState(false);
  const [query, setQuery] = useState<IAjaxQuery & { nonce: number } & Record<string, string | number>>({ action: 'ci_api_handler', cmd, nonce });
  const data = useWordpressAjax<Record<string, string>>(query, {
    // placeholderData: null,
    refetchInterval: isPolling ? 3000 : null,
    enabled
  });
  const disabled = data?.isFetching;
  const queryClient = useQueryClient();

  const updateQuery = () => {
    const formData = new FormData($form.current);
    const input: IWordpressAjaxParams = { action: '' };
    formData.forEach((value, key) => (input[key] = value));
    setQuery((q) => ({ ...query, ...input, nonce }));
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setEnabled(true);
    setNonce((n) => n + 1);
    updateQuery();
  };

  const togglePolling = () => {
    updateQuery();
    setIsPolling((p) => !p);
  };

  // const clearData = () => {
  //   queryClient.removeQueries({queryKey:[query]});
  // }

  return (
    <div className='p-3 border rounded d-flex gap-3 w-100'>
      <form ref={$form} onSubmit={handleSubmit} className='d-flex flex-column gap-2' style={{ flex: '0 0 300px' }}>
        <p className='m-0'>{cmd}</p>
        <input type='hidden' className='form-control' name='action' value='ci_api_handler' />
        <input type='hidden' className='form-control' name='cmd' value={cmd} />
        {children}
        <div className='input-group'>
          <button className='btn btn-primary' title={name} disabled={disabled}>
            {name}
          </button>
          {/* <button className='btn btn-secondary' type='button' onClick={clearData}>
            Clear
          </button> */}
        </div>
        {allowPolling ? (
          <label>
            <input type='checkbox' checked={isPolling} onChange={togglePolling} />
            Poll
          </label>
        ) : null}
      </form>
      <div className='position-relative' style={{ flex: '1 1 auto' }}>
        <pre style={{ fontSize: 11 }}>{JSON.stringify(data.data, null, 2)}</pre>

        <div className='spinner-border spinner-border-sm' role='status' style={{ pointerEvents: 'none', position: 'absolute', top: 16, right: 16, opacity: data.isFetching ? 1 : 0, transition: 'opacity 0.2s' }} />

        {/* <div className='position-absolute d-flex align-items-start justify-content-end' style={{ flex: 'auto', inset: 0, opacity: data.isFetching ? 1 : 0, transition: 'opacity 0.2s' }}>
          <div className='spinner-border spinner-border-sm' role='status' />
        </div> */}
      </div>
    </div>
  );
};
