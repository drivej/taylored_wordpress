import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { IAjaxQuery } from '../models';
import { ISupplierActionQuery } from '../utilities/StockPage';
import { ISupplier, useSuppliers } from '../utilities/useSuppliers';
import { useTotalProducts } from '../utilities/useTotalProducts';
import { useTotalRemoteProducts } from '../utilities/useTotalRemoteProducts';
import { since } from '../utils/datestamp';
import { fetchWordpressAjax } from '../utils/fetchWordpressAjax';
import { timeago } from '../utils/timeago';
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
  should_stop: boolean;
  complete: boolean;
  completed: string;
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

  // const refresh = () => {
  //   supplierAction.mutate('get_import_info', { onSettled: setImportInfo });
  // };

  const supplierAction = useMutation<IImportStatus, unknown, Partial<ISupplierActionQuery>>({
    mutationFn: ({ func, args = [] }) => fetchWordpressAjax<IImportStatus, IAjaxQuery & ISupplierActionQuery>({ ...query, func, args })
  });

  const startImport = () => {
    supplierAction.mutate({ func: 'start_import', args:[] }, { onSettled: setImportInfo });
  };

  const stopImport = () => {
    supplierAction.mutate({ func: 'stop_import' }, { onSettled: setImportInfo });
  };

  const continueImport = () => {
    supplierAction.mutate({ func: 'continue_import' }, { onSettled: setImportInfo });
  };

  const resetImport = () => {
    supplierAction.mutate({ func: 'reset_import' }, { onSettled: setImportInfo });
  };

  const updateImport = () => {
    supplierAction.mutate({ func: 'update_import' }, { onSettled: setImportInfo });
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
    supplierAction.mutate({ func: 'create_scheduled_import' }, { onSettled: () => getNextImportTime() });
  };

  const cancelScheduledImport = () => {
    supplierAction.mutate({ func: 'cancel_scheduled_import' }, { onSettled: () => getNextImportTime() });
  };

  const onChangeAutoImport: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.currentTarget.checked) {
      createScheduledImport();
    } else {
      cancelScheduledImport();
    }
  };

  const active = importInfo?.active === true;
  const canStart = importInfo?.active === false;
  const shouldStop = importInfo?.should_stop === true;
  const canStop = !shouldStop && importInfo?.active === true;
  const canReset = importInfo?.active === false; // && typeof importInfo?.started === 'string';
  const canContinue = canStart && importInfo?.progress > 0;
  // if ((active && progress === 0) || shouldStop) progress = 100;
  const isComplete = importInfo?.complete === true;
  let progress = active && (importInfo?.progress === 0 || shouldStop) ? 100 : (importInfo?.progress ?? 0) * 100;

  const [progressBarClasses, setProgressBarClasses] = useState(['progress-bar']);

  // const progressBarClasses = ['progress-bar'];
  // if (active) {
  //   progressBarClasses.push(...['progress-bar-striped', 'progress-bar-animated']);
  //   if (progress === 0) {
  //     progressBarClasses.push('bg-warning');
  //   } else if (shouldStop) {
  //     progressBarClasses.push('bg-danger');
  //   }
  // } else {
  //   if (isComplete) {
  //     progressBarClasses.push('bg-success');
  //   } else {
  //     progressBarClasses.push('bg-secondary');
  //   }
  // }

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (importInfo?.complete) {
      const count = importInfo?.processed ?? 0;
      const updated = importInfo?.updated_at ?? '?';
      const ago = timeago(new Date(Date.parse(importInfo?.completed))); // since(importInfo?.completed);

      // setMessage(`Completed processing ${importInfo?.processed ?? 0} products updated after ${importInfo?.updated_at},  ${since(importInfo?.completed)} ago.`);
      setMessage(`Completed. ${count} products updated since ${updated}. Updated ${ago}.`);
    } else if (importInfo?.active === true) {
      let started = '';
      if (typeof importInfo?.started === 'string') {
        started = since(importInfo?.started);
      }
      setMessage(`Running update ${started}...`);
    } else {
      setMessage('');
    }

    //
    //
    //

    const c = ['progress-bar'];
    if (importInfo?.active === true) {
      c.push(...['progress-bar-striped', 'progress-bar-animated']);
      if (importInfo?.progress === 0) {
        c.push('bg-warning');
      } else if (importInfo?.should_stop === true) {
        c.push('bg-danger');
      }
    } else {
      if (importInfo?.complete === true) {
        c.push('bg-success');
      } else {
        c.push('bg-secondary');
      }
    }
    setProgressBarClasses(c);
  }, [importInfo]);

  const $cursorInput = useRef<HTMLInputElement>();
  const [cursor, setCursor] = useState('w4Ae7lQGM1zE');
  const $updatedAtInput = useRef<HTMLInputElement>();
  const [updatedAt, setUpdatedAt] = useState('2024-03-01');

  const customCursor = () => {
    const cursor = $cursorInput.current.value;
    const updatedAt = $updatedAtInput.current.value;
    supplierAction.mutate({ func: 'start_import', args: [updatedAt, cursor] }, { onSettled: setImportInfo });
  };

  if (dataPoll.isSuccess) {
    // const is_running = data.isSuccess ? data.data.running || data.data.is_scheduled : false;
    // data.isSuccess ? data.data.running || data.data.is_scheduled : false;

    return (
      <div className='d-flex flex-column gap-4'>
        <div className='border rounded shadow-sm p-4'>
          <div className='d-flex flex-column gap-3'>
            <h5>Import Status</h5>
            <div className='progress' role='progressbar'>
              <div className={progressBarClasses.join(' ')} style={{ width: `${progress}%` }}></div>
            </div>

            <div>{message}</div>

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
              <button disabled={!canStart} className='btn btn-sm btn-secondary' onClick={updateImport}>
                Update
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

        <div className={`border rounded shadow-sm p-4`}>
          <div className='d-flex flex-column gap-3'>
            <h5>Custom Cursor</h5>
            <div className='input-group'>
              <span className='input-group-text' id='basic-addon3'>
                Cursor
              </span>
              <input type='text' className='form-control' value={cursor} onChange={(e) => setCursor(e.currentTarget.value)} ref={$cursorInput} />
              <input type='text' className='form-control' value={updatedAt} onChange={(e) => setUpdatedAt(e.currentTarget.value)} ref={$updatedAtInput} />
              <button type='button' className='btn btn-primary' onClick={customCursor}>
                Go
              </button>
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