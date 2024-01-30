import * as React from 'react';
import { DebugLog } from '../common/debug_log/DebugLog';

export const Overview = () => {
  return (
    <div className='p-3'>
      <h3>Welcome!</h3>
      <DebugLog />
    </div>
  );
};
