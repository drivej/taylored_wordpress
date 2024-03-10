import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { IWooProductStatus, ProductAdmin, useAdminAPI, useSuppliers } from '../common/hooks/useAdminAPI';
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
  const [_sku, _setSku] = useState(store.data.sku);
  const [sku, setSku] = useState<string>(null);
  // const [result, setResult] = useState({});
  const report = useAdminAPI('product_report', { sku }, { enabled: !!sku });

  useEffect(() => {
    store.merge({ sku });
  }, [sku]);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    _setSku(e.currentTarget.value);
  };

  const onClick = async () => {
    // let report = await ProductAdmin.getProductReport({ sku });
    // setResult(report);
    setSku(_sku);
  };

  return (
    <div>
      <div className='input-group'>
        <input className='form-control' type='text' value={sku} onChange={onChange} />
        <button className='btn btn-primary' onClick={onClick}>
          Report
        </button>
      </div>
      <pre>{JSON.stringify(report.data, null, 2)}</pre>
    </div>
  );
};

export const ImportProductForm = () => {
  const queryClient = useQueryClient();
  const store = useLocalStorage('product_data', { supplier_key: '', product_id: '', cmd: '' });
  const [product_id, setProductId] = useState(store.data.product_id);
  const suppliers = useSuppliers();
  const [supplier_key, setSupplierKey] = useState(store.data.supplier_key);
  const [cmd, setCmd] = useState('');
  const adminResult = useAdminAPI(cmd, { supplier_key, product_id }, { placeholderData: undefined });

  useEffect(() => {
    if (suppliers.isSuccess && !supplier_key) {
      setSupplierKey(suppliers.data.data[0].key);
    }
  }, [suppliers.isSuccess]);

  useEffect(() => {
    store.merge({ product_id, supplier_key });
  }, [product_id, supplier_key, cmd]);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setProductId(e.currentTarget.value);
  };

  const onChangeSupplier: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    setSupplierKey(e.currentTarget.value);
  };

  const onClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    setCmd(e.currentTarget.value);
    queryClient.invalidateQueries({ queryKey: ['admin_api'] });
  };

  const commands = [
    { key: 'get_supplier_product', name: 'Get Supplier Product' },
    { key: 'get_woo_product', name: 'Get Woo Product' },
    { key: 'import_product', name: 'Import Product' },
    { key: 'update_variations', name: 'Update Variations' },
    { key: 'delete_supplier_product', name: 'Delete Product' },
    { key: 'create_product', name: 'Create Product' },
    { key: 'get_product_status', name: 'Status' },
    { key: 'get_product_attributes', name: 'Attributes' },
    { key: 'get_product_variations', name: 'Variations' },
    { key: 'delete_product_variations', name: 'Delete Variations' },
    { key: 'sync_product_variations', name: 'Sync Variations' },
    { key: 'sync_attributes', name: 'Sync Attributes' },
    { key: 'sync_stock', name: 'Sync Stock' },
    { key: 'clear_cache', name: 'Clear Cache' },
    { key: 'test', name: 'Test' },
    { key: 'stats', name: 'Stats' }
  ];

  return (
    <div className='d-flex flex-column gap-2'>
      <div className='input-group'>
        <select className='form-select' onChange={onChangeSupplier} value={supplier_key}>
          {suppliers.isSuccess ? suppliers?.data?.data?.map((s) => <option value={s.key}>{s.name}</option>) : null}
        </select>
        <input className='form-control' type='text' value={product_id} onChange={onChange} />
      </div>
      <div className='d-flex gap-2 flex-wrap'>
        {commands.map((s) => (
          <button title={s.key} className={`btn btn-sm ${s.key === cmd ? 'btn-primary' : 'btn-secondary'}`} value={s.key} onClick={onClick}>
            {s.name}
          </button>
        ))}
      </div>
      {adminResult.isLoading || adminResult.isFetching ? <pre>{JSON.stringify({ isLoading: true }, null, 2)}</pre> : <pre>{JSON.stringify(adminResult.data, null, 2)}</pre>}
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
