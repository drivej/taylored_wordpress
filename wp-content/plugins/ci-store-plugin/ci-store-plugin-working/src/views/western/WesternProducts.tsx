import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, ProductVariation } from '../../components/woo/Product';
import { lookup } from '../../utils/lookup';
import { StatsProvider, useStats } from '../../utils/useStats';
import { fetchIsWooProductVariationBySku, fetchWooAPI, fetchWooProduct, fetchWooProductBySku, fetchWooProductExists, fetchWooProductVariations, fetchWooProductsBySku } from '../woo/useWoo';
import { IWesternItemExt, IWesternItemStatus, IWesternProductExt } from './IWestern';
import { IWooImage, IWooVariable, IWooVariation } from './IWoo';
import { ProductContextProvider, useProductContext } from './ProductContextProvider';
import { fetchWesternProduct, fetchWesternProductsPage } from './useWestern';

export const isValidProduct = (p: IWesternProductExt) => {
  if (!p?.items?.data) return false;
  if (p.items?.data?.length === 0) return false;
  if (p.items.data.filter(isValidItem).length === 0) return false;
  return true;
};

export const isValidItem = (item: IWesternItemExt) => {
  return item.status_id !== IWesternItemStatus.NLA;
};

function useProductStats() {
  return useStats<{
    products: number;
    items: number;
  }>();
}

const ProductStatsInfo = () => {
  const { stats } = useProductStats();
  return (
    <>
      {stats?.products?.toLocaleString() ?? 0} products / {stats?.items?.toLocaleString() ?? 0} items
    </>
  );
};

export const WesternProducts = () => {
  return (
    <StatsProvider>
      <div className='card'>
        <div className='card-body'>
          <p>
            <ProductStatsInfo />
          </p>
          <table className='table table-sm'>
            <thead>
              <tr>
                <th>#</th>
                <th>ID</th>
                <th>Woo</th>
                <th>Status</th>
                <th>Name</th>
                <th>Items (new/woo)</th>
                <th>Woo ID</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <WesternProductsPage />
            </tbody>
          </table>
        </div>
      </div>
    </StatsProvider>
  );
};

const WesternProductsPage = ({ cursor, startIndex = 0 }: { cursor?: string; startIndex?: number }) => {
  const stats = useProductStats();
  const [statInfo, setStatInfo] = useState(null);
  // const [products, setProducts] = useState<IWesternProductExt[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [submitStats, setSubmitStats] = useState(false);
  const [nextCursor, setNextCursor] = useState('');
  const [nextStartIndex, setNextStartIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    const go = async () => {
      const _products = await fetchWesternProductsPage(cursor, 3);
      if (!mounted) return;
      // setProducts(_products.data);
      const itemsCount = _products.data.reduce((a, p) => a + p.items.data.length, 0);
      // const ids = _products.data.reduce((a, p) => [...a, `MASTER_${p.id}`, ...p.items.data.map((e) => e.sku)], []);
      const uniProducts = _products.data.map((p) => Product.fromWesternProduct(p));
      const ids = uniProducts.map((p) => p.sku);
      console.log({ ids });
      console.log({ uniProducts });
      const check = await fetchWooProductsBySku(ids);
      if (!mounted) return;
      const checkLookup = lookup(check, 'sku'); // check.reduce((o, p) => ({ ...o, [p.sku]: p }), {});

      uniProducts.forEach((p) => {
        if (checkLookup?.[p.sku]) {
          p.woo = checkLookup[p.sku];
        }
        // p.woo = checkLookup?.[p.sku] ?? { sku: null, date_modified: null };
        // p.items.data.map((e) => (e.woo = checkLookup?.[e.sku] ?? null));
      });

      setProducts(uniProducts);
      setStatInfo({ products: _products.data.length, items: itemsCount });
      setSubmitStats(true);
      setNextStartIndex(startIndex + _products.data.length);
      setNextCursor(_products.meta.cursor.next);
    };
    go();
    () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (submitStats) {
      stats.update(statInfo);
    }
  }, [submitStats]);

  return (
    <>
      {products.map((p, i) => (
        <ProductContextProvider key={`row_${p.id}`} productId={p.id}>
          <ProductsPageRow product={p} index={startIndex + i} />
        </ProductContextProvider>
      ))}
      {nextCursor && nextStartIndex < 3 ? (
        <WesternProductsPage cursor={nextCursor} startIndex={nextStartIndex} />
      ) : (
        <tr>
          <td colSpan={5}>complete</td>
        </tr>
      )}
    </>
  );
  // }
};

