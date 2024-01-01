import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { since } from '../../utils/datestamp';
import { fetchWordpressAjax } from '../../utils/fetchWordpressAjax';

export interface IWordpressAjaxParams {
  action: string;
  cmd?: string;
}

export interface ICronJobParams {
//   supplier?: string;
//   product?: number;
  job_id?: string;
  job_action?: string;
  job_args?: string;
}

enum JobStatus {
  NONE = 'none',
  STARTING = 'starting',
  STARTED = 'started',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  COMPLETING = 'completing',
  COMPLETED = 'completed',
  DELETING = 'deleting',
  ERROR = 'error'
}

enum JobProcess {
  IDLE = 'idle',
  RUNNING = 'running'
}

interface ICronJob {
  id: string;
  status: JobStatus;
  process: JobProcess;
  action: string;
  created: string;
  updated: string;
  args: Record<string, string | number>;
}

const useJobs = () => {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: () => {
      return fetchWordpressAjax<ICronJob[]>({ action: 'cronjob_do_cmd', cmd: 'get_jobs' });
    },
    // keepPreviousData: true,
    initialData: [],
    placeholderData: [],
    refetchInterval: 5000
  });
};

const ICON_PLAY = String.fromCharCode(9654);
const ICON_PAUSE = '⏸︎';
const ICON_REFRESH = '↺';
const ICON_WAITING = <div className='spinner-grow spinner-grow-sm' role='status' />;
const iCON_DELETE = <>&times;</>;
const ICON_ERROR = '!';

const JobIcon = ({ job }: { job: ICronJob }) => {
  switch (job.status) {
    case JobStatus.STARTED:
      return ICON_PAUSE;

    case JobStatus.STOPPING:
    case JobStatus.COMPLETING:
    case JobStatus.STARTING:
    case JobStatus.DELETING:
      return ICON_WAITING;

    case JobStatus.COMPLETED:
      return iCON_DELETE;

    case JobStatus.STOPPED:
      return iCON_DELETE;

    case JobStatus.ERROR:
      return ICON_ERROR;

    case JobStatus.NONE:
    default:
      return ICON_PLAY;
  }
};

export const Jobs = () => {
  const jobs = useJobs();
  const queryClient = useQueryClient();

  const updateJobs = () => {
    queryClient.invalidateQueries(['jobs']);
  };

  const mutationJob = useMutation({
    mutationFn: (options: Partial<ICronJobParams & IWordpressAjaxParams>) => fetchWordpressAjax<ICronJob[]>({ action: 'cronjob_do_cmd', ...options }),
    onSuccess: (data) => queryClient.setQueryData(['jobs'], data)
  });

  const cleanJobs = () => {
    mutationJob.mutate({ cmd: 'clean_jobs' });
  };

  const createJob = () => {
    const action = prompt('Action?', 'import_western_product');
    if (action) {
      mutationJob.mutate({ cmd: 'create_job', job_args: JSON.stringify({ action, product_id:6 }) });
    }
  };

  const deleteJob = (job: ICronJob) => {
    if (job.status === JobStatus.DELETING) {
      if (confirm('Are you sure you want to force delete this job?')) {
        mutationJob.mutate({ cmd: 'force_delete_job', job_id: job.id });
      }
    } else {
      if (confirm('Are you sure you want to delete this job?')) {
        mutationJob.mutate({ cmd: 'delete_job', job_id: job.id });
      }
    }
  };

  const startJob = (job: ICronJob) => {
    mutationJob.mutate({ cmd: 'start_job', job_id: job.id });
  };

  const stopJob = (job: ICronJob) => {
    mutationJob.mutate({ cmd: 'stop_job', job_id: job.id });
  };

  const toggleJob = (job: ICronJob) => {
    switch (job.status) {
      case JobStatus.NONE:
        startJob(job);
        break;
      case JobStatus.STARTING:
        alert('Starting...');
        break;
      case JobStatus.STARTED:
        stopJob(job);
        break;
      case JobStatus.COMPLETING:
        alert('Completing...');
      case JobStatus.COMPLETED:
        deleteJob(job);
        break;
      case JobStatus.STOPPING:
        alert('Stopping...');
      case JobStatus.STOPPED:
        deleteJob(job);
        break;
      case JobStatus.DELETING:
        alert('Deleting...');
      case JobStatus.ERROR:
        alert('There was a problem running this job.');
    }
  };

  return (
    <div className='d-flex flex-column gap-3 p-3'>
      <div className='d-flex gap-3'>
        <button className='btn btn-primary' onClick={cleanJobs}>
          Clean Jobs
        </button>
        <button className='btn btn-primary' onClick={createJob}>
          Create Job
        </button>
      </div>
      <div className='position-relative'>
        <div className='bg-primary' style={{ opacity: jobs.isFetching || mutationJob.isLoading ? 1 : 0, transition: 'opacity 0.3s', width: '100%', height: 5 }} />
        {jobs.data?.length > 0 ? (
          <table className='table table-sm table-bordered align-middle'>
            <thead>
              <tr>
                <th style={{ width: 1 }}></th>
                <th>id</th>
                <th>process</th>
                <th>status</th>
                <th>action</th>
                <th>created</th>
                <th>updated</th>
                <th>args</th>
                <th style={{ width: 1 }}>
                  <button className='btn btn-primary' onClick={updateJobs}>
                    {ICON_REFRESH}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className='table-group-divider'>
              {jobs.data.map((job) => (
                <tr>
                  <td>
                    <button className='btn btn-primary' style={{ fontFamily: 'initial' }} onClick={() => toggleJob(job)}>
                      <JobIcon job={job} />
                    </button>
                  </td>
                  <td>{job.id}</td>
                  <td>{job?.process ?? 'unknown'}</td>
                  <td>{job.status}</td>
                  <td>{job.action}</td>
                  <td title={job.created}>{since(job.created)}</td>
                  <td title={job.updated}>{since(job.updated)}</td>
                  <td>
                    {Object.keys(job.args).map((k) => (
                      <span>
                        {k}: {job.args[k]},{' '}
                      </span>
                    ))}
                  </td>
                  <td>
                    <button className='btn btn-primary' onClick={() => deleteJob(job)} title='delete'>
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>{jobs.isLoading ? <h4>Loadiung...</h4> : <h4>Currently, there are no jobs in progress.</h4>}</div>
        )}
      </div>
    </div>
  );
};
