import '../assets/plugin.scss';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { UtilitiesPage } from './UtilitiesPage';

const router = createBrowserRouter([
  {
    path: '*',
    element: <UtilitiesPage />
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