const itemNeedsUpdate = (p: IWesternProductExt | IWesternItemExt) => {
  if (p.woo?.sku) {
    const d1 = new Date(Date.parse(p.updated_at));
    const d2 = new Date(Date.parse(p.woo.date_modified));
    return d1 > d2;
  }
  return false;
};

const itemNeedsInsert = (p: IWesternProductExt | IWesternItemExt) => {
  return !p?.woo?.sku;
};

export function cacheBust() {
  const array = new Uint32Array(1);
  self.crypto.getRandomValues(array);
  return { cachebust: array[0] };
}

enum ProductProblem {
  VARIATIONS_NOT_SYNCED = 'variation counts do not match'
}

function productVariationToWooVariation(item: ProductVariation, masterAttributes: Product) {
  return {
    sku: item.sku,
    name: item.name,
    stock_status: 'in_stock',
    stock_quantity: 10,
    regular_price: item.price.toString(),
    description: item.description,
    image: { name: '', src: item.images[0] } as IWooImage,
    _ci_additional_images: item.images,
    _ci_data: JSON.stringify({ id: item.id })
    // attributes: [{ id: skuAttrId, name: 'sku', option: item.sku }]
  };
}

interface ActionRow {
  action: string;
  type: string;
  wooProductId: string | number;
  wooProductSku: string;
  wooId: string | number;
  wooSku: string | number;
  srcId: string | number;
  srcSku: string | number;
}

