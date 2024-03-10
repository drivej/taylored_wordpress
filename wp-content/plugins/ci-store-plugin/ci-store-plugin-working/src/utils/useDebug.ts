import { useMemo } from 'react';

export const useDebug = () => {
  return useMemo(() => new URLSearchParams(location.search).get('debug') === '1', []);
};
