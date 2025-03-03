import { useMutation } from '@tanstack/react-query';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { IAjaxQuery } from '../models';
import { ISupplierActionQuery } from '../utilities/StockPage';
import { ISupplier, useSuppliers } from '../utilities/useSuppliers';
import { useTotalProducts } from '../utilities/useTotalProducts';
import { fetchWordpressAjax } from '../utils/fetchWordpressAjax';
import { formatDuration } from '../utils/formatDuration';
import { timeago } from '../utils/timeago';
import { useStopWatch } from '../utils/useStopWatch';
import { useWordpressAjax } from '../utils/useWordpressAjax';
import { ErrorLogs } from './ImporterLogs';
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
  waiting: boolean;
  progress: number;
  processing: boolean;
  is_scheduled: boolean;
  active: boolean;
  age: string;
  should_stop: boolean;
  complete: boolean;
  completed: string;
  stalled: boolean;
  updated: string; // date since last processing ping
  memory: number;
  //
  args: {
    updated_at: string;
    cursor: string;
    import_type: string;
  }; //Record<string, string | boolean>;
}

export const SupplierImportStatus = ({ supplier }: { supplier: ISupplier }) => {
  const totalProducts = useTotalProducts(supplier.key);
  // const totalRemoteProducts = useTotalRemoteProducts(supplier.key);
  const query: ISupplierActionQuery = {
    action: 'ci_api_handler', //
    cmd: 'supplier_action',
    supplier_key: supplier.key,
    func: 'get_import_info',
    func_group: 'importer'
  };
  const [refetchInterval, setRefetchInterval] = useState<number | false>(60000);
  const dataPoll = useWordpressAjax<IImportStatus>(query, { refetchInterval });
  const [importInfo, setImportInfo] = useState<Partial<IImportStatus>>({ status: 0 });
  const [estimatedTime, setEstimatedTime] = useState(0);
  const stopwatch = useStopWatch();

  useEffect(() => {
    setImportInfo(dataPoll.data);
  }, [dataPoll.data]);

  useEffect(() => {
    if (importInfo?.active) {
      setRefetchInterval(10000);
      if (typeof importInfo?.started === 'string') {
        const start_date = Date.parse(importInfo.started);
        stopwatch.start(start_date);
      }
    } else {
      if (!importInfo?.processing) {
        setRefetchInterval(60000);
        stopwatch.pause();
      }
    }
  }, [importInfo]);

  const supplierAction = useMutation<IImportStatus, unknown, Partial<ISupplierActionQuery>>({
    mutationFn: ({ func, args = [] }) => fetchWordpressAjax<IImportStatus, IAjaxQuery & ISupplierActionQuery>({ ...query, func, args })
  });

  const refresh = () => {
    supplierAction.mutate({ func: 'get_import_info', args: [] }, { onSettled: setImportInfo });
  };

  const startImport = () => {
    supplierAction.mutate({ func: 'custom_start', args: ['', '', importType] }, { onSettled: setImportInfo });
  };

  const stopImport = () => {
    supplierAction.mutate({ func: 'stop' }, { onSettled: setImportInfo });
  };

  const resumeImport = () => {
    supplierAction.mutate({ func: 'resume' }, { onSettled: setImportInfo });
  };

  const resetImport = () => {
    supplierAction.mutate({ func: 'reset' }, { onSettled: setImportInfo });
  };

  const updateImport = () => {
    supplierAction.mutate({ func: 'update' }, { onSettled: setImportInfo });
  };

  const killImport = () => {
    supplierAction.mutate({ func: 'kill' }, { onSettled: setImportInfo });
  };

  const rerunImport = () => {
    supplierAction.mutate({ func: 'rerun' }, { onSettled: setImportInfo });
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

  useEffect(() => {
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

  // const pending = importInfo?.complete===false && importInfo?.stopping===false && importInfo?.waiting===false && importInfo?.stalled===false && importInfo?.active===false;
  const active = importInfo?.active === true || importInfo?.waiting === true;
  const canStart = importInfo?.active === false;
  const shouldStop = importInfo?.should_stop === true;
  const canStop = (!shouldStop && importInfo?.active === true) || importInfo?.stalled;
  const canReset = importInfo?.active === false;
  const canContinue = canStart && importInfo?.progress > 0;
  // const isComplete = importInfo?.complete === true;

  // const max_stall_age = 60 * 10; // 10 min stall age
  // const stall_age_seconds = dateAge(importInfo?.updated ?? '');
  const canKill = true; //stall_age_seconds > max_stall_age && importInfo?.active === true;

  let progress = active && (importInfo?.progress === 0 || shouldStop) ? 100 : (importInfo?.progress ?? 0) * 100;
  const [progressBarClasses, setProgressBarClasses] = useState(['progress-bar']);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (importInfo?.complete) {
      const count = importInfo?.processed ?? 0;
      // const updated = importInfo?.completed ?? '?';
      const ago = timeago(new Date(Date.parse(importInfo?.completed))); // since(importInfo?.completed);

      // setMessage(`Completed processing ${importInfo?.processed ?? 0} products updated after ${importInfo?.updated_at},  ${since(importInfo?.completed)} ago.`);
      setMessage(`Completed. ${count} products updated ${ago}.`);
    } else if (importInfo?.active === true) {
      // let started = '';
      // if (typeof importInfo?.started === 'string') {
      //   started = since(importInfo?.started);
      // }

      // TODO: estimate time remaining
      if (typeof importInfo?.started === 'string' && (importInfo?.processed ?? 0) > 0 && (importInfo?.total ?? 0) > 0) {
        const started = Date.parse(importInfo.started);
        const elapsed = (Date.now() - started) * 0.001; // ms
        const perItem = elapsed / importInfo.processed;
        const totalTime = perItem * importInfo.total;
        // const left = importInfo.total - importInfo.processed;
        // const timeLeft = perItem * left;
        setEstimatedTime(totalTime);
        // console.log({ left, timeLeft, timeLeftS: formatDuration(timeLeft), startedS: importInfo.started, started, elapsed, elapsedF: formatDuration(elapsed), perItem, totalTime, totalTimeF: formatDuration(totalTime) });
      }
      setImportType(importInfo?.args?.import_type ?? 'import');
      setMessage(`Running update...`);
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
  const [cursor, setCursor] = useState('g9akM2pNYlKO');
  const [importType, setImportType] = useState(supplier.import_options[0]);
  const $updatedAtInput = useRef<HTMLInputElement>();
  const [updatedAt, setUpdatedAt] = useState('2023-01-01');
  const $importTypeInput = useRef<HTMLSelectElement>();

  const customCursor = () => {
    const cursor = $cursorInput.current.value;
    const updatedAt = $updatedAtInput.current.value;
    const importType = $importTypeInput.current.value;
    supplierAction.mutate({ func: 'custom_start', args: [updatedAt, cursor, importType] }, { onSettled: setImportInfo });
  };

  if (dataPoll.isSuccess) {
    // const is_running = data.isSuccess ? data.data.running || data.data.is_scheduled : false;
    // data.isSuccess ? data.data.running || data.data.is_scheduled : false;

    return (
      <div className='d-flex flex-column gap-4'>
        <div className='border rounded shadow-sm p-4'>
          <div className='d-flex flex-column gap-3'>
            {/* <pre>{JSON.stringify(dataPoll2.data, null, 2)}</pre> */}
            <h5>Import Status </h5>

            {/* <div className='progress' style={{ height: 30 }}>
              <div className='progress-bar bg-success' role='progressbar' style={{ width: '15%' }}>
                324 Imported
              </div>
              <div className='progress-bar bg-info' role='progressbar' style={{ width: '30%' }}>
                700 Processed
              </div>
              <div className='progress-bar progress-bar-striped progress-bar-animated bg-secondary' role='progressbar' style={{ width: '100%' }}>
                1243 Pending...
              </div>
            </div> */}

            <div className='progress' role='progressbar'>
              <div className={progressBarClasses.join(' ')} style={{ width: `${progress}%` }}></div>
            </div>

            <div>
              {message}{' '}
              {active ? (
                <>
                  {formatDuration(~~stopwatch.elapsedSeconds)} (Est. {formatDuration(estimatedTime)})
                </>
              ) : null}
            </div>

            <div className='d-flex gap-2 justify-content-between'>
              <div className='d-flex gap-2 align-items-center'>
                <label className='form-label m-0'>Type</label>
                <select disabled={!canStart} className='form-select' value={importType} onChange={(e) => setImportType(e.currentTarget.value)} ref={$importTypeInput}>
                  {supplier.import_options.map((o) => (
                    <option value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
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
                  <button disabled={!canContinue} className='btn btn-sm btn-secondary' onClick={resumeImport}>
                    Resume
                  </button>
                  <button disabled={!canStart} className='btn btn-sm btn-secondary' onClick={rerunImport}>
                    Rerun
                  </button>
                  <button disabled={!canStart} className='btn btn-sm btn-secondary' onClick={updateImport}>
                    Update
                  </button>
                  {/* <button disabled={!canStart} className='btn btn-sm btn-secondary' onClick={autoImportImport}>
                  Auto&nbsp;Import
                </button> */}
                </div>
              </div>

              <div className='btn-group' style={{ width: 'min-content' }}>
                {canKill ? (
                  <button disabled={!canKill} className='btn btn-sm btn-secondary' onClick={killImport}>
                    Kill
                  </button>
                ) : null}
              </div>

              <div>
                <button className='btn btn-sm btn-secondary' onClick={refresh}>
                  Refresh
                </button>
              </div>
            </div>

            <div className='d-flex justify-content-between'>
              <div>
                {totalProducts?.data ? (
                  <>
                    Imported: <b>{totalProducts?.data ?? '-'}</b>
                  </>
                ) : null}
              </div>
              <div>
                {(importInfo?.memory ?? 0) > 0 ? <>Memory Used: {~~(importInfo.memory * 100)}%</> : null} {/* Total: <b>{totalRemoteProducts?.data ?? '-'}</b> */}
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
              <div className='btn-group'>
                <label className='switch'>
                  <input type='checkbox' checked={nextImport !== 'never'} onChange={onChangeAutoImport} />
                  <span className='slider round'></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <ErrorLogs baseQuery={{ supplier_key: supplier.key, cmd: 'supplier_action' }} />

        <div className={`border rounded shadow-sm p-4`}>
          <div className='d-flex flex-column gap-3'>
            <h5>Custom Process</h5>
            <div className='d-flex gap-2'>
              <div>
                <label className='form-label'>Cursor</label>
                <input type='text' className='form-control' value={cursor} onChange={(e) => setCursor(e.currentTarget.value)} ref={$cursorInput} />
              </div>
              <div>
                <label className='form-label'>Updated</label>
                <input type='text' className='form-control' placeholder='YYYY-MM-DD' value={updatedAt} onChange={(e) => setUpdatedAt(e.currentTarget.value)} ref={$updatedAtInput} />
              </div>
              <div>
                <label className='form-label'>Type</label>

                <select className='form-select' disabled={!canStart} value={importType} onChange={(e) => setImportType(e.currentTarget.value)} ref={$importTypeInput}>
                  {supplier.import_options.map((o) => (
                    <option value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className='form-label d-block'>&nbsp;</label>
                <button type='button' className='btn btn-primary btn-sm' onClick={customCursor}>
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>

        <pre style={{ fontSize: 11 }}>{JSON.stringify({ importInfo, is_running: active, canStart }, null, 2)}</pre>
      </div>
    );
  }
  return <LoadingPage />;
};
