import * as React from 'react';
import { JobWorker } from '../common/job_worker/JobWorker';

export const ImportProducts = () => {
  return <JobWorker jobKey='import_products' />;
};
