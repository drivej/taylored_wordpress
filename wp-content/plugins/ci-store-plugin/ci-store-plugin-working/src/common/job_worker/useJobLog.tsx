import { IJobInfo } from './job_models';
import { useDataFile, useJob } from './useJob';

export type IJobLog = {
  timestamp: string;
  wps_id: number;
  action: 'insert' | 'ignore' | 'update' | 'delete';
}[];

export const useJobLog = (jobKey: string) => {
  const info = useJob<IJobInfo>(jobKey, 'info');
  const data = useDataFile<IJobLog>(info?.data?.log_url, { enabled: info.isSuccess, refetchInterval: 5000, gcTime: 0 });
  return data;
};

// export const useJobLog = (jobKey: string) => {
//   return useQuery({
//     queryKey: [jobKey, 'log'],
//     queryFn: () => fetchWordpressAjax<IJobLog>({ action: `${jobKey}_api`, cmd: `log` }),
//     placeholderData: keepPreviousData,
//     refetchInterval: 5000
//   });
// };
