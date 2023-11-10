import * as React from 'react';
import { useEffect, useState } from 'react';
import { Product } from '../../components/woo/Product';
import { lookup } from '../../utils/lookup';
import { fetchWooProductBySku, fetchWooProductVariations } from '../woo/useWoo';
import { IWesternItemExt, IWesternProductExt } from './IWestern';
import { IWooVariable } from './IWoo';
import { cacheBust } from './WesternProducts';
import { fetchWesternProduct, westernProductIncludes } from './useWestern';

interface IProductContext {
  isReady: boolean;
  supplier: string;
  srcProduct: IWesternProductExt;
  srcVariationLookup: Record<string, IWesternItemExt>;
  wooParent: IWooVariable;
  wooVariations: IWooVariable[];
  wooVariationsLookup: Record<string, IWooVariable>;
  uniProduct: Product;
}

const ProductContext = React.createContext<IProductContext>(null);

export const ProductContextProvider = ({ productId, supplier = 'western', children }: { productId: number | string; supplier?: string; children: React.ReactNode }) => {
  const [info, setInfo] = useState<IProductContext>({ isReady: false, supplier, srcProduct: null, srcVariationLookup: null, wooParent: null, wooVariations: null, wooVariationsLookup: null, uniProduct: null });

  useEffect(() => {
    let mounted = true;
    const go = async () => {
      const srcProduct = await fetchWesternProduct(productId);
      const uniProduct = Product.fromWesternProduct(srcProduct);
      const wooSku = uniProduct.sku; // `MASTER_${productId}`;//srcProduct.items.data.length===1 ? srcProduct.items.data[0].sku : `MASTER_${productId}`;
      const wooParent = await fetchWooProductBySku(wooSku, { includes: westernProductIncludes, ...cacheBust() });
      const srcVariationLookup = lookup(srcProduct.items.data, 'sku');
      const wooVariations = wooParent?.id ? (await fetchWooProductVariations(wooParent.id, cacheBust())).data : [];
      const wooVariationsLookup = wooVariations ? lookup(wooVariations, 'sku') : null;
      uniProduct.variations.forEach((v) => v.attribute('sku', v.sku));
      if (mounted) {
        setInfo((o) => ({ ...o, isReady: true, srcProduct, srcVariationLookup, wooParent, wooVariations, wooVariationsLookup, uniProduct }));
      }
    };
    go();
    return () => {
      mounted = false;
    };
  }, []);

  return <ProductContext.Provider value={{ ...info }}>{children}</ProductContext.Provider>;
};

export const useProductContext = () => {
  return React.useContext(ProductContext);
};
