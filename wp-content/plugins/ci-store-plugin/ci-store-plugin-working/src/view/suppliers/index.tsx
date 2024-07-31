import '../../assets/plugin.scss';
import './suppliers.scss';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { HashRouter, NavLink, Outlet, Route, Routes } from 'react-router-dom';
import { IAjaxQuery, IWordpressAjaxParams } from '../../models';
import { SupplierImportStatus } from '../../overview/Overview';
import { useSuppliers } from '../../utilities/useSuppliers';
import { fetchWordpressAjax } from '../../utils/fetchWordpressAjax';
import { useWordpressAjax } from '../../utils/useWordpressAjax';

const SupplierImportStatusPage = ({ supplier_key }: { supplier_key: string }) => {
  const suppliers = useSuppliers();
  const supplier = suppliers.isSuccess ? suppliers.data.find((s) => s.key === supplier_key) : null;

  if (suppliers.isSuccess) {
    if (supplier) {
      return <SupplierImportStatus supplier={supplier} />;
    } else {
      return <div>Supplier not found.</div>;
    }
  }

  return <LoadingPage />;
};

const SupplierWrapper = () => {
  const suppliers = useSuppliers();
  if (suppliers.isSuccess) {
    return (
      <div className='p-3 d-flex flex-column gap-3 overflow-auto'>
        <header>
          <p className='m-0'>CI Store</p>
          <h3>Suppliers</h3>
        </header>
        <nav>
          <ul className='nav nav-tabs'>
            {suppliers.data.map((supplier) => (
              <li className='nav-item m-0'>
                <NavLink to={`/${supplier.key}`} className='nav-link'>
                  {supplier.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <Outlet />
      </div>
    );
  }
  return <LoadingPage />;
};

export const LoadingPage = () => {
  return (
    <div className='d-flex align-items-center justify-content-center' style={{ minHeight: '80vh' }}>
      <div className='spinner-border' role='status'>
        <span className='visually-hidden'>Loading...</span>
      </div>
    </div>
  );
};

const SupplierT14Page = () => {
  return (
    <div className='d-flex flex-column gap-3'>
      <nav className='d-flex gap-2'>
        <NavLink className='btn btn-sm btn-primary' to=''>
          Overview
        </NavLink>
        <NavLink className='btn btn-sm btn-primary' to='brands'>
          Brands
        </NavLink>
      </nav>
      <Outlet />
    </div>
  );
};

const SupplierWPSPage = () => {
  return (
    <div className='d-flex flex-column gap-3'>
      <nav className='d-flex gap-2'>
        <NavLink className='btn btn-sm btn-primary' to=''>
          Overview
        </NavLink>
        <NavLink className='btn btn-sm btn-primary' to='brands'>
          Brands
        </NavLink>
      </nav>
      <Outlet />
    </div>
  );
};

interface IBrandsResponse {
  data: { id: string; allowed: boolean; name: string; Xattributes: { name: string } }[];
  meta: { allowed: string[] };
}

type IBrandQuery = IAjaxQuery & { supplier_key: string; func: string; args?: unknown[] };

const SupplierBrands = ({ supplier_key }: { supplier_key: string }) => {
  // { data: { id: string; attributes: { name: string } }[] }
  const query: IBrandQuery = {
    action: 'ci_api_handler',
    cmd: 'supplier_action',
    supplier_key,
    func: 'get_brands'
  };

  const brands = useWordpressAjax<IBrandsResponse>(query);
  const [allowedBrandIds, setAllowedBrandIds] = React.useState([]);

  React.useEffect(() => {
    if (brands.isSuccess) {
      setAllowedBrandIds(brands.data.meta.allowed);
    }
  }, [brands.data]);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const input: IWordpressAjaxParams = { action: '' };
    formData.forEach((value, key) => (input[key] = value));
    const brand_ids = Array.from($brandsSelect.current.selectedOptions).map(({ value }) => value);

    fetchWordpressAjax<IBrandsResponse, IBrandQuery>({
      action: 'ci_api_handler',
      cmd: 'supplier_action',
      supplier_key,
      func: 'set_allowed_brand_ids',
      args: [JSON.stringify(brand_ids), 'TEST']
    }).then((result) => {
      setAllowedBrandIds(result.meta.allowed);
    });
  };

  const $brandsSelect = React.useRef<HTMLSelectElement>(null);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const checked = e.currentTarget.checked;
    const brandId = e.currentTarget.dataset.brandid;
    $brandsSelect.current.options.namedItem(e.currentTarget.value).selected = checked;

    setAllowedBrandIds((ids) => {
      const i = ids.indexOf(brandId);
      let output = [...ids];
      if (checked) {
        if (i === -1) {
          output.push(brandId);
        }
      } else {
        if (i > -1) {
          output.splice(i, 1);
        }
      }
      return output;
    });
  };

  if (brands.isSuccess) {
    return (
      <div>
        <form onSubmit={onSubmit} className='d-flex flex-column gap-4'>
          <select className='d-none w-100' ref={$brandsSelect} name='brand_ids' multiple>
            {brands?.data?.data?.map((brand) => {
              const checked = allowedBrandIds.includes(brand.id);
              return (
                <option id={`option_brand_${brand.id}`} value={brand.id} selected={checked}>
                  {brand.name} {brand.id}
                </option>
              );
            })}
          </select>

          <div className='brands_container'>
            {brands?.data?.data?.map((brand) => {
              const checked = allowedBrandIds.includes(brand.id);
              return (
                <>
                  <input
                    onChange={onChange} //
                    id={`brand_${brand.id}`}
                    type='checkbox'
                    checked={checked}
                    name={brand.name}
                    value={`option_brand_${brand.id}`}
                    data-brandid={brand.id}
                  />
                  <label htmlFor={`brand_${brand.id}`} className='brands_item'>
                    {brand.name}
                  </label>
                </>
              );
            })}
          </div>

          <div>
            <button className='btn btn-primary w-100'>Save</button>
          </div>
        </form>
      </div>
    );
  }

  return <LoadingPage />;
};

export const render = (id: string) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false } } });
  const root = createRoot(document.getElementById(id));
  root.render(
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route path='' element={<SupplierWrapper />}>
            <Route path='t14' element={<SupplierT14Page />}>
              <Route index={true} element={<SupplierImportStatusPage supplier_key='t14' />} />
              <Route path='brands' element={<SupplierBrands supplier_key='t14' />} />
            </Route>
            <Route path='wps' element={<SupplierWPSPage />}>
              <Route index={true} element={<SupplierImportStatusPage supplier_key='wps' />} />
              <Route path='brands' element={<SupplierBrands supplier_key='wps' />} />
            </Route>
          </Route>
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  );
};
