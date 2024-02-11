import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { IWooProductStatus, ProductAdmin, useSuppliers } from '../common/hooks/useAdminAPI';
import { formatDuration } from '../common/utils/formatDuration';
import { useLocalStorage } from '../common/utils/useLocalStorage';

export const ManageProducts = () => {
  return (
    <div className='p-3 d-flex flex-column gap-3'>
      <DeleteProductsForm />
      <ImportProductForm />
      <ProductReportForm />
    </div>
  );
};

export const ProductReportForm = () => {
  const store = useLocalStorage('product_report', { sku: '' });
  const [sku, setSku] = useState(store.data.sku);
  const [result, setResult] = useState({});

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setSku(e.currentTarget.value);
  };

  useEffect(() => {
    store.merge({ sku });
  }, [sku]);

  const onClick = async () => {
    let report = await ProductAdmin.getProductReport({ sku });
    setResult(report);
  };

  return (
    <div>
      <div className='input-group'>
        <input className='form-control' type='text' value={sku} onChange={onChange} />
        <button className='btn btn-primary' onClick={onClick}>
          Report
        </button>
      </div>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
};

export const ImportProductForm = () => {
  const store = useLocalStorage('product_data', { supplier_key: '', product_id: '' });
  const [product_id, setProductId] = useState(store.data.product_id);
  const [result, setResult] = useState({});
  const suppliers = useSuppliers();
  const [supplier_key, setSupplierKey] = useState(store.data.supplier_key);

  useEffect(() => {
    if (suppliers.isSuccess && !supplier_key) {
      setSupplierKey(suppliers.data.data[0].key);
    }
  }, [suppliers.isSuccess]);

  useEffect(() => {
    store.merge({ product_id, supplier_key });
  }, [product_id, supplier_key]);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setProductId(e.currentTarget.value);
  };

  const onClickImport = async () => {
    let product = await ProductAdmin.importProduct({ supplier_key: 'wps', product_id });
    setResult(product);
  };

  const onClickData = async () => {
    let product = await ProductAdmin.getSupplierProduct({ supplier_key: 'wps', product_id });
    setResult(product);
  };

  const onChangeSupplier: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    setSupplierKey(e.currentTarget.value);
  };

  const onClickWooProduct = async () => {
    let product = await ProductAdmin.getWooProduct({ supplier_key: 'wps', product_id });
    setResult(product);
  };

  return (
    <div>
      <div className='input-group'>
        <select className='form-select' onChange={onChangeSupplier} value={supplier_key}>
          {suppliers.isSuccess ? suppliers?.data?.data?.map((s) => <option value={s.key}>{s.name}</option>) : null}
        </select>
        <input className='form-control' type='text' value={product_id} onChange={onChange} />
        <button className='btn btn-primary' onClick={onClickData}>
          Get {supplier_key.toUpperCase()} Product
        </button>
        <button className='btn btn-primary' onClick={onClickWooProduct}>
          Get Woo Product
        </button>
        <button className='btn btn-primary' onClick={onClickImport}>
          Import Product
        </button>
      </div>
      <div></div>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
};

