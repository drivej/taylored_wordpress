import * as React from 'react';
import { DebugLog } from '../common/debug_log/DebugLog';
import { JobWorker } from '../common/job_worker/JobWorker';

export const StockCheck = () => {
  return (
    <div className='p-3'>
      <h3>Stock Check</h3>
      <JobWorker jobKey='stock_check' />
      <DebugLog />
    </div>
  );
};