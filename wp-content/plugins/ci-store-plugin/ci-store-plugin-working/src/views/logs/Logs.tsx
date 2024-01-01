import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { fetchWordpressAjax } from '../../utils/fetchWordpressAjax';
import { IWordpressAjaxParams } from '../jobs/Jobs';

const useLogs = () => {
  return useQuery({
    queryKey: ['logs'],
    queryFn: () => {
      return fetchWordpressAjax<string[]>({ action: 'logs_do_cmd', cmd: 'get_logs' });
    },
    keepPreviousData: true,
    initialData: [],
    refetchInterval: 5000
  });
};

export const Logs = () => {
  const queryClient = useQueryClient();
  const logs = useLogs();
  const $pre = React.useRef<HTMLPreElement>();

  const mutationLog = useMutation({
    mutationFn: (options: Partial<IWordpressAjaxParams>) => fetchWordpressAjax<string[]>({ action: 'logs_do_cmd', ...options }),
    onSuccess: (data) => queryClient.setQueryData(['logs'], data)
  });

  const refresh = () => {
    queryClient.invalidateQueries(['logs']);
  };

  const clear = () => {
    mutationLog.mutate({ cmd: 'clear_logs' });
  };

  return (
    <div className='d-flex flex-column gap-3 p-3'>
      <div className='d-flex gap-3'>
        <button className='btn btn-primary' onClick={clear}>
          Clear Logs
        </button>
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
