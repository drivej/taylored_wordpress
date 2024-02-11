import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ICronJobParams, IWordpressAjaxParams } from '../../views/jobs/Jobs';
import { fetchWordpressAjax } from '../utils/fetchWordpressAjax';

export interface IDebugLog {
  data: { date: string; message: string }[];
}

export const useDebugLog = () => {
  const queryClient = useQueryClient();
  const queryKey = ['debug_log_api'];
  const query = useQuery({
    queryKey,
    queryFn: () => {
      return fetchWordpressAjax<IDebugLog, ICronJobParams>({ action: `debug_log_api`, cmd: 'get_data' });
    },
    placeholderData: keepPreviousData,
    refetchInterval: 60000
  });

  const mutation = useMutation({
    mutationFn: (options: Partial<IWordpressAjaxParams>) => fetchWordpressAjax<IDebugLog>({ action: 'debug_log_api', ...options }),
    onSuccess: (data) => queryClient.setQueryData(queryKey, data)
  });

  const empty = () => {
    mutation.mutate({ cmd: `empty` });
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return { ...query, empty, refresh };
};
