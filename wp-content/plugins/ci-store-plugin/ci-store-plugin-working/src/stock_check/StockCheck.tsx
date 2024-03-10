import * as React from 'react';
import { useEffect, useState } from 'react';
import { DebugLog } from '../common/debug_log/DebugLog';
import { useJobData } from '../common/hooks/useJob';
import { JobLog } from '../common/job_worker/JobLog';
import { JobWorker } from '../common/job_worker/JobWorker';
import { ScheduledEventsTable } from '../common/scheduled_events/ScheduledEvents';
import { useDebug } from '../utils/useDebug';

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
  const debug = useDebug();

  useEffect(() => {
    if (jobData.isSuccess) {
      if (!jobData.data.is_running) {
        if (jobData.data?.result?.since) {
          setSince(jobData.data?.result?.since); // already in the input format
        } else if (jobData.data?.completed) {
          const dateObj = new Date(Date.parse(jobData.data.completed));
          const dateStr = [dateObj.getFullYear(), `${dateObj.getMonth()}`.padStart(2, '0'), `${dateObj.getDate()}`.padStart(2, '0')].join('-');
          setSince(dateStr);
        }
      } else {
        if (jobData.data?.last_completed) {
          const dateObj = new Date(Date.parse(jobData.data.last_completed));
          const dateStr = [dateObj.getFullYear(), `${dateObj.getMonth()}`.padStart(2, '0'), `${dateObj.getDate()}`.padStart(2, '0')].join('-');
          setSince(dateStr);
        }
      }
    }
  }, [jobData.isSuccess, jobData.data]);

  useEffect(() => {
    console.log('since', since);
  }, [since]);

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
      <pre>{JSON.stringify(jobData.data, null, 2)}</pre>
      <JobWorker jobKey={jobKey} args={{ since }} />
      {debug ? (
        <>
          <ScheduledEventsTable filter='ci_import_product' />
          <JobLog jobKey={jobKey} />
          <DebugLog />
        </>
      ) : null}
    </div>
  );
};
