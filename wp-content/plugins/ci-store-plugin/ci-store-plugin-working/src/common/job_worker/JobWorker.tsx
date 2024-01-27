import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { IWordpressAjaxParams } from '../../views/jobs/Jobs';
import { fetchWordpressAjax } from '../utils/fetchWordpressAjax';
import { formatTimeAgo } from '../utils/formatDuration';
import { useJob } from './useJob';

export const JobWorker = ({ jobKey }: { jobKey: string }) => {
  //   const jobKey = 'import_products';
  const action = `${jobKey}_api`;
  const queryClient = useQueryClient();
  const jobData = useJob(jobKey);

  const mutation = useMutation({
    mutationFn: (options: Partial<IWordpressAjaxParams>) => fetchWordpressAjax<string[]>({ action, ...options }),
    onSuccess: (data) => queryClient.setQueryData([jobKey], data)
  });

  const refresh = () => {
    if (!jobData.isLoading) {
      queryClient.invalidateQueries([jobKey]);
    }
  };

  const update = () => {
    mutation.mutate({ cmd: `status` });
  };

  const start = () => {
    const confirmed = confirm('Start job?');
    if (confirmed) {
      mutation.mutate({ cmd: `start` });
    }
  };

  const stop = () => {
    mutation.mutate({ cmd: `stop` });
  };

  const resume = () => {
    mutation.mutate({ cmd: 'resume' });
  };

  const hack = () => {
    mutation.mutate({ cmd: 'hack' });
  };

  //   useEffect(() => {
  //     if (jobData.data?.is_running) {
  //       const timer = setInterval(() => refresh(), 5000);
  //       return () => {
  //         clearInterval(timer);
  //       };
  //     }
  //   }, [jobData.data]);
  if (!jobData.isSuccess) {
    return <div className='p-3'>loading...</div>;
  }

  const isRunning = jobData.data?.is_running === true;
  const isComplete = jobData.data.is_complete === true;
  const canStart = jobData.data?.is_running === false;
  const canStop = jobData.data?.is_running === true;
  const percentComplete = (jobData.data?.progress ?? 0) * 100;
  const canResume = !isRunning && !isComplete;
  const lastUpdate = jobData.data?.started ? new Date(Date.parse(jobData.data?.started)) : null;
  const ago = jobData.data?.started ? formatTimeAgo((Date.now() - lastUpdate.getTime()) / 1000) : '';

  return (
    <div className='d-flex flex-column gap-3 p-3'>
      <div className='d-flex gap-3'>
        <div className='btn-group'>
          <button className='btn btn-primary' disabled={!canStart} onClick={start}>
            Start
          </button>

          <button className='btn btn-primary' disabled={!canResume} onClick={resume}>
            Resume
          </button>

          <button className='btn btn-primary' disabled={!canStop} onClick={stop}>
            Stop
          </button>

          <button className='btn btn-primary' onClick={update}>
            Refresh
          </button>

          <button className='btn btn-primary' onClick={hack}>
            Hack
          </button>
        </div>
      </div>

      <div className='progress-stacked'>
        <div className='progress' role='progressbar' style={{ width: percentComplete + '%' }}>
          <div className={`progress-bar ${isRunning ? 'progress-bar-striped progress-bar-animated' : ''} bg-info`}></div>
        </div>
      </div>

      {/* <table style={{ width: 1 }} cellPadding={5}>
              <tbody>
                <tr>
                  <td>
                    <div className='bg-secondary' style={{ width: 16, height: 16 }} />
                  </td>
                  <td>Ignore</td>
                  <td align='right'>{ignoreCount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>
                    <div className='bg-info' style={{ width: 16, height: 16 }} />
                  </td>
                  <td>Update</td>
                  <td align='right'>{updateCount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>
                    <div className='bg-success' style={{ width: 16, height: 16 }} />
                  </td>
                  <td>Insert</td>
                  <td align='right'>{insertCount.toLocaleString()}</td>
                </tr>
              </tbody>
            </table> */}

      <pre>{JSON.stringify(jobData.data, null, 2)}</pre>

      {/* <button className='btn btn-primary' onClick={hackStockCheck}>
              Hack
            </button> */}
    </div>
  );
};
