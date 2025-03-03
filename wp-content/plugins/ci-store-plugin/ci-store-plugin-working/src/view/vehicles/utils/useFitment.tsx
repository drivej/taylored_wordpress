import { useQuery } from '@tanstack/react-query';

const fetchVehicles = async (query: Record<string, string | number>) => {
  // Append required parameters to the query
  query.action = window.vehicles_ajax.action;
  query.nonce = window.vehicles_ajax.nonce;

  // Build URLSearchParams from the sorted query keys
  const params = new URLSearchParams();
  Object.keys(query)
    .sort()
    .forEach((name) => {
      params.append(name, String(query[name]));
    });

  // Fetch data from the server
  const response = await fetch(window.vehicles_ajax.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  const res = await response.json();
  return res?.data;
};

// export const useVehicles = (query, options = {}) => {
//   return useQuery({
//     queryKey: ['vehicles', query],
//     queryFn: () => fetchVehicles(query),
//     ...options,
//   });
// };

// Define the async fetch function

// Create a custom hook that uses react-query's useQuery

export type FitmentData = {
  vehicle_id: number;
  product_id: number;
  variation_id: number;
  has_vehicles: boolean;
  fitment: boolean;
  variation: boolean;
  product: boolean;
  variation_skus: string[];
  variation_ids: number[];
  product_type: 'simple' | 'variable';
};

export const useFitment = (vehicle_id: number, options = {}) => {
  const type = 'fitment';
  const product_id = window.vehicles_ajax?.product_id;

  return useQuery<FitmentData>({
    queryKey: ['vehicles', type, product_id, vehicle_id], // Query key; changes in `query` will trigger a refetch
    queryFn: () => fetchVehicles({ type, product_id, vehicle_id }), // The query function that fetches data
    enabled: () => !!product_id && !!vehicle_id && vehicle_id > 0,
    ...options
  });
};
