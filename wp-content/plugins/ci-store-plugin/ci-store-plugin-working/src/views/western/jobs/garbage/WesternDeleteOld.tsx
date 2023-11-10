import * as React from 'react';
import { Context, useContext, useRef, useState } from 'react';
import { DownloadButton } from '../../../../components/DownloadButton';
import { JobContext, JobProvider } from '../../../../jobs/JobProvider';
import { IJobContext, JobStatus } from '../../../../jobs/JobTypes';
import { chunkArray } from '../../../../utils/chunkArray';
import { IWooProduct } from '../../IWoo';
import { convertWooProductsToCSV } from '../../WooUtils';
import { IWesternDeleteJobInput, IWesternDeleteJobOutput, WesternDeleteJobManager } from './WesternDeleteJob';

export const WesternDeleteJob = () => {
  return (
    <JobProvider<IWesternDeleteJobInput, IWesternDeleteJobOutput> manager={WesternDeleteJobManager}>
      <WesternDeleteJobUI />
    </JobProvider>
  );
};

const WesternDeleteJobUI = () => {
  const job = useContext<IJobContext<IWesternDeleteJobInput, IWesternDeleteJobOutput>>(JobContext as Context<IJobContext<IWesternDeleteJobInput, IWesternDeleteJobOutput>>);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  return (
    <div className='card'>
      <div className='card-body d-flex flex-column gap-2'>
        <div>
          <label>Products Changed Since...</label>
          <input className='form-control' style={{ width: 'fit-content' }} type='date' value={lastUpdate} onChange={(e) => setLastUpdate(e.currentTarget.value)} />
        </div>

        <pre>{JSON.stringify(job.manager.stages[0]?.output,null,2)}</pre>

        <div className='d-flex gap-2'>
          {job.status === JobStatus.NONE ? (
            <button className='btn btn-secondary' onClick={() => job.start({ lastUpdate })}>
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
            <MultiDownload products={job.output.products} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

const MultiDownload = ({ products }: { products: IWooProduct[] }) => {
  const [chunkSize, setChunkSize] = useState(10000);
  const timestamp = Date.now();

  const simpleProducts = products.filter((p) => p.Type === 'simple');
  const simpleProductsChunks = chunkArray(simpleProducts, chunkSize);
  const $simpleButtons = useRef<HTMLAnchorElement[]>([]);
  const simpleProductsBlob = new Blob([convertWooProductsToCSV(simpleProducts)], { type: 'text/csv' });

  const downloadAll = ($a: React.MutableRefObject<HTMLAnchorElement[]>) => {
    $a.current.forEach((b) => b.click());
  };

  return (
    <div className='d-flex flex-column gap-2'>
      <label>Chunk Size</label>
      <div>
        <select className='form-control' style={{ width: 'fit-content' }} value={chunkSize} onChange={(e) => setChunkSize(parseInt(e.currentTarget.value))}>
          <option value='1000'>1,000</option>
          <option value='10000'>10,000</option>
          <option value='100000'>100,000</option>
        </select>
      </div>
      <table className='table'>
        <tbody>
          <tr>
            <td>Delete</td>
            <td>{simpleProducts.length.toLocaleString()}</td>
            <td>
              <DownloadButton
                label={`↓ Western Simple Products`} //
                filename={`western_updated_simple_products_${timestamp}`}
                blob={simpleProductsBlob}
              />
            </td>
            <td>
              <div className='d-flex flex-wrap gap-2'>
                {simpleProductsChunks.map((chunk, i) => {
                  return (
                    <DownloadButton
                      key={`chunk-${i}`}
                      ref={(ref) => ($simpleButtons.current[i] = ref)}
                      label={`↓ ${(i + 1 + '').padStart(4, '0')}`} //
                      filename={`western_simple_${i + 1}_of_${simpleProductsChunks.length}_${timestamp}`}
                      blob={new Blob([convertWooProductsToCSV(chunk)], { type: 'text/csv' })}
                      style={{ minWidth: 75 }}
                    />
                  );
                })}
              </div>
            </td>
            <td>
              <button className='btn btn-secondary' onClick={() => downloadAll($simpleButtons)}>
                ↓&nbsp;All&nbsp;Chunks
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};