import '../../assets/plugin.scss';
// import '../../assets/styles.scss';
import '../../assets/suppliers.scss';
import '../../assets/switch.scss';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { HashRouter, NavLink, Outlet, Route, Routes } from 'react-router-dom';
import { LoadingPage } from '../../components/LoadingPage';
import { SupplierBrandsPage } from '../../components/SupplierBrandsPage';
import { SupplierImportStatusPage } from '../../components/SupplierImportStatus';
import { SupplierLinks } from '../../components/SupplierLinks';
import { useSuppliers } from '../../utilities/useSuppliers';
import { SupplierT14Overview } from './t14/SupplierT14Overview';
import { SupplierWPSOverview } from './wps/SupplierWPSOverview';
import { WPSTermsPage } from './wps/WPSTermsPage';

const Suppliers = {
  t14: {
    tabs: [
      { label: 'Overview', to: '' },
      { label: 'Import', to: 'import' },
      { label: 'Brands', to: 'brands' }
    ]
  },
  wps: {
    tabs: [
      { label: 'Overview', to: '' },
      { label: 'Import', to: 'import' },
      { label: 'Brands', to: 'brands' },
      { label: 'Terms', to: 'terms' }
    ]
  }
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

export const render = (id: string) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false } } });
  const root = createRoot(document.getElementById(id));
  root.render(
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route path='' element={<SupplierWrapper />}>
            <Route path='t14' element={<SupplierLinks tabs={Suppliers.t14.tabs} />}>
              <Route index={true} element={<SupplierT14Overview />} />
              <Route path='import' element={<SupplierImportStatusPage supplier_key='t14' />} />
              <Route path='brands' element={<SupplierBrandsPage supplier_key='t14' />} />
            </Route>
            <Route path='wps' element={<SupplierLinks tabs={Suppliers.wps.tabs} />}>
              <Route index={true} element={<SupplierWPSOverview />} />
              <Route path='import' element={<SupplierImportStatusPage supplier_key='wps' />} />
              <Route path='brands' element={<SupplierBrandsPage supplier_key='wps' />} />
              <Route path='terms' element={<WPSTermsPage />} />
            </Route>
          </Route>
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  );
};
