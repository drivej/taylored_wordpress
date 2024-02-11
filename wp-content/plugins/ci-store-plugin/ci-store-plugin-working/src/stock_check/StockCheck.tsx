import * as React from 'react';
import { useEffect, useState } from 'react';
import { DebugLog } from '../common/debug_log/DebugLog';
import { useJobData } from '../common/hooks/useJob';
import { JobLog } from '../common/job_worker/JobLog';
import { JobWorker } from '../common/job_worker/JobWorker';
import { ScheduledEventsTable } from '../common/scheduled_events/ScheduledEvents';

interface IStockCheckResult {
  total_products: number;
  processed: number;
  delete: number;
  update: number;
  ignore: number;
  insert: number;
  error: number;
  cursor: string;
  page_size: number;
  since: string;
}

export const StockCheck = () => {
  const [since, setSince] = useState('');
  const jobKey = 'stock_check';
  // const action = `${jobKey}_api`;
  // const queryClient = useQueryClient();
  // const jobData = useJobStatus(jobKey);
  const jobData = useJobData<IStockCheckResult>(jobKey);

  useEffect(() => {
    if (jobData.data?.completed) {
      setSince(jobData.data?.completed);
    } else if (jobData.data?.result?.since) {
      setSince(jobData.data?.result?.since);
    }
  }, [jobData.data]);

  // jobworker
  // ci_
  return (
    <div className='p-3 d-flex flex-column gap-3'>
      <div>
        <h3>Stock Check</h3>
        <div className='input-group'>
          <span className='input-group-text'>Since</span>
          <input className='form-control' type='date' value={since} onChange={(e) => setSince(e.currentTarget.value)} />
        </div>
      </div>
      <JobWorker jobKey={jobKey} args={{ since }} />
      <ScheduledEventsTable filter='ci_import_product' />
      <JobLog jobKey={jobKey} />
      <DebugLog />
    </div>
  );
};
