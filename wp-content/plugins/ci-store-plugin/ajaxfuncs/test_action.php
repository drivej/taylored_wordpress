<?php
namespace CIStore\Ajax;

include_once CI_STORE_PLUGIN . 'utils/WooTools.php';
include_once CI_STORE_PLUGIN . 'suppliers/Suppliers.php';
include_once CI_STORE_PLUGIN . 'utils/WooTools/WooTools_get_product_info_by_skus.php';
include_once CI_STORE_PLUGIN . 'utils/WooTools/WooTools_upsert_terms.php';
include_once CI_STORE_PLUGIN . 'utils/WooTools/WooTools_get_mem.php';
include_once CI_STORE_PLUGIN . 'utils/WooTools/WooTools_upsert_brand.php';
// include_once CI_STORE_PLUGIN . 'utils/WooTools/WooTools_empty_taxonomy.php';

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

function remove_duplicate_wps_items($items)
{
    $seen_ids        = []; // Stores unique product IDs
    $unique_products = []; // Stores filtered product list

    foreach ($items as $product) {
        $product_id = $product['id'];

        // Check if this ID has already been seen
        if (! isset($seen_ids[$product_id])) {
            $seen_ids[$product_id] = true;     // Mark ID as seen
            $unique_products[]     = $product; // Keep only the first occurrence
        }
    }

    return $unique_products;
}

