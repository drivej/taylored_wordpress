import * as React from 'react';
import { Context, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { clearInterval } from 'timers';
import { JobContext, JobProvider } from '../../../../__old/jobs/JobProvider';
import { IJobContext, JobStatus } from '../../../../__old/jobs/JobTypes';
import { DownloadButton } from '../../../../components/DownloadButton';
import { UploadCSVFile } from '../../../../components/UploadFile';
import { chunkArray } from '../../../../utils/chunkArray';
import { WooTest } from '../../../woo/WooTest';
import { CATEGORY_DELETE, IWooProduct } from '../../IWoo';
// import { convertWesternProductToWooProduct } from '../../WesternUtils';
import { WooColumnKeys, convertWooProductsToCSV } from '../../WooUtils';
import { useWesternProduct } from '../../useWestern';
import { IWesternJobInput, IWesternJobOutput, WesternJobManager } from './WesternImportJob';

export const WesternImport = () => (
  <JobProvider<IWesternJobInput, IWesternJobOutput> manager={WesternJobManager}>
    <WooTest />
    <WesternJobUI />
  </JobProvider>
);

const WesternJobUI = () => {
  const job = useContext<IJobContext<IWesternJobInput, IWesternJobOutput>>(JobContext as Context<IJobContext<IWesternJobInput, IWesternJobOutput>>);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [currentProducts, setCurrentProducts] = useState<Partial<IWooProduct>[]>([]);
  const [includeImages, setIncludeImages] = useState(true);

  const onComplete = (content: any[]) => {
    setCurrentProducts(content ?? []);
  };

  useEffect(() => {
    if (job.isComplete) {
      console.log({ job: job.output });
    }
  }, [job.isComplete]);

  // const [includeNLA, setIncludeNLA] = useState(true);

  return (
    <div className='card'>
      <article className='card-body'>
        {/* <p>This will import products that are available. If a product has not available items, it will be skipped. </p> */}
        <section>
          <label>Upload WooCommerce CSV export to compare products...</label>
          <UploadCSVFile onComplete={onComplete} />
          {currentProducts?.length > 0 ? <label>Uploaded {currentProducts.length.toLocaleString()} products</label> : null}
        </section>

        <section>
          <label>Products Changed Since...</label>
          <input className='form-control' style={{ width: 'fit-content' }} type='date' value={lastUpdate} onChange={(e) => setLastUpdate(e.currentTarget.value)} />
        </section>

        <section className='Xd-none'>
          <label>Include Images</label>
          <input type='checkbox' checked={includeImages} onChange={(e) => setIncludeImages(e.currentTarget.checked)} />
        </section>

        {/* <section className='d-none'>
          <label title={IWesternItemStatus.NLA}>Include NLA items</label>
          <input type='checkbox' checked={includeNLA} onChange={(e) => setIncludeNLA(e.currentTarget.checked)} />
        </section> */}

        <section>
          <div className='d-flex gap-2'>
            {job.status === JobStatus.NONE ? (
              <button className='btn btn-secondary' onClick={() => job.start({ lastUpdate, includeNLA: true, currentProducts })}>
                start
              </button>
            ) : null}
            {job.isRunning && !job.isComplete ? (
              <button className='btn btn-secondary' onClick={() => job.manager.pause()}>
                pause
              </button>
            ) : null}
            {job.status === JobStatus.PAUSED ? (
              <button className='btn btn-secondary' onClick={() => job.manager.resume()}>
                resume
              </button>
            ) : null}
            {job.status !== JobStatus.NONE ? (
              <button className='btn btn-secondary' onClick={() => job.reset()}>
                reset
              </button>
            ) : null}
          </div>
        </section>

        {job.isRunning || job.isComplete ? (
          <div style={{ position: 'relative', height: 30, borderRadius: 3, overflow: 'hidden', background: '#babade', color: '#000' }}>
            <div style={{ transition: 'width 5s', position: 'absolute', left: 0, top: 0, bottom: 0, width: `${job.progress * 100}%`, background: 'rgba(255,255,255,0.3)' }}></div>
            <div style={{ transition: 'width 5s', position: 'absolute', left: 0, top: 0, bottom: 0, width: `${job.stageProgress * 100}%`, background: 'rgba(255,255,255,0.3)' }}></div>
            <div style={{ paddingLeft: 10, position: 'absolute', inset: 0, lineHeight: 'inherit', display: 'flex', alignItems: 'center', textOverflow: 'ellipsis' }}>
              {job.isComplete ? (
                <>
                  Completed {job.output.products.length.toLocaleString()} products in {(job.manager.elapsedTime / 1000).toFixed(2)}s
                </>
              ) : (
                job.currentStage?.name
              )}
            </div>
          </div>
        ) : null}

        {job.isComplete ? (
          <div>
            <MultiDownload
              products={job.output.products.map((p) => {
                p.Images = '';
                return p;
              })}
              currentProducts={currentProducts}
              includeImages={includeImages}
            />
          </div>
        ) : null}
      </article>
    </div>
  );
};

const MultiDownload = ({ products, currentProducts, includeImages }: { products: IWooProduct[]; currentProducts: Partial<IWooProduct>[]; includeImages: boolean }) => {
  const lookup = new Set(currentProducts.map((p) => p.SKU));
  const [chunkSize, setChunkSize] = useState(1000);
  const [newOnly, setNewOnly] = useState(true);

  const simpleProducts = useMemo(() => {
    if (newOnly) {
      return products.filter((p) => p.Type === 'simple' && p.Categories !== CATEGORY_DELETE && !lookup.has(p.SKU));
    } else {
      return products.filter((p) => p.Type === 'simple' && p.Categories !== CATEGORY_DELETE);
    }
  }, [newOnly]);
  const masterProducts = products.filter((p) => p.Type === 'variable' && p.Categories !== CATEGORY_DELETE && !lookup.has(p.SKU));
  const variationProducts = products.filter((p) => p.Type === 'variation' && p.Categories !== CATEGORY_DELETE && !lookup.has(p.SKU));

  const deleteProducts = products.filter((p) => p.Categories === CATEGORY_DELETE && lookup.has(p.SKU));

  return (
    <div className='d-flex flex-column gap-2'>
      <label>Chunk Size</label>
      <div>
        <select className='form-select' style={{ width: 'fit-content' }} value={chunkSize} onChange={(e) => setChunkSize(parseInt(e.currentTarget.value))}>
          <option value='1000'>1,000</option>
          <option value='10000'>10,000</option>
          <option value='100000'>100,000</option>
        </select>
      </div>
      <label>
        New Only
        <input type='checkbox' checked={newOnly} onChange={(e) => setNewOnly(e.currentTarget.checked)} />
      </label>

      <table className='table'>
        <tbody>
          <DownloadCSVRows name='Simple' chunkSize={chunkSize} products={simpleProducts} />
          <DownloadCSVRows name='Master' chunkSize={chunkSize} products={masterProducts} />
          <DownloadCSVRows name='Variation' chunkSize={chunkSize} products={variationProducts} />
          <DownloadCSVRows name='Delete' chunkSize={chunkSize} products={deleteProducts} columnKeys={['Categories', 'SKU', 'Name', 'Meta: _ci_data']} />
        </tbody>
      </table>
    </div>
  );
};

export const DownloadProduct = ({ id }: { id: number }) => {
  const timestamp = useRef(formatTimestamp(new Date()));
  const product = useWesternProduct(id);
  const productsBlob = useMemo(() => {
    if (product.isSuccess) {
      // const products = convertWesternProductToWooProduct(product.data);
      // return new Blob([convertWooProductsToCSV(products)], { type: 'text/csv' });
    }
  }, [product]);

  if (product.isLoading) {
    return <div>loading...</div>;
  }
  if (product.isError) {
    return <div>error</div>;
  }
  if (product.isSuccess) {
    // return (
    //   <DownloadButton
    //     label={`↓ Western ${name} Products`} //
    //     filename={`western_product_${id}_${timestamp.current}`}
    //     blob={productsBlob}
    //   />
    // );
  }
  return null;
};

const formatTimestamp = (d: Date):string => {
  return [
    d.getFullYear(), //
    d.getMonth().toString().padStart(2, '0'),
    d.getDate().toString().padStart(2, '0'),
    '-',
    d.getHours().toString().padStart(2, '0'),
    d.getMinutes().toString().padStart(2, '0'),
    d.getSeconds().toString().padStart(2, '0')
  ].join('');
};

const DownloadCSVRows = ({ chunkSize, products, name, columnKeys = WooColumnKeys }: { products: IWooProduct[]; chunkSize: number; name: string; columnKeys?: string[] }) => {
  const productsChunks = chunkArray(products, chunkSize);
  const $buttons = useRef<HTMLAnchorElement[]>([]);
  const productsBlob = new Blob([convertWooProductsToCSV(products, columnKeys)], { type: 'text/csv' });
  const timestamp = useRef(formatTimestamp(new Date()));
  const [downloadIndex, setDownloadIndex] = useState(-1);

  // useEffect(() => {
  //   if (downloadIndex > -1 && downloadIndex < $buttons.current.length) {
  //     $buttons.current[downloadIndex].click();
  //     setTimeout(() => {
  //       setDownloadIndex((i) => i + 1);
  //     }, 100);
  //   }
  // }, [downloadIndex]);

  const downloadAll = ($a: React.MutableRefObject<HTMLAnchorElement[]>) => {
    // setDownloadIndex(0);

    let i = 0;
    let t: NodeJS.Timeout;
    t = setInterval(() => {
      if (i < $buttons.current.length) {
        $buttons.current[i].click();
        setDownloadIndex(i);
        i++;
      } else {
        clearInterval(t);
      }
    }, 100);
  };

  return (
    <tr>
      <td>{name}</td>
      <td>{products.length.toLocaleString()}</td>
      <td>
        {products.length > 0 ? (
          <DownloadButton
            label={`↓ Western ${name} Products`} //
            filename={`western_updated_${name.toLowerCase()}_products_${timestamp}`}
            blob={productsBlob}
          />
        ) : null}
      </td>
      <td>
        <div className='d-flex flex-wrap gap-2'>
          {productsChunks.map((chunk, i) => {
            return (
              <DownloadButton
                key={`chunk-${i}`}
                ref={(ref) => ($buttons.current[i] = ref)}
                label={`↓ ${(i + 1 + '').padStart(4, '0')}`} //
                filename={`western_${name.toLowerCase()}_${i + 1}_of_${productsChunks.length}_${timestamp.current}`}
                blob={new Blob([convertWooProductsToCSV(chunk)], { type: 'text/csv' })}
                style={{ minWidth: 75 }}
              />
            );
          })}
        </div>
      </td>
      <td>
        {products.length > 0 ? (
          <button className='btn btn-secondary' onClick={() => downloadAll($buttons)}>
            ↓&nbsp;All&nbsp;Chunks&nbsp;{downloadIndex > -1 && downloadIndex < $buttons.current.length ? downloadIndex : 0}/{$buttons?.current?.length ?? 0}
          </button>
        ) : null}
      </td>
    </tr>
  );
};
