import * as React from 'react';
import { useState } from 'react';
import { IAjaxQuery, IQueryOptions } from '../models';
import { fetchWordpressAjax } from '../utils/fetchWordpressAjax';
import { formatDuration } from '../utils/formatDuration';
import { useLocalStorage } from '../utils/useLocalStorage';
import { useWordpressAjax } from '../utils/useWordpressAjax';

enum StockStatus {
  NOT_FOUND = 'notfound',
  IN_STOCK = 'instock',
  OUT_OF_STOCK = 'outofstock',
  ERROR = 'error'
}

interface ISupplierActionQuery extends IAjaxQuery {
  func: string;
  args: (string | number)[];
  supplier_key: string;
}

interface IWooProductsQuery {
  posts_per_page: number;
  paged: number;
}

interface IWooProductsResponse {
  total: number;
  posts_per_page: number;
  paged: number;
  isLastPage: boolean;
  products: {
    // supplier_product_id: number;
    woo_product_id: number;
  }[];
}

export const StockPage = () => {
  return (
    <div className='d-flex flex-column gap-3'>
      <StockBlock />
      <UpdateProductsBlock />
      {/* <TestBlock /> */}
    </div>
  );
};

const useWooProducts = (_query: Partial<IWooProductsQuery>, options: IQueryOptions<IWooProductsResponse> = {}) => {
  //   const query: ISupplierActionQuery = { action: 'ci_api_handler', cmd: 'supplier_action', supplier_key: 'wps', func: 'get_woo_products', args: [pageIndex, pageSize] };
  const query: IAjaxQuery & Partial<IWooProductsQuery> = { action: 'ci_api_handler', cmd: 'get_woo_products', paged: 0, posts_per_page: 10, ..._query };
  //   console.log({ useWooProducts: options.enabled });
  const data = useWordpressAjax<IWooProductsResponse>(query, options);
  return data;
};

// const checkStockStatus = async (supplier_product_id: number | string) => {
//   const result = await fetchWordpressAjax<{ data: StockStatus }, ISupplierActionQuery>({
//     action: 'ci_api_handler', //
//     cmd: 'supplier_action',
//     supplier_key: 'wps',
//     func: 'get_stock_status',
//     args: [supplier_product_id]
//   });
//   return result?.data;
// };

const updateStockStatus = async (woo_product_id: number | string) => {
  const result = await fetchWordpressAjax<{ deleted: boolean; is_available: boolean; exetime: number; woo_product_id: string | number }, IAjaxQuery & { woo_product_id: number | string }>({
    action: 'ci_api_handler', //
    cmd: 'update_woo_product_stock_status',
    woo_product_id
  });
  return result;
};

const updateWooProduct = async (woo_product_id: number | string) => {
  try {
    const result = await fetchWordpressAjax<{ updated: boolean; is_available: boolean; exetime: number; woo_product_id: string | number }, IAjaxQuery & { woo_product_id: number | string }>({
      action: 'ci_api_handler', //
      cmd: 'update_woo_product',
      woo_product_id
    });
    return result;
  } catch (err) {
    return {
      action: 'ci_api_handler', //
      cmd: 'update_woo_product',
      woo_product_id,
      updated: false
    };
  }
};

