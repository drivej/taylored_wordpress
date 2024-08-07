import * as React from 'react';
import { IAjaxQuery, IWordpressAjaxParams } from '../models';
import { fetchWordpressAjax } from '../utils/fetchWordpressAjax';
import { useWordpressAjax } from '../utils/useWordpressAjax';
import { LoadingPage } from './LoadingPage';

interface IBrandsResponse {
  data: { id: string; allowed: boolean; name: string; Xattributes: { name: string } }[];
  meta: { allowed: string[] };
}

type IBrandQuery = IAjaxQuery & { supplier_key: string; func: string; args?: unknown[] };

export const SupplierBrandsPage = ({ supplier_key }: { supplier_key: string }) => {
  const query: IBrandQuery = {
    action: 'ci_api_handler',
    cmd: 'supplier_action',
    supplier_key,
    func: 'get_brands'
  };

  const brands = useWordpressAjax<IBrandsResponse>(query);
  const [allowedBrandIds, setAllowedBrandIds] = React.useState([]);

  React.useEffect(() => {
    if (brands.isSuccess) {
      setAllowedBrandIds(brands.data.meta.allowed);
    }
  }, [brands.data]);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const input: IWordpressAjaxParams = { action: '' };
    formData.forEach((value, key) => (input[key] = value));
    const brand_ids = Array.from($brandsSelect.current.selectedOptions).map(({ value }) => value);

    fetchWordpressAjax<IBrandsResponse, IBrandQuery>({
      action: 'ci_api_handler',
      cmd: 'supplier_action',
      supplier_key,
      func: 'set_allowed_brand_ids',
      args: [JSON.stringify(brand_ids), 'TEST']
    }).then((result) => {
      setAllowedBrandIds(result.meta.allowed);
    });
  };

  const $brandsSelect = React.useRef<HTMLSelectElement>(null);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const checked = e.currentTarget.checked;
    const brandId = e.currentTarget.dataset.brandid;
    $brandsSelect.current.options.namedItem(e.currentTarget.value).selected = checked;

    setAllowedBrandIds((ids) => {
      const i = ids.indexOf(brandId);
      let output = [...ids];
      if (checked) {
        if (i === -1) {
          output.push(brandId);
        }
      } else {
        if (i > -1) {
          output.splice(i, 1);
        }
      }
      return output;
    });
  };

  if (brands.isSuccess) {
    return (
      <div>
        <form onSubmit={onSubmit} className='d-flex flex-column gap-4'>
          <select className='d-none w-100' ref={$brandsSelect} name='brand_ids' multiple>
            {brands?.data?.data?.map((brand) => {
              const checked = allowedBrandIds.includes(brand.id);
              return (
                <option id={`option_brand_${brand.id}`} value={brand.id} selected={checked}>
                  {brand.name} {brand.id}
                </option>
              );
            })}
          </select>

          <div>
            <div className='d-grid' style={{ gridTemplateColumns: '1fr 1fr' }}>
              <h5>All Brands</h5>
              <h5>Selected Brands</h5>
            </div>
            <div className='d-grid gap-2' style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className='border rounded shadow-sm p-2' style={{ overflow: 'auto', maxHeight: '70vh' }}>
                {brands?.data?.data?.map((brand) => {
                  const checked = allowedBrandIds.includes(brand.id);
                  // if (checked) return null;
                  return (
                    <div>
                      <input
                        className='d-none'
                        onChange={onChange} //
                        id={`brand_${brand.id}`}
                        type='checkbox'
                        checked={checked}
                        name={brand.name}
                        value={`option_brand_${brand.id}`}
                        data-brandid={brand.id}
                      />
                      <label htmlFor={`brand_${brand.id}`} className={`Xbrands_item ${checked ? 'fw-bold' : 'text-body-tertiary'}`}>
                        {brand.name}
                      </label>
                    </div>
                  );
                })}
              </div>
              <div className='border rounded shadow-sm p-2' style={{ overflow: 'auto', maxHeight: '70vh' }}>
                {brands?.data?.data?.map((brand) => {
                  const checked = allowedBrandIds.includes(brand.id);
                  if (!checked) return null;
                  return (
                    <div>
                      <input
                        className='d-none'
                        onChange={onChange} //
                        id={`brand_${brand.id}`}
                        type='checkbox'
                        checked={checked}
                        name={brand.name}
                        value={`option_brand_${brand.id}`}
                        data-brandid={brand.id}
                      />
                      <label htmlFor={`brand_${brand.id}`} className='Xbrands_item fw-bold'>
                        {brand.name}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* <div className='brands_container'>
            {brands?.data?.data?.map((brand) => {
              const checked = allowedBrandIds.includes(brand.id);
              return (
                <>
                  <input
                    onChange={onChange} //
                    id={`brand_${brand.id}`}
                    type='checkbox'
                    checked={checked}
                    name={brand.name}
                    value={`option_brand_${brand.id}`}
                    data-brandid={brand.id}
                  />
                  <label htmlFor={`brand_${brand.id}`} className='brands_item'>
                    {brand.name}
                  </label>
                </>
              );
            })}
          </div> */}

          <div>
            <button className='btn btn-primary w-100'>Save</button>
          </div>
        </form>
      </div>
    );
  }

  return <LoadingPage />;
};
