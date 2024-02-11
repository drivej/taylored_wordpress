import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import { IWooVariation } from './IWoo';
import { fetchWooAPI, useWooProduct, useWooProducts } from './useWoo';

export const WooProducts = () => {
  const products = useWooProducts();
  const [productId, setProductId] = useState<number>(null);

  if (products.isSuccess) {
    return (
      <div className='d-grid' style={{ maxWidth: '100%', gridTemplateColumns: 'max(30%,300px) auto' }}>
        <div style={{ overflow: 'auto' }}>
          {products.data.data.map((p) => (
            <div key={`product-list-${p.id}`} onClick={() => setProductId(p.id)}>
              {p.name}
            </div>
          ))}
        </div>
        <div style={{ overflow: 'auto' }}>
          <WooEditProduct id={productId} />
        </div>
      </div>
    );
  }

  if (products.isError) {
    return <div>error</div>;
  }

  return <div>loading...</div>;
};

export const WooEditProduct = ({ id }: { id: number }) => {
  const queryClient = useQueryClient();
  const product = useWooProduct(id);
  const [input, setInput] = useState<Partial<IWooVariation>>({});

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const form = new FormData(e.currentTarget);
    const cmd = form.get('cmd');
    const params = new URLSearchParams(form as unknown as string);
    const body = params.toString();
    console.log({ body, cmd });

    if (Object.keys(input).length > 220) {
      console.log(input);
      fetchWooAPI(`products/${id}`, input, 'post');
    }
  };

  const onClickButton: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    const form = new FormData(e.currentTarget.form);
    form.append(e.currentTarget.name, e.currentTarget.value);
  };

  const onUpdate = (name: string, value: string, changed: boolean) => {
    if (changed) {
      setInput((v) => ({ ...v, [name]: value }));
    } else {
      setInput((v) => {
        const vals = { ...v };
        delete vals[name];
        return vals;
      });
    }
  };

  const insert = async () => {
    const result = await fetchWooAPI<unknown, Partial<IWooVariation>>(`products`, { sku: 'JasonDUmbPreoduct', name: 'Test Garbage Product', type: 'simple' }, 'post');
    queryClient.invalidateQueries({ queryKey: ['woo-api'] });
  };

  const onClickDelete = async () => {
    if (confirm('Are you sure?')) {
      const result = await fetchWooAPI(`products/${id}`, { force: true }, 'delete');
      console.log({ result });
      queryClient.invalidateQueries({ queryKey: ['woo-api'] });
    }
  };

  if (product.isSuccess) {
    return (
      <div>
        <form onSubmit={onSubmit}>
          <TextField name='name' initialValue={product.data.data.name} onUpdate={onUpdate} />
          <button name='cmd' value='update' type='submit' onClick={onClickButton}>
            Submit
          </button>
          <button type='button' onClick={onClickDelete}>
            Delete
          </button>
          <button type='button' onClick={insert}>
            Insert
          </button>
          <input type='submit' name='cmd' value='test' />
        </form>
        <CreateNewProductForm />
        <pre>{JSON.stringify({ product }, null, 2)}</pre>
      </div>
    );
  }

  return null;
};

const CreateNewProductForm = () => {
  const queryClient = useQueryClient();
  const [input, setInput] = useState<Partial<IWooVariation>>({});

  const onUpdate = (name: string, value: string, changed: boolean) => {
    if (changed) {
      setInput((v) => ({ ...v, [name]: value }));
    } else {
      setInput((v) => {
        const vals = { ...v };
        delete vals[name];
        return vals;
      });
    }
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await fetchWooAPI<unknown, Partial<IWooVariation>>(`products`, input, 'post');
    queryClient.invalidateQueries({ queryKey: ['woo-api'] });
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <TextField name='name' initialValue={''} onUpdate={onUpdate} />
        <TextField name='sku' initialValue={''} onUpdate={onUpdate} />
        <button type='submit'>Submit</button>
      </form>
    </div>
  );

  return null;
};

const TextField = forwardRef(({ name, initialValue, onUpdate }: { name: string; initialValue: string; onUpdate(name: string, value: string, changed: boolean): void }, ref) => {
  const [value, setValue] = useState(initialValue);
  const changed = useMemo(() => initialValue !== value, [value]);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setValue(e.currentTarget.value);
  };

  useEffect(() => {
    onUpdate(name, value, changed);
  }, [value, changed]);

  const id = `product-${name}`;

  return (
    <div>
      <label htmlFor={id} style={{ textTransform: 'capitalize' }}>
        {name}
      </label>
      <input className={`form-control ${changed ? 'changed' : ''}`} id={id} type='text' value={value} onChange={onChange} />
    </div>
  );
});
