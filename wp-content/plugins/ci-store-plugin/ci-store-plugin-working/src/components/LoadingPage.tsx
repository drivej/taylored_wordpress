import * as React from 'react';

export const LoadingPage = () => {
  return (
    <div className='d-flex align-items-center justify-content-center' style={{ minHeight: '80vh' }}>
      <div className='spinner-border' role='status'>
        <span className='visually-hidden'>Loading...</span>
      </div>
    </div>
  );
};
