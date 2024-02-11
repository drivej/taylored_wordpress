import * as React from 'react';
import { useJobLog } from '../hooks/useJobLog';
import { RefetchTimer } from '../scheduled_events/ScheduledEvents';

export const JobLog = ({ jobKey }: { jobKey: string }) => {
  const log = useJobLog(jobKey);

  return (
    <div className='border'>
      <div>
        <div className='p-2 d-flex justify-content-between align-items-center'>
          <h5 className='m-0'>Job Log</h5>
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
                  <td>{JSON.stringify({ ...line, timestamp: undefined }, null, 2)}</td>
                </tr>
              )) ?? null}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};
