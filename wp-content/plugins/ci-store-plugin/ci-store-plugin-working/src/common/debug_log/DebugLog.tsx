import * as React from 'react';
import { useDebugLog } from '../hooks/useDebugLog';
import { RefetchTimer } from '../scheduled_events/ScheduledEvents';

// wp_ajax_debug_log_api

export const DebugLog = () => {
  const log = useDebugLog();
  // const queryClient = useQueryClient();

  // const mutation = useMutation({
  //   mutationFn: (options: Partial<IWordpressAjaxParams>) => fetchWordpressAjax<IDebugLog>({ action: 'debug_log_api', ...options }),
  //   onSuccess: (data) => queryClient.setQueryData(['debug_log_api'], data)
  // });

  // const empty = () => {
  //   mutation.mutate({ cmd: `empty` });
  // };

  // const refresh = () => {
  //   queryClient.invalidateQueries({ queryKey: ['debug_log_api'] });
  // };

  // updated: 2024-02-03T15:41:15+00:00

  return (
    <div className='border'>
      <div>
        <div className='p-2 d-flex justify-content-between align-items-center'>
          <h5 className='m-0'>Debug Log</h5>
          <div className='btn-group'>
            <button className='btn btn-primary btn-sm' onClick={log.empty}>
              Empty
            </button>
            <button className='btn btn-primary btn-sm' onClick={log.refresh}>
              Refresh
            </button>
          </div>
        </div>
        <RefetchTimer query={log} />
      </div>
      {log.isSuccess && log.data?.data ? (
        <table className='table table-sm w-100' style={{ fontSize: '12px', tableLayout: 'fixed' }}>
          <tbody>
            {log.data.data.map((line) => (
              <tr>
                <td style={{ width: '24ch' }} className='text-nowrap'>
                  {line.date}
                </td>
                <td>
                  <div className='text-truncate w-100' title={line.message}>
                    {line.message}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  );
};
