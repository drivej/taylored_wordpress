import { UseQueryOptions, keepPreviousData, useQuery } from '@tanstack/react-query';
import { ICronJobParams } from '../../views/jobs/Jobs';
import { IJobInfo, IJobWorker } from '../job_worker/job_models';
import { fetchWordpressAjax } from '../utils/fetchWordpressAjax';
import { useDataFile } from './useDataFile';

export type IQueryOptions<T = unknown> = Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>;

export interface IAjaxQuery {
  action: string;
  cmd: string;
}

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

export const useJobStatus = (jobKey: string) =>
  useJob<IJobWorker>(jobKey, 'status', {
    refetchInterval: 5000 //
  });

// export const useJobInfo = (jobKey: string) => useJob(jobKey, 'info');

export const useJobData = <R,>(jobKey: string) => {
  const info = useJob<IJobInfo>(jobKey, 'info');
  const data = useDataFile<IJobWorker<R>>(info?.data?.data_url, {
    enabled: info.isSuccess, //
    refetchInterval: 10000,
    gcTime: 0
  });
  data.data;
  return data;
};
