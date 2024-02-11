import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ICronJobParams, IWordpressAjaxParams } from '../../views/jobs/Jobs';
import { IJobInfo } from '../job_worker/job_models';
import { fetchWordpressAjax } from '../utils/fetchWordpressAjax';
import { useDataFile } from './useDataFile';
import { useJob } from './useJob';

export type IJobLog = {
  timestamp: string;
  wps_id: number;
  action: 'insert' | 'ignore' | 'update' | 'delete';
}[];

export const useJobLog = (jobKey: string) => {
  const action = `${jobKey}_api`;
  const queryKey = [jobKey, 'log'];
  const info = useJob<IJobInfo>(jobKey, 'info');
  const data = useDataFile<IJobLog>(info?.data?.log_url, { enabled: info.isSuccess, refetchInterval: 5000, gcTime: 0 });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (options: Partial<IWordpressAjaxParams>) => fetchWordpressAjax<string[], ICronJobParams>({ action, ...options }),
    onSuccess: (data) => queryClient.setQueryData(queryKey, data)
  });

  const empty = () => {
    mutation.mutate({ cmd: `clear_log` });
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return { ...data, empty, refresh };
};

// export const useJobLog = (jobKey: string) => {
//   return useQuery({
//     queryKey: [jobKey, 'log'],
//     queryFn: () => fetchWordpressAjax<IJobLog>({ action: `${jobKey}_api`, cmd: `log` }),
//     placeholderData: keepPreviousData,
//     refetchInterval: 5000
//   });
// };