function test_action()
{
    /** @var Supplier_WPS $supplier */
    $supplier = \CIStore\Suppliers\get_supplier('wps');

    $product_id = 31533;
    $vehicle_id = 6255;

    // return $supplier->get_api("/items/501664/vehicles", ['countOnly' => 'true']);

    return $supplier->match_product_vehicle($product_id, $vehicle_id);
   

    $product = $supplier->get_product(242142, 'pdp');
    return $supplier->normalize_products($product, true);
    // $items = $supplier->get_products_page('PNmYPgBl0J1W', 'pdp');
    // $items = $supplier->normalize_products($items, false);

    // foreach ($items['data'] as &$product) {
    //     if ($product['woo_id']) {
    //         $woo_product = wc_get_product($product['woo_id']);
    //         if ($woo_product) {
    //             $product['delete'] = $woo_product->delete(true);
    //         }
    //     }
    // }

    // return $supplier->import_products_page('PNmYPgBl0J1W', '');

    // return $items;

    // return $supplier->normalize_products($items, false);

    // return $supplier->import_products_page('PNmYPgBl0J1W', '');
    // return get_terms([
    //     'taxonomy'   => 'product_brand',
    //     'hide_empty' => false,
    // ]);
    // return get_taxonomy('product_brand');

    // return upsert_brand('honda');

    // $date          = \DateTime::createFromFormat("Y-m-d H:i:s", '2025-02-18 17:50:10', new \DateTimeZone('UTC'));
    // $formattedDate = $date->format("Y-m-d\TH:i:sP");
    // return ['f' => $formattedDate, 'c' => gmdate("c")];

    // return $supplier->get_api('/products/466587');
    // return $supplier->get_api('/items/387/vehicles', ['countOnly' => 'true']);

    // return $supplier->limit_vehicle_load();
    // $cursor = '';

    // $page_size = $supplier->limit_vehicle_load($cursor);
    // $params    = $supplier->get_vehicle_params($cursor, $page_size);
    // $page      = $supplier->get_api('/products', $params);

    // return $page;

    // $page_size = 10;

    // $page = $supplier->get_api('/products', [
    //     'page'    => [
    //         'cursor' => $cursor,
    //         'size'   => $page_size,
    //     ],
    //     'include' => 'items',
    //     'fields'  => [
    //         'products' => 'id,items',
    //         'items'    => 'id',
    //     ],
    // ]);

    // $supertotal   = 0;
    // $max_vehicles = 2000;
    // $max_count    = -1;

    // foreach ($page['data'] as $i => &$product) {
    //     $total        = 0;
    //     $product['i'] = $i;
    //     foreach ($product['items']['data'] as &$item) {
    //         $vehicles               = $supplier->get_api("/items/{$item['id']}/vehicles", ['countOnly' => 'true']);
    //         $subtotal               = $vehicles['data']['count'] ?? 0;
    //         $item['total_vehicles'] = $subtotal;
    //         $total                  = $total + $subtotal;
    //     }
    //     $product['total_vehicles'] = $total;
    //     $supertotal += $total;
    //     $product['supertotal'] = $supertotal;

    //     if ($supertotal > $max_vehicles && $max_count == -1) {
    //         $max_count      = $i;
    //         $product['max'] = $max_count;
    //     }
    // }

    // $page['meta']['max_count']  = $max_count;
    // $page['meta']['supertotal'] = $supertotal;
    // return ['meta' => $page['meta'], 'data' => $page['data']];

    // $page_size = $max_count + 1;

    // unset($vehicles);

    // $page = $supplier->get_api('/products', [
    //     'page'    => [
    //         'cursor' => $cursor,
    //         'size'   => $page_size,
    //     ],
    //     'include' => 'items',
    //     'fields'  => [
    //         'products' => 'id,items',
    //         'items'    => 'id',
    //     ],
    // ]);

    // $page['meta']['max_count']  = $max_count;
    // $page['meta']['supertotal'] = $supertotal;

    // return $page;

    // $terms = get_the_terms(407863, 'product_vehicle');
    // $info  = array_column($terms, 'term_id', 'slug');
    // return ['meta' => ['count' => count($info), 'data' => $info]];

    // return update_post_meta(379043, '_ci_product_id', 9235);
    // return update_post_meta(489470, '_ci_product_id', 472526);

    // 489471

    // return $supplier->normalize_wps_api_response($supplier->get_product(8454));
    // $params  = $supplier->get_params_for_query('pdp');
    // $product = $supplier->get_api('products/8454', $params);
    // return ['params' => $params, 'product' => $product];

    // return update_post_meta(378307, '_ci_import_version', '0.0');

    return 'empty';

    // $id   = 8454;
    // $page = $supplier->get_product($id);
    // $res  = $supplier->normalize_products($page, true);
    // return $res;

    // foreach ($res['data'] as &$product) {
    //     $product = [
    //         'woo_id'     => $product['woo_id'],
    //         'attributes' => $product['attributes'],
    //         'variations' => array_map(fn($v) => ['attributes' => $v['attributes']], $product['variations']),
    //     ];
    // }
    // return $res;

    // return WooTools\check_mem();
    // $ids = [2821, 2822, 2823];

    // return $supplier->get_attributekeys([33,50,3,195,68]);

    // $taxonomy = 'product_vehicle';
    // $slugs    = array_map(fn($v) => "vehicle_{$v}", $ids);
    // global $wpdb;
    // $placeholders = implode(',', array_fill(0, count($slugs), '%s'));
    // $query        = $wpdb->prepare("
    //     SELECT t.term_id
    //     FROM {$wpdb->terms} t
    //     INNER JOIN {$wpdb->term_taxonomy} tt ON t.term_id = tt.term_id
    //     WHERE tt.taxonomy = %s
    //     AND t.slug IN ($placeholders)
    // ", array_merge([$taxonomy], $slugs));

    // return $wpdb->get_col($query);

    // return get_terms([
    //     'taxonomy'   => 'product_vehicle',
    //     // 'slug'       => $slugs,
    //     'hide_empty' => false, // Include empty terms too
    //     'field' => ['id'],
    // ]);
    // $product = $supplier->get_product(56224);
    // $items   = $product['data']['items']['data'];
    // $uitems  = remove_duplicate_wps_items($items);
    // return [
    //     'items'   => count($items), // Show duplicates
    //     '$uitems' => count($uitems),
    // ];

    // $items = $supplier->get_products_page('', 'custom');
    // // return $items;
    // return  $supplier->patch_products_metadata($items);

    // return $supplier->normalize_products($supplier->get_product(56224));

    // [17-Feb-2025 05:44:02 UTC] Error inserting term:
    // Piston kits & Components - A term with the name provided already exists in this taxonomy.

    // return = get_terms([
    //     'taxonomy'   => 'product_cat',
    //     'hide_empty' => false,
    //     'slug'       => sanitize_title('Piston kits & Components'),
    // ]);

    // W1N5Mdgge2EP

    // return $supplier->import_products_page('PNmYPgNE0J1W', '2023-01-01');

    // $page = $supplier->get_products_page('p1NVMz30Rdg7', 'plp', '2023-01-01', [1, 4, 8, 16, 32]);
    // $page = $supplier->get_products_page('g9akM2aWelKO', 'pdp', '2023-01-01');
    // return $page;
    // $products = $page['data'];
    // $meta = $page['meta'];
    // foreach ($products as &$product) {
    //     $product = $supplier->normalize_product($product);
    // }
    // // return ['meta' => $meta, 'products' => $products];
    // $products = $supplier->process_normalize_products($products);
    // $products = $supplier->custom_normalize_products($products, $meta);
    // $products = $supplier->delete_normalize_products($products, $meta);
    // $products = $supplier->assign_normalize_products($products, $meta);
    // $products = $supplier->assign_product_images($products, $meta);
    // $products = $supplier->categorize_normalize_products($products, $meta);
    // $products = $supplier->save_normalize_products($products, $meta);

    // $result   = $supplier->normalize_products($page);
    // $products = $result['data'];

    // foreach ($products as &$product) {
    //     // $product['variations'] = remove_duplicate_wps_items($product['variations']);
    //     $ids = [];
    //     foreach ($product['variations'] as &$variation) {
    //         $ids[] = $variation['id'];
    //     }
    //     $unique_count = count(array_unique($ids));
    //     $total_count  = count($ids);
    //     $id_counts    = array_count_values($ids);
    //     $duplicates   = array_keys(array_filter($id_counts, fn($count) => $count > 1));

    //     // Correct placement: Check duplicates *before* returning
    //     // if ($total_count !== $unique_count) {
    //     sort($ids);
    //     return [
    //         'duplicates'  => array_diff($ids, array_unique($ids)), // Show duplicates
    //         'message'     => 'Duplicate IDs found!',
    //         '$duplicates' => $duplicates,
    //         'ids'         => $ids,
    //     ];
    //     // }
    // }
    // $attr_keys = array_keys($products[0]['attributes']);
    // $rows = [
    //     ['woo_id', 'name', ...$attr_keys ]
    // ];
    // foreach ($products as &$product) {
    //     foreach ($product['variations'] as &$variation) {
    //         $rows[] = [
    //             $variation['woo_id'],
    //             $variation['name'],
    //             ...array_map(fn($k) => $variation['attributes'][$k], $attr_keys),
    //         ];
    //         $variation = [
    //             'woo_id' => $variation['woo_id'],
    //             'image_ids' => $variation['image_ids'],
    //             // 'attributes' => $variation['attributes']
    //         ];
    //     }
    // }
    // return ['rows' => $rows];

    // return ['meta' => $meta, 'products' => $products];
    // // return $supplier->delete_products_page($page);
    // return array_map(fn($v) => $v['id'].' '.$v['sku'].' '.$v['name'],$page['data'][0]['items']['data']);
    // return $page;
    // return ['meta' => $result['meta'], 'products' => $products];
    // return $supplier->nsormalize_product_vehicles($page);

    // /** @var Supplier_T14 $supplier */
    // $supplier = Suppliers\get_supplier('t14');
}
