import * as React from 'react';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Product } from '../../components/woo/Product';
import { ProductDetails } from '../../components/woo/ProductDetails';
import { useWesternProduct } from './useWestern';

export const WesternProductPage = () => {
  const params = useParams<{ productId: string }>();
  // const westernProduct = useWesternProduct(parseInt(params.productId));
  // const product = useMemo<Product>(() => (westernProduct.data ? Product.fromWesternProduct(westernProduct.data) : null), [westernProduct.data]);

  // if (westernProduct.isLoading) {
  //   return <div className='bg-white p-2'>loading...</div>;
  // }

  // if (westernProduct.isError) {
  //   return (
  //     <div className='bg-white p-2'>
  //       <h2>{westernProduct.failureReason.message}</h2>
  //     </div>
  //   );
  // }

  // if (westernProduct.data?.id) {
  return (
    <div>
      <div className='bg-white p-2 d-flex flex-wrap gap-2'>
        {[378376, 25526, 6252].map((id, i) => (
          <Link key={id} to={`/western/product/${id}`}>
            {id}
          </Link>
        ))}
      </div>
      {/* <div>
          <DownloadProduct id={parseInt(params.productId)} />
        </div> */}
      {/* <WooProductDetails products={wooProduct} /> */}
      {/* <ProductDetails product={product} /> */}
      <WesternProduct productId={params.productId} />
      {/* <pre>{JSON.stringify(westernProduct, null, 2)}</pre> */}
    </div>
  );
  // }

  // return <pre>{JSON.stringify(westernProduct.data, null, 2)}</pre>;
};

export const WesternProduct = ({ productId }: { productId: string | number }) => {
  const westernProduct = useWesternProduct(parseInt(''+productId));
  const product = useMemo<Product>(() => (westernProduct.data ? Product.fromWesternProduct(westernProduct.data) : null), [westernProduct.data]);

  // return <pre>{JSON.stringify(westernProduct,null,2)}</pre>
  if (westernProduct.isLoading || !productId) {
    return <div>loading...</div>;
  }

  if (westernProduct.isError) {
    return <div>WP: {westernProduct.failureReason.message}</div>;
  }

  if (westernProduct.data?.id) {
    return <ProductDetails product={product} />;
  }

  return null;
};
