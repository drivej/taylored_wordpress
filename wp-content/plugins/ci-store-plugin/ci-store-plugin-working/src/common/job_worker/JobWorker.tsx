import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { useEffect } from 'react';
import { useStopWatch } from '../../utils/useStopWatch';
import { IWordpressAjaxParams } from '../../views/jobs/Jobs';
import { useJobData } from '../hooks/useJob';
import { RefetchTimer } from '../scheduled_events/ScheduledEvents';
import { fetchWordpressAjax } from '../utils/fetchWordpressAjax';
import { formatDuration, formatTimeAgo } from '../utils/formatDuration';
import { IJobWorker } from './job_models';

export function JobWorker<T>({ jobKey, args }: { jobKey: string; args?: T }) {
  const action = `${jobKey}_api`;
  const queryClient = useQueryClient();
  // const jobData = useJobStatus(jobKey);
  const jobData = useJobData(jobKey);

  const mutation = useMutation({
    mutationFn: (options: Partial<IWordpressAjaxParams>) => fetchWordpressAjax<string[]>({ action, ...(args ?? {}), ...options }),
    onSuccess: (data) => queryClient.setQueryData([jobKey], data)
  });

  const refresh = () => {
    if (!jobData.isLoading) {
      queryClient.invalidateQueries({ queryKey: [jobKey, 'status'] });
    }
  };

  // const update = () => {
  //   mutation.mutate({ cmd: `status` });
  // };

  const start = () => {
    const confirmed = confirm('Start job?');
    if (confirmed) {
      mutation.mutate({ cmd: `start` });
    }
  };

  const reset = () => {
    mutation.mutate({ cmd: `reset` });
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

  useEffect(() => {
    if (jobData.data?.is_running) {
      const timer = setInterval(() => refresh(), 2000);
      return () => {
        clearInterval(timer);
      };
    }
  }, [jobData.data]);

  if (!jobData.isSuccess) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  const isRunning = jobData.data?.is_running === true;
  const isComplete = jobData.data.is_complete === true;
  const isStalled = jobData.data.is_stalled === true;
  const isStopping = isRunning && jobData.data.is_stopping === true;
  const wasStopped = !isRunning && !isStopping && !isComplete;
  const canStart = jobData.data?.is_running === false;
  const canStop = jobData.data?.is_running === true;
  const percentComplete = (jobData.data?.progress ?? 0) * 100;
  const canResume = !isRunning && !isComplete;
  const canReset = !isRunning;
  // const lastUpdate = jobData.data?.started ? new Date(Date.parse(jobData.data?.started)) : null;
  // const ago = jobData.data?.started ? formatTimeAgo((Date.now() - lastUpdate.getTime()) / 1000) : '';

  return (
    <div className='d-flex flex-column gap-3'>

      {/* <pre style={{ fontSize: 12 }}>{JSON.stringify(jobInfo.data, null, 2)}</pre> */}
      {isStalled ? <StalledMessage jobData={jobData.data} /> : isComplete ? <CompletedMessage jobData={jobData.data} /> : isRunning ? <RunningMessage jobData={jobData.data} /> : isStopping ? <StoppingMessage /> : wasStopped ? <StoppedMessage jobData={jobData.data} /> : ''}
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

          <button className='btn btn-primary' disabled={!canReset} onClick={reset}>
            Reset
          </button>

          {/* <button className='btn btn-primary' onClick={update}>
            Refresh
          </button> */}

          {/* <button className='btn btn-primary' onClick={hack}>
            Hack
          </button> */}
        </div>
      </div>

      <div className='progress-stacked'>
        <div className='progress' role='progressbar' style={{ width: percentComplete + '%' }}>
          <div className={`progress-bar ${isRunning ? 'progress-bar-striped progress-bar-animated' : ''} bg-info`}></div>
        </div>
      </div>

      <RefetchTimer query={jobData} />

      <pre style={{ fontSize: 12 }}>{JSON.stringify(jobData.data, null, 2)}</pre>
    </div>
  );
}

const StalledMessage = ({ jobData }: { jobData: IJobWorker }) => {
  const started = new Date(Date.parse(jobData.started)).getTime();
  const stopped = new Date(Date.parse(jobData.stopped)).getTime();
  const duration = formatDuration((stopped - started) / 1000);
  const ago = formatTimeAgo((Date.now() - stopped) / 1000);

  return (
    <div>
      <p className='m-0'>
        Stalled {ago} in {duration}
      </p>
    </div>
  );
};

const CompletedMessage = ({ jobData }: { jobData: IJobWorker }) => {
  const started = new Date(Date.parse(jobData.started)).getTime();
  const completed = new Date(Date.parse(jobData.completed)).getTime();
  const duration = formatDuration((completed - started) / 1000);
  const ago = formatTimeAgo((Date.now() - completed) / 1000);

  return (
    <div>
      <p className='m-0'>
        Completed {ago} in {duration}
      </p>
    </div>
  );
};

const RunningMessage = ({ jobData }: { jobData: IJobWorker }) => {
  const stopWatch = useStopWatch();

  useEffect(() => {
    const startTime = new Date(Date.parse(jobData.started)).getTime();
    stopWatch.start(startTime);
  }, [jobData]);

  return (
    <div>
      <p className='m-0'>Running... {formatDuration(stopWatch.elapsedSeconds)}</p>
    </div>
  );
};

const StoppingMessage = ({ jobData }: { jobData?: IJobWorker }) => {
  return (
    <div>
      <p className='m-0'>Stopping...</p>
    </div>
  );
};

const StoppedMessage = ({ jobData }: { jobData?: IJobWorker }) => {
  const ago = formatTimeAgo((Date.now() - new Date(Date.parse(jobData.stopped)).getTime()) / 1000);
  return (
    <div>
      <p className='m-0'>Stopped {ago}</p>
    </div>
  );
};
