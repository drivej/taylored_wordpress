import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { CronJobPost, useCronJobs } from './cronjob/useCronJobs';

export const CronJobManager = () => {
  const cronjobs = useCronJobs();
  //   const [fields, setFields] = useState<{ [key: string]: string | number }>({});

  //   const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
  //     updateFields({ [e.currentTarget.getAttribute('name')]: e.currentTarget.value });
  //     // const delta = { [e.currentTarget.getAttribute('name')]: e.currentTarget.value };
  //     // setFields((f) => ({ ...f, ...delta }));
  //   };

  //   const updateFields = (delta: { [key: string]: string | number }) => {
  //     // const delta = { [e.currentTarget.getAttribute('name')]: e.currentTarget.value };
  //     setFields((f) => ({ ...f, ...delta }));
  //   };

  //   const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
  //     e.preventDefault();
  //     const data = new FormData(e.currentTarget);
  //     const response = await fetch('/wp-admin/admin-ajax.php', { method: 'POST', body: data }).then((r) => r.json());
  //     console.log({ response });
  //   };

  //   useEffect(() => {
  //     if (cronjobs.isSuccess) {
  //       const job = cronjobs.data.data[0];
  //       updateFields({ 'post[ID]': job.ID });
  //     }
  //   }, [cronjobs.isSuccess]);

  if (cronjobs.isSuccess) {
    return (
      <div>
        <h1>Cron Jobs</h1>
        <CreateCronJobButton />
        <div>
          {cronjobs.data.data.map((job) => (
            <CronJobRow job={job} />
          ))}
          <pre>{JSON.stringify(cronjobs, null, 2)}</pre>
        </div>
      </div>
    );
    // return ;
  }
  return <div>loading...</div>;
};

// export const CronJobRowHeader = () => {
//   return (
//     <thead>
//       <tr className='d-flex gap-2'>
//         <th>Title</th>
//         <th>Action</th>
//         <th className='text-nowrap'>Run Every (hrs)</th>
//         <th>Cursor</th>
//         <th>Started</th>
//         <th>Completed</th>
//       </tr>
//     </thead>
//   );
// };

export const CronJobRow = ({ job }: { job: CronJobPost }) => {
  const queryClient = useQueryClient();
  // const cronjobs = useCronJobs();
  const [fields, setFields] = useState<{ [key: string]: string | number }>({
    'post[ID]': job.ID,
    'post[post_title]': job.post_title,
    'post[meta_input][started]': job.meta.started,
    'post[meta_input][cursor]': job.meta.cursor,
    'post[meta_input][cadence]': job.meta?.cadence ?? '24',
    'post[meta_input][completed]': job.meta?.completed,
    'post[meta_input][action]': job.meta?.action
  });

  const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = (e) => {
    updateFields({ [e.currentTarget.getAttribute('name')]: e.currentTarget.value });
  };

  const updateFields = (delta: { [key: string]: string | number }) => {
    setFields((f) => ({ ...f, ...delta }));
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    // var object = {};
    // data.forEach((value, key) => (object[key] = value));
    // var json = JSON.stringify(object);
    // console.log(json);
    const response = await fetch('/wp-admin/admin-ajax.php', { method: 'POST', body: data }).then((r) => r.json());
    console.log({ response });
  };

  const handleSubmitDelete: React.FormEventHandler<HTMLFormElement> = async (e) => {
    if (confirm('Are you sure?')) {
      e.preventDefault();
      const response = await fetch('/wp-admin/admin-ajax.php', { method: 'POST', body: new FormData(e.currentTarget) }).then((r) => r.json());
      console.log({ response });
      queryClient.invalidateQueries(['getCronJobs']);
    }
  };

  return (
    <div>
      <div className='p-2 border rounded'>
        <form onSubmit={handleSubmit} className='d-flex flex-column gap-2'>
          <input type='hidden' name='action' value='ci_action' />
          <input type='hidden' name='ci_action' value='update' />
          <input type='hidden' name='post[ID]' value={job.ID} />
          <div className='d-grid gap-2' style={{ gridTemplateColumns: '50% 50%' }}>
            <div>
              <label>Title</label>
              <input className='form-control' type='text' name='post[post_title]' value={fields['post[post_title]']} onChange={handleChange} />
            </div>
            <div>
              <label>Action</label>
              <select className='form-control' name='post[meta_input][action]' value={fields['post[meta_input][action]']} onChange={handleChange}>
                <option value=''>None</option>
                <option value='action_import_wps'>Import Active WPS</option>
                <option value='action_delete_wps'>Delete Inactive WPS</option>
              </select>
            </div>
            <div>
              <label className='text-nowrap'>Run Every (hrs)</label>
              <input className='form-control' type='number' step='1' min={1} max={24 * 365} name='post[meta_input][cadence]' value={fields['post[meta_input][cadence]']} onChange={handleChange} />
            </div>
            <div>
              <label>Cursor</label>
              <input className='form-control' type='text' name='post[meta_input][cursor]' value={fields['post[meta_input][cursor]']} onChange={handleChange} />
            </div>
            <div>
              <label>Started</label>
              <input readOnly className='form-control' type='datetime-local' name='post[meta_input][started]' value={fields['post[meta_input][started]']} onChange={handleChange} />
            </div>
            <div>
              <label>Completed</label>
              <input readOnly className='form-control' type='datetime-local' name='post[meta_input][completed]' value={fields['post[meta_input][completed]']} onChange={handleChange} />
            </div>
          </div>
          <div>
            <button className='btn btn-primary' type='submit'>
              Update
            </button>
          </div>
        </form>
        <form onSubmit={handleSubmitDelete}>
          <input type='hidden' name='action' value='ci_action' />
          <input type='hidden' name='ci_action' value='delete' />
          <input type='hidden' name='post[ID]' value={job.ID} />
          <button className='btn btn-primary' type='submit'>
            Delete
          </button>
        </form>
        {/* <pre>{JSON.stringify(fields, null, 2)}</pre> */}
      </div>
      {/* <pre>{JSON.stringify(job, null, 2)}</pre> */}
    </div>
  );
};

