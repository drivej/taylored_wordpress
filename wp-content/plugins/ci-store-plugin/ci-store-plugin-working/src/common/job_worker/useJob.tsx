import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchWordpressAjax } from '../utils/fetchWordpressAjax';
import { IJobWorker } from './job_models';

export const useJob = (jobKey: string) => {
  return useQuery({
    queryKey: [jobKey],
    queryFn: () => {
      return fetchWordpressAjax<IJobWorker>({ action: `${jobKey}_api`, cmd: `status` });
    },
    placeholderData: keepPreviousData,
    refetchInterval: 2000
  });
};