export const DeleteProductsForm = () => {
  const queryClient = useQueryClient();
  const [autoDelete, setAutoDelete] = useState(false);
  const [statuses, setStatuses] = useState<IWooProductStatus[]>([IWooProductStatus.PUBLISH]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (autoDelete) {
      let mounted = true;
      // setStartTime(Date.now());

      const deletePage = async () => {
        // collect ids
        let page = 1;
        let deleted = 0;
        let products = await ProductAdmin.getProducts({ page, limit: 100, status: statuses });
        setMessage('Collecting products IDs...');

        const ids = [...products.data];
        while (page < products.meta.pages) {
          if (mounted && autoDelete) {
            page++;
            products = await ProductAdmin.getProducts({ page, limit: 100, status: statuses });
            ids.push(...products.data);
            setMessage(`Collecting products IDs... ${ids.length}`);
          } else {
            break;
          }
        }

        setMessage(`Collecting products IDs... ${ids.length}`);
        const startTime = Date.now();
        const totalProducts = ids.length;
        let timeElapsed, timePerAction, actionsRemaining, secondsRemaining;

        let i = ids.length;
        if (i > 0) {
          while (i--) {
            if (mounted && autoDelete) {
              const res = await ProductAdmin.deleteProduct(ids[i].id);
              if (res.data.deleted) {
                deleted++;
                if (deleted > 0) {
                  timeElapsed = (Date.now() - startTime) / 1000;
                  timePerAction = timeElapsed / deleted;
                  actionsRemaining = totalProducts - deleted;
                  secondsRemaining = actionsRemaining * timePerAction;
                } else {
                  secondsRemaining = 0;
                }
                setMessage(`Deleted ${deleted} of ${ids.length} products (time remaining: ${formatDuration(secondsRemaining)})`);
              }
            } else {
              break;
            }
          }
        } else {
          setAutoDelete(false);
          queryClient.invalidateQueries({ queryKey: ['admin_api', 'stats'] });
        }
        setAutoDelete(false);
        setMessage(`Deleted ${deleted} of ${ids.length} products`);
      };

      deletePage();

      return () => {
        mounted = false;
      };
    }
  }, [autoDelete]);

  const toggleAutoDelete = () => setAutoDelete(!autoDelete);

  const toggleStatus: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const checked = e.currentTarget.checked;
    const status = e.currentTarget.value as IWooProductStatus;
    setStatuses((s) => {
      const index = s.indexOf(status);
      const a = [...s];
      if (checked) {
        if (index === -1) {
          a.push(status);
        }
      } else {
        if (index > -1) {
          a.splice(index, 1);
        }
      }
      return a;
    });
  };

  useEffect(() => {
    ProductAdmin.getProducts({ page: 1, limit: 1, status: statuses }).then((products) => {
      console.log(products);
      setTotalProducts(products.meta.total);
    });
  }, [statuses]);

  const selectAllStatuses: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setStatuses([IWooProductStatus.DRAFT, IWooProductStatus.PUBLISH, IWooProductStatus.TRASH, IWooProductStatus.PENDING]);
  };

  const isAllChecked = statuses.length === 3 || statuses.length === 0;

  return (
    <div className='d-flex flex-column gap-2'>
      <h3 className='m-0'>Manage Products</h3>
      <p className='m-0'>Choose which status to delete...</p>
      <div>
        <div className='btn-group btn-group-sm' role='group'>
          <input className='btn-check' id='cb-all' type='checkbox' value={''} checked={isAllChecked} onChange={selectAllStatuses} />
          <label className='btn btn-outline-primary' htmlFor='cb-all'>
            All
          </label>

          <input className='btn-check' id='cb-publish' type='checkbox' value={IWooProductStatus.PUBLISH} checked={statuses.indexOf(IWooProductStatus.PUBLISH) > -1} onChange={toggleStatus} />
          <label className='btn btn-outline-primary' htmlFor='cb-publish'>
            {IWooProductStatus.PUBLISH}
          </label>

          <input className='btn-check' id='cb-pending' type='checkbox' value={IWooProductStatus.PENDING} checked={statuses.indexOf(IWooProductStatus.PENDING) > -1} onChange={toggleStatus} />
          <label className='btn btn-outline-primary' htmlFor='cb-pending'>
            {IWooProductStatus.PENDING}
          </label>

          <input className='btn-check' id='cb-draft' type='checkbox' value={IWooProductStatus.DRAFT} checked={statuses.indexOf(IWooProductStatus.DRAFT) > -1} onChange={toggleStatus} />
          <label className='btn btn-outline-primary' htmlFor='cb-draft'>
            {IWooProductStatus.DRAFT}
          </label>

          <input className='btn-check' id='cb-trash' type='checkbox' value={IWooProductStatus.TRASH} checked={statuses.indexOf(IWooProductStatus.TRASH) > -1} onChange={toggleStatus} />
          <label className='btn btn-outline-primary' htmlFor='cb-trash'>
            {IWooProductStatus.TRASH}
          </label>
        </div>
      </div>
      <div>
        <button disabled={totalProducts === 0} className={`mb-2 btn ${autoDelete ? 'btn-danger' : 'btn-secondary'}`} onClick={toggleAutoDelete}>
          Auto Delete {totalProducts} Products
          {autoDelete ? (
            <div className='ms-2 spinner-grow spinner-grow-sm' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
          ) : null}
        </button>
      </div>
      <p>{message}</p>
    </div>
  );
};
