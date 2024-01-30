import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { IWordpressAjaxParams } from '../../views/jobs/Jobs';
import { fetchWordpressAjax } from '../utils/fetchWordpressAjax';
import { useJobLog } from './useJobLog';

export const JobLog = ({ jobKey }: { jobKey: string }) => {
  const action = `${jobKey}_api`;
  const queryKey = [jobKey, 'log'];
  const log = useJobLog(jobKey);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (options: Partial<IWordpressAjaxParams>) => fetchWordpressAjax<string[]>({ action, ...options }),
    onSuccess: (data) => queryClient.setQueryData(queryKey, data)
  });

  const empty = () => {
    mutation.mutate({ cmd: `clear_log` });
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return (
    <div>
      <div className='btn-group mb-2'>
        <button className='btn btn-primary' onClick={empty}>
          Empty
        </button>
        <button className='btn btn-primary' onClick={refresh}>
          Refresh
        </button>
      </div>
      {log.isSuccess && log.data ? (
        <div style={{ maxHeight: 300, overflow: 'auto' }}>
          <table className='table table-sm table-bordered w-100' style={{ fontSize: '12px', tableLayout: 'fixed' }}>
            <tbody>
              {log.data?.reverse()?.map((line, i) => (
                <tr>
                  <td style={{ width: '6ch' }}>{log.data.length - i}</td>
                  <td style={{ width: '24ch' }} className='text-nowrap'>
                    {line.timestamp}
                  </td>
                  {/* <td>
                    <div className='text-truncate w-100'>
                      wps:{line.wps_id} action:{line.action}
                    </div>
                  </td> */}
                  <td>{JSON.stringify(line, null, 2)}</td>
                </tr>
              )) ?? null}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};
