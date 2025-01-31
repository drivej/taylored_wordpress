<?php
namespace CIStore\Ajax;

use CIStore\Suppliers;

include_once CI_STORE_PLUGIN . 'utils/WooTools.php';
include_once CI_STORE_PLUGIN . 'suppliers/Suppliers.php';

// function load_next_brand_page(&$query)
// {
//     /** @var \Supplier_T14 $supplier */
//     $supplier = WooTools:: get_supplier('t14');

//     $query['count'] = 0;
//     $query['has_more'] = false;

//     if (!array_key_exists('data', $query)) {
//         $query['data'] = [];
//     }

//     if ($query['page_index'] <= $query['total_pages']) {
//         $brand_id = $query['brand_ids'][$query['brand_index']];
//         $items = $supplier->get_products_page_ext(['brand_id' => $brand_id, 'page' => $query['page_index']]);
//         foreach ($items['data'] as $i => $item) {
//             $query['data'][] = $item['id'] . ' ' . $item['attributes']['product_name'];
//         }
//         $query['count'] = count($query['data']);
//         $query['total_pages'] = $items['meta']['total_pages'];
//     }
//     $query['page_index']++;

//     if ($query['page_index'] > $query['total_pages']) {
//         $query['total_pages'] = 1;
//         $query['page_index'] = 1;
//         $query['brand_index']++;
//     }
//     $has_more = $query['brand_index'] < count($query['brand_ids']);

//     return $has_more;
// }

// function getAllPages($path)
// {
//     /** @var \Supplier_T14 $supplier */
//     $supplier = WooTools:: get_supplier('t14');
//     $page = 1;
//     $total_pages = 1;
//     $data = [];

//     while ($page <= $total_pages) {
//         $items = $supplier->get_api($path, ['page' => $page]);
//         $a = array_map(fn($item) => $item['id'], $items['data']);
//         $total_pages = $items['meta']['total_pages'];
//         $data = [ ...$data, ...$a];
//         $page++;
//     }
//     sort($data);
//     return ['meta' => $items['meta'], 'data' => $data];
// }

//
//
//

// function doShit($a) {
//     error_log('fucking shit happening ' . $a);
// }

// add_action('doShit', __NAMESPACE__ . '\\doShit', 10, 1);

// function test_action() {
//     do_action('doShit', 'test');
//     $success = wp_schedule_single_event(time() + 5, 'doShit', ['frog']);
//     error_log('schedule');
//     return ['success' => $success];
// }

//
//
//
/*

[2025-01-25 19:03:17] import_products_page {"is_valid":true,"cursor":"7A5MLdbBM8q2","updated_at":"2023-01-01","count":32,"all":3853,"api":1748,"process":2105,"item":120}
[2025-01-25 19:03:27] import_products_page {"is_valid":true,"cursor":"5pO0ymkP0bqW","updated_at":"2023-01-01","count":32,"all":4994,"api":2158,"process":2836,"item":156}
[2025-01-25 19:03:38] error_string: Invalid taxonomy.
[2025-01-25 19:03:38] error_string: Invalid taxonomy.
[2025-01-25 19:03:38] error_string: Invalid taxonomy.
[2025-01-25 19:03:38] error_string: Invalid taxonomy.
[2025-01-25 19:03:38] error_string: Invalid taxonomy.
[2025-01-25 19:03:38] error_string: Invalid taxonomy.
[2025-01-25 19:03:38] 2 Undefined array key "Green" /Users/jasoncontento/Local Sites/tayloredlocal/app/public/wp-content/plugins/ci-store-plugin/suppliers/wps/Supplier_WPS_Attributes.php 422
[2025-01-25 19:03:38] 2 Undefined array key "Silver" /Users/jasoncontento/Local Sites/tayloredlocal/app/public/wp-content/plugins/ci-store-plugin/suppliers/wps/Supplier_WPS_Attributes.php 422
[2025-01-25 19:03:38] 2 Undefined array key "Silver" /Users/jasoncontento/Local Sites/tayloredlocal/app/public/wp-content/plugins/ci-store-plugin/suppliers/wps/Supplier_WPS_Attributes.php 422
[2025-01-25 19:03:38] 2 Undefined array key "Green" /Users/jasoncontento/Local Sites/tayloredlocal/app/public/wp-content/plugins/ci-store-plugin/suppliers/wps/Supplier_WPS_Attributes.php 422
[2025-01-25 19:03:38] 2 Undefined array key "Silver" /Users/jasoncontento/Local Sites/tayloredlocal/app/public/wp-content/plugins/ci-store-plugin/suppliers/wps/Supplier_WPS_Attributes.php 422
[2025-01-25 19:03:38] 2 Undefined array key "Silver" /Users/jasoncontento/Local Sites/tayloredlocal/app/public/wp-content/plugins/ci-store-plugin/suppliers/wps/Supplier_WPS_Attributes.php 422
[2025-01-25 19:03:38] 2 Undefined array key "Orange" /Users/jasoncontento/Local Sites/tayloredlocal/app/public/wp-content/plugins/ci-store-plugin/suppliers/wps/Supplier_WPS_Attributes.php 422
[2025-01-25 19:03:38] 2 Undefined array key "Black" /Users/jasoncontento/Local Sites/tayloredlocal/app/public/wp-content/plugins/ci-store-plugin/suppliers/wps/Supplier_WPS_Attributes.php 422
[2025-01-25 19:03:38] 2 Undefined array key "Black" /Users/jasoncontento/Local Sites/tayloredlocal/app/public/wp-content/plugins/ci-store-plugin/suppliers/wps/Supplier_WPS_Attributes.php 422

*/

