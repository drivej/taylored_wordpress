import * as React from 'react';
import { useContext, useState } from 'react';

const StatsContext = React.createContext(null);
export function StatsProvider<T = { [key: string]: number }>({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<T>({} as T);
  const update = (delta: Partial<T>) => {
    setStats((s) =>
      Object.keys(delta).reduce(
        (o, k) => {
          if (!o[k]) o[k] = 0;
          if (delta[k]) o[k] += delta[k];
          return o;
        },
        { ...s }
      )
    );
  };

  return <StatsContext.Provider value={{ stats, update }}>{children}</StatsContext.Provider>;
}
export function useStats<T>() {
  return useContext<IStatsContext<T>>(StatsContext);
}
interface IStatsContext<T> {
  stats: T;
  update(delta: Partial<T>): void;
}
