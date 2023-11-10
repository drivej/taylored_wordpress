import * as csv from 'csvtojson';
import * as JsSearch from 'js-search';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DownloadButton } from '../../components/DownloadButton';
import { fetchApi } from '../../components/fetchApi';
import { TuckerProduct } from '../../utils/TuckerProduct';
import { ImportReport, TuckerProducts } from '../../utils/TuckerProducts';
import { getFileName } from '../../utils/getFileName';

interface DownloadFile {
  filepath: string;
  filename: string;
  status: 0;
  sku: string;
}

interface Job {
  key: string;
  type: string;
  startTime: string;
  status: string;
  error: string;
  steps: number;
  step: number;
}

async function downloadFTPImages(files: DownloadFile[]) {
  return fetchApi<{ job: Job }>('/download', { files });
}

async function getDownloadedImages() {
  return fetchApi<{ files: string[] }>('/downloads');
}

async function cleanImages() {
  return fetchApi<{ stats: { deletedFiles: number } }>('/clean');
}

function getDownloadProgress(jobKey: string) {
  return fetchApi<{ job: Job }>(`/job/${jobKey}`);
}

export const UploadForm = () => {
  const [message, setMessage] = useState(<></>);
  const [importReport, setImportReport] = useState<ImportReport>([]);
  const $fileInput = useRef<HTMLInputElement>();
  const [FTPDownloads, setFTPDownloads] = useState<{ files: DownloadFile[] }>({ files: [] });
  const [jobStatus, setJobStatus] = useState(0);
  const [loadIndex, setLoadIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [store, setStore] = useState<TuckerProducts>(null);
  const [searchTerm, setSearchTerm] = useState(window.localStorage.getItem('searchTerm') || '');
  const imageRoot = process.env.IMAGE_ROOT;
  const limit = 1;
  const hasProducts = useMemo(() => store?.products?.length > 0, [store]);

  useEffect(() => {
    window.localStorage.setItem('searchTerm', searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    let mounted = true;
    if (jobStatus > 0) {
      downloadFTPImages(FTPDownloads.files.slice(loadIndex, loadIndex + limit)).then((res) => {
        if (mounted) {
          setProgress(FTPDownloads.files.length > 0 ? (loadIndex + 1) / FTPDownloads.files.length : 0);
          if (loadIndex < FTPDownloads.files.length - 1) {
            setLoadIndex((n) => n + limit);
          } else {
            setJobStatus(0);
            compareImages();
          }
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, [loadIndex]);

  const startDownload = () => {
    const files = Object.keys(missingImages).reduce((a, filename) => {
      return [
        ...a,
        {
          filepath: missingImages[filename],
          filename,
          status: 0
        }
      ];
    }, []);

    setFTPDownloads({ files });
    setProgress(0);
    setJobStatus(1);
    setLoadIndex(0);
  };

  const stopDownload = () => {
    setJobStatus(0);
    compareImages();
  };

  const deleteImages = () => {
    if (confirm('Are you sure?')) {
      setIsCleaning(true);
      cleanImages().then((res) => {
        console.log(res);
        setIsCleaning(false);
        compareImages();
      });
    }
  };

  const [missingImages, setMissingImages] = useState<Record<string, string>>({});

  const compareImages = () => {
    if (isComparing || (store?.products?.length ?? 0) === 0) {
      return;
    }
    setIsComparing(true);

    const images = store.products.reduce((a, p) => {
      p.getImagesArray().forEach((v) => (a[getFileName(v)] = v));
      return a;
    }, {});

    getDownloadedImages().then((res) => {
      res.files.forEach((v) => delete images[getFileName(v)]);
      setMissingImages(images);
      setIsComparing(false);
      if (Object.keys(images).length === 0) {
        setMessage(
          <div className='card-body'>
            <div className='alert alert-info' role='alert'>
              All images are accounted for.
            </div>
          </div>
        );
      } else {
        const count = Object.keys(images).length;
        setMessage(
          <div className='card-body'>
            <div className='alert alert-danger' role='alert'>
              There {count === 1 ? 'is' : 'are'} {Object.keys(images).length} {count === 1 ? 'image' : 'images'} that need to be downloaded!
            </div>
          </div>
        );
      }
    });
  };

  const [storeContent, setStoreContent] = useState('');

  useEffect(() => {
    setStoreContent(window.localStorage.getItem('storeContent'));
  }, []);

  useEffect(() => {
    if (storeContent) {
      window.localStorage.setItem('storeContent', storeContent);
      csv()
        .fromString(storeContent)
        .then(async (jsonObj) => {
          const tucker = TuckerProducts.fromJson(jsonObj, { imageRoot });
          setImportReport(tucker.importReport);
          setStore(tucker);
        });
    }
  }, [storeContent]);

  useEffect(() => {
    setIsUploading(false);
    setIsUploaded(true);
    compareImages();
  }, [store]);

  const search = useMemo(() => {
    const e = new JsSearch.Search('sku');
    e.indexStrategy = new JsSearch.AllSubstringsIndexStrategy();
    return { current: e };
  }, []);

  const [products, setProducts] = useState([]);
  const [term, setTerm] = useState('');

  useEffect(() => {
    if (store?.products?.length > 0 && search.current) {
      search.current.addIndex('haystack');
      const docs = [...store.masterProducts, ...store.simpleProducts].map((p) => ({
        haystack: [p.sku, p.type, p.properties.product_name, p.properties.desc, p.properties.bullet_text, p.properties.tucker_item, ...p.variations.map((v) => v.sku)].join(' '),
        sku: p.sku
      }));
      search.current.addDocuments(docs);
      setProducts([]);
    }
  }, [store]);

  useEffect(() => {
    if (store?.products?.length > 0 && search.current) {
      if (term) {
        const results = search.current.search(term) as { sku: string }[];
        const skus = new Set(results.map((r) => r.sku));
        setProducts(store.products.filter((p) => skus.has(p.sku)));
      } else {
        setProducts([]);
      }
    }
  }, [term]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setIsUploaded(false);
    setIsUploading(true);
    e.preventDefault();
    const file = $fileInput.current.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const contents = event.target?.result?.toString() ?? '';
      setStoreContent(contents);
      setIsUploading(false);
      setIsUploaded(true);
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    if (store?.products?.length > 0) {
      store.updateOptions({ imageRoot });
    }
  }, [imageRoot]);

  const [selectedSku, setSelectedSku] = useState(new URL(window.location.href).searchParams.get('sku') || '');

  useEffect(() => {
    window.history.replaceState(null, document.title, selectedSku ? `?sku=${selectedSku}` : `?`);
  }, [selectedSku]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBlockEnd: 100 }}>
      <div className='card'>
        <div className='card-body'>
          <h3 className='card-title'>Upload Tucker CSV and download all the images</h3>
        </div>

        <div className='card-body'>
          <form method='POST' encType='multipart/form-data' onSubmit={onSubmit}>
            <h5>Upload Tucker CSV</h5>
            <div className='input-group'>
              <input className='form-control' ref={$fileInput} type='FILE' name='file' onChange={(e) => console.log(e.currentTarget.form.requestSubmit())} />
              <button className='btn btn-primary' type='submit'>
                Submit
              </button>
            </div>
          </form>
        </div>

        <div className='card-body'>
          {isUploading ? <h3 style={{ marginTop: '1em' }}>Uploading...</h3> : null}
          {isUploaded ? (
            <>
              {hasProducts ? (
                <>
                  {/* <div>
                    <h5>Download Master Product with Variations</h5>
                    <div className='input-group'>
                      <select className='form-select' onChange={(e) => setSelectedSku(e.target.value)} value={selectedSku}>
                        <option value=''>select...</option>
                        {store.masterProducts.map((m) => (
                          <option value={m.sku} key={`${Date.now()}_single_${m.sku}`}>
                            {m.properties.product_name} ({m.properties.tucker_item},{m.type})
                          </option>
                        ))}
                      </select>
                      {selectedSku ? (
                        <DownloadButton
                          label={`↓ ${selectedSku}`} //
                          filename={`${Date.now()}_single_${selectedSku}`}
                          blob={new Blob([store.toWooCSV((p) => p.sku === selectedSku)], { type: 'text/csv' })}
                        />
                      ) : null}
                    </div>
                  </div> */}
                  <div>
                    <table className='table table-bordered table-sm fs-6'>
                      <tbody>
                        <tr>
                          <td>All</td>
                          <td>
                            <DownloadButton
                              label={`↓ All ${store.stats().products}`} //
                              filename={`${Date.now()}_all`}
                              blob={new Blob([store.toWooCSV()], { type: 'text/csv' })}
                            />
                          </td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>Masters</td>
                          <td>
                            <DownloadButton
                              label={`↓ All ${store.stats().masterProducts}`} //
                              filename={`${Date.now()}_master_all`}
                              blob={new Blob([store.toWooCSV((p) => p.isMaster)], { type: 'text/csv' })}
                            />
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                              {(() => {
                                const filterTest = (p: TuckerProduct) => p.isMaster;
                                let offset = 0;
                                const limit = 50;
                                const products = store.products.filter(filterTest);
                                const btns = [];

                                while (offset < products.length) {
                                  const endIndex = Math.min(offset + limit, products.length);
                                  btns.push(
                                    <DownloadButton
                                      key={`master_${offset}_${endIndex}`}
                                      label={`↓ ${offset}-${endIndex}`} //
                                      filename={`master_${offset}_${endIndex}`}
                                      blob={new Blob([store.toWooCSV(filterTest, offset, limit)], { type: 'text/csv' })}
                                    />
                                  );
                                  offset += limit;
                                }
                                return <>{btns}</>;
                              })()}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>Variations</td>
                          <td>
                            <DownloadButton
                              label={`↓ All ${store.stats().variations}`} //
                              filename={`${Date.now()}_variation_all`}
                              blob={new Blob([store.toWooCSV((p) => p.isVariation)], { type: 'text/csv' })}
                            />
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                              {(() => {
                                const filterTest = (p: TuckerProduct) => p.isVariation;
                                let offset = 0;
                                const limit = 100;
                                const products = store.products.filter(filterTest);
                                const btns = [];

                                while (offset < products.length) {
                                  const endIndex = Math.min(offset + limit, products.length);
                                  btns.push(
                                    <DownloadButton
                                      key={`variation_${offset}_${endIndex}`}
                                      label={`↓ ${offset}-${endIndex}`} //
                                      filename={`variation_${offset}_${endIndex}`}
                                      blob={new Blob([store.toWooCSV(filterTest, offset, limit)], { type: 'text/csv' })}
                                    />
                                  );
                                  offset += limit;
                                }
                                return <>{btns}</>;
                              })()}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>Simple</td>
                          <td>
                            <DownloadButton
                              label={`↓ All ${store.stats().simpleProducts}`} //
                              filename={`${Date.now()}_simple_all`}
                              blob={new Blob([store.toWooCSV((p) => p.isSimple)], { type: 'text/csv' })}
                            />
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                              {(() => {
                                const filterTest = (p: TuckerProduct) => p.isSimple;
                                let offset = 0;
                                const limit = 100;
                                const products = store.products.filter(filterTest);
                                const btns = [];

                                while (offset < products.length) {
                                  const endIndex = Math.min(offset + limit, products.length);
                                  btns.push(
                                    <DownloadButton
                                      key={`simple_${offset}_${endIndex}`}
                                      label={`↓ ${offset}-${endIndex}`} //
                                      filename={`simple_${offset}_${endIndex}`}
                                      blob={new Blob([store.toWooCSV(filterTest, offset, limit)], { type: 'text/csv' })}
                                    />
                                  );
                                  offset += limit;
                                }
                                return <>{btns}</>;
                              })()}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              ) : null}
            </>
          ) : null}
        </div>

        {hasProducts && Object.keys(missingImages).length > 0 ? (
          <div className='card-body'>
            <h5>Download Images to Server to Prepare for Import</h5>

            {jobStatus === 1 ? (
              <div className='input-group w-100'>
                <button className='btn btn-secondary' onClick={stopDownload}>
                  Stop
                </button>
                <span className='input-group-text bg-light flex-grow-1 position-relative'>
                  <div className='progress w-100' role='progressbar'>
                    <div className='progress-bar' style={{ width: `${progress * 100}%` }}></div>
                  </div>
                </span>
                <span className='input-group-text justify-content-center' style={{ minWidth: '6ch' }}>
                  {' '}
                  {~~(progress * 100)}%
                </span>
                <span className='input-group-text justify-content-center' style={{ minWidth: '12ch' }}>
                  {loadIndex} / {FTPDownloads?.files?.length ?? 0}
                </span>
              </div>
            ) : (
              <button className='btn btn-primary' onClick={startDownload}>
                Start Downloading Images
              </button>
            )}
          </div>
        ) : null}
        {message}
      </div>
      {hasProducts ? (
        <div className='card'>
          <div className='card-body'>
            <div className='card-title'>
              <h3>Find Product</h3>
            </div>
            <div className='card-text'>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setTerm(searchTerm);
                }}
              >
                <div className='input-group'>
                  <select
                    className='form-select'
                    style={{ flex: '1 0 auto' }}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setTerm(e.target.value);
                    }}
                    value={searchTerm}
                  >
                    <option value=''>select...</option>
                    {[...store.masterProducts, ...store.simpleProducts]
                      .sort((a, b) => (a.properties.product_name < b.properties.product_name ? -1 : a.properties.product_name > b.properties.product_name ? 1 : 0))
                      .map((m) => (
                        <option value={m.sku} key={`${Date.now()}_single_${m.sku}`}>
                          {m.properties.product_name} ({m.properties.tucker_item},{m.type},{m.variations.length})
                        </option>
                      ))}
                  </select>
                  <input
                    className='form-control'
                    style={{ flex: '1 1 50%' }}
                    value={searchTerm}
                    placeholder='Enter Full or Partial SKU'
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                    }}
                  />
                  <button
                    className='btn btn-secondary'
                    type='button'
                    onClick={() => {
                      setTerm('');
                      setSearchTerm('');
                    }}
                  >
                    Clear
                  </button>
                  <button className='btn btn-primary' type='submit'>
                    Search
                  </button>
                  {products.length === 0 && term ? <span className='input-group-text'>Nothing Found for "{term}"</span> : null}
                </div>
              </form>

              <div>
                <table className='table table-bordered table-sm fs-6 m-0 mt-3'>
                  <tbody>
                    {products?.map((p: TuckerProduct, i) => {
                      return (
                        <tr key={`search_${i}_${p.properties.tucker_item}`}>
                          <td style={{ width: 1 }}>{p.properties.tucker_item}</td>
                          <td>
                            {p.properties.product_name} ({p.variations.length} variations)
                            {/* <pre>{JSON.stringify(p.attributes, null,2)}</pre> */}
                          </td>
                          <td style={{ width: 1 }}>
                            <DownloadButton
                              label={`↓ Download`} //
                              filename={`product_${p.properties.tucker_item}`}
                              blob={new Blob([store.toWooCSV((p2) => p2.sku === p.sku || p2?.master?.sku === p.sku)], { type: 'text/csv' })}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <div className='card'>
        <div className='card-body'>
          <h3 className='card-title'>Utilities</h3>
        </div>
        <div className='card-body'>
          <div className='card-text'>
            <h4>Clean</h4>
            <p>Delete all previous product images download from Tucker FTP. This helps when images have potentially been updated.</p>
            {isCleaning ? (
              <h4>Cleaning...</h4>
            ) : (
              <button className='btn btn-primary' onClick={deleteImages}>
                Run: Clean
              </button>
            )}
          </div>
        </div>
        <div className={hasProducts ? `card-body` : 'd-none'}>
          <div className='card-text'>
            <h4>Compare Images</h4>
            <p>Compare downloaded images to product data to see if we're missing anything.</p>
            {isComparing ? (
              <h4>Comparing...</h4>
            ) : isUploaded ? (
              <button className='btn btn-primary' onClick={compareImages}>
                Run: Compare
              </button>
            ) : (
              <p className='info' style={{ display: 'inline-block', padding: 10 }}>
                Upload product data first.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className='card'>
        <div className='card-body'>
          <h3 className='card-title'>Import Report</h3>
        </div>
        <div className='card-body'>
          <table className='table table-sm table-bordered fs-6'>
            <thead>
              <tr>
                <th>#</th>
                <th>Master</th>
                <th>SKU</th>
                <th>Repair</th>
              </tr>
            </thead>
            <tbody>
              {importReport
                .sort((a, b) => (a.product.master?.sku < b.product.master?.sku ? -1 : a.product.master?.sku > b.product.master?.sku ? 1 : 0))
                .map((r, i) => (
                  <tr key={`report-${i}`}>
                    <td style={{ width: 1 }}>{i}</td>
                    <td>{r.product.master?.sku ?? ''}</td>
                    <td style={{ width: 1 }}>{r.product.sku}</td>
                    <td>{r.note}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