const UpdateProductsBlock = () => {
  const localStore = useLocalStorage('product_update', {
    pageIndex: 0, //
    totalUpdated: 0,
    exeTimes: [],
    estimatedLoadTime: 0,
    totalProcessed: 0,
    totalProducts: 0
  });
  const [pageIndex, setPageIndex] = useState(localStore.data.pageIndex);
  const [shouldLoad, setShouldLoad] = useState(false);
  const wooProducts = useWooProducts({ paged: pageIndex, posts_per_page: 20 }, { enabled: shouldLoad });
  //   const startTime = React.useRef(Date.now());
  const [exeTimes, setExeTimes] = useState<number[]>(localStore.data.exeTimes);
  const [avgExeTime, setAvgExeTime] = useState(0);
  //   const avgExeTime = exeTimes.reduce((c, t) => c + t, 0); //exeTimes.length>0 ? exeTimes.reduce((c, t) => c + t, 0) / exeTimes.length : 0;
  //   const estTotalTime = avgExeTime * (wooProducts?.data?.total ?? 1);
  const [estimatedLoadTime, setEstimatedLoadTime] = useState(localStore.data.estimatedLoadTime);
  const [isRunning, setIsRunning] = useState(false);
  const [totalUpdated, setTotalUpdated] = useState(localStore.data.totalUpdated);
  const [totalProcessed, setTotalProcessed] = useState(localStore.data.totalProcessed);
  const [totalProducts, setTotalProducts] = useState(localStore.data.totalProducts);
  const isStopping = !shouldLoad && isRunning;
  const progress = totalProducts > 0 ? totalProcessed / totalProducts : 0;
  const resetDisabled = isRunning || isStopping || pageIndex === 0;

  const processProduct = async (woo_product_id: number) => {
    const start = Date.now();
    const result = await updateWooProduct(woo_product_id);
    const exeTime = Date.now() - start;
    setExeTimes((t) => [...t, exeTime]);
    if (result.updated) setTotalUpdated((t) => t + 1);
    console.log('processProduct', woo_product_id, (exeTime / 1000).toFixed(2) + 's');
  };

  const processProducts = async (products: IWooProductsResponse['products']) => {
    setIsRunning(true);
    let i = products.length;
    while (i--) {
      await processProduct(products[i].woo_product_id);
    }
    setIsRunning(false);
  };

  React.useEffect(() => {
    if (shouldLoad && wooProducts.data?.products?.length) {
      const runProcess = async () => {
        await processProducts(wooProducts.data.products);
        // let i = wooProducts.data.products.length;
        // setIsRunning(true);
        // while (i--) {
        //   console.log('loop', { shouldLoad });
        //   await processProduct(wooProducts.data.products[i].woo_product_id);
        // }

        if (shouldLoad && wooProducts.data.isLastPage === false) {
          //   startTime.current = Date.now();
          setPageIndex((i) => i + 1);
        }
        // setIsRunning(false);
      };

      if (shouldLoad) {
        setTotalProcessed(wooProducts.data.posts_per_page * wooProducts.data.paged);
        setTotalProducts(wooProducts.data.total);
        runProcess();
      }
    } else {
      setIsRunning(false);
    }
  }, [wooProducts.data, shouldLoad]);

  React.useEffect(() => {
    localStore.merge({ pageIndex, totalUpdated, exeTimes: [estimatedLoadTime], estimatedLoadTime, totalProcessed, totalProducts });
  }, [pageIndex, totalUpdated, exeTimes, estimatedLoadTime, totalProcessed, totalProducts]);

  React.useEffect(() => {
    if (exeTimes.length) {
      const sum = exeTimes.reduce((c, t) => c + t, 0);
      const avg = sum / exeTimes.length;
      setAvgExeTime(avg);
      if (wooProducts.isSuccess) {
        const estTime = avg * wooProducts.data.total; // / wooProducts.data.posts_per_page;
        setEstimatedLoadTime(estTime);
      }
    }
  }, [exeTimes]);

  const toggleLoad: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setShouldLoad(!shouldLoad);
  };

  const reset = () => {
    if (!isRunning) {
      setShouldLoad(false);
      setPageIndex(0);
      setExeTimes([]);
      setTotalProcessed(0);
      setTotalProducts(0);
      setTotalUpdated(0);
      setEstimatedLoadTime(0);
      setIsRunning(false);
    }
  };

  return (
    <div className='p-3 border rounded'>
      <div className='d-flex w-100 flex-column gap-3'>
        <div className='d-flex justify-content-between gap-3'>
          <h3>Update Products</h3>
          {isRunning ? (
            <div className='spinner-border spinner-border-sm' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
          ) : null}
        </div>
        <div className='d-flex gap-2'>
          <button type='button' disabled={isStopping} className={`btn ${shouldLoad || isRunning ? 'btn-warning' : 'btn-primary'}`} onClick={toggleLoad}>
            {isStopping ? 'Stopping...' : shouldLoad ? 'Pause' : pageIndex > 0 ? 'Resume' : 'Start'}
          </button>
          <button type='button' disabled={resetDisabled} className='btn btn-secondary' onClick={reset}>
            Reset
          </button>
        </div>
        <p className='m-0'> {shouldLoad || isRunning ? 'Updating products...' : 'Click "Start" to begin updating products'}</p>
        <div className='progress' role='progressbar'>
          <div className={`progress-bar ${isRunning ? 'progress-bar-striped progress-bar-animated' : 'bg-secondary'}`} style={{ width: `${progress * 100}%` }}></div>
        </div>
        <div className='d-flex justify-content-between'>
          <small>
            Est. Time: {formatDuration(estimatedLoadTime / 1000)} Avg. Exe. {formatDuration(avgExeTime / 1000)}
          </small>
          <small>
            ({totalUpdated} updated) {totalProcessed} / {totalProducts}
          </small>
        </div>
      </div>
      <pre>{JSON.stringify({ pageIndex, isRunning, shouldLoad, avgExeTime: formatDuration(avgExeTime), estTotalTime: formatDuration(estimatedLoadTime), exeTimes: exeTimes.length }, null, 2)}</pre>
    </div>
  );
};