const ProductsPageRow = ({ product: product, index }: { product: Product; index: number }) => {
  const nav = useNavigate();
  const productContext = useProductContext();
  const inWoo = product.woo?.id;

  const doAction: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.stopPropagation();

    let result;

    console.log({ srcProduct: productContext.srcProduct });
    console.log({ wooParent: productContext.wooParent });
    console.log({ wooVariations: productContext.wooVariations });
    console.log({ uniProduct: productContext.uniProduct });

    const rows: Partial<ActionRow>[] = [];

    if (productContext.uniProduct.variations.length === 1) {
      const wooUpdate = new Date(Date.parse(productContext.uniProduct.woo?.date_modified ?? '1970'));
      if (productContext.wooParent?.id) {
        if (productContext.uniProduct.updated > wooUpdate) {
          rows.push({ action: 'update', type: 'simple', srcId: productContext.srcProduct.id, srcSku: productContext.srcProduct.items.data[0].sku, wooSku: productContext.uniProduct.sku });
        }
      } else {
        rows.push({ action: 'insert', type: 'simple', srcId: productContext.srcProduct.id, srcSku: productContext.srcProduct.items.data[0].sku, wooSku: productContext.uniProduct.sku });
      }
      //   if (productContext.wooParent?.id) {
      //     // const exists = await fetchWooProductExists(productContext.uniProduct.sku);
      //     // console.log('simple', { exists });
      //     const srcItem = productContext.srcProduct;
      //     const wooItem = productContext.wooParent;
      //     const srcUpdated = srcItem?.updated_at ? new Date(Date.parse(srcItem.updated_at)) : null;
      //     const wooUpdate = wooItem?.date_modified ? new Date(Date.parse(wooItem?.date_modified)) : null;
      //     if (srcUpdated > wooUpdate) {
      //       const payload = productContext.uniProduct.toWoo();
      //       delete payload.sale_price;
      //       delete payload.description;
      //       console.log({ payload });
      //       result = await fetchWooAPI(`/products/${productContext.wooParent.id}`, { regular_price: payload.regular_price }, 'put');
      //       console.log('update', result);
      //     }
      //   } else {
      //     result = await fetchWooAPI(`/products`, productContext.uniProduct.toWoo(), 'post');
      //     console.log('insert', result);
      //   }
    } else {
      // create parent prodiuct if not exist
      if (!productContext.wooParent?.id) {
        rows.push({ action: 'insert', type: 'variable', srcId: productContext.srcProduct.id });
      }

      // find variations to delete in woo
      const deleteWooVariations = productContext.wooVariations.filter((v) => productContext.srcVariationLookup?.[v.sku]?.sku !== v.sku);
      console.log({ deleteWooVariations });
      for (var i = 0; i < deleteWooVariations.length; i++) {
        rows.push({ action: 'delete', type: 'variation', wooId: deleteWooVariations[i].id, wooSku: deleteWooVariations[i].sku });
        // result = await fetchWooAPI(`/products/${productContext.wooParent.id}/variations/${deleteWooVariations[i].id}`, null, 'delete');
        // console.log('delete', result);
      }

      // find variations to insert from src
      const insertWooVariations = productContext.srcProduct.items.data.filter((v) => productContext.wooVariationsLookup?.[v.sku]?.sku !== v.sku);

      console.log({ insertWooVariations });
      for (let i = 0; i < insertWooVariations.length; i++) {
        rows.push({ action: 'insert', type: 'variation', srcId: insertWooVariations[i].id, srcSku: insertWooVariations[i].sku });

        // const exists = await fetchWooProductExists(insertWooVariations[i].sku);
        // if (!exists) {
        //   console.log(insertWooVariations[i].sku, { exists });
        //   const payload = productContext.uniProduct.variation(insertWooVariations[i].sku).toWoo();
        //   payload.parent_id = productContext.wooParent.id;
        //   console.log({ payload });
        //   result = await fetchWooAPI(`/products/${productContext.wooParent.id}/variations`, [payload], 'post');
        //   console.log('insert', result);
        //   console.log({ payload: { sku: payload.sku } });
        //   console.log({ result: { sku: result.sku } });
        //   if (payload.sku !== result.sku) {
        //     result = await fetchWooAPI(`/products/${productContext.wooParent.id}/variations/${result.id}`, { sku: insertWooVariations[i].sku }, 'put');
        //     console.log('update insert', result);
        //   }
        // } else {
        //   console.error('Product already exists in Woo - this should be an updated');
        // }
      }

      const updateWooVariations = productContext.wooVariations
        .filter((v) => productContext.srcVariationLookup?.[v.sku]?.sku === v.sku)
        .filter((v) => {
          const sku = v.sku;
          const srcItem = productContext.srcProduct.items.data.find((e) => e.sku === sku);
          const wooItem = productContext.wooVariations.find((e) => e.sku === sku);
          const srcUpdated = srcItem?.updated_at ? new Date(Date.parse(srcItem.updated_at)) : null;
          const wooUpdate = wooItem?.date_modified ? new Date(Date.parse(wooItem?.date_modified)) : null;
          return srcUpdated > wooUpdate;
        });

      for (let i = 0; i < updateWooVariations.length; i++) {
        rows.push({ action: 'update', type: 'variation', wooProductId: productContext.wooParent.id, wooId: updateWooVariations[i].id, wooSku: updateWooVariations[i].sku });
      }

      // update parent product attribute values
      if (deleteWooVariations.length > 0 || insertWooVariations.length > 0) {
        const attributes = productContext.uniProduct.attributes.filter((a) => a.values.length > 1).map((a) => a.toWoo());
        console.log({ attributes });
        rows.push({ action: 'update', type: 'variable', wooProductId: productContext.uniProduct.sku });
        // result = await fetchWooAPI(`/products/${productContext.wooParent.id}`, { id: productContext.wooParent.id, attributes }, 'put');
        // console.log({ result });
      }
    }
    // console.log({ updateWooVariations });

    rows.forEach((r) => {
      r.wooProductId = productContext.wooParent?.id ?? '';
      r.wooProductSku = productContext.uniProduct.sku;
    });

    console.table(rows, ['action', 'type', 'wooProductId', 'wooProductSku', 'wooId', 'wooSku', 'srcId', 'srcSku']);

    return;
  };

  return (
    <tr key={product.id} className='pointer' onClick={() => nav(`/western/product/${product.id}`)}>
      <td>{index}</td>
      <td>{product.id}</td>
      <td>{inWoo ? '✓' : '×'}</td>
      <td>{product.updated.toISOString()}</td>
      <td>{product.name}</td>
      <td>
        {product.variations.length} /{product.woo?.variations?.length ?? '?'}
        {/* <a className='link' target='_blank' onClick={(e) => e.stopPropagation()} href={`/wooapi/products/${productContext?.wooParent?.id}/variations?_fields=id,sku,name`}>
          {productContext?.wooVariations?.length}
        </a> */}
      </td>
      <td>
        <a href={`https://tayloredblank4dev.kinsta.cloud?p=${product?.woo?.id}`} className='link' target='_blank' onClick={(e) => e.stopPropagation()}>
          {product?.woo?.id}
        </a>
      </td>
      <td>
        <button className='btn badge text-bg-secondary' onClick={doAction}>
          Update
        </button>
      </td>
    </tr>
  );
};

