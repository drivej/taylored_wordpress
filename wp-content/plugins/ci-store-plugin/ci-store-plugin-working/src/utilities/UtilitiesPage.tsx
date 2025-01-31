import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { IAjaxQuery, IWordpressAjaxParams } from '../models';
import { slugify } from '../utils/slugify';
import { useInitialSearchParams } from '../utils/useSearchParams';
import { useWordpressAjax } from '../utils/useWordpressAjax';
import { Pre } from './Pre';

export const CSVTable = ({ data }: { data: { rows: string[][] } }) => {
  if (data?.rows && Array.isArray(data.rows)) {
    const rows = data?.rows ?? [];

    return (
      <>
        <table className='table table-sm border' style={{ fontSize: 11 }}>
          <thead>
            <tr>
              {rows[0].map((r) => (
                <td>{r}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(1).map((r) => (
              <tr>
                {r.map((c) => (
                  <td>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <Pre data={{ ...data, rows: undefined }} />
      </>
    );
  }

  return <Pre data={data} />;
};

export const ErrorLogs = ({ data }: { data: string[] }) => {
  const $pre = useRef<HTMLPreElement>();

  useEffect(() => {
    if ($pre.current) {
      $pre.current.scrollTop = 0;
    }
  }, [data, $pre.current]);

  if (data?.length) {
    return (
      <pre ref={$pre} style={{ fontSize: 10, overflow: 'auto', maxHeight: 400, maxWidth: '100%' }}>
        {data
          .map((r, i) => `${i} ${r}`)
          .reverse()
          .join('\n')}
      </pre>
    );
  }
  return null;
};

export const PageSizeInput = ({ initialValue = 20 }: { initialValue?: number }) => {
  return (
    <div className='input-group'>
      <label className='input-group-text'>Page Size</label>
      <TextInput name='page_size' defaultValue={`${initialValue}`} type='number' min={10} max={100} step={10} />
    </div>
  );
};

export const SelectImportType = () => {
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

export const SelectSupplier = () => {
  const suppliers = useSuppliers();
  const options = suppliers.data?.map((s) => ({ name: s.name, value: s.key })) ?? [];
  return <SelectInput name='supplier_key' options={options} />;
};

export const SelectInput = ({ name, options, initialValue = null }: { name: string; options: { name: string; value: string }[]; initialValue?: string }) => {
  const searchParams = useInitialSearchParams();
  const [value, setValue] = useState(searchParams.has(name) ? searchParams.get(name) : initialValue ?? options?.[0]?.value ?? '');

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

export const ProductInput = () => {
  const searchParams = useInitialSearchParams();
  return <TextInput name='product_id' defaultValue={searchParams.get('supplier_product_id')} />;
};

export const WooIdInput = () => {
  const searchParams = useInitialSearchParams();
  return <TextInput name='woo_id' defaultValue={searchParams.get('woo_id')} />;
};

export const TextInput = ({ name, defaultValue = '', type = 'text', ...props }: { name: string; defaultValue: string } & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) => {
  const [value, setValue] = useState(defaultValue);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setValue(e.currentTarget.value);
  };

  return <input {...props} type={type} className='form-control' name={name} value={value} onChange={onChange} />;
};

export const CheckboxInput = ({ name, checked: isChecked = false }: { name: string; checked: boolean } & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) => {
  const [value, setValue] = useState(isChecked ? '1' : '0');
  const [checked, setChecked] = useState(isChecked);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setChecked(e.currentTarget.checked);
    setValue(e.currentTarget.checked ? '1' : '0');
  };

  return (
    <label>
      <input type='hidden' name={name} value={value} />
      <input type='checkbox' checked={checked} onChange={onChange} />
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

export const useSuppliers = () => {
  return useWordpressAjax<{ key: string; name: string }[]>({ action: 'ci_api_handler', cmd: 'get_suppliers' });
};

export const AdminForm = ({ name, label = name, cmd, allowPolling = false, children = null, confirmSubmit = false, RenderResult = Pre }: { label?: string; name: string; cmd: string; allowPolling?: boolean; children?: React.ReactNode; confirmSubmit?: boolean; RenderResult?: React.ComponentType<{ data: unknown }> }) => {
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
    if (confirmSubmit) {
      const confirmed = confirm('Are you sure you want to do this?');
      if (!confirmed) {
        return;
      }
    }
    setEnabled(true);
    setNonce((n) => n + 1);
    updateQuery();
  };

  const togglePolling = () => {
    updateQuery();
    setIsPolling((p) => !p);
  };

  const clearData = () => {
    queryClient.setQueryData([query], null);
  };

  return (
    <div className='p-3 border rounded d-flex gap-3 w-100'>
      <form ref={$form} onSubmit={handleSubmit} className='d-flex flex-column gap-2' style={{ flex: '0 0 300px' }}>
        <p className='m-0'>{name}</p>
        <input type='hidden' className='form-control' name='action' value='ci_api_handler' />
        <input type='hidden' className='form-control' name='cmd' value={cmd} />
        {children}
        <div className='input-group'>
          <button className='btn btn-primary' title={name} disabled={disabled}>
            {label}
          </button>
          <button className='btn btn-secondary' type='button' onClick={clearData}>
            Clear
          </button>
        </div>
        {allowPolling ? (
          <label style={{ width: 'fit-content' }}>
            <input type='checkbox' checked={isPolling} onChange={togglePolling} />
            Poll
          </label>
        ) : null}
      </form>
      <div className='position-relative' style={{ flex: '1 1 auto', maxWidth: '100%', overflow: 'auto' }}>
        <RenderResult data={data.data} />
        <div className='spinner-border spinner-border-sm' role='status' style={{ pointerEvents: 'none', position: 'absolute', top: 16, right: 16, opacity: data.isFetching ? 1 : 0, transition: 'opacity 0.2s' }} />
      </div>
    </div>
  );
};
