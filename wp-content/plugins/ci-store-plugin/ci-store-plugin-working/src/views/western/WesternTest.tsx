import * as React from 'react';
import { IWesternProductExt } from './IWestern';
import { useWestern } from './useWestern';

export const WesternTest = () => {
  const data1 = useWestern<IWesternProductExt[]>({ path: 'products', include: 'features,tags,items,items.images,attributekeys,attributevalues,items.inventory,items.attributevalues,taxonomyterms', pageSize: 10 });
  const data2 = useWestern<IWesternProductExt[]>({ path: 'products', include: 'features,tags,items:filter(status_id|NLA|ne),items.images,attributekeys,attributevalues,items.inventory,items.attributevalues,taxonomyterms', pageSize: 10 });

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '50% 50%' }}>
        <pre>{JSON.stringify({ count: data1?.data?.data?.length, valid: data1?.data?.data?.filter((e) => e.items?.data?.length > 0).length, info: data1?.data?.data?.map((e) => ({ name: e.name, items: e.items.data.length })) }, null, 2)}</pre>
        <pre>{JSON.stringify({ count: data2?.data?.data?.length, valid: data2?.data?.data?.filter((e) => e.items?.data?.length > 0).length, info: data2?.data?.data?.map((e) => ({ name: e.name, items: e.items.data.length })) }, null, 2)}</pre>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '50% 50%' }}>
        <pre>{JSON.stringify({ data1 }, null, 2)}</pre>
        <pre>{JSON.stringify({ data2 }, null, 2)}</pre>
      </div>
    </div>
  );
};