const WesternProductsPageRow = ({ product: product, index }: { product: IWesternProductExt; index: number }) => {
  const productContext = useProductContext();
  const nav = useNavigate();
  const needsUpdate = itemNeedsUpdate(product);
  const hasWoo = !!product?.woo;
  const inWoo = !!product.woo?.sku;
  const [liveWooVariations, setLiveWooVariations] = useState<IWooVariable[]>([]);
  const [problems, setProblems] = useState<ProductProblem[]>([]);

  const addProblem = (issue: ProductProblem) => {
    setProblems((probs) => (probs.indexOf(issue) === -1 ? [...probs, issue] : probs));
  };

  useEffect(() => {
    if (product.woo?.id) {
      // fetchWooProductVariations(product.woo.id, cacheBust()).then(setLiveWooVariations);
    }
  }, [product.woo]);

  useEffect(() => {
    if (liveWooVariations.length !== product.items.data.length) {
      addProblem(ProductProblem.VARIATIONS_NOT_SYNCED);
    }
  }, [liveWooVariations]);

  useEffect(() => {
    if (productContext.isReady) {
    }
  }, [productContext.isReady]);

  const doAction: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.stopPropagation();

    let result;

    console.log({ srcProduct: productContext.srcProduct });
    console.log({ wooParent: productContext.wooParent });
    console.log({ wooVariations: productContext.wooVariations });
    console.log({ uniProduct: productContext.uniProduct });

    if (productContext.uniProduct.variations.length === 1) {
      if (productContext.wooParent?.id) {
        // const exists = await fetchWooProductExists(productContext.uniProduct.sku);
        // console.log('simple', { exists });
        const srcItem = productContext.srcProduct;
        const wooItem = productContext.wooParent;
        const srcUpdated = srcItem?.updated_at ? new Date(Date.parse(srcItem.updated_at)) : null;
        const wooUpdate = wooItem?.date_modified ? new Date(Date.parse(wooItem?.date_modified)) : null;
        if (srcUpdated > wooUpdate) {
          const payload = productContext.uniProduct.toWoo();
          delete payload.sale_price;
          delete payload.description;
          console.log({ payload });
          result = await fetchWooAPI(`/products/${productContext.wooParent.id}`, { regular_price: payload.regular_price }, 'put');
          console.log('update', result);
        }
      } else {
        result = await fetchWooAPI(`/products`, productContext.uniProduct.toWoo(), 'post');
        console.log('insert', result);
      }
      return;
    }

    // result = await fetchWooAPI(`/products/${productContext.wooParent.id}/variations/88375`, { sku: '015-01001' }, 'put');
    // console.log('test', result);
    // return;

    const rows = [];

    // find variations to delete in woo
    const deleteWooVariations = productContext.wooVariations.filter((v) => productContext.srcVariationLookup?.[v.sku]?.sku !== v.sku);
    console.log({ deleteWooVariations });
    for (var i = 0; i < deleteWooVariations.length; i++) {
      rows.push({ action: 'delete', wooProductId: productContext.wooParent.id, wooVariationId: deleteWooVariations[i].id, wooVariationSku: deleteWooVariations[i].sku });
      result = await fetchWooAPI(`/products/${productContext.wooParent.id}/variations/${deleteWooVariations[i].id}`, null, 'delete');
      console.log('delete', result);
    }

    // find variations to insert from src
    const insertWooVariations = productContext.srcProduct.items.data.filter((v) => productContext.wooVariationsLookup?.[v.sku]?.sku !== v.sku);

    console.log({ insertWooVariations });
    for (let i = 0; i < insertWooVariations.length; i++) {
      rows.push({ action: 'insert', wooProductId: productContext.wooParent.id, wooVariationId: null, wooVariationSku: insertWooVariations[i].sku });

      const exists = await fetchWooProductExists(insertWooVariations[i].sku);
      if (!exists) {
        console.log(insertWooVariations[i].sku, { exists });
        const payload = productContext.uniProduct.variation(insertWooVariations[i].sku).toWoo();
        payload.parent_id = productContext.wooParent.id;
        console.log({ payload });
        result = await fetchWooAPI(`/products/${productContext.wooParent.id}/variations`, [payload], 'post');
        console.log('insert', result);
        console.log({ payload: { sku: payload.sku } });
        console.log({ result: { sku: result.sku } });
        if (payload.sku !== result.sku) {
          result = await fetchWooAPI(`/products/${productContext.wooParent.id}/variations/${result.id}`, { sku: insertWooVariations[i].sku }, 'put');
          console.log('update insert', result);
        }
      } else {
        console.error('Product already exists in Woo - this should be an updated');
      }
    }

    const updateWooVariations = productContext.wooVariations
      .filter((v) => productContext.srcVariationLookup?.[v.sku]?.sku === v.sku)
      .filter((v) => {
        const sku = v.sku;
        const srcItem = productContext.srcProduct.items.data.find((e) => e.sku === sku);
        const wooItem = productContext.wooVariations.find((e) => e.sku === sku);
        const srcUpdated = srcItem?.updated_at ? new Date(Date.parse(srcItem.updated_at)) : null;
        const wooUpdate = wooItem?.date_modified ? new Date(Date.parse(wooItem?.date_modified)) : null;
        return srcUpdated > wooUpdate;
      });

    for (let i = 0; i < updateWooVariations.length; i++) {
      rows.push({ action: 'update', wooProductId: productContext.wooParent.id, wooVariationId: updateWooVariations[i].id, wooVariationSku: updateWooVariations[i].sku });
    }
    console.log({ updateWooVariations });

    console.table(rows);

    if (deleteWooVariations.length > 0 || insertWooVariations.length > 0) {
      // update parent product attribute values
      const attributes = productContext.uniProduct.attributes.filter((a) => a.values.length > 1).map((a) => a.toWoo());
      console.log({ attributes });
      result = await fetchWooAPI(`/products/${productContext.wooParent.id}`, { id: productContext.wooParent.id, attributes }, 'put');
      console.log({ result });
    }

    return;

    const uniqueSkus = Array.from(new Set([...productContext.wooVariations.map((v) => v.sku), ...productContext.srcProduct.items.data.map((e) => e.sku)])).sort();

    if (productContext.isReady) {
      const deleteSkus = productContext.wooVariations.filter((v) => !productContext.srcVariationLookup?.[v.sku]);

      const rows = [];
      for (let i = 0; i < uniqueSkus.length; i++) {
        const sku = uniqueSkus[i];
        const srcItem = productContext.srcProduct.items.data.find((e) => e.sku === sku);
        const wooItem = productContext.wooVariations.find((e) => e.sku === sku);

        const src = productContext.srcProduct.items.data[i];
        // const isVariation = await fetchIsWooProductVariationBySku(product.woo.id, src.sku, cacheBust());
        const exists = await fetchWooProductExists(sku);
        const srcUpdated = srcItem?.updated_at ? new Date(Date.parse(srcItem.updated_at)) : null;
        const wooUpdate = wooItem?.date_modified ? new Date(Date.parse(wooItem?.date_modified)) : null;

        let action = 'none';
        if (wooItem?.id && !srcItem?.id) {
          action = 'delete';
        } else if (!wooItem?.id && srcItem?.id) {
          action = 'insert';
        } else if (wooItem?.id && srcItem?.id) {
          if (srcUpdated > wooUpdate) {
            action = 'update';
          }
        }
        rows.push({
          src_id: srcItem?.id,
          src_sku: srcItem?.sku, //
          woo_id: wooItem?.id,
          woo_sku: wooItem?.sku,
          src_updated: srcUpdated,
          woo_updated: wooUpdate,
          woo_exists: exists,
          // isVariation: isVariation,
          action //: !exists && !isVariation ? 'insert' : productContext.wooVariationsLookup[src.sku]?.sku === src.sku ? 'none' : 'update'
        });
      }
      console.table(rows);
      let result;
      let path;
      let payload;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        switch (row.action) {
          case 'delete':
            path = `/products/${productContext.wooParent.id}/variations/${row.woo_id}`;
            console.log('delete', path);
            result = await fetchWooAPI(path, null, 'delete');
            console.log(row.action, result);
            break;
          case 'insert':
            path = `/products/${productContext.wooParent.id}/variations`;
            payload = productContext.uniProduct.variation(row.src_sku).toWoo();
            delete payload.id;
            console.log('insert', { path, payload });
            // result = await fetchWooAPI(path, [item], 'post');
            // console.log(row.action, result);
            break;
          case 'update':
            break;
        }
      }
      return;

      // const insertSkus = wooVariations.filter((v) => !masterVariationLookup?.[v.sku]);
      const updateSkus = [];
      const insertSkus = productContext.srcProduct.items.data
        .filter((v) => !productContext.wooVariationsLookup?.[v.sku])
        .filter(async (item) => {
          const exists = fetchWooProductExists(item.sku);
          if (exists) {
            updateSkus.push(item);
            return false;
          }
          return !exists;
        });

      deleteSkus.forEach((e, i) => console.log('delete', e.sku, e.id));
      insertSkus.forEach((e, i) => console.log('insert', e.sku, e.id));
      updateSkus.forEach((e, i) => console.log('update', e.sku, e.id));
    }
    return;
    // const r = await fetchWooAPI(`/products/19580/variations/88356`, null, 'delete');
    // console.log({ r });
    // // return;

    if (inWoo) {
      const srcProduct = await fetchWesternProduct(product.id);
      // const itemUpdates = masterProduct.items.data.filter(itemNeedsUpdate);
      // const itemInserts = masterProduct.items.data.filter(itemNeedsInsert);
      const srcVariationLookup = lookup(srcProduct.items.data, 'sku');
      const wooParent = (await fetchWooProduct<IWooVariable>(product.woo.id, cacheBust())).data;
      const wooVariations = (await fetchWooProductVariations(product.woo.id, cacheBust())).data;
      const wooVariationsLookup = lookup(wooVariations, 'sku');
      const skuAttrId = wooParent.attributes.filter((a) => a.name === 'sku')?.[0]?.id ?? -1;
      const uniProduct = Product.fromWesternProduct(srcProduct);
      uniProduct.variations.forEach((v) => v.attribute('sku', v.sku));

      // console.log({ product });
      console.log({ srcProduct });
      console.log({ srcVariationLookup });
      console.log({ skuAttrId });
      // console.log({ itemUpdates, itemInserts, items: masterProduct.items });
      console.log({ wooParent });
      console.log({ wooVariations });
      console.log({ wooVariationsLookup });

      // srcProduct.items.data.forEach((i, e) => console.log('master --> item', e, i.sku, '=>', wooVariationsLookup[i.sku]?.id));

      const rows = [];
      for (let i = 0; i < srcProduct.items.data.length; i++) {
        const src = srcProduct.items.data[i];
        const isVariation = await fetchIsWooProductVariationBySku(product.woo.id, src.sku, cacheBust());
        const exists = await fetchWooProductExists(src.sku);
        rows.push({
          'src.id': src.id,
          'src.sku': src.sku, //
          'woo.id': wooVariationsLookup[src.sku]?.id,
          'woo.sku': wooVariationsLookup[src.sku]?.sku,
          'woo.exists': exists,
          isVariation: isVariation,
          action: !exists && !isVariation ? 'insert' : wooVariationsLookup[src.sku]?.sku === src.sku ? 'none' : 'update'
        });
      }
      console.table(rows);
      return;

      // const inserts = rows.filter((r) => r.action === 'insert').map((r) => srcProduct.items.data.filter((item) => item.sku === r.sku));
      const inserts = rows.filter((r) => r.action === 'insert').map((r) => uniProduct.variation(r.sku).toWoo());
      // console.log({ insert:inserts[0] });

      // delete inserts[0].id;
      const z = await fetchWooAPI(`/products/${product.woo.id}/variations`, inserts, 'post');
      console.log({ z });
      return;

      console.log('wooVariations:');
      wooVariations.forEach((e, i) => console.log('woo --> variation', i, e.sku, '=>', srcVariationLookup[e.sku]?.id));

      //
      // DELETE VARIATIONS - check for orphaned veriations that are no longer needed
      //
      const deleteSkus = wooVariations.filter((v) => !srcVariationLookup?.[v.sku]);

      // const insertSkus = wooVariations.filter((v) => !masterVariationLookup?.[v.sku]);
      const updateSkus = [];
      const insertSkus = srcProduct.items.data
        .filter((v) => !wooVariationsLookup?.[v.sku])
        .filter(async (item) => {
          const exists = fetchWooProductExists(item.sku);
          if (exists) updateSkus.push(item);
          return !exists;
        });

      deleteSkus.forEach((e, i) => console.log('delete', e.sku, e.id));
      insertSkus.forEach((e, i) => console.log('insert', e.sku, e.id));
      updateSkus.forEach((e, i) => console.log('update', e.sku, e.id));

      const xxx = await fetchWooAPI(`/products/19580/variations/387`, { sale_price: '99.99' }, 'put');
      console.log({ xxx });
      return;

      insertSkus.slice(0, 1).forEach(async (e) => {
        const variation = uniProduct.variation(e.sku);
        const wooVariation = variation.toWoo();
        const exists = await fetchWooProductExists(e.sku);
        const test = (await fetchWooAPI<IWooVariation>(`/products/${wooParent.id}/variations/${e.id}`, null, 'get')).data;
        console.log({ test });
        if (test?.id === e.id) {
          console.log(e.id, e.sku, 'this exists under this product');
          const delta = { attributes: wooVariation.attributes.map((a) => ({ id: a.id, option: a.option })) };
          console.log({ delta });
          const insertResult = await fetchWooAPI(`/products/${wooParent.id}/variations/${e.id}`, delta, 'put');
          console.log({ exists });
          console.log({ wooVariation });
          console.log({ insertResult });
        } else {
          console.log({ exists, wooVariation });
          const insertResult = await fetchWooAPI(`/products/${wooParent.id}/variations`, wooVariation, 'post');
          console.log({ insertResult });
        }
      });

      // const variations = universalProduct.variations.map<Partial<IWooVariation>>((item) => {
      // })

      return;

      console.log({ deleteSkus });
      deleteSkus.forEach(async (v) => {
        const deleteResult = await fetchWooAPI(`/products/${wooParent.id}/variations/${v.id}`, null, 'delete');
        console.log({ deleteResult });
      });
      //
      //
      //
      // const variations = universalProduct.variations.map<Partial<IWooVariation>>((item) => {
      //   return {
      //     sku: item.sku,
      //     name: item.name,
      //     stock_status: 'in_stock',
      //     stock_quantity: 10,
      //     regular_price: item.price,
      //     description: item.description,
      //     image: { name: '', src: item.thumbnail } as IWooImage,
      //     _ci_additional_images: item.images,
      //     _ci_data: JSON.stringify({ id: item.id }),
      //     attributes: [{ id: skuAttrId, name: 'sku', option: item.sku }]
      //   };
      // });
      // console.log({ variations });
      // const updateResult = await fetchWooAPI(`products/${wooParent.id}/variations`, variations, 'post');
      // console.log({ updateResult });
      // return;
      //
      // INSERT NEW VARIATIONS - find new variations
      //
      const _insertVariations = srcProduct.items.data.filter((v) => !wooVariationsLookup?.[v.sku]);

      // remove variations that already exist from post and update them with put
      const insertVariations = _insertVariations.filter(async (p) => {
        const exists = fetchWooProductExists(p.sku);
        console.log('insert variation exists!', p.sku);
        if (exists) {
          const wooVariation = await fetchWooProductBySku(p.sku);
          console.log({ wooVariation });
          return true;
          const updateDelta = {
            name: p.name,
            regular_price: p.list_price,
            attributes: [{ id: skuAttrId, name: 'sku', option: p.sku }]
          };
          const updateResult = await fetchWooAPI(`products/${wooParent.id}/variations/${2}`, updateDelta, 'put');
          console.log({ updateDelta });
          console.log({ updateResult });
          return false;
        }
        return true;
      });

      return;

      console.log({ insertVariations });
      const insertDelta = insertVariations.map((item) => ({
        name: item.name,
        // type: 'variation',
        regular_price: item.list_price,
        attributes: [{ id: skuAttrId, name: 'sku', option: item.sku }]
      }));
      const insertResult = await fetchWooAPI(`products/${wooParent.id}/variations`, insertDelta, 'post');
      console.log({ insertDelta });
      console.log({ insertResult });
      //
      // UPDATE PARENT WITH NEW VARIATION ATTRIBUTES
      //
      if (deleteSkus.length > 0 || insertVariations.length > 0) {
        const skuAttributeOptions = srcProduct.items.data.map((item) => item.sku);
        const parentDelta = {
          attributes: wooParent.attributes.map((a) => {
            if (a.name === 'sku') {
              a.options = skuAttributeOptions;
            }
            return a;
          })
        };

        if (skuAttrId === -1) {
          parentDelta.attributes.push({
            id: 0, //
            name: 'sku',
            position: 0,
            visible: true,
            variation: true,
            options: skuAttributeOptions
          });
        }

        const result1 = await fetchWooAPI(`products/${wooParent.id}`, parentDelta, 'put');
        console.log('updated parent', result1);
      }

      // itemInserts.forEach(async (item) => {
      //   const exists = await fetchWooProductExists(item.sku);
      //   console.log({ [item.sku]: { exists } });

      //   if (exists) {
      //     const wooVariation = await fetchWooProductBySku(item.sku);
      //     console.log({ wooVariation });

      //     const variationDelta: Partial<IWooVariation> = {
      //       name: item.name,
      //       type: 'variation',
      //       attributes: [{ id: skuAttrId, name: 'sku', option: item.sku }]
      //     };
      //     const result2 = await fetchWooAPI(`products/${wooParent.id}/variations/${wooVariation.id}`, variationDelta, 'put');
      //     console.log({ result1, result2 });
      //   } else {
      //     const delta: Partial<IWooVariation> = {
      //       sku: item.sku,
      //       // parent_id: p.woo.id,
      //       name: item.name,
      //       regular_price: item.list_price
      //       // description: getWesterItemDescription(p),
      //       // type: 'variation',
      //       // attributes: [{ id: 'color', option: 'Red' }]
      //     };
      //     console.log({ delta });
      //     // const result = await fetchWooAPI(`products/${p.woo.id}/variations`, delta, 'post');
      //     // console.log({ result });
      //   }

      //   // const result2 = await pos tWooAPI(`products/${p.woo.id}/variations`, delta);
      //   // console.log({ result2 });
      // });
    } else {
      console.log('add product as new');
      console.log({ product });
      const universalProduct = Product.fromWesternProduct(product);
      console.log({ universalProduct });
      const wooProduct = universalProduct.toWoo();
      console.log({ wooProduct });
      const exists = await fetchWooProductExists(universalProduct.sku);
      console.log({ exists });
      if (exists) {
        const wooRemoteProduct = await fetchWooProductBySku(universalProduct.sku);
        console.log({ wooRemoteProduct });
      }
      // product.att
    }
  };

  return (
    <tr key={product.id} className='pointer' onClick={() => nav(`/western/product/${product.id}`)}>
      <td>{index}</td>
      <td>{product.id}</td>
      <td>{inWoo ? '✓' : '×'}</td>
      <td title={problems.join('&#013;')}>
        {problems.length > 0 ? <span className='badge text-bg-danger'>{problems.length} Problems</span> : ''} {!hasWoo ? <SpinnerSmall /> : needsUpdate ? <span className='badge text-bg-warning'>Update</span> : inWoo ? 'ok' : <span className='badge text-bg-danger'>Missing</span>}
      </td>
      <td>{product.name}</td>
      <td>
        {productContext?.srcProduct?.items?.data?.length ?? 0} /{' '}
        <a className='link' target='_blank' onClick={(e) => e.stopPropagation()} href={`/wooapi/products/${productContext?.wooParent?.id}/variations?_fields=id,sku,name`}>
          {productContext?.wooVariations?.length}
        </a>
      </td>
      <td>
        <a href={`https://tayloredblank4dev.kinsta.cloud?p=${product?.woo?.id}`} className='link' target='_blank' onClick={(e) => e.stopPropagation()}>
          {product?.woo?.id}
        </a>
      </td>
      <td>
        <button className='btn badge text-bg-secondary' onClick={doAction}>
          Update
        </button>
      </td>
    </tr>
  );
};

const SpinnerSmall = () => {
  return (
    <div className='spinner-border spinner-border-sm' role='status'>
      <span className='visually-hidden'>Loading...</span>
    </div>
  );
};
