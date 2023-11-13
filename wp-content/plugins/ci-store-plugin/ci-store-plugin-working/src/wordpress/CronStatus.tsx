import { useQuery } from '@tanstack/react-query';
import * as React from 'react';

interface ICronStatus {
  data: {
    status: string;
    started: string;
    updated: string;
    completed: string;
    cursor: string;
    products: number;
  };
  meta: {
    next: boolean;
  };
}

export const useCronStatus = () => {
  const getCronJobs = async () => {
    const res = await fetch('/wp-admin/admin-ajax.php', { method: 'POST', body: new URLSearchParams({ action: 'ci_cron_status' }) });
    return res.json();
  };
  return useQuery<ICronStatus>(['getCronJobs'], getCronJobs, { refetchInterval: 5000 });
};

export const CronStatus = () => {
  // const [data, setData] = useState({});
  const status = useCronStatus();

  const d = new Date(Date.parse(status?.data?.data?.started ?? '2020')).toISOString();
  // useEffect(() => {

  // }, [])

  return (
    <div>
      <pre>{JSON.stringify(status.data, null, 2)}</pre>
      {d}
    </div>
  );
};
