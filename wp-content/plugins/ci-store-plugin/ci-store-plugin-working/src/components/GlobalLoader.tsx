import { useIsFetching } from '@tanstack/react-query';
import * as React from 'react';

export function GlobalLoader() {
  const isFetching = useIsFetching();

  return isFetching ? (
    <div style={{ opacity: isFetching ? 1 : 0, display:isFetching ? null : 'none', transition: 'opacity 0.2s', position: 'fixed', zIndex: 999, bottom: 10, right: 10 }}>
      <div className='spinner-border' role='status'>
        {/* <span className='sr-only'>Loading...</span> */}
      </div>
    </div>
  ) : null;
}
