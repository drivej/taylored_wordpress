import * as React from 'react';
import { useState } from 'react';
import { DebugLog } from '../common/debug_log/DebugLog';
import { JobLog } from '../common/job_worker/JobLog';
import { JobWorker } from '../common/job_worker/JobWorker';
import { useScheduledEvents } from '../common/job_worker/useScheduledEvents';

export const StockCheck = () => {
  const [since, setSince] = useState('');
  const events = useScheduledEvents();

  return (
    <div className='p-3 d-flex flex-column gap-3'>
      <div>
        <h3>Stock Check</h3>
        <label className='form-label'>Since</label>
        <input className='form-control' type='date' value={since} onChange={(e) => setSince(e.currentTarget.value)} />
      </div>
      <JobWorker jobKey='stock_check' args={{ since }} />

      <div style={{ maxHeight: 300, overflow: 'auto' }}>
        <table className='table table-sm table-bordered w-100' style={{ fontSize: '12px', tableLayout: 'fixed' }}>
          <tbody>
            {events.data?.data?.map((line, i) => (
              <tr>
                <td style={{ width: '6ch' }}>{events.data?.data.length - i}</td>
                <td style={{ width: '24ch' }} className='text-nowrap'>
                  {line.name}
                </td>
                <td>{JSON.stringify(line.args)}</td>
                <td>
                  <button onClick={() => events.unschedule(line)}>del</button>
                  {/* <a target='_blank' href={`/wp-admin/admin.php?page=ci-store-plugin-page-stock_check&cmd=unschedule&hook_name=ci_import_product&hook_name=${encodeURIComponent(line.name)}&hook_hash=${encodeURIComponent(line.hash)}`}>del</a> */}
                </td>
              </tr>
            )) ?? null}
          </tbody>
        </table>
      </div>

      {/* <pre>{JSON.stringify(events.data, null, 2)}</pre> */}
      <JobLog jobKey='stock_check' />
      <DebugLog />
    </div>
  );
};
