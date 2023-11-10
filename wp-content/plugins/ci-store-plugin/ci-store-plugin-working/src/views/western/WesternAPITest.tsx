import * as React from 'react';
import { useEffect, useState } from 'react';
import urlJoin from 'url-join';
import { IWesternError } from './IWestern';
import { useWestern } from './useWestern';

const InputForm = ({ storeKey, placeholder = '', value = '', onSubmit }: { storeKey: string; placeholder?: string; value: string; onSubmit?(val: string): void }) => {
  const [inputValue, setInputValue] = useState(localStorage.getItem(storeKey) || value || '');

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setInputValue(e.currentTarget.value);
    localStorage.setItem(storeKey, e.currentTarget.value);
  };

  const _onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    onSubmit(inputValue);
  };

  useEffect(() => {
    if (value) {
      setInputValue(value);
    }
  }, [value]);

  return (
    <form onSubmit={_onSubmit}>
      <div className='input-group'>
        <input className='form-control' name={storeKey} placeholder={placeholder} type='text' onChange={onChange} value={inputValue || ''} />
        <button className='btn btn-primary' type='submit'>
          Go
        </button>
      </div>
    </form>
  );
};

export const WesternAPITest = () => {
  const [inputs, setInputs] = useState<string[]>(['', '', '']);

  useEffect(() => {
    const v = window.localStorage.getItem('western-api-inputs');
    if (v) {
      try {
        const info = JSON.parse(v);
        setInputs(info);
      } catch (err) {}
    }
  }, []);

  const updateInput = (index: number, val: string) => {
    setInputs((v) => {
      const a = [...v];
      a[index] = val;
      window.localStorage.setItem('western-api-inputs', JSON.stringify(a));
      return a;
    });
  };

  return (
    <div className='w-100' style={{ display: 'grid', gridTemplateColumns: '33% 33% auto', columnGap: 10 }}>
      <div className='overflow-auto'>
        <WesternAPIForm value={inputs[0]} onChange={(v) => updateInput(0, v)} />
      </div>
      <div className='overflow-auto'>
        <WesternAPIForm value={inputs[1]} onChange={(v) => updateInput(1, v)} />
      </div>
      <div className='overflow-auto'>
        <WesternAPIForm value={inputs[2]} onChange={(v) => updateInput(2, v)} />
      </div>
    </div>
  );
};

const WesternAPIForm = ({ value = '', onChange }: { value?: string; onChange(val: string): void }) => {
  const pathToConfig = (path: string) => {
    if (path) {
      const url = new URL(urlJoin('http://www.dummy.com', path));
      return { path: url.pathname, ...Object.fromEntries(url.searchParams) };
    }
    return { path: '' };
  };

  const [path, setPath] = useState(value);
  const data = useWestern(pathToConfig(path));

  const onSubmit = (val: string) => {
    setPath(val);
  };

  useEffect(() => {
    if (data.isSuccess) {
      onChange(path);
    }
  }, [data.isSuccess]);

  useEffect(() => {
    setPath(value);
  }, [value]);

  return (
    <div>
      <InputForm storeKey='api-test-form' placeholder='API' onSubmit={onSubmit} value={value} />
      {data.isError ? <p>Error: {(data.error as IWesternError).message}</p> : null}
      {data.isSuccess ? <pre style={{ maxWidth: '100%' }}>{JSON.stringify({ ...data.data }, null, 2)}</pre> : data.isLoading && data.isFetching ? <p>loading...</p> : null}
    </div>
  );
};