function get_products_by_terms()
{
    // Ensure the response is JSON
    header('Content-Type: application/json');

    $data = []; // Initialize the output array

    // Get all product taxonomies
    $product_taxonomies = wc_get_attribute_taxonomies();

    if (! empty($product_taxonomies)) {
        foreach ($product_taxonomies as $taxonomy) {
            $taxonomy_name = 'pa_' . $taxonomy->attribute_name;

            // Get all terms for this taxonomy
            $terms = get_terms([
                'taxonomy'   => $taxonomy_name,
                'hide_empty' => false,
            ]);

            $taxonomy_data = []; // Store terms and products for this taxonomy

            if (! empty($terms) && ! is_wp_error($terms)) {
                foreach ($terms as $term) {
                    // Query products for this term
                    $products = wc_get_products([
                        'limit'     => -1,
                        'status'    => 'publish',
                        'tax_query' => [
                            [
                                'taxonomy' => $taxonomy_name,
                                'field'    => 'term_id',
                                'terms'    => $term->term_id,
                            ],
                        ],
                    ]);

                    // Extract product names
                    $product_names = [];
                    if (! empty($products)) {
                        foreach ($products as $product) {
                            $product_names[] = $product->get_name();
                        }
                    }

                    // Add term data
                    $taxonomy_data[] = [
                        'term'     => $term,
                        // 'term_name' => $term->name,
                        // 'term_id' => $term->term_id,
                        // 'term_slug' => $term->slug,
                        'products' => $product_names,
                    ];
                }
            }

            // Add taxonomy data
            $data[$taxonomy_name] = $taxonomy_data;
        }
    }

    // Send the data as JSON
    return $data;
}

// Hook the function to a custom AJAX endpoint (for testing or live use)
// add_action('wp_ajax_get_products_by_terms', 'get_products_by_terms');
// add_action('wp_ajax_nopriv_get_products_by_terms', 'get_products_by_terms');

