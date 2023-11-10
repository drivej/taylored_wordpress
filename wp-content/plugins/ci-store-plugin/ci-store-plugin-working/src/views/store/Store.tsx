import * as csv from 'csvtojson';
import * as JsSearch from 'js-search';
import * as React from 'react';
import { useContext, useEffect, useMemo, useState } from 'react';
import { MessageContext } from '../../components/Message';
import { TuckerProduct } from '../../utils/TuckerProduct';
import { TuckerProducts } from '../../utils/TuckerProducts';
import './store.css';

// TODO: MASTER_WPS_447784 has an issue - make sure we can only add products that have valid variations

export const Store = () => {
  const [store, setStore] = useState<TuckerProducts>(new TuckerProducts([]));
  const [term, setTerm] = useState('');
  // const search = useRef(new JsSearch.Search('sku')); //.indexStrategy = new JsSearch.AllSubstringsIndexStrategy();
  const [products, setProducts] = useState([]);
  const message = useContext(MessageContext);

  const search = useMemo(() => {
    const e = new JsSearch.Search('sku');
    e.indexStrategy = new JsSearch.AllSubstringsIndexStrategy();
    e.addIndex('haystack');
    return { current: e };
  }, []);

  useEffect(() => {
    csv()
      .fromString(window.localStorage.getItem('storeContent') ?? '')
      .then((jsonObj) => {
        setStore(TuckerProducts.fromJson(jsonObj, { imageRoot: '/downloads' }));
        message.hide();
      });
  }, []);

  useEffect(() => {
    // if (search.current) {
    //   search.current.indexStrategy = new JsSearch.AllSubstringsIndexStrategy();
    // search.current.addIndex('haystack');
    const docs = [...store.masterProducts, ...store.simpleProducts].map((p) => ({
      haystack: [p.sku, p.type, p.properties.product_name, p.properties.desc, p.properties.bullet_text, p.properties.tucker_item, ...p.variations.map((v) => v.sku)].join(' '),
      sku: p.sku
    }));
    search.current.addDocuments(docs);
    setProducts([...store.masterProducts, ...store.simpleProducts]);
    // }
  }, [store]);

  useEffect(() => {
    if (term) {
      const results = search.current.search(term) as { sku: string }[];
      const skus = new Set(results.map((r) => r.sku));
      setProducts([...store.masterProducts, ...store.simpleProducts].filter((p) => skus.has(p.sku)));
    } else {
      setProducts([...store.masterProducts, ...store.simpleProducts]);
    }
  }, [term]);

  if (store.products.length > 0) {
    return (
      <div>
        <div className='p-4'>
          <div className='input-group mx-auto' style={{ maxWidth: 500 }}>
            <span className='input-group-text'>Search</span>
            <input
              className='form-control'
              value={term}
              onChange={(e) => {
                setTerm(e.currentTarget.value);
              }}
            />
            <span className='input-group-text'>{products.length} Products</span>
          </div>
        </div>
        <div className='store'>
          {products.map((p) => {
            return <Product key={p.sku} data={p} />;
          })}
          <div className='product'></div>
          <div className='product'></div>
          <div className='product'></div>
          <div className='product'></div>
          <div className='product'></div>
          <div className='product'></div>
          <div className='product'></div>
        </div>
      </div>
    );
  }
  return <div>loading...</div>;
};

const Product = ({ data }: { data: TuckerProduct }) => {
  const [selectedImage, setSelectedImage] = useState(data.images[0]);
  const [attributes, setAttributes] = useState(data.isSimple ? {} : data.attributes.reduce((o, a) => ({ ...o, [a.slug]: { ...a, value: a.values[0] } }), {}));
  const [variation, setVariation] = useState<TuckerProduct>(data);

  const selectAttribute = (slug: string, value: string) => {
    setAttributes((oldAttrs) => {
      const attrs = { ...oldAttrs };
      attrs[slug].value = value;
      return attrs;
    });
  };

  useEffect(() => {
    const found = data.variations.find((v) => data.attributes.filter((attr) => v.getAttribute(attr.slug)?.value === attributes[attr.slug].value).length === data.attributes.length);
    setVariation(found ?? data);
  }, [attributes]);

  useEffect(() => {
    setSelectedImage(variation.images[0]);
  }, [variation]);

  return (
    <div className='product card'>
      <div className='card-body' style={{ flex: '0 1 auto' }}>
        <div>{selectedImage ? <img src={selectedImage} className='product-image' /> : <div className='product-image'>no image</div>}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {variation.images.map((img, i) => (
            <img key={`${data.sku}_img_${i}`} src={img} style={{ width: 40, height: 40, objectFit: 'contain' }} onClick={() => setSelectedImage(img)} />
          ))}
        </div>
      </div>
      <div className='card-body' style={{ flex: '0 1 auto' }}>
        <div>
          <h4>{data.properties.product_name}</h4>
          <p>{data.sku}</p>
          {data.isMaster ? <p>{variation?.sku ?? 'select'}</p> : null}
        </div>
      </div>
      <div className='card-body' style={{ flex: '0 1 auto' }}>
        <div>
          {data.isMaster
            ? data.attributes.map((attr, i) => {
                return (
                  <div key={`${data.sku}_attr_${i}`} className='input-group mb-1'>
                    <label className='input-group-text' style={{ display: 'flex', alignItems: 'center' }}>
                      {attr.slug}
                    </label>
                    <select className='form-select' name={attr.slug} onChange={(e) => selectAttribute(attr.slug, e.currentTarget.value)}>
                      {attr.values.map((val, ii) => (
                        <option key={`${data.sku}_attr_${i}_${ii}`} value={val}>
                          {val}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })
            : null}
        </div>
      </div>

      {!data.isSimple && variation.sku === data.sku ? <div className='danger'>This is not available</div> : null}

      <div className='card-body' style={{ flex: '0 1 auto' }}>
        <p>{data.properties.desc}</p>
      </div>

      <div className='card-body' dangerouslySetInnerHTML={{ __html: data.getBulletHTML() }}></div>
    </div>
  );
};
