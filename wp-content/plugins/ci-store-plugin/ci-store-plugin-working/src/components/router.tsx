import * as React from 'react';
import { Outlet, createBrowserRouter } from 'react-router-dom';
import { Store } from '../views/store/Store';
import { WesternAPITest } from '../views/western/WesternAPITest';
import { WesternCompare } from '../views/western/WesternCompare';
import { WesternBigImport, WesternCheckUpdates, WesternCleanup, WesternDelete, WesternDif, WesternInsert, WesternRefresh, WesternSingleImport, WesternSyncCategories, WesternUpdateProductCategories } from '../views/western/WesternJobs';
import { WesternNav } from '../views/western/WesternNav';
import { WesternProductPage } from '../views/western/WesternProduct';
import { WesternProducts } from '../views/western/WesternProducts';
import { WesternTest } from '../views/western/WesternTest';
import { WesternDeleteJob } from '../views/western/jobs/garbage/WesternDeleteOld';
import { WesternImport } from '../views/western/jobs/garbage/WesternImport';
import { WooNav } from '../views/woo/WooNav';
import { WooProduct } from '../views/woo/WooProduct';
import { WooProducts } from '../views/woo/WooProducts';
import { Layout } from './Layout';

export const router = createBrowserRouter([
  // {
  //   path: '/',
  //   element: (
  //     <Layout>
  //       <UploadForm />
  //     </Layout>
  //   )
  // },
  {
    path: '*',
    element: (
      <Layout>
        <Outlet />
      </Layout>
    ),
    children: [
      {
        path: 'western',
        element: (
          <>
            <WesternNav />
            <Outlet />
          </>
        ),
        children: [
          {
            index: true,
            element: <WesternImport />
          },
          {
            path: 'import',
            element: <WesternImport />
          },
          {
            path: 'delete',
            element: <WesternDeleteJob />
          },
          {
            path: 'products',
            element: <WesternProducts />
          },
          {
            path: 'api',
            element: <WesternAPITest />
          },
          {
            path: 'test',
            element: <WesternTest />
          },
          {
            path: 'cleanup',
            element: <WesternCleanup />
          },
          {
            path: 'dif',
            element: <WesternDif />
          },
          {
            path: 'singleimport',
            element: <WesternSingleImport />
          },
          {
            path: 'synccategories',
            element: (
              <div className='card'>
                <div className='card-body d-flex flex-column gap-3'>
                  <WesternCheckUpdates />
                  <WesternInsert />
                  <WesternDelete />
                  <WesternRefresh />
                  <WesternSyncCategories />
                </div>
              </div>
            )
          },
          {
            path: 'updateproductcategories',
            element: <WesternUpdateProductCategories />
          },
          {
            path: 'bigimport',
            element: <WesternBigImport />
          },
          {
            path: 'products/:productId',
            element: <WesternProductPage />
          },
          {
            path: 'product/:productId',
            element: <WesternProductPage />
          },
          {
            path: 'compare/:productId',
            element: <WesternCompare />
          }
        ]
      },
      {
        path: 'woo',
        element: (
          <>
            <WooNav />
            <Outlet />
          </>
        ),
        children: [
          {
            path: 'products',
            element: <WooProducts />
          },
          {
            path: 'products/:productId',
            element: <WooProduct />
          }
        ]
      },
      {
        path: 'store',
        element: <Store />
      },
      {
        path: '*',
        element: <h2>You're lost bruh.</h2>
      }
    ]
  }
]);
