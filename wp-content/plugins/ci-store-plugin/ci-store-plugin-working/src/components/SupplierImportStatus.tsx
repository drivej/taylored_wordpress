import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { IAjaxQuery } from '../models';
import { ISupplierActionQuery } from '../utilities/StockPage';
import { ISupplier, useSuppliers } from '../utilities/useSuppliers';
import { useTotalProducts } from '../utilities/useTotalProducts';
import { useTotalRemoteProducts } from '../utilities/useTotalRemoteProducts';
import { fetchWordpressAjax } from '../utils/fetchWordpressAjax';
import { useWordpressAjax } from '../utils/useWordpressAjax';
import { LoadingPage } from './LoadingPage';

export const SupplierImportStatusPage = ({ supplier_key }: { supplier_key: string }) => {
  const suppliers = useSuppliers();
  const supplier = suppliers.isSuccess ? suppliers.data.find((s) => s.key === supplier_key) : null;

  if (suppliers.isSuccess) {
    if (supplier) {
      return <SupplierImportStatus supplier={supplier} />;
    } else {
      return <div>Supplier not found.</div>;
    }
  }

  return <LoadingPage />;
};

interface IImportStatus {
  prev_cursor: string;
  cursor: string;
  updated_at: string;
  size: number;
  running: boolean;
  attempt: number;
  status: number; //'idle' | 'running';
  stopping: boolean;
  started: string | boolean;
  processed: number;
  total: number;
  // total_products: number;
  progress: number;
  is_scheduled: boolean;
  active: boolean;
  age: string;
}

export const SupplierImportStatus = ({ supplier }: { supplier: ISupplier }) => {
  const queryClient = useQueryClient();
  const totalProducts = useTotalProducts(supplier.key);
  const totalRemoteProducts = useTotalRemoteProducts(supplier.key);

  const query: ISupplierActionQuery = {
    action: 'ci_api_handler', //
    cmd: 'supplier_action',
    supplier_key: supplier.key,
    func: 'get_import_info'
  };
  const dataPoll = useWordpressAjax<IImportStatus>(query, { refetchInterval: 5000 });

  const [importInfo, setImportInfo] = useState<Partial<IImportStatus>>({ status: 0 });

  useEffect(() => {
    setImportInfo(dataPoll.data);
  }, [dataPoll.data]);

  const refresh = () => {
    supplierAction.mutate('get_import_info', { onSettled: setImportInfo });
  };

  const supplierAction = useMutation({
    mutationFn: (func: string) => fetchWordpressAjax<IImportStatus, IAjaxQuery & ISupplierActionQuery>({ ...query, func })
  });

  const startImport = () => {
    supplierAction.mutate('start_import', { onSettled: setImportInfo });
  };

  const stopImport = () => {
    supplierAction.mutate('stop_import', { onSettled: setImportInfo });
  };

  const continueImport = () => {
    supplierAction.mutate('continue_import', { onSettled: setImportInfo });
  };

  const resetImport = () => {
    supplierAction.mutate('reset_import', { onSettled: setImportInfo });
  };

  const [nextImport, setNextImport] = useState('');

  const getNextImportTime = async () => {
    const res = await fetchWordpressAjax<{ data: boolean | string }, IAjaxQuery & ISupplierActionQuery>({ ...query, func: 'get_next_import_time' });
    if (res.data === false) {
      setNextImport('never');
    } else {
      setNextImport(res.data as string);
    }
  };

  React.useEffect(() => {
    getNextImportTime();
  }, []);

  const createScheduledImport = () => {
    supplierAction.mutate('create_scheduled_import', { onSettled: () => getNextImportTime() });
  };

  const cancelScheduledImport = () => {
    supplierAction.mutate('cancel_scheduled_import', { onSettled: () => getNextImportTime() });
  };

  const onChangeAutoImport: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.currentTarget.checked) {
      createScheduledImport();
    } else {
      cancelScheduledImport();
    }
  };

  const progress = (importInfo?.progress ?? 0) * 100;
  const canStart = importInfo?.active === false;
  const canStop = importInfo?.active === true;
  const canReset = importInfo?.active === false && typeof(importInfo?.started)==='string';
  const canContinue = canStart && importInfo?.progress > 0;
  const active = importInfo?.active === true;

  const progressBarClasses = ['progress-bar'];
  if (active) {
    progressBarClasses.push(...['progress-bar-striped', 'progress-bar-animated']);
    if (progress === 0) {
      progressBarClasses.push('bg-warning');
    }
  } else {
    progressBarClasses.push('bg-secondary');
  }

  if (dataPoll.isSuccess) {
    // const is_running = data.isSuccess ? data.data.running || data.data.is_scheduled : false;
    // data.isSuccess ? data.data.running || data.data.is_scheduled : false;

    return (
      <div className='d-flex flex-column gap-4'>
        <div className='border rounded shadow-sm p-4'>
          <div className='d-flex flex-column gap-3'>
            <h5>Import Status</h5>
            <div className='progress' role='progressbar'>
              <div className={progressBarClasses.join(' ')} style={{ width: `${progress === 0 ? 100 : progress}%` }}></div>
            </div>

            <div className='btn-group' style={{ width: 'min-content' }}>
              <button disabled={!canStart} className='btn btn-sm btn-secondary' onClick={startImport}>
                Start
              </button>
              <button disabled={!canStop} className='btn btn-sm btn-secondary' onClick={stopImport}>
                Stop
              </button>
              <button disabled={!canReset} className='btn btn-sm btn-secondary' onClick={resetImport}>
                Reset
              </button>
              <button disabled={!canContinue} className='btn btn-sm btn-secondary' onClick={continueImport}>
                Continue
              </button>
            </div>
            {/* <button className='btn btn-sm btn-secondary' onClick={refresh}>
              Refresh
            </button> */}

            <div className='d-flex justify-content-between'>
              <div>
                Imported: <b>{totalProducts?.data ?? '-'}</b>
              </div>
              <div>
                Total: <b>{totalRemoteProducts?.data ?? '-'}</b>
              </div>
              <div>
                Processed:{' '}
                <b>
                  {importInfo?.processed ?? '-'} / {importInfo?.total ?? '-'}
                </b>
              </div>
            </div>
          </div>
        </div>

        <div className={`border rounded shadow-sm p-4 ${nextImport === 'never' ? 'bg-warning' : ''}`}>
          <div className='d-flex flex-column gap-3'>
            <div>
              <h5>Auto-Import</h5>
              {nextImport === '' ? <p>loading...</p> : nextImport === 'never' ? <p>The import will not run automatically. To schedule the importer to run, click the toggle below.</p> : <p>The next import will run: {nextImport}</p>}
              <div className='btn-group Xd-flex Xgap-2'>
                <label className='switch'>
                  <input type='checkbox' checked={nextImport !== 'never'} onChange={onChangeAutoImport} />
                  <span className='slider round'></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <pre>{JSON.stringify({ importInfo, is_running: active, canStart }, null, 2)}</pre>
      </div>
    );
  }
  return <LoadingPage />;
};