const StockBlock = () => {
  const localStore = useLocalStorage('stock_remover', {
    pageIndex: 0, //
    totalDeleted: 0,
    exeTimes: [],
    estimatedLoadTime: 0,
    totalProcessed: 0,
    totalProducts: 0
  });
  const [pageIndex, setPageIndex] = useState(localStore.data.pageIndex);
  const [shouldLoad, setShouldLoad] = useState(false);
  const wooProducts = useWooProducts({ paged: pageIndex, posts_per_page: 20 }, { enabled: shouldLoad });
  const startTime = React.useRef(Date.now());
  const [exeTimes, setExeTimes] = useState<number[]>(localStore.data.exeTimes);
  const [estimatedLoadTime, setEstimatedLoadTime] = useState(localStore.data.estimatedLoadTime);
  const [isRunning, setIsRunning] = useState(false);
  const [totalDeleted, setTotalDeleted] = useState(localStore.data.totalDeleted);
  const [totalProcessed, setTotalProcessed] = useState(localStore.data.totalProcessed);
  const [totalProducts, setTotalProducts] = useState(localStore.data.totalProducts);
  const isStopping = !shouldLoad && isRunning;
  const progress = totalProducts > 0 ? totalProcessed / totalProducts : 0;
  const resetDisabled = isRunning || isStopping || pageIndex === 0;

  React.useEffect(() => {
    if (wooProducts.data?.products?.length) {
      setIsRunning(true);
      setTotalProcessed(wooProducts.data.posts_per_page * wooProducts.data.paged);
      setTotalProducts(wooProducts.data.total);

      Promise.all(wooProducts.data.products.map((res) => updateStockStatus(res.woo_product_id))).then((res) => {
        const exeTime = Date.now() - startTime.current;
        setExeTimes((t) => [...t, exeTime]);
        setTotalDeleted((t) => t + res.reduce((s, r) => s + (r.deleted ? 1 : 0), 0));
        if (shouldLoad && wooProducts.data.isLastPage === false) {
          startTime.current = Date.now();
          setPageIndex((i) => i + 1);
        } else {
          setIsRunning(false);
          setShouldLoad(false);
        }
      });
    }
  }, [wooProducts.data, shouldLoad]);

  React.useEffect(() => {
    localStore.merge({ pageIndex, totalDeleted, exeTimes: [estimatedLoadTime], estimatedLoadTime, totalProcessed, totalProducts });
  }, [pageIndex, totalDeleted, exeTimes, estimatedLoadTime, totalProcessed, totalProducts]);

  React.useEffect(() => {
    if (exeTimes.length) {
      const sum = exeTimes.reduce((c, t) => c + t, 0);
      const avg = sum / exeTimes.length;
      if (wooProducts.isSuccess) {
        const estTime = (avg * wooProducts.data.total) / wooProducts.data.posts_per_page;
        setEstimatedLoadTime(estTime);
      }
    }
  }, [exeTimes]);

  const toggleLoad = () => {
    setShouldLoad(!shouldLoad);
  };

  const reset = () => {
    if (!isRunning) {
      setShouldLoad(false);
      setPageIndex(0);
      setExeTimes([]);
      setTotalProcessed(0);
      setTotalProducts(0);
      setTotalDeleted(0);
      setEstimatedLoadTime(0);
      setIsRunning(false);
    }
  };

  return (
    <div className='p-3 border rounded'>
      <div className='d-flex w-100 flex-column gap-3'>
        <div className='d-flex justify-content-between gap-3'>
          <h3>Remove Out-of-Stock Products</h3>
          {isRunning ? (
            <div className='spinner-border spinner-border-sm' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
          ) : null}
        </div>
        <div className='d-flex gap-2'>
          <button type='button' disabled={isStopping} className={`btn ${shouldLoad || isRunning ? 'btn-warning' : 'btn-primary'}`} onClick={toggleLoad}>
            {isStopping ? 'Stopping...' : shouldLoad ? 'Pause' : pageIndex > 0 ? 'Resume' : 'Start'}
          </button>
          <button type='button' disabled={resetDisabled} className='btn btn-secondary' onClick={reset}>
            Reset
          </button>
        </div>
        <p className='m-0'> {shouldLoad || isRunning ? 'Removing out-of-stock products...' : 'Click "Start" to begin removing out-of-stock products'}</p>
        <div className='progress' role='progressbar'>
          <div className={`progress-bar ${isRunning ? 'progress-bar-striped progress-bar-animated' : 'bg-secondary'}`} style={{ width: `${progress * 100}%` }}></div>
        </div>
        <div className='d-flex justify-content-between'>
          <small>Est. Time: {formatDuration(estimatedLoadTime / 1000)}</small>
          <small>
            ({totalDeleted} deleted) {totalProcessed} / {totalProducts}
          </small>
        </div>
      </div>
    </div>
  );
};

