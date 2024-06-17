import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { IAjaxQuery, ICronJobParams, IQueryOptions } from '../models';
import { fetchWordpressAjax } from './fetchWordpressAjax';

export const useWordpressAjax = <T,>(query: IAjaxQuery, options: IQueryOptions<T> = {}) =>
  useQuery({
    queryKey: [query],
    queryFn: () => fetchWordpressAjax<T, ICronJobParams>(query),
    placeholderData: keepPreviousData,
    ...options
  });
