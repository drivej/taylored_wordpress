import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { fetchWordpressAjax } from '../utils/fetchWordpressAjax';
import { IWordpressAjaxParams } from '../views/jobs/Jobs';

const useStockUpdate = () => {
  return useQuery({
    queryKey: ['stock_status'],
    queryFn: () => {
      return fetchWordpressAjax<string[]>({ action: 'stock_check_handler', cmd: 'status' });
    },
    keepPreviousData: true,
    initialData: [],
    refetchInterval: 10000
  });
};

export const StockCheck = () => {
  const queryClient = useQueryClient();
  const logs = useStockUpdate();
  const $pre = React.useRef<HTMLPreElement>();

  const mutationLog = useMutation({
    mutationFn: (options: Partial<IWordpressAjaxParams>) => fetchWordpressAjax<string[]>({ action: 'stock_check_handler', ...options }),
    onSuccess: (data) => queryClient.setQueryData(['stock_status'], data)
  });

  const refresh = () => {
    queryClient.invalidateQueries(['stock_status']);
  };

  return (
    <div className='d-flex flex-column gap-3 p-3'>
      <div className='d-flex gap-3'>
        <button className='btn btn-primary' onClick={refresh}>
          ↺
        </button>
      </div>
      <div className='position-relative'>
        {/* <div className='bg-primary' style={{ opacity: logs.isFetching || mutationLog.isLoading ? 1 : 0, transition: 'opacity 0.3s', width: '100%', height: 5 }}> */}
        {/* <div className='spinner-border text-light' role='status' /> */}
        {/* </div> */}
        <div style={{ background: 'black', padding: '0.5em' }}>
          <pre
            ref={$pre}
            style={{
              color: 'orange', //
              margin: 0,
              padding: 0,
              fontSize: '12px',
              fontFamily: 'monospace',
              lineHeight: 1.5,
              maxHeight: 1.5 * 12 * 50,
              minHeight: 300
            }}
            dangerouslySetInnerHTML={{ __html: logs?.data?.splice?.(0)?.reverse().join('\n') ?? '' }}
          ></pre>
        </div>
      </div>
    </div>
  );
};