interface ICronData {
  status: 'starting' | 'started' | 'pausing' | 'paused' | 'resuming' | 'stopping' | 'stopped' | 'error';
  started: string;
  updated: string;
  completed: string;
  next: string;
  cursor: string;
  products: number;
  current_product: unknown;
  data: unknown;
}

export const useCronJob = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ICronData['status']>('stopped');

  const getCronJobs = async (cmd = '') => {
    const res = await fetch(`/wp-admin/admin-ajax.php?action=ci_store_cronjob_api&cmd=${cmd}`);
    return res.json();
  };

  const job = useQuery<ICronData>({
    queryKey: ['getCronStatus'],
    queryFn: () => getCronJobs(),
    initialData: { status: 'stopped' } as ICronData,
    refetchInterval: 3000
  });

  useEffect(() => {
    setStatus(job.data.status);
  }, [job.data.status]);

  const runCmd = async (cmd = '', newStatus: ICronData['status']) => {
    setStatus(newStatus);
    const d = await getCronJobs(cmd);
    return queryClient.setQueryData(['getCronStatus'], d);
  };

  const start = () => runCmd('start', 'starting');
  const pause = () => runCmd('pause', 'pausing');
  const resume = () => runCmd('resume', 'resuming');
  const stop = () => runCmd('stop', 'stopping');
  const refresh = () => {};

  return { ...job.data, status, refresh, start, pause, resume, stop };
};

export const PauseCron = () => {
  const cronjob = useCronJob();

  const stopDisabled = useMemo(() => {
    switch (cronjob.status) {
      case 'started':
      case 'paused':
        return false;
      // case 'idle':
      // case 'stopping':
      // case 'error':
      default:
        return true;
    }
  }, [cronjob.status]);

  const pauseDisabled = useMemo(() => {
    switch (cronjob.status) {
      case 'started':
        return false;
      default:
        return true;
    }
  }, [cronjob.status]);

  const resumeDisabled = useMemo(() => {
    switch (cronjob.status) {
      case 'paused':
        return false;
      default:
        return true;
    }
  }, [cronjob.status]);

  const startDisabled = useMemo(() => {
    switch (cronjob.status) {
      // case 'idle':
      case 'stopped':
        return false;
      default:
        return true;
    }
  }, [cronjob.status]);

  return (
    <div>
      <p>{cronjob.status ?? 'loading...'}</p>
      <button disabled={startDisabled} className='btn btn-primary' type='button' onClick={cronjob.start}>
        Start
      </button>
      <button disabled={pauseDisabled} className='btn btn-primary' type='button' onClick={cronjob.pause}>
        Pause
      </button>
      <button disabled={resumeDisabled} className='btn btn-primary' type='button' onClick={cronjob.resume}>
        Resume
      </button>
      <button disabled={stopDisabled} className='btn btn-primary' type='button' onClick={cronjob.stop}>
        Stop
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: '33% 33% auto' }}>
        <pre>{JSON.stringify({ ...cronjob, products: null, current_product: null }, null, 2)}</pre>
        <pre>{JSON.stringify({ products: cronjob.products }, null, 2)}</pre>
        <pre>{JSON.stringify({ current_product: cronjob?.current_product }, null, 2)}</pre>
      </div>
    </div>
  );
};

const CreateCronJobButton = () => {
  const queryClient = useQueryClient();
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const response = await fetch('/wp-admin/admin-ajax.php', { method: 'POST', body: data }).then((r) => r.json());
    console.log({ response });
    queryClient.invalidateQueries(['getCronJobs']);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type='hidden' name='action' value='ci_action' />
      <input type='hidden' name='ci_action' value='create' />
      <input type='hidden' name='post[post_type]' value='cronjob' />
      <input type='hidden' name='post[post_title]' value='New Cron Job' />
      <button className='btn btn-primary' type='submit'>
        Create
      </button>
    </form>
  );
};
