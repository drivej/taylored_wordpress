import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import fetch from 'cross-fetch';
import * as React from 'react';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './assets/plugin.scss';
import { WesternProduct } from './views/western/WesternProduct';
import { useWesternProducts } from './views/western/useWestern';
// import { WordPressApp } from './wordpress/WordpressApp';

// const root = createRoot(document.getElementById('product-root'));
// root.render(<WordPressApp />);

const AppInner = () => {
  const [pageSize, setPageSize] = useState(100);
  const [pageCursor, setPageCursor] = useState<string>(null);
  const [productId, setProductId] = useState<number>(null);
  const products = useWesternProducts({ pageSize, pageCursor });

  // const test = async () => {
  //   const data = await fetchWesternAPI('/products', { pageSize, pageCursor });
  //   console.log(data);
  // };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const response = await fetch('/wp-admin/admin-ajax.php', { method: 'POST', body: data }).then((r) => r.json());
    console.log({ response });
  };

  const [fields, setFields] = useState({ 'post[post_title]': 'newprodctitle' });

  const updateFields: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setFields((f) => ({ ...f, [e.currentTarget.name]: e.currentTarget.value }));
  };

  return (
    <div>
      <h1>Test React AppZZ</h1>

      <form method='post' action='' onSubmit={handleSubmit}>
        <input type='text' id='' name='action' value='ci_woo_action' />
        <div>
          <label htmlFor='product_sku'>Product Sku:</label>
          <input type='text' id='product_sku' name='post[meta_input][_sku]' value='MASTER_9523' required />
        </div>
        <div>
          <label htmlFor='product_title'>Product Title:</label>
          <input type='text' id='product_title' name='post[post_title]' value={fields['post[post_title]']} onChange={updateFields} required />
        </div>
        <div>
          <label htmlFor='product_description'>Product Title:</label>
          <input type='text' id='product_title' name='post[post_content]' value='newprodctitle' required />
        </div>
        <div>
          <label htmlFor='product_price'>Product Price:</label>
          <input type='text' id='product_price' name='post[meta_input][_price]' value='55.6' required />
        </div>
        <input type='submit' name='submit_product' value='Add Product' />
      </form>

      <input type='number' min={1} max={1000} step={10} value={pageSize} onChange={(e) => setPageSize(parseInt(e.currentTarget.value))} />
      <button className='btn btn-primary'>Go</button>
      <button className='btn btn-primary' disabled={!products.data?.meta?.cursor?.next} onClick={() => setPageCursor(products.data?.meta?.cursor?.next)}>
        Next Page {products.data?.meta?.cursor?.next}
      </button>
      <div className='d-flex'>
        {products.isSuccess ? (
          <div>
            {products.data.data.map((p) => (
              <div key={`row_${p.id}`} onClick={() => setProductId(p.id)}>
                {p.name}
              </div>
            ))}
          </div>
        ) : null}
        {productId ? <WesternProduct productId={productId} /> : <h1>Waiting</h1>}
      </div>
      {/* <pre>{JSON.stringify(products, null, 2)}</pre> */}
    </div>
  );
};

const App = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false } } });
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AppInner />
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export const render = (id: string) => {
  const root = createRoot(document.getElementById(id));
  root.render(<App />);
};
