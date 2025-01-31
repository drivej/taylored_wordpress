import '../assets/plugin.scss';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { RouterProvider, createHashRouter } from 'react-router-dom';
import { LogsPage } from './LogsPage';
import { MiscPage } from './MiscPage';
import { ProductsPage } from './ProductsPage';
import { UtilitiesRoot } from './UtilitiesRoot';

const router = createHashRouter([
  {
    path: '/',
    element: <UtilitiesRoot />,
    errorElement: <div>Error</div>,
    children: [
      // {
      //   path: 'monkeywrench',
      //   element: <MonkeyWrenchPage />
      // },
      {
        path: 'products',
        element: <ProductsPage />
      },
      {
        path: 'misc',
        element: <MiscPage />
      },
      {
        path: 'logs',
        element: <LogsPage />
      },
      // {
      //   path: 'tasks',
      //   element: <TaskPage />
      // },
      // {
      //   path: 'stock',
      //   element: <StockPage />
      // }
    ]
  }
]);

export const render = (id: string) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false } } });
  const root = createRoot(document.getElementById(id));
  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};
