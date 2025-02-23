import { useMutation } from '@tanstack/react-query';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { IAjaxQuery } from '../models';
import { ISupplierActionQuery } from '../utilities/StockPage';
import { fetchWordpressAjax } from '../utils/fetchWordpressAjax';
import { useWordpressAjax } from '../utils/useWordpressAjax';

export const ErrorLogs = ({ baseQuery }: { baseQuery: Partial<IAjaxQuery> }) => {
  const [refetchInterval, setRefetchInterval] = useState<number | false>(5000);

  const query = {
    action: 'ci_api_handler',
    cmd: 'get_log', // 'supplier_action',
    args: [baseQuery.supplier_key]
    // log_key: baseQuery.supplier_key
    // supplier_key: '',
    // ...baseQuery
  };

  const logs = useWordpressAjax<string>(
    {
      ...query
      // func: 'logs'
    },
    {
      refetchInterval
    }
  );

  const [logContent, setLogContent] = useState('');

  useEffect(() => {
    setLogContent(logs?.data ?? '');
  }, [logs.data]);

  const action = useMutation<unknown, unknown, Partial<ISupplierActionQuery>>({
    mutationFn: (delta) => fetchWordpressAjax<string, IAjaxQuery>({ ...query, ...delta })
  });

  const clear = () => {
    action.mutate({ cmd: 'clear_log' }, { onSettled: setLogContent });
  };

  const refresh = () => {
    action.mutate({ func: 'logs' }, { onSettled: setLogContent });
  };

  return (
    <div className='border rounded shadow-sm p-4'>
      <div className='mb-2'>
        <div className='input-group input-group-sm'>
          <button disabled={action.isPending} className='btn btn-secondary' onClick={clear}>
            Clear
          </button>

          <button disabled={action.isPending} className='btn btn-secondary' onClick={refresh}>
            Refresh
          </button>

          <div className='input-group-text'>
            <input onChange={(e) => setRefetchInterval(e.currentTarget.checked ? 5000 : false)} className='form-check-input' checked={refetchInterval !== false} type='checkbox' value='' id='flexCheckDefault' />
            <label className='form-check-label' htmlFor='flexCheckDefault'>
              Poll
            </label>
          </div>
        </div>
      </div>
      <div style={{ maxHeight: 600, overflow: 'auto', fontSize: 11 }}>
        <pre>{logContent}</pre>
        {/* {typeof logContent === 'string'
          ? logContent?.split('\n')?.map((ln, i) => (
              <div key={`ln${i}`} style={{ whiteSpace: 'nowrap' }}>
                {ln}
              </div>
            ))
          : 'Error'} */}
      </div>
    </div>
  );
};

export const SupplierLogs = ({ supplier_key }: { supplier_key: string }) => <ErrorLogs baseQuery={{ supplier_key, cmd: 'supplier_action' }} />;

export const ImporterLogs = ({ supplier_key }: { supplier_key: string }) => <ErrorLogs baseQuery={{ supplier_key, cmd: 'supplier_action' }} />;
