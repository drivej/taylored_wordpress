import * as React from 'react';
import { JobWorker } from '../common/job_worker/JobWorker';

export const ImportProducts = () => {
  return (
    <div className='p-3'>
      <h3>Import Products</h3>
      <JobWorker jobKey='import_products' />
    </div>
  );
};
