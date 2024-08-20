import { useMutation } from '@tanstack/react-query';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { IAjaxQuery } from '../models';
import { ISupplierActionQuery } from '../utilities/StockPage';
import { fetchWordpressAjax } from '../utils/fetchWordpressAjax';
import { useWordpressAjax } from '../utils/useWordpressAjax';

export const ImporterLogs = ({ supplier_key }: { supplier_key: string }) => {
  const [refetchInterval, setRefetchInterval] = useState<number | false>(5000);
  //   const [query, setQuery] = useState<IAjaxQuery & { nonce: number } & Record<string, string | number>>({ action: 'ci_api_handler', cmd, nonce });

  const query = {
    action: 'ci_api_handler',
    cmd: 'supplier_action',
    supplier_key,
    // func_group: 'importer'
  };

  const logs = useWordpressAjax<string>(
    {
      ...query,
      func: 'contents'
    },
    {
      refetchInterval
    }
  );

  const [logContent, setLogContent] = useState('');

  useEffect(() => {
    setLogContent(logs?.data ?? '');
  }, [logs.data]);

  const supplierAction = useMutation<unknown, unknown, Partial<ISupplierActionQuery>>({
    mutationFn: ({ func, args = [] }) => fetchWordpressAjax<string, IAjaxQuery & ISupplierActionQuery>({ ...query, func, args })
  });

  const clear = () => {
    if (confirm('Are you sure?')) {
      supplierAction.mutate({ func: 'clear', args: [] }, { onSettled: setLogContent });
    }
  };

  const refresh = () => {
    supplierAction.mutate({ func: 'contents', args: [] }, { onSettled: setLogContent });
  };

  return (
    <div className='border rounded shadow-sm p-4'>
      <div className='btn-group' style={{ width: 'min-content' }}>
        <button className='btn btn-sm btn-secondary' onClick={clear}>
          Clear
        </button>
        <button className='btn btn-sm btn-secondary' onClick={refresh}>
          Refresh
        </button>
      </div>
      <div style={{ maxHeight: 600, overflow: 'auto', fontSize: 11 }}>{logContent?.split('\n')?.map((ln) => <div style={{ whiteSpace: 'nowrap' }}>{ln}</div>)}</div>
    </div>
  );
};
