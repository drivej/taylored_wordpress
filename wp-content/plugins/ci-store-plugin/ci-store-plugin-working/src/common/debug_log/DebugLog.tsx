import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { IWordpressAjaxParams } from '../../views/jobs/Jobs';
import { IDebugLog, useDebugLog } from '../job_worker/useDebugLog';
import { fetchWordpressAjax } from '../utils/fetchWordpressAjax';

// wp_ajax_debug_log_api

export const DebugLog = () => {
  const log = useDebugLog();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (options: Partial<IWordpressAjaxParams>) => fetchWordpressAjax<IDebugLog>({ action: 'debug_log_api', ...options }),
    onSuccess: (data) => queryClient.setQueryData(['debug_log_api'], data)
  });

  const empty = () => {
    mutation.mutate({ cmd: `empty` });
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['debug_log_api'] });
  };

  return (
    <div className='p-3'>
      <div className='btn-group mb-2'>
        <button className='btn btn-primary' onClick={empty}>
          Empty
        </button>
        <button className='btn btn-primary' onClick={refresh}>
          Refresh
        </button>
      </div>
      {log.isSuccess && log.data?.data ? (
        <table className='table table-sm table-bordered w-100' style={{ fontSize: '12px', tableLayout: 'fixed' }}>
          <tbody>
            {log.data.data.map((line) => (
              <tr>
                <td style={{ width: '24ch' }} className='text-nowrap'>
                  {line.date}
                </td>
                <td>
                  <div className='text-truncate w-100' title={line.message}>{line.message}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  );
};
