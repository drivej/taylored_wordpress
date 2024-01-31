import { UseQueryOptions, UseQueryResult, keepPreviousData, useQuery } from '@tanstack/react-query';
import { ICronJobParams } from '../../views/jobs/Jobs';
import { fetchWordpressAjax } from '../utils/fetchWordpressAjax';
import { IJobInfo, IJobWorker } from './job_models';

export type IQueryOptions<T = unknown> = Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>;

interface IAjaxQuery {
  action: string;
  cmd: string;
}

export const useWordpressAjax = <T,>(query: IAjaxQuery, options: IQueryOptions<T> = {}) => {
  return useQuery({
    queryKey: [query.action, query.cmd],
    queryFn: () => {
      return fetchWordpressAjax<T, ICronJobParams>(query);
    },
    placeholderData: keepPreviousData,
    ...options
  });
};

export const useJob = <T,>(jobKey: string, cmd: string = `status`, options: IQueryOptions<T> = {}) => {
  return useQuery({
    queryKey: [jobKey, cmd],
    queryFn: () => {
      return fetchWordpressAjax<T, ICronJobParams>({ action: `${jobKey}_api`, cmd });
    },
    placeholderData: keepPreviousData,
    ...options
  });
};

export const useJobStatus = (jobKey: string) => useJob<IJobWorker>(jobKey, 'status', { refetchInterval: 5000 });

// export const useJobInfo = (jobKey: string) => useJob(jobKey, 'info');

export const useJobData = (jobKey: string) => {
  const info = useJob<IJobInfo>(jobKey, 'info');
  const data = useDataFile<IJobWorker>(info?.data?.data_url, { enabled: info.isSuccess, refetchInterval: 5000, gcTime: 0 });
  data.data;
  return data;
};

export const useDataFile = <T,>(url: string, options: IQueryOptions = {}) => {
  return useQuery({
    queryKey: [url],
    queryFn: async () => {
      const u = new URL(url, window.location.href);
      u.searchParams.set('nocache', Date.now().toString());
      const r = await fetch(u.href);
      return await (r.json() as Promise<T>);
    },
    ...options
  }) as UseQueryResult<T, Error>;
};


