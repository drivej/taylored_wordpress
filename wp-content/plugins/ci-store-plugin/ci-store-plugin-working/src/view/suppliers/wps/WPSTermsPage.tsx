import * as React from 'react';
import { useMemo, useState } from 'react';
import { ISupplierActionQuery } from '../../../utilities/StockPage';
import { useWordpressAjax } from '../../../utils/useWordpressAjax';

const useTermMap = () => {
  const query: ISupplierActionQuery = {
    action: 'ci_api_handler', //
    cmd: 'supplier_action',
    supplier_key: 'wps',
    func: 'get_wps_term_slugs'
  };
  return useWordpressAjax<unknown>(query);
};

const useCategoryCount = () => {
  const query: ISupplierActionQuery = {
    action: 'ci_api_handler', //
    cmd: 'supplier_action',
    supplier_key: 'wps',
    func: 'get_woo_product_category_counts'
  };
  return useWordpressAjax<{ id: number; count: number; name: string }[]>(query);
};

const useWPSCategoryCount = () => {
  const query: ISupplierActionQuery = {
    action: 'ci_api_handler', //
    cmd: 'supplier_action',
    supplier_key: 'wps',
    func: 'get_wps_product_category_counts'
  };
  return useWordpressAjax<{ id: number; count: number; name: string }[]>(query);
};

export const WPSTermsPage = () => {
  const query: ISupplierActionQuery = {
    action: 'ci_api_handler', //
    cmd: 'supplier_action',
    supplier_key: 'wps',
    func: 'refresh_taxonomy',
    func_group: 'importer'
  };
  const [enabled, setEnabled] = useState(false);
  const importTaxonomy = useWordpressAjax<unknown>(query, { enabled });
  // const termMap = useTermMap();

  //   useEffect(() => {
  //     if (importTaxonomy.isSuccess && !importTaxonomy.isLoading) {
  //       setEnabled(false);
  //     }
  //   }, [importTaxonomy.isSuccess, importTaxonomy.isLoading]);

  return (
    <div>
      <button className='btn btn-sm btn-primary' disabled={enabled} onClick={() => setEnabled(true)}>
        Import Terms
      </button>
      <br />
      <br />
      <p>{importTaxonomy.isSuccess ? 'Taxonomy Updated.' : 'Click to update taxonomy.'}</p>

      {/* <pre>{JSON.stringify({ categoryCounts }, null, 2)}</pre> */}
      <TermsTree />
    </div>
  );
};

type ITerm = { id: number; parent_id: number; name: string; depth: number; children?: ITerm[]; woo_id?: number; count?: number; supplierCount?: number };

const TermsTree = () => {
  const termMap = useTermMap();
  const categoryCounts = useCategoryCount();
  const supplierCounts = useWPSCategoryCount();

  const query: ISupplierActionQuery = {
    action: 'ci_api_handler', //
    cmd: 'supplier_action',
    supplier_key: 'wps',
    func: 'get_all_terms',
    func_group: 'importer'
  };
  // const [enabled, setEnabled] = useState(false);
  const terms = useWordpressAjax<ITerm[]>(query);
  // const [tree, setTree] = useState<ITerm[]>([]);
  const tree = useMemo(() => {
    if (categoryCounts.isSuccess && terms.isSuccess && termMap.isSuccess && supplierCounts.isSuccess) {
      return buildTree(terms.data);
    }
    return [];
  }, [terms.isSuccess, termMap.isSuccess, categoryCounts.isSuccess, supplierCounts.isSuccess]);

  function buildTree(terms: ITerm[], parentId: number = null) {
    if (parentId === null) {
      terms.sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0));
      terms.forEach((t) => {
        t.woo_id = termMap.data[t.id];
        t.count = categoryCounts.data.find((c) => c.id === t.woo_id)?.count ?? 0;
        t.supplierCount = supplierCounts.data.find((c) => c.id === t.id)?.count ?? 0;
      });
    }
    return terms
      .filter((term) => term.parent_id === parentId)
      .map((term) => ({
        ...term,
        children: buildTree(terms, term.id)
      }));
  }

  // useEffect(() => {
  //   if (terms.isSuccess) {
  //     setTree(buildTree(terms.data));
  //   }
  // }, [terms.isSuccess]);
  return (
    <div className='term-tree-container'>
      <ul>
        <li>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label data-depth='0'>Categories</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ minWidth: '10ch', textAlign: 'right' }}>Supplier</div>
              <div>|</div>
              <div style={{ minWidth: '10ch', textAlign: 'right' }}>Woo</div>
              <div>|</div>
              <div style={{ minWidth: '10ch', textAlign: 'right' }}>Woo ID</div>
              <div>|</div>
              <div style={{ minWidth: '10ch', textAlign: 'right' }}>Supplier ID</div>
            </div>
          </div>
        </li>
      </ul>
      <Tree data={tree} />
    </div>
  );

  // return <pre>{JSON.stringify({ tree, terms }, null, 2)}</pre>;
};

const Tree = ({ data, depth = 0 }: { data: ITerm[]; depth?: number }) => {
  // well, well... the depth value from WPS is unreliable
  if (!data || data.length === 0) return null;

  return (
    <ul>
      {data.map((node) => (
        <li key={node.id} data-depth={depth} data-ref={JSON.stringify({ ...node, children: node.children.length })}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label data-depth={depth}>{node.name}</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ minWidth: '10ch', textAlign: 'right' }}>{node.supplierCount}</div>
              <div>|</div>
              <div style={{ minWidth: '10ch', textAlign: 'right' }}>{node.count}</div>
              <div>|</div>
              <div style={{ minWidth: '10ch', textAlign: 'right' }}>{node.woo_id}</div>
              <div>|</div>
              <div style={{ minWidth: '10ch', textAlign: 'right' }}>{node.id}</div>
            </div>
          </div>
          {node.children && node.children.length > 0 && <Tree data={node.children} depth={depth + 1} />}
        </li>
      ))}
    </ul>
  );
};
