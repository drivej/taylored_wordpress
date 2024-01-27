import * as React from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { JobProvider, useJob } from '../../__old/jobs/JobProvider';
import { JobTitle, JobUI } from '../../__old/jobs/JobUI';
import { getStore } from '../../utils/getStore';
import { lookup } from '../../utils/lookup';
import { IWesternBigImportPayload, WesternBigImportJobManager } from './WesternBigImportJob';
import { IWesternDifJobPayload, WesternDifJobManager, getSupplierIdFromWoo } from './WesternDifJob';
import { IWesternSingleImportPayload, WesternSingleImportJobManager } from './WesternSingleImportJob';
import { IWesternCheckUpdatesPayload, WesternCheckUpdatesJobManager } from './jobs/WesternCheckUpdates';
import { IWesternDeletePayload, WesternDeleteProductsJobManager } from './jobs/WesternDelete';
import { IWesternInsertPayload, WesternInsertProductsJobManager } from './jobs/WesternInsert';
import { IWesternRefreshPayload, WesternRefreshJobManager } from './jobs/WesternRefresh';
import { IWesternSyncCategoriesPayload, WesternSyncCategoriesJobManager } from './jobs/WesternSyncCategories';
import { IWesternUpdateProductCategoriesPayload, WesternUpdateProductCategoriesJobManager } from './jobs/WesternUpdateProductCategories';
import { WesternCleanupJobManager, WesternCleanupJobManagerPayload } from './jobs/aux/WesternCleanupJob';