// const TestBlock = () => {
//   const localStore = useLocalStorage('product_update', {
//     pageIndex: 0, //
//     totalUpdated: 0,
//     exeTimes: [],
//     estimatedLoadTime: 0,
//     totalProcessed: 0,
//     totalProducts: 0
//   });
//   const [pageIndex, setPageIndex] = useState(localStore.data.pageIndex);
//   const [shouldLoad, setShouldLoad] = useState(false);
//   const wooProducts = useWooProducts({ paged: pageIndex, posts_per_page: 20 }, { enabled: shouldLoad });
//   const startTime = React.useRef(Date.now());
//   const [exeTimes, setExeTimes] = useState<number[]>(localStore.data.exeTimes);
//   const avgExeTime = exeTimes.reduce((c, t) => c + t, 0); //exeTimes.length>0 ? exeTimes.reduce((c, t) => c + t, 0) / exeTimes.length : 0;
//   const estTotalTime = avgExeTime * (wooProducts?.data?.total ?? 1);
//   const [estimatedLoadTime, setEstimatedLoadTime] = useState(localStore.data.estimatedLoadTime);
//   const [isRunning, setIsRunning] = useState(false);
//   const [totalUpdated, setTotalUpdated] = useState(localStore.data.totalUpdated);
//   const [totalProcessed, setTotalProcessed] = useState(localStore.data.totalProcessed);
//   const [totalProducts, setTotalProducts] = useState(localStore.data.totalProducts);
//   const isStopping = !shouldLoad && isRunning;
//   const progress = totalProducts > 0 ? totalProcessed / totalProducts : 0;
//   const resetDisabled = isRunning || isStopping || pageIndex === 0;

//   React.useEffect(() => {
//     if (wooProducts.data?.products?.length) {
//       const processProducts = async () => {
//         let i = wooProducts.data.products.length;
//         while (i--) {
//           console.log({ shouldLoad });
//           if (shouldLoad) {
//             const start = Date.now();
//             const result = await updateWooProduct(wooProducts.data.products[i].woo_product_id);
//             const exeTime = Date.now() - start;
//             console.log(exeTime);
//             setExeTimes((t) => [...t, exeTime]);
//             if (result.updated) {
//               setTotalUpdated((t) => t + 1);
//             }
//           }
//         }
//         // const exeTime = Date.now() - startTime.current;
//         // setExeTimes((t) => [...t, exeTime]);

