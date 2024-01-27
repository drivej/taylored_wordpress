import * as React from 'react';
import { JobWorker } from '../common/job_worker/JobWorker';

export const StockCheck = () => {
  return <JobWorker jobKey='stock_check' />;
};

// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import * as React from 'react';
// import { useEffect } from 'react';
// import { fetchWordpressAjax } from '../utils/fetchWordpressAjax';
// import { formatDate, formatTimeAgo } from '../utils/formatDuration';
// import { IWordpressAjaxParams } from '../views/jobs/Jobs';

// interface IStockStatus {
//   total_products: number;
//   started: string;
//   cursor: string;
//   products_processed: number;
//   update: number;
//   ignore: number;
//   insert: number;
//   completed: string;
//   is_running: boolean;
//   is_complete: boolean;
//   is_stopping: boolean;
//   is_stalled: boolean;
// }

// const useStockUpdate = () => {
//   return useQuery({
//     queryKey: ['stock_status'],
//     queryFn: () => {
//       return fetchWordpressAjax<IStockStatus>({ action: 'stock_check_api', cmd: 'status' });
//     },
//     keepPreviousData: true,
//     refetchInterval: 5000
//   });
// };

// export const StockCheck = () => {
//   const queryClient = useQueryClient();
//   const stockStatus = useStockUpdate();

//   const mutation = useMutation({
//     mutationFn: (options: Partial<IWordpressAjaxParams>) => fetchWordpressAjax<string[]>({ action: 'stock_check_api', ...options }),
//     onSuccess: (data) => queryClient.setQueryData(['stock_status'], data)
//   });

//   const refresh = () => {
//     if (!stockStatus.isLoading) {
//       queryClient.invalidateQueries(['stock_status']);
//     }
//   };

//   const startStockCheck = () => {
//     const confirmed = confirm('Start stock check?');
//     if (confirmed) {
//       mutation.mutate({ cmd: 'start_stock_check' });
//     }
//   };

//   const stopStockCheck = () => {
//     mutation.mutate({ cmd: 'stop_stock_check' });
//   };

//   const hackStockCheck = () => {
//     mutation.mutate({ cmd: 'hack_stock_check' });
//   };

//   const resumeStockCheck = () => {
//     mutation.mutate({ cmd: 'resume_stock_check' });
//   };

//   useEffect(() => {
//     if (stockStatus.data?.is_running) {
//       const timer = setInterval(() => refresh(), 2000);
//       return () => {
//         clearInterval(timer);
//       };
//     }
//   }, [stockStatus.data]);

//   if (!stockStatus.isSuccess) {
//     return <div>loading...</div>;
//   }

//   const isRunning = stockStatus.isSuccess ? stockStatus.data.is_running === true : false;
//   const isComplete = stockStatus.isSuccess ? stockStatus.data.is_complete === true : false;
//   const canResume = !isRunning && !isComplete;
//   const totalProducts = stockStatus.data?.total_products ?? 1;
//   const ignoreCount = stockStatus.data?.ignore ?? 0;
//   const updateCount = stockStatus.data?.update ?? 0;
//   const insertCount = stockStatus.data?.insert ?? 0;
//   const ignoreWidth = (100 * ignoreCount) / totalProducts;
//   const updateWidth = (100 * updateCount) / totalProducts;
//   const insertWidth = (100 * insertCount) / totalProducts;
//   const lastUpdate = stockStatus.data?.started ? new Date(Date.parse(stockStatus.data?.started)) : null;
//   const ago = stockStatus.data?.started ? formatTimeAgo((Date.now() - lastUpdate.getTime()) / 1000) : '';

//   return (
//     <div className='d-flex flex-column gap-3 p-3'>
//       {isRunning ? (
//         <div>
//           <h5>
//             <div className='spinner-border spinner-border-sm text-primary' role='status' /> Running...
//           </h5>
//           <p>Started {ago}</p>
//         </div>
//       ) : (
//         <div>
//           {lastUpdate ? (
//             <>
//               <h5>Last Updated:</h5>
//               <p>
//                 {formatDate(lastUpdate)} ({ago})
//               </p>
//             </>
//           ) : (
//             <h5>Run your first stock check!</h5>
//           )}
//         </div>
//       )}
//       <div className='d-flex gap-3'>
//         <div className='btn-group'>
//           <button className='btn btn-primary' disabled={isRunning} onClick={startStockCheck}>
//             Start
//           </button>

//           <button className='btn btn-primary' disabled={!canResume} onClick={resumeStockCheck}>
//             Resume
//           </button>

//           <button className='btn btn-primary' disabled={!isRunning} onClick={stopStockCheck}>
//             Stop
//           </button>
//         </div>
//       </div>

//       <div className='progress-stacked'>
//         <div className='progress' role='progressbar' style={{ width: ignoreWidth + '%' }}>
//           <div className={`progress-bar ${isRunning ? 'progress-bar-striped progress-bar-animated' : ''} bg-secondary`}></div>
//         </div>
//         <div className='progress' role='progressbar' style={{ width: updateWidth + '%' }}>
//           <div className={`progress-bar ${isRunning ? 'progress-bar-striped progress-bar-animated' : ''} bg-info`}></div>
//         </div>
//         <div className='progress' role='progressbar' style={{ width: insertWidth + '%' }}>
//           <div className={`progress-bar ${isRunning ? 'progress-bar-striped progress-bar-animated' : ''} bg-success`}></div>
//         </div>
//       </div>

//       <table style={{ width: 1 }} cellPadding={5}>
//         <tbody>
//           <tr>
//             <td>
//               <div className='bg-secondary' style={{ width: 16, height: 16 }} />
//             </td>
//             <td>Ignore</td>
//             <td align='right'>{ignoreCount.toLocaleString()}</td>
//           </tr>
//           <tr>
//             <td>
//               <div className='bg-info' style={{ width: 16, height: 16 }} />
//             </td>
//             <td>Update</td>
//             <td align='right'>{updateCount.toLocaleString()}</td>
//           </tr>
//           <tr>
//             <td>
//               <div className='bg-success' style={{ width: 16, height: 16 }} />
//             </td>
//             <td>Insert</td>
//             <td align='right'>{insertCount.toLocaleString()}</td>
//           </tr>
//         </tbody>
//       </table>

//       <pre>{JSON.stringify(stockStatus.data, null, 2)}</pre>

//       <button className='btn btn-primary' onClick={hackStockCheck}>
//         Hack
//       </button>
//     </div>
//   );
// };
