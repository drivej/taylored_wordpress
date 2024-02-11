import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { IQueryOptions } from './useJob';

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
