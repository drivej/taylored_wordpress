import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { MasterPrices, Price, Product, ProductAttribute, ProductVariation } from './Product';

// export const WooProductDetails = ({ products }: { products: IWooProduct[] }) => {
//   if (!products || products?.length === 0) return null;
//   const product = Product.fromWooRows(products);
//   return <ProductDetails key={product.sku} product={product} />;
// };

export const ProductDetails = ({ product }: { product: Product }) => {
  const [sku, setSku] = useState(product.sku);
  const item = useMemo<Product | ProductVariation>(() => (product.hasVariation(sku) ? product.variation(sku) : product), [sku]);
  const [attributeValues, setAttributeValues] = useState<{ [key: string]: string }>({});
  const [attributeUI, setAttributeUI] = useState<ProductAttribute[]>([...product.attributes]);
  const masterSelected = item?.sku === product?.sku;
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [price, setPrice] = useState<Price>(product.price);
  const itemAttributeValues = useMemo<{ [key: string]: string }>(() => {
    if (masterSelected) return {};
    return { ...(item as ProductVariation).attributes };
  }, [item, masterSelected]);
  const description = useMemo(() => item?.description || product.description || null, [item]);

  const selectAttr: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    if (e?.currentTarget?.name) {
      const name = e.currentTarget.name;
      const value = e.currentTarget.value;
      const delta = { [name]: value };
      setAttributeValues((a) => ({ ...a, ...delta }));
    }
  };

  const clearChoices = () => {
    setAttributeValues({});
    setSku(product.sku);
  };

  const selectSku: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    // console.log('selectSku', e.currentTarget.value);
    setSku(e.currentTarget.value);
    // Do I want the selected sku to auto select attributes?
    // setAttributeValues(product.variation(e.currentTarget.value, false).attributes);
  };

  useEffect(() => {
    // console.log('useEffect[attributeValues]');
    const items = product.filterVariations(attributeValues);
    setVariations(items);

    if (items.length > 1) {
      if (items.find((e) => e.sku === sku)) {
        // do nothing - current sku is valid
      } else {
        setSku(null);
      }
      // && items.filter((e) => e.sku === sku).length > -1) {
      // setSku(product.sku);
    } else if (items.length === 1) {
      setSku(items[0].sku);
    } else {
      setSku(product.sku);
    }

    setAttributeUI((input) => {
      const a = [...input];
      a.forEach((a, i) => {
        a.values.forEach((v) => {
          v.disabled = product.filterVariations({ ...attributeValues, [a.name]: v.value }).length === 0;
        });
      });
      return a;
    });
  }, [attributeValues]);

  useEffect(() => {
    // console.log('useEffect[sku, variations, attributeValues]');
    if (sku && !masterSelected) {
      setPrice(product.variation(sku).price);
    } else {
      setPrice(product.renderPriceFromVariation(new Price(), variations));
    }
  }, [variations, sku]);

  const images = useMemo(() => {
    console.log({ sku, variations, masterSelected });
    if (!masterSelected && sku) {
      console.log({ variation: product.variation(sku) });
      return product.variation(sku).images;
    }
    if (variations.length < product.variations.length) {
      const imgs = new Set<string>();
      if (sku && !masterSelected) {
        console.log({ variation: product.variation(sku) });
        return product.variation(sku).images;
      } else {
        variations.forEach((v) => v.images.map((src) => imgs.add(src)));
      }
      return Array.from(imgs);
    }
    return product?.images ?? [];
  }, [sku, variations, attributeValues]);

  return (
    <div className='bg-white p-4'>
      {product?.variations?.length === 0 ? <h2 className='alert alert-danger'>This product is invalid</h2> : null}
      <div className='d-grid gap-4 mx-auto' style={{ gridTemplateColumns: 'min(50%,300px) 50%', maxWidth: 1200 }}>
        <div>
          <div className='bg-light d-flex flex-wrap gap-3 p-3 rounded'>
            <img style={{ width: '100%', aspectRatio: '1/1', objectFit: 'contain', objectPosition: 'center' }} className='bg-white rounded' src={images[0]} />
            {images.slice(1).map((src, i) => (
              <img key={`img1-${i}`} style={{ width: 120, height: 120, objectFit: 'contain', objectPosition: 'center' }} className='bg-white rounded' src={src} />
            ))}
          </div>
        </div>
        <div className='d-flex flex-column gap-3 p-3'>
          {product.name.toLowerCase() !== (item?.name ?? '').toLowerCase() ? <h3>{product.name}</h3> : null}
          <h1 className='m-0'>{item?.name}</h1>
          {description ? <p className='m-0' dangerouslySetInnerHTML={{ __html: description }}></p> : null}
          <MasterPrices price={price} />
          <p className='m-0'>{sku}</p>
          <div className='d-flex flex-column gap-3'>
            {product.variations.length > 1 ? (
              <div className='d-flex flex-column gap-2 bg-light p-3 border rounded'>
                <label className='d-flex align-items-center'>{variations.length === 1 ? 'Selected...' : <>Quick Select ({variations.length} items)</>}</label>
                <select className='form-select' disabled={variations.length === 1} value={sku || ''} onChange={selectSku}>
                  {masterSelected ? <option value={product.sku}>Select item...</option> : null}
                  {variations.map((p, i) => (
                    <option key={`options-${p.sku}-${i}`} value={p.sku}>
                      {p.sku} {p.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {attributeUI
              .filter((a) => a.values.length > 1)
              .map((attr) => {
                const name = attr.name;
                const values = attr.values.filter((attrValue, i) => !attrValue.disabled);
                const value = values.length === 1 ? values[0].value : attributeValues?.[name] ?? '';
                const selectDisabled = values.length === 1;
                const itemValue = itemAttributeValues?.[name];

                return (
                  <div className='d-flex flex-column gap-2' key={`attr-${name}`}>
                    <div className='d-flex justify-content-between align-items-center' key={`attr-${name}`}>
                      <label className='text-bold text-capitalize'>
                        {name} {values.length > 1 ? <small>({values.length})</small> : null}
                      </label>
                      <div style={{ display: value && !selectDisabled ? '' : 'none' }}>
                        <button
                          className='btn btn-sm btn-light rounded-pill px-3'
                          onClick={() => {
                            setAttributeValues((a) => {
                              const d = { ...a };
                              delete d[name];
                              return d;
                            });
                          }}
                        >
                          clear
                        </button>
                      </div>
                    </div>

                    {values.length === 0 ? (
                      <select className='form-select' disabled={true} value={0}>
                        <option value={0}>N/A</option>
                      </select>
                    ) : (
                      <>
                        <select
                          className={`form-select ${!sku && !value}`} //
                          name={name}
                          size={Math.min(7, values.length > 1 ? values.length : null)}
                          value={value}
                          onChange={selectAttr}
                          disabled={selectDisabled}
                        >
                          {values.length > 0 ? (
                            <option className='d-none' value=''>
                              Select {name}...
                            </option>
                          ) : null}

                          {values.map((attrValue, i) => (
                            <option key={`attr-${name}-value-${i}`} value={attrValue.value} className={itemValue === attrValue.value ? 'checked' : ''}>
                              {attrValue.value}
                            </option>
                          ))}
                        </select>
                      </>
                    )}
                  </div>
                );
              })}

            <div style={{ height: 32 }} />

            <div className='p-3 bg-white shadow rounded-top' style={{ transition: 'opacity 0.3s', position: 'sticky', bottom: 0, opacity: Object.keys(attributeValues).length > 0 || sku ? 1 : 0 }}>
              <div className='d-flex justify-content-stretch gap-3 w-100'>
                <button className='btn btn-lg btn-primary' style={{ flex: '0 0 66%' }} disabled={!sku}>
                  Add to Cart
                </button>
                {product.variations.length > 0 ? (
                  <button className='btn btn-lg btn-outline-secondary' style={{ flex: '1 1 auto' }} disabled={Object.keys(attributeValues).length === 0 && !sku} onClick={clearChoices}>
                    clear choices
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <pre>{JSON.stringify({ product: product.toJSON() }, null, 2)}</pre> */}
      {/* <pre>{JSON.stringify({ woo: product.toWoo() }, null, 2)}</pre> */}
    </div>
  );
};

function formatPriceRange(range: { min: number; max: number }, currency = 'USD') {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  });

  const eq = range.min === range.max;
  const min = range.min > 0;
  const max = range.max > 0;

  if (eq && min) {
    return formatter.format(range.min);
  }
  if (min && max) {
    return [formatter.format(range.min), formatter.format(range.max)].join('-');
  }
  if (min) {
    return formatter.format(range.min);
  }
  if (max) {
    return formatter.format(range.max);
  }
  return '';
}

const MasterPrices = ({ price }: { price: Price }) => {
  const sale = formatPriceRange(price.sale);
  const reg = formatPriceRange(price.regular);

  return (
    <>
      {sale ? <h3>Sale: {sale}</h3> : null}
      {reg ? <h3>Reg: {reg}</h3> : null}
    </>
  );
};
