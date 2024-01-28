import { useQuery } from '@tanstack/react-query';

interface ICronStatus {
  data: {
    status: string;
    started: string;
    updated: string;
    completed: string;
    next: string;
    cursor: string;
    products: number;
    data: unknown;
  };
  meta: {
    next: boolean;
  };
}

export const useCronStatus = () => {
  const getCronJobs = async () => {
    const res = await fetch('/wp-admin/admin-ajax.php?action=ci_store_cronjob_api');
    return res.json();
  };
  return useQuery<ICronStatus>({ queryKey: ['getCronStatus'], queryFn: getCronJobs, refetchInterval: 5000 });
};

// export const CronStatus = () => {
//   // const [data, setData] = useState({});
//   const status = useCronStatus();

//   const d = new Date(Date.parse(status?.data?.data?.started ?? '2020')).toISOString();
//   // useEffect(() => {

//   // }, [])

//   return (
//     <div>
//       <pre>{JSON.stringify(status.data, null, 2)}</pre>
//       {d}
//     </div>
//   );
// };
