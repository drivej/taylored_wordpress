import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import fetch from 'cross-fetch';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './assets/plugin.scss';
import { GlobalLoader } from './components/GlobalLoader';
import { WesternProduct } from './views/western/WesternProduct';
import { useWesternProducts } from './views/western/useWestern';
import { usePost } from './views/wp/usePost';
import { PauseCron } from './wordpress/CronJobManager';
// import { WordPressApp } from './wordpress/WordpressApp';

// const root = createRoot(document.getElementById('product-root'));
// root.render(<WordPressApp />);

const InputField = ({ label, name, value, onChange }: { label: string; name: string; value: string; onChange: React.ChangeEventHandler<HTMLInputElement> }) => {
  return (
    <>
      <label htmlFor={`input_${name}`}>{label}</label>
      <input type='text' id={`input_${name}`} name={name} value={value} onChange={onChange} />
    </>
  );
};

const AppInner = () => {
  const [pageSize, setPageSize] = useState(100);
  const [pageCursor, setPageCursor] = useState<string>(null);
  const [productId, setProductId] = useState<number>(null);
  const products = useWesternProducts({ pageSize, pageCursor });
  const post = usePost('MASTER_952322');

  useEffect(() => {
    if (post.isSuccess) {
      setFields({
        'post[post_title]': post.data.post_title,
        'post[meta_input][_sku]': post.data.meta_input._sku,
        'post[post_content]': post.data.post_content,
        'post[meta_input][_price]': post.data.meta_input._price
      });
    }
  }, [post.isSuccess]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const response = await fetch('/wp-admin/admin-ajax.php', { method: 'POST', body: data }).then((r) => r.json());
    console.log({ response });
  };

  const [fields, setFields] = useState({
    'post[post_title]': 'newprodctitle',
    'post[meta_input][_sku]': 'MASTER_952322',
    'post[post_content]': 'desc 231',
    'post[meta_input][_price]': '99'
  });

  const updateFields: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const delta = { [e.currentTarget.getAttribute('name')]: e.currentTarget.value };
    setFields((f) => ({ ...f, ...delta }));
  };

  return (
    <div style={{ position: 'relative' }}>
      <PauseCron />
      {/* <CronStatus /> */}
      <hr />
      {/* <TestAPI /> */}
      {/* <CronJobManager /> */}
      <hr />
      <h1>Test React AppZZ</h1>
      <pre>{JSON.stringify(post, null, 2)}</pre>
      <form method='post' action='' onSubmit={handleSubmit}>
        <input type='hidden' name='action' value='ci_woo_action' />
        <input type='hidden' name='post[post_type]' value='product' />
        <input type='hidden' name='post[post_status]' value='publish' />
        <div className='gap-2' style={{ display: 'grid', gridTemplateColumns: 'min-content 1fr' }}>
          <InputField label='Sku' name='post[meta_input][_sku]' value={fields['post[meta_input][_sku]']} onChange={updateFields} />
          <InputField label='Title' name='post[post_title]' value={fields['post[post_title]']} onChange={updateFields} />
          <InputField label='Description' name='post[post_content]' value={fields['post[post_content]']} onChange={updateFields} />
          <InputField label='Price' name='post[meta_input][_price]' value={fields['post[meta_input][_price]']} onChange={updateFields} />
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
            {products?.data?.data?.map((p) => (
              <div key={`row_${p.id}`} onClick={() => setProductId(p.id)}>
                {p.name}
              </div>
            ))}
          </div>
        ) : null}
        {productId ? <WesternProduct productId={productId} /> : <h1>Waiting</h1>}
      </div>
      {/* <pre>{JSON.stringify(products, null, 2)}</pre> */}

      <GlobalLoader />
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
