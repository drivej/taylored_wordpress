import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useWooProductBySku } from '../woo/useWoo';
import { useWesternProduct } from './useWestern';

export const WesternCompare = () => {
  const params = useParams<{ productId: string }>();
  const woo = useWooProductBySku(`MASTER_WPS_${params.productId}`);
  const wps = useWesternProduct(parseInt(params.productId));

  return (
    <div className='d-grid w-100 gap-3' style={{ gridTemplateColumns: '50% 50%' }}>
      <div className='overflow-auto'>
        <h2>{`MASTER_WPS_${params.productId}`}</h2>
        <pre>
          {JSON.stringify(
            {
              id: woo.data?.id,
              sku: woo.data?.sku,
              name: woo.data?.name,
              date_modified: woo.data?.date_modified,
              type: woo.data?.type,
              meta_data: woo.data?.meta_data
            },
            null,
            2
          )}
        </pre>
      </div>
      <div className='overflow-auto'>
        <h2>{parseInt(params.productId)}</h2>
        <pre>
          {JSON.stringify(
            {
              id: wps.data?.id,
              name: wps.data?.name,
              items: wps.data?.items?.data?.length ?? 0,
              updated_at: wps.data?.updated_at
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
};
