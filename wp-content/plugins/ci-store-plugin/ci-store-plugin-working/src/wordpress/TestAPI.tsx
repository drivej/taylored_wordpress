import * as React from 'react';
import { useEffect, useState } from 'react';
import { JobEventType } from '../jobs/JobTypes';
import { IWooVariable } from '../views/western/IWoo';
import { getTotalWPSProducts } from '../views/western/WPSJobUtils';
import { Job_loadAllWpsProducts } from '../views/western/tasks/Job_loadAllWpsProducts';
import { IWooAPIResponse } from '../views/woo/useWoo';

interface IImportJob {
  stage: number;
  cursor: string;
  updatedAt: string;
  count: number;
}

const ImportJobContext = React.createContext<{ info: IImportJob }>(null);

const ImportJobContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [info, setInfo] = useState<IImportJob>({
    stage: -1,
    cursor: '',
    updatedAt: '2020-01-01',
    count: -1
  });

  const updateInfo = (delta: { [key: string]: string | number }) => {
    setInfo((f) => ({ ...f, ...delta }));
  };

  return <ImportJobContext.Provider value={{ info }}>{children}</ImportJobContext.Provider>;
};

function startImport() {}

async function continueImport(input: { stage: number; cursor: string; updatedAt: string; count: number }) {
  const updatedAt = input?.updatedAt ?? '2022-01-01';
  const params = new URLSearchParams({
    // _fields: 'id,sku,date_modified,meta_data',
    'filter[updated_at][gt]': updatedAt,
    per_page: '20',
    page: '1'
  });

  switch (input.stage) {
    case 0:
      const count = getTotalWPSProducts(updatedAt);
      break;
    case 1:
      const res = await fetch(`/wp-json/wc/store/v1/products?${params}`, { method: 'GET', headers: { 'content-type': 'application/json' } });
      break;
  }
}

export const TestAPI = () => {
  const getWooProducts = async (page = 1) => {
    const params = new URLSearchParams({
      // _fields: 'id,sku,date_modified,meta_data',
      per_page: '20',
      page: '1'
    });
    const res = await fetch(`/wp-json/wc/store/v1/products?${params}`, { method: 'GET', headers: { 'content-type': 'application/json' } });
    const data: IWooAPIResponse<IWooVariable[]> = await res.json();
    return data;
    //await fetchWooAPI<IWooVariable[]>(`/products`, { _fields: 'id,sku,date_modified,meta_data', per_page: 50, page }, 'get');
  };

  const getWooProduct = async (id: number) => {
    const params = new URLSearchParams({ _fields: 'id,sku,date_modified,meta_data', per_page: '50', page: '1' });
    const res = await fetch(`/wp-json/wc/store/v1/products/${id}?${params}`, { method: 'GET', headers: { 'content-type': 'application/json' } });
    const data: IWooAPIResponse<IWooVariable[]> = await res.json();
    return data;
    //await fetchWooAPI<IWooVariable[]>(`/products`, { _fields: 'id,sku,date_modified,meta_data', per_page: 50, page }, 'get');
  };

  const [data, setData] = useState<IWooAPIResponse<IWooVariable[]>>();

  useEffect(() => {
    const go = async () => {
      // filter[updated_at][gt]=2020-01-01

      const c = new Job_loadAllWpsProducts();
      c.on(JobEventType.COMPLETED, (e) => {
        console.log({ output: e.ref.output });
      });
      c.run({ wpsProducts: [], useWpsCache: false, lastUpdate: null });

      const _data = await getWooProducts();
      setData(_data);
    };
    go();
  }, []);

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
};
