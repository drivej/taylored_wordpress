import * as React from 'react';

export const SpinnerSmall = (props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
  return (
    <div {...props} className='spinner-border spinner-border-sm' role='status'>
      <span className='visually-hidden'>Loading...</span>
    </div>
  );
};
