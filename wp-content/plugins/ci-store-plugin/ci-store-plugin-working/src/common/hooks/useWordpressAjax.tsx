import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ICronJobParams } from '../../views/jobs/Jobs';
import { fetchWordpressAjax } from '../utils/fetchWordpressAjax';
import { IAjaxQuery, IQueryOptions } from './useJob';

export const useWordpressAjax = <T,>(query: IAjaxQuery, options: IQueryOptions<T> = {}) =>
  useQuery({
    queryKey: [query],
    queryFn: () => fetchWordpressAjax<T, ICronJobParams>(query),
    placeholderData: keepPreviousData,
    ...options
  });
