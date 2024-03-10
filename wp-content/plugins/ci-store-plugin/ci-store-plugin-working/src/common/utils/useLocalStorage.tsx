// import debounce from 'lodash/debounce';
// import isEqual from 'lodash/isEqual';

import { debounce, isEqual } from 'lodash';
import { useEffect, useState } from 'react';
import { inBrowser, isBrowser } from './inBrowser';

export function getLocalStoreObject<T = null>(id: string, defaultValue: T | null = null): T {
  let val: T | null = defaultValue;
  if (isBrowser()) {
    const raw = window.localStorage.getItem(id);
    if (raw) {
      try {
        val = JSON.parse(raw);
      } catch (err) {
        //
      }
    }
  }
  return val as T;
}

export function useLocalStorage<T>(id: string, initialValue: T) {
  const [data, setData] = useState<T>({ ...initialValue, ...getLocalStoreObject(id) });

  function merge(delta: Partial<T>) {
    const res = { ...data, ...delta };
    if (!isEqual(data, res)) {
      setData(res);
    }
  }

  useEffect(() => {
    if (inBrowser) {
      const db = debounce(() => {
        window.localStorage.setItem(id, JSON.stringify(data));
      }, 300);

      db();

      return () => {
        db.cancel();
      };
    }
  }, [data]);

  return {
    data,
    setData,
    merge
  };
}
