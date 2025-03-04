import * as React from 'react';
import { Pre } from './Pre';
import { AdminForm, SelectSupplier, TextInput } from './UtilitiesPage';

export const ProductsPage = () => {
  return (
    <>
      <AdminForm name='Get Product' cmd='supplier_action'>
        <SelectSupplier />
        <TextInput name='func' defaultValue='get_product' hidden={true} />
        <TextInput name='args[0]' defaultValue='' placeholder='Supplier Product ID...' />
      </AdminForm>

      <AdminForm name='Import Product' cmd='supplier_action'>
        <SelectSupplier />
        <TextInput name='func' defaultValue='import_product' hidden={true} />
        <TextInput name='args[0]' defaultValue='' placeholder='Supplier Product ID...' />
      </AdminForm>

      <AdminForm name='Import Product Vehicles' cmd='supplier_action'>
        <SelectSupplier />
        <TextInput name='func' defaultValue='import_product_vehicles' hidden={true} />
        <TextInput name='args[0]' defaultValue='' placeholder='Supplier Product ID...' />
      </AdminForm>

      <AdminForm name='Match Product Vehicle' cmd='supplier_action'>
        <SelectSupplier />
        <TextInput name='func' defaultValue='match_product_vehicle' hidden={true} />
        <TextInput name='args[0]' defaultValue='' placeholder='Supplier Product ID...' />
        <TextInput name='args[1]' defaultValue='' placeholder='Supplier Vehicle ID...' />
      </AdminForm>

      {/* <AdminForm name='Get Product Attributes' cmd='supplier_action'>
        <SelectSupplier />
        <TextInput name='func' defaultValue='get_attributes_from_product_id' hidden={true} />
        <TextInput name='args[0]' defaultValue='' placeholder='Supplier ID...' />
      </AdminForm> */}

      {/* <AdminForm name='Get Product' cmd='get_product'>
        <SelectSupplier />
        <ProductInput />
        <CheckboxInput name='light' checked={false} />
      </AdminForm> */}

      {/* <AdminForm name='Update Product' cmd='update_product'>
        <SelectSupplier />
        <ProductInput />
      </AdminForm> */}
      {/* 
      <AdminForm name='Extract Product Tags' cmd='extract_product_tags'>
        <SelectSupplier />
        <ProductInput />
      </AdminForm> */}
      {/* 
      <AdminForm name='View Attributes' cmd='view_attributes' RenderResult={CSVTable}>
        <SelectSupplier />
        <ProductInput />
      </AdminForm> */}

      {/* <AdminForm name='View Variations' cmd='view_variations' RenderResult={VariationsTable}>
        <SelectSupplier />
        <ProductInput />
      </AdminForm> */}

      {/* <AdminForm name='WPS API' cmd='western_api' allowPolling={true}>
        <TextInput name='url' defaultValue='/' />
      </AdminForm> */}

      <AdminForm name='Supplier API' cmd='supplier_api'>
        <SelectSupplier />
        <TextInput name='url' defaultValue='/' />
      </AdminForm>

      {/* <AdminForm name='Test' cmd='test_action'></AdminForm> */}

      {/* <AdminForm name='Import Product' cmd='import_product'>
        <SelectSupplier />
        <ProductInput />
      </AdminForm> */}

      {/* <AdminForm name='Get Product Status' cmd='get_product_status' allowPolling={true}>
        <SelectSupplier />
        <ProductInput />
      </AdminForm> */}

      {/* <AdminForm name='Import Product Status' cmd='get_import_product_status' allowPolling={true}>
        <SelectSupplier />
        <ProductInput />
      </AdminForm> */}
    </>
  );
};
/*
[{"file":"https:\/\/cdn.wpsstatic.com\/images\/200_max\/80c4-63d80b8053eff.png","width":1962,"height":1962,"filesize":4970814},{"file":"https:\/\/cdn.wpsstatic.com\/images\/200_max\/a1f9-63d80b8043f94.png","width":1869,"height":1869,"filesize":4068106},{"file":"https:\/\/cdn.wpsstatic.com\/images\/200_max\/5aab-63d80b8067ef8.png","width":2011,"height":2011,"filesize":3380976},{"file":"https:\/\/cdn.wpsstatic.com\/images\/200_max\/5afa-63d80b8053baf.png","width":1523,"height":1523,"filesize":2687793}]
*/
const VariationsTable = ({ data }: { data: { rows: string[][] } }) => {
  const processData = (c: string) => {
    if (c) {
      if (typeof c === 'string' && c.indexOf('file') > -1) {
        try {
          const data = JSON.parse(c);
          return data.map((r) => <img src={r.file} style={{ width: 20, height: 20 }} />);
        } catch (err) {
          return c;
        }
      }
    }
    return c;
  };

  if (data?.rows && Array.isArray(data.rows)) {
    const rows = data?.rows ?? [];

    return (
      <>
        <table className='table table-sm border' style={{ fontSize: 11 }}>
          <thead>
            <tr>
              {rows[0].map((r) => (
                <td>{r}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(1).map((r) => (
              <tr>
                {r.map((c) => (
                  <td>{processData(c)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {/* <Pre data={data} /> */}
      </>
    );
  }

  return <Pre data={data} />;
};
