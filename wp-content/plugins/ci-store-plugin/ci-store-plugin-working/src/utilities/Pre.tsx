import * as React from 'react';


export const Pre = ({ data }: { data: unknown; }) => {
  return <pre style={{ fontSize: 11 }}>{JSON.stringify(data, null, 2)}</pre>;
};