export const WesternCleanup = () => {
  const storeKey = 'WesternCheckUpdatesSettings';
  const [config, setConfig] = React.useState<Partial<IWesternCheckUpdatesPayload>>(getStore(storeKey, { startPage: 1 }));

  useEffect(() => {
    const storeInfo = window.localStorage.getItem(storeKey);
    if (storeInfo) {
      try {
        const storeData = JSON.parse(storeInfo) as Partial<IWesternCheckUpdatesPayload>;
        setConfig((c) => ({ ...c, ...storeData }));
      } catch (err) {
        console.log(err);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storeKey, JSON.stringify(config));
  }, [config]);

  const updateConfig = (delta: Partial<IWesternCheckUpdatesPayload>) => {
    setConfig((c) => ({ ...c, ...delta }));
  };

  return (
    <JobProvider<WesternCleanupJobManagerPayload> manager={WesternCleanupJobManager}>
      <div className='card'>
        <article className='card-body'>
          <JobTitle />
          <div className='d-flex gap-2 align-items-center'>
            <label>Start Page</label>
            <input type='number' min={1} step={1} value={config.startPage} onChange={(e) => updateConfig({ startPage: parseInt(e.currentTarget.value) })} />
          </div>
          <JobUI<WesternCleanupJobManagerPayload> />
        </article>
      </div>
    </JobProvider>
  );
};

export const WesternDif = () => (
  <JobProvider<IWesternDifJobPayload> manager={WesternDifJobManager}>
    <div className='card'>
      <article className='card-body'>
        <JobTitle />
        <JobUI<IWesternDifJobPayload> />
      </article>
    </div>
  </JobProvider>
);

export const WesternSingleImport = () => {
  const [wpsProductId, setWpsProductId] = React.useState(null);

  useEffect(() => {
    const val = window.localStorage.getItem('wpsProductId');
    if (val) {
      setWpsProductId(parseInt(val));
    }
  }, []);

  useEffect(() => {
    if (wpsProductId) {
      window.localStorage.setItem('wpsProductId', wpsProductId);
    }
  }, [wpsProductId]);

  return (
    <JobProvider<IWesternSingleImportPayload> manager={WesternSingleImportJobManager}>
      <div className='card'>
        <article className='card-body'>
          <JobTitle />
          <div>
            <label>WPS Product Id</label>
            <input type='text' value={wpsProductId || ''} onChange={(e) => setWpsProductId(parseInt(e.currentTarget.value))} />
          </div>
          <JobUI<IWesternSingleImportPayload> input={{ supplierProductId: wpsProductId }} />
        </article>
        <JobOutput<IWesternSingleImportPayload> />
      </div>
    </JobProvider>
  );
};

export const WesternSyncCategories = () => {
  return (
    <JobProvider<IWesternSyncCategoriesPayload> manager={WesternSyncCategoriesJobManager}>
      <div className='card'>
        <article className='card-body'>
          <JobTitle />
          <JobUI<IWesternSyncCategoriesPayload> />
        </article>
      </div>
    </JobProvider>
  );
};

export const WesternDelete = () => {
  return (
    <JobProvider<IWesternDeletePayload> manager={WesternDeleteProductsJobManager}>
      <div className='card'>
        <article className='card-body'>
          <JobTitle />
          <JobUI<IWesternDeletePayload> />
        </article>
      </div>
    </JobProvider>
  );
};

export const WesternInsert = () => {
  return (
    <JobProvider<IWesternInsertPayload> manager={WesternInsertProductsJobManager}>
      <div className='card'>
        <article className='card-body'>
          <JobTitle />
          <JobUI<IWesternInsertPayload> />
        </article>
      </div>
    </JobProvider>
  );
};

export const WesternCheckUpdates = () => {
  const storeKey = 'WesternCheckUpdatesSettings';
  const [config, setConfig] = React.useState<Partial<IWesternCheckUpdatesPayload>>(getStore(storeKey, { startPage: 1 }));

  useEffect(() => {
    const storeInfo = window.localStorage.getItem(storeKey);
    if (storeInfo) {
      try {
        const storeData = JSON.parse(storeInfo) as Partial<IWesternCheckUpdatesPayload>;
        setConfig((c) => ({ ...c, ...storeData }));
      } catch (err) {
        console.log(err);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storeKey, JSON.stringify(config));
  }, [config]);

  const updateConfig = (delta: Partial<IWesternCheckUpdatesPayload>) => {
    setConfig((c) => ({ ...c, ...delta }));
  };

  return (
    <JobProvider<IWesternCheckUpdatesPayload> manager={WesternCheckUpdatesJobManager}>
      <div className='card'>
        <article className='card-body'>
          <JobTitle />
          <div className='d-flex gap-2 align-items-center'>
            <label>Start Page</label>
            <input type='number' min={1} step={1} value={config.startPage} onChange={(e) => updateConfig({ startPage: parseInt(e.currentTarget.value) })} />
          </div>
          <JobUI<Partial<IWesternCheckUpdatesPayload>> input={config} />
        </article>
      </div>
    </JobProvider>
  );
};

export const WesternRefresh = () => {
  return (
    <JobProvider<IWesternRefreshPayload> manager={WesternRefreshJobManager}>
      <div className='card'>
        <article className='card-body'>
          <JobTitle />
          <JobUI<IWesternRefreshPayload> />
        </article>
      </div>
    </JobProvider>
  );
};

export const WesternUpdateProductCategories = () => {
  return (
    <JobProvider<IWesternUpdateProductCategoriesPayload> manager={WesternUpdateProductCategoriesJobManager}>
      <div className='card'>
        <article className='card-body'>
          <JobTitle />
          <JobUI<IWesternUpdateProductCategoriesPayload> />
        </article>
      </div>
    </JobProvider>
  );
};

export const WesternBigImport = () => {
  const storeKey = 'bigImportSettings';
  const [config, setConfig] = React.useState<Partial<IWesternBigImportPayload>>(getStore(storeKey, { lastUpdate: '', useWooCache: true, useWpsCache: true }));

  useEffect(() => {
    const storeInfo = window.localStorage.getItem(storeKey);
    if (storeInfo) {
      try {
        const storeData = JSON.parse(storeInfo) as Partial<IWesternBigImportPayload>;
        setConfig((c) => ({ ...c, ...storeData }));
      } catch (err) {
        console.log(err);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storeKey, JSON.stringify(config));
  }, [config]);

  const updateConfig = (delta: Partial<IWesternBigImportPayload>) => {
    setConfig((c) => ({ ...c, ...delta }));
  };

  return (
    <JobProvider<IWesternBigImportPayload> manager={WesternBigImportJobManager}>
      <div className='card'>
        <article className='card-body'>
          <JobTitle />
          <div className='d-flex gap-2 align-items-center'>
            <label>Last Update</label>
            <input type='date' value={config.lastUpdate} onChange={(e) => updateConfig({ lastUpdate: e.currentTarget.value })} />
          </div>
          <div className='d-flex gap-2 align-items-center'>
            <label>Use WPS Cache</label>
            <input type='checkbox' checked={config.useWpsCache} onChange={(e) => updateConfig({ useWpsCache: e.currentTarget.checked })} />
          </div>
          <div className='d-flex gap-2 align-items-center'>
            <label>Use Woo Cache</label>
            <input type='checkbox' checked={config.useWooCache} onChange={(e) => updateConfig({ useWooCache: e.currentTarget.checked })} />
          </div>
          <JobUI<Partial<IWesternBigImportPayload>> input={config} />
        </article>
        {/* <JobOutput<IWesternBigImportPayload> /> */}
      </div>
    </JobProvider>
  );
};

function JobOutput<O>() {
  const job = useJob<O>();
  return <pre>{JSON.stringify(job.output, null, 2)}</pre>;
}

const ProductTest = () => {
  const job = useJob<IWesternDifJobPayload>();
  const [wooSku, setWooSku] = React.useState('');
  const [results, setResults] = React.useState<unknown>({});

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const output = job.manager.output as IWesternDifJobPayload;
    console.log({ output });
    if (output) {
      const found = output.wooProducts.filter((p) => p.sku === wooSku);
      setResults({ found });
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label>Woo Sku</label>
        <input placeholder='Woo Sku' value={wooSku} onChange={(e) => setWooSku(e.currentTarget.value)} />
      </div>
      <button>Submit</button>
      <pre>{JSON.stringify({ results }, null, 2)}</pre>
    </form>
  );
};

const DifTable = () => {
  const job = useJob<IWesternDifJobPayload>();

  return null;

  if (job.isComplete) {
    const wooLookup = lookup(job.output.wooProducts, 'id');
    const wpsLookup = lookup(job.output.wpsProducts, 'id');
    const wooNameLookup = lookup(job.output.wooProducts, 'name');
    const wpsNameLookup = lookup(job.output.wpsProducts, 'name');

    const wooIds = job.output.wooProducts.map(getSupplierIdFromWoo);
    const wpsIds = job.output.wpsProducts.map((p) => p.id);
    const ids: number[] = Array.from(new Set([...wooIds, ...wpsIds])).sort();

    const data: { wooName: string; wpsName: string; id: number; woo: boolean; wps: boolean; action: number }[] = ids.map((id) => {
      const woo = wooIds.indexOf(id) > -1;
      const wps = wpsIds.indexOf(id) > -1;
      const action = wps && woo ? 0 : wps && !woo ? 1 : !wps && woo ? -1 : 99999;
      return {
        wooName: '',
        wpsName: '',
        id,
        woo,
        wps,
        action
      };
    });

    return (
      <table className='table table-sm'>
        <thead>
          <tr>
            <th>wooName</th>
            <th>wpsName</th>
            <th>id</th>
            <th>woo</th>
            <th>wps</th>
            <th>action</th>
            <th>compare</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={`row${i}`}>
              <td>{d.wooName}</td>
              <td>{d.wpsName}</td>
              <td>{d.id.toString()}</td>
              <td>
                <input type='checkbox' checked={d.woo} onChange={() => {}} />
                {/* <div style={{ width: 16, height: 16, border: '2px solid #000', backgroundColor: d.woo ? '#333' : '#fff' }} /> */}
              </td>
              <td>
                <input type='checkbox' checked={d.wps} onChange={() => {}} />
                {/* <div style={{ width: 16, height: 16, border: '2px solid #000', backgroundColor: d.wps ? '#333' : '#fff' }} /> */}
              </td>
              <td>{d.action}</td>
              <td>
                <Link to={`/western/compare/${d.id}`} target='_blank'>
                  compare
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  if (job.isRunning) {
    return <div>building...</div>;
  }
  return null;
};