function test_action()
{
    /** @var Supplier_T14 $supplier */
    $supplier = Suppliers\get_supplier('t14');

    // $p = 18.199999999999999;
    // return number_format($p, 2, '.', '');
    // $brands = $supplier->get_api('/brands');

    $brand_id = 461; //464;
                     // $pricegroup_id = 1068;

    return $supplier->import_brand($brand_id, 60, 24);
    return $supplier->get_all_pages("/items/brand/{$brand_id}");
    return $supplier->get_api("/items/brand/{$brand_id}/pricegroup");

    // return $supplier->get_all_pages("/items/data/brand/{$brand_id}/pricegroup/{$pricegroup_id}");
    // return $supplier->get_brands(true);
    // return $supplier->get_brand_info($brand_id);
    // $items = $supplier->get_all_pages("/items/brand/{$brand_id}");
    // // return $items;

    // $groups = [];
    // foreach ($items['data'] as $item) {
    //     $price_group = $item['attributes']['price_group_id'];
    //     if (! isset($groups[$price_group])) {
    //         $groups[$price_group] = ['price_group' => $item['attributes']['price_group'], 'variations' => []];
    //     }
    //     $groups[$price_group]['variations'][] = ['name' => $item['attributes']['part_description'], 'product_name' => $item['attributes']['product_name']];
    // }
    // return $groups;

    // $all = $supplier->get_brand_items($brand_id);
    // return $all;

    // $result = \WooTools::attachment_urls_to_postids(['https://d32vzsop7y1h3k.cloudfront.net/9657ae56388e7d86cf2320547d4a3fe6.png']);
    // return $result;

    // return $supplier->get_all_brand_data(461);

    // return ['all' => count($all['data']), 'report' => $report];
    // return $supplier->get_brands_info();

    return $supplier->get_brands_info();

    $item_id = 597652;
    $data    = $supplier->get_api("/pricing/{$item_id}");
    $price   = $supplier->get_price($item_id);
    return ['price' => $price, 'data' => $data];
    // return $supplier->get_allowed_brand_ids();

    // $brand_id = 461;
    // return $supplier->get_api("/items/brand/{$brand_id}", ["page" => 3]);

    // return $supplier->get_total_items('/items');
    // return $supplier->get_total_remote_products();
    // return $supplier->prepare_brands();
    // return $supplier->get_brands_info();
    // return $supplier->get_total_items('/items/brand/461');
    // 1798
    $b1         = $supplier->get_api('/items/brand/461', ['page' => 1]);
    $b1['data'] = array_values(array_slice($b1['data'], 0, 10));
    return $supplier->process_page($b1);

    $b2 = $supplier->get_api('/items/brand/461', ['page' => 2]);
    return ['test' => count(array_unique(array_map(fn($e) => $e['id'], [ ...$b1['data'], ...$b2['data']]))), 'auto' => $supplier->get_total_items('/items/brand/461')];
    return count($b1['data']);

    $im   = $supplier->get_importer();
    $args = $im->getBaseInfo();
    // return $args;
    return $im->do_process($args);

    // $im->log(['val'=>'test']);
    return $im->before_start(['args' => ['days' => 1]]);

    // return get_products_by_terms();

    /** @var Supplier_WPS $supplier */
    $supplier = \CIStore\Suppliers\get_supplier('wps');

    // $importer = $supplier->get_importer();
    // return ['info' => $importer->get_import_info(), 'hooks' => $supplier->get_importer_hook_status()];

    $cursor     = '5pO0ymkP0bqW';
    $updated_at = '2023-01-01';
    $items      = $supplier->import_products_page($cursor, $updated_at);
    return $items;

    $query = [];
    $supplier->load_next_brand_page($query);
    return $query;
    $total        = $supplier->get_total_remote_products();
    $brands       = $supplier->get_allowed_brand_ids();
    $brands_count = [];
    $brands_total = 0;
    foreach ($brands as $brand_id) {
        $brands_1                = $supplier->get_products_page_ext(['brand_id' => $brand_id, 'page' => 1]);
        $page                    = $brands_1['meta']['total_pages'];
        $brands_n                = $supplier->get_products_page_ext(['brand_id' => $brand_id, 'page' => $page]);
        $total                   = ($page - 1) * count($brands_1['data']) + count($brands_n['data']);
        $brands_count[$brand_id] = $total;
        $brands_total += $total;
    }
    return ['brands' => $brands_count, 'total' => $brands_total];

    // $attr = $supplier->process_product_attributes($product['data']);
    return [
        'brands'   => $brands,
        'total'    => $total,
        'product'  => ['count' => count($product['data']), 'meta' => $product['meta']],
        'product2' => ['count' => count($product2['data']), 'meta' => $product2['meta']],
    ];

//     $result = [];
//     global $wp_filter;
//     return $wp_filter;

//     // return ['hook' => $hook, 'error' => has_action($hook)];

//     $hooks = hookReport($supplier);
//     $hook  = $hooks['import_start_hook'];
//     $has   = has_action($hook);

//     return $hook;

//     if (has_action($hook)) {
//         do_action($hook, [
//             'updated_at'  => '2023-01-01',
//             'cursor'      => '',
//             'import_type' => 'import',
//         ]);
//     }

//     return $hooks;

//     return ['hooks' => $hooks, 'hook' => $hook, 'has' => $has];

//     return $supplier->import_product('302380');

//     // $product                   = $test_data['data'][0];
//     // $product_attributes        = $supplier->process_product_attributes($product); // NEW
//     // $product_attributes_lookup = $supplier->build_attributes_lookup($product_attributes);

//     // foreach ($product['items']['data'] as $variation) {
//     //     $res                      = $supplier->process_varition_attributes($variation, $product_attributes_lookup);
//     //     $result[$variation['id']] = $res;
//     // }
//     // return $result;
//     // $valid_items        = $supplier->getValidItems($product);
//     // return $valid_items;
//     // $lookup_attribute_slug = $supplier->get_attributes_from_product($product);
//     // return $lookup_attribute_slug;

//     // $items = $supplier->process_items_native($test_data);
//     // return ['count' => count($items['data']), 'all' => $items];

//     $items = $supplier->import_products_page('GbW0vw89YB1k', '2023-01-01');
//     return $items;
//     // $items = $supplier->get_products_page('GbW0vw89YB1k', 'pdp', '2023-01-01');

//     /** @var Supplier_T14 $supplier */
//     $supplier = WooTools:: get_supplier('t14');

//     $brand_id = 461;

//     $result = $supplier->get_api('/items/updates', ['page' => 2, 'days' => 2]);
//     // return $result['meta'];
//     return array_map(fn($item) => $item['id'], $result['data']);

//     return $supplier->get_all_brand_data($brand_id);
//     // $page = 1;
//     // $args = ['page' => $page];

//     // $items = $supplier->getAllPages("/items/brand/{$brand_id}");
//     // $items_data = $supplier->getAllPages("/items/data/brand/{$brand_id}");
//     // $items_pricing = $supplier->getAllPages("/pricing/brand/{$brand_id}");
//     // $items_fitment = $supplier->getAllPages("/items/fitment/brand/{$brand_id}");

//     // return $items;
//     // $items = $supplier->get_api("/items/brand/{$brand_id}", $args);
//     // $items_data = $supplier->get_api("/items/data/brand/{$brand_id}", $args);
//     // $items_pricing = $supplier->get_api("/pricing/brand/{$brand_id}", $args);
//     // $items_fitment = $supplier->get_api("/items/fitment/brand/{$brand_id}", $args);

//     // return [
//     //     'items' => $items, //count($items['data']),
//     //     'items_data' => $items_data, //count($items_data['data']),
//     //     'items_pricing' => $items_pricing, //count($items_pricing['data']),
//     //     'items_fitment' => $items_fitment, //count($items_fitment['data']),
//     // ];

//     // $allowed_brands = $supplier->get_allowed_brand_ids();
//     // $all = [];
//     // $total = 0;

//     $query = [];

//     while ($supplier->load_next_brand_page($query));

//     return $query;

//     // foreach ($allowed_brands as $i => $brand_id) {
//     //     $total_pages = 1;
//     //     $page = 0;
//     //     while ($page < $total_pages) {
//     //         $page++;
//     //         $items = $supplier->get_products_page_ext(['brand_id' => $brand_id, 'page' => $page]);

//     //         foreach ($items['data'] as $ii => $item) {
//     //             $all[] = $item['id'] . ' ' . $item['attributes']['product_name'];
//     //         }
//     //         $total_pages = $items['meta']['total_pages'];
//     //         $total += count($items['data']);
//     //     }
//     // }
//     // return ['count' => $total, 'data' => $all];

//     return $supplier->get_products_page_ext(['brand_id' => 461]);
//     return $supplier->import_products_page(6);
//     return $supplier->get_product('078595');
//     return $supplier->get_products_page(1, 1);

//     // return $supplier->get_total_remote_products(1);

//     $supplier = WooTools:: get_supplier('wps');

//                                      // $supplier_product_id = '663';
//                                      // $supplier_product_id = '381514';
//                                      // $supplier_product_id = '369908';
//     $supplier_product_id = '208187'; // '169113';
//     return $supplier->import_product($supplier_product_id);

//     // 1NVMzzG6MRdg - broke
//     $cursor = 'qZkejkbnMoLK';
//     // return $supplier->get_products_page($cursor, 'pdp', '2023-01-01');
//     // return $supplier->import_products_page($cursor);

//     $product = $supplier->get_product($supplier_product_id, 'pdp');
//     // return $product;
//     // return $supplier->get_attributes_from_product($product['data']);
//     // return $supplier->process_product_attributes($product['data']);
//     // return $product;

//     $sku    = $supplier->get_product_sku($supplier_product_id);
//     $woo_id = wc_get_product_id_by_sku($sku);

//     if ($woo_id) {

//         $woo_product = new \WC_Product_Variable($woo_id);

//         $product_attributes = $supplier->process_product_attributes($product['data']);                  // NEW
//                                                                                                         // return ['product_attributes' => $product_attributes, 'product' => $product];
//         $product_attributes_lookup      = $supplier->build_attributes_lookup($product_attributes);      // NEW
//         $product_attributes_lookup_slug = array_column($product_attributes, 'slug', 'key');             // NEW
//         $woo_attributes                 = $supplier->build_woo_product_attributes($product_attributes); // NEW

//         // $skus = [];
//         // $attr = new \WC_Product_Attribute();
//         // $attr->set_name('SKU');
//         // $attr->set_options(implode(' | ',$skus));
//         // $attr->set_visible(1);
//         // $attr->set_variation(1);
//         // $attr->set_position(10);
//         // $attrs['sku'] = $attr;

//         // $attrs = [];
//         // foreach($woo_attributes as $key => $attr){
//         //     $attrs[$key] = $attr->get_data();
//         // }
//         // return ['$woo_attributes' => $attrs];

//         $woo_product->set_attributes($woo_attributes); // NEW

//         $woo_product->save();

//         foreach ($product['data']['items']['data'] as $i => $variation) {
//             $variation_sku    = $supplier->get_variation_sku($supplier_product_id, $variation['id']);
//             $variation_woo_id = wc_get_product_id_by_sku($variation_sku);

//             $result[$variation_sku] = [];

//             if ($variation_woo_id) {
//                 $woo_variation = new \WC_Product_Variation($variation_woo_id);

//                 $supplier->clean_prXoduct_attributes($variation_woo_id); // optional for initial cleanup

//                 $variation_attributes = $supplier->process_varition_attributes($variation, $product_attributes_lookup);
//                 // $result[$variation_sku] = [
//                 //     'variation_attributes' => $variation_attributes,
//                 //     'current' => $woo_variation->get_attributes(),
//                 // ];

//                 foreach ($variation_attributes as $key => $term) {
//                     $term_id    = $term['id'];
//                     $term_value = $term['value'];
//                     $slug       = $product_attributes_lookup_slug[$key];
//                     wp_set_object_terms($variation_woo_id, $term_id, $key, true);
//                     $woo_variation->update_meta_data("attribute_{$slug}", $term_value);
//                     $result[$variation_sku]["attribute_{$slug}"] = $term_value;
//                     // $result[$variation_sku][$slug] = "attribute_{$slug}";
//                 }

//                 // $woo_variation->set_attributes($variation_attributes);
//                 $woo_variation->update_meta_data('attribute_sku', $variation['sku'], true);
//                 $woo_variation->save();
//                 // $result[$variation_sku] = process_varition_attributes($variation, $product_attributes_lookup);
//             } else {
//                 $result[$variation_sku] = $variation_woo_id;
//             }
//         }
//         $result['product_attributes'] = $product_attributes;
//         $result['product']            = $product;
//     }

//     return $result;

//     $supplier_product_id = $product['data']['id'];
//     $woo_product         = $supplier->get_woo_product($supplier_product_id);

//     return $woo_product->get_children();
//     $result['woo_product'] = $woo_product->get_attributes();

//     $attributes = $variation->get_attributes();

// // Set the new attribute using the term ID
//     $attributes[$taxonomy] = $term_ids[0]; // Attach the first term ID (single value)

// // Update the variation with the new attributes
//     $variation->set_attributes($attributes);

//     return $taxonomy;
}
