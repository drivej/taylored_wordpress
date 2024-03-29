import '../assets/plugin.scss';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { RouterProvider, createHashRouter } from 'react-router-dom';
import { ImportPage } from './ImportPage';
import { MiscPage } from './MiscPage';
import { MonkeyWrenchPage } from './MonkeyWrench';
import { PatchPage } from './PatchPage';
import { UtilitiesRoot } from './UtilitiesRoot';

const router = createHashRouter([
  {
    path: '/',
    element: <UtilitiesRoot />,
    errorElement: <div>Error</div>,
    children: [
      {
        path: 'patch',
        element: <PatchPage />
      },
      {
        path: 'import',
        element: <ImportPage />
      },
      {
        path: 'monkeywrench',
        element: <MonkeyWrenchPage />
      },
      {
        path: 'misc',
        element: <MiscPage />
      }
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
