import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { VehicleFitment } from './VehicleFitment';
import './vehicles.scss';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 60 * 24,
      refetchOnWindowFocus: false,
      retry: false
    }
  }
});

const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage
});

// Persist the query cache to localStorage
persistQueryClient({
  queryClient,
  persister: localStoragePersister
});

export const render = (id: string) => {
  const root = createRoot(document.getElementById(id));
  root.render(
    <QueryClientProvider client={queryClient}>
      <VehicleFitment />
    </QueryClientProvider>
  );
};

render('vehicle-fitment-react');