//         if (shouldLoad && wooProducts.data.isLastPage === false) {
//           //   startTime.current = Date.now();
//           setPageIndex((i) => i + 1);
//         } else {
//           setIsRunning(false);
//           setShouldLoad(false);
//         }
//       };

//       if (shouldLoad) {
//         setIsRunning(true);
//         setTotalProcessed(wooProducts.data.posts_per_page * wooProducts.data.paged);
//         setTotalProducts(wooProducts.data.total);
//         processProducts();
//       }

//       //   Promise.all(wooProducts.data.products.map((res) => updateWooProduct(res.woo_product_id))).then((res) => {
//       //     const exeTime = Date.now() - startTime.current;
//       //     setExeTimes((t) => [...t, exeTime]);
//       //     setTotalUpdated((t) => t + res.reduce((s, r) => s + (r.updated ? 1 : 0), 0));
//       //     if (shouldLoad && wooProducts.data.isLastPage === false) {
//       //       startTime.current = Date.now();
//       //       setPageIndex((i) => i + 1);
//       //     } else {
//       //       setIsRunning(false);
//       //       setShouldLoad(false);
//       //     }
//       //   });
//     }
//   }, [wooProducts.data, shouldLoad]);

//   React.useEffect(() => {
//     localStore.merge({ pageIndex, totalUpdated: totalUpdated, exeTimes: [estimatedLoadTime], estimatedLoadTime, totalProcessed, totalProducts });
//   }, [pageIndex, totalUpdated, exeTimes, estimatedLoadTime, totalProcessed, totalProducts]);

//   React.useEffect(() => {
//     if (exeTimes.length) {
//       const sum = exeTimes.reduce((c, t) => c + t, 0);
//       const avg = sum / exeTimes.length;
//       if (wooProducts.isSuccess) {
//         const estTime = avg * wooProducts.data.total; // / wooProducts.data.posts_per_page;
//         setEstimatedLoadTime(estTime);
//       }
//     }
//   }, [exeTimes]);

//   const toggleLoad = () => {
//     setShouldLoad(!shouldLoad);
//   };

//   const reset = () => {
//     if (!isRunning) {
//       setShouldLoad(false);
//       setPageIndex(0);
//       setExeTimes([]);
//       setTotalProcessed(0);
//       setTotalProducts(0);
//       setTotalUpdated(0);
//       setEstimatedLoadTime(0);
//       setIsRunning(false);
//     }
//   };

//   return (
//     <div className='p-3 border rounded'>
//       <div className='d-flex w-100 flex-column gap-3'>
//         <div className='d-flex justify-content-between gap-3'>
//           <h3>!!TEST</h3>
//           {isRunning ? (
//             <div className='spinner-border spinner-border-sm' role='status'>
//               <span className='visually-hidden'>Loading...</span>
//             </div>
//           ) : null}
//         </div>
//         <div className='d-flex gap-2'>
//           <button type='button' disabled={isStopping} className={`btn ${shouldLoad || isRunning ? 'btn-warning' : 'btn-primary'}`} onClick={toggleLoad}>
//             {isStopping ? 'Stopping...' : shouldLoad ? 'Pause' : pageIndex > 0 ? 'Resume' : 'Start'}
//           </button>
//           <button type='button' disabled={resetDisabled} className='btn btn-secondary' onClick={reset}>
//             Reset
//           </button>
//         </div>
//         <p className='m-0'> {shouldLoad || isRunning ? 'Updating products...' : 'Click "Start" to begin updating products'}</p>
//         <div className='progress' role='progressbar'>
//           <div className={`progress-bar ${isRunning ? 'progress-bar-striped progress-bar-animated' : 'bg-secondary'}`} style={{ width: `${progress * 100}%` }}></div>
//         </div>
//         <div className='d-flex justify-content-between'>
//           <small>Est. Time: {formatDuration(estimatedLoadTime / 1000)}</small>
//           <small>
//             ({totalUpdated} updated) {totalProcessed} / {totalProducts}
//           </small>
//         </div>
//       </div>
//       <pre>{JSON.stringify({ avgExeTime: formatDuration(avgExeTime), estTotalTime: formatDuration(estTotalTime), exeTimes: exeTimes.length })}</pre>
//     </div>
//   );
// };
