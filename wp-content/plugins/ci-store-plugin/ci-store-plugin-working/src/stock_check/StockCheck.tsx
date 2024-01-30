import * as React from 'react';
import { useState } from 'react';
import { DebugLog } from '../common/debug_log/DebugLog';
import { JobLog } from '../common/job_worker/JobLog';
import { JobWorker } from '../common/job_worker/JobWorker';

export const StockCheck = () => {
  const [since, setSince] = useState('');

  return (
    <div className='p-3 d-flex flex-column gap-3'>
      <div>
        <h3>Stock Check</h3>
        <label className='form-label'>Since</label>
        <input className='form-control' type='date' value={since} onChange={(e) => setSince(e.currentTarget.value)} />
      </div>
      <JobWorker jobKey='stock_check' args={{ since }} />
      <JobLog jobKey='stock_check' />
      <DebugLog />
    </div>
  );
};
