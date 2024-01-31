import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ICronJobParams } from '../../views/jobs/Jobs';
import { fetchWordpressAjax } from '../utils/fetchWordpressAjax';

export interface IDebugLog {
  data: { date: string; message: string }[];
}

export const useDebugLog = () => {
  return useQuery({
    queryKey: ['debug_log_api'],
    queryFn: () => {
      return fetchWordpressAjax<IDebugLog, ICronJobParams>({ action: `debug_log_api`, cmd: 'get_data' });
    },
    placeholderData: keepPreviousData,
    refetchInterval: 5000
  });
};

// export const useWordpressAjax = (apiKey: string, cmd:string = '') => {
//   return useQuery({
//     queryKey: [apiKey],
//     queryFn: () => {
//       return fetchWordpressAjax<IJobWorker>({ action: `${apiKey}`, cmd });
//     },
//     placeholderData: keepPreviousData,
//     refetchInterval: 2000
//   });
// };
