<?php

// require_once __DIR__ . './../log/write_to_log_file.php';
// require_once __DIR__ . './../western/get_western_products_page.php';
// require_once __DIR__ . './../western/get_western_product.php';
require_once __DIR__ . './../western/western_utils.php';
require_once __DIR__ . '/update_product_attributes.php';
require_once __DIR__ . '/update_product_taxonomy.php';
require_once __DIR__ . '/update_product_variations.php';
require_once __DIR__ . './../utils/Report.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
/**
 *
 * @param int    $wps_product_id
 * @param bool   $force_update
 * @param Report $report
 */
function import_western_product($wps_product_id, $force_update = false, $report = new Report())
{
    $supplier = \CI\Admin\get_supplier('wps');
    $report->addLog('import_western_product()');
    $start_time = microtime(true);
    $action = '';
    $product_id = '';
    $sku = $supplier->get_product_sku($wps_product_id);
    // $sku = get_western_sku($wps_product_id);

    // try {
    $wps_product = $supplier->get_product($wps_product_id);
    $report->addData('wps_product_id', $wps_product_id);

    if (isset($wps_product['error'])) {
        if (isset($wps_product['status_code']) && $wps_product['status_code'] === 404) {
            $product_id = wc_get_product_id_by_sku($sku);
            if ($product_id) {
                $report->addLog('404 ' . $wps_product_id);
                $action = 'delete';
            } else {
                $report->addLog('not found ' . $wps_product_id);
                $action = 'ignore';
            }
        } else {
            $action = 'error';
        }
    } else {
        $product_id = wc_get_product_id_by_sku($sku);
        $report->addData('product_sku', $sku);
        $report->addData('product_id', $product_id);
        $is_valid = isValidProduct($wps_product);

        if ($is_valid) {
            if ($product_id) {
                $product = wc_get_product_object('product', $product_id);
                $needs_update = $force_update === true || product_needs_update($product, $wps_product);
                if ($needs_update) {
                    $action = 'update';
                } else {
                    $action = 'ignore';
                }
            } else {
                $action = 'insert';
            }
        } else {
            if ($product_id) {
                $action = 'delete';
            } else {
                $action = 'ignore';
            }
        }
    }

    // write_to_log_file("import_western_product() " . json_encode(['action' => $action, "wps_product_id" => $wps_product_id, "product_id" => $product_id]));

    switch ($action) {
        case 'insert':
            $product_id = insert_western_product($wps_product, $report);
            break;
        case 'update':
            update_western_product($wps_product, $product_id, $report);
            break;
        case 'delete':
            delete_product($product_id, $report);
            break;
        case 'ignore':
        case 'error':
        default:
    }

    $report->addData('action', $action);
    $report->addData('product_id', $product_id);

    // } catch (Exception $e) {
    //     write_to_log_file("ERROR! import_western_product() " . json_encode(["wps_product_id" => $wps_product_id, 'e'=>$e]));
    // }
    $end_time = microtime(true);
    $time_taken = $end_time - $start_time;
    // write_to_log_file('import_western_product()' . json_encode(['wps_product_id' => $wps_product_id, 'action' => $action, 'time' => $time_taken]));
    // return $report; //['wps_product_id' => $wps_product_id, 'product_id' => $product_id, 'action' => $action, 'sku' => $sku];
}
/**
 *
 * @param WC_Product   $woo_product
 * @param array    $wps_product
 */
function product_needs_update_reasons($woo_product, $wps_product)
{
    $supplier = \CI\Admin\get_supplier('wps');
    $reasons = [];
    // $needs_update = false;
    $import_version = $woo_product->get_meta('_ci_import_version');
    // update if import version changes
    if ($import_version != $supplier->import_version) {
        // $needs_update = true;
        $reasons[] = 'import version updated from ' . $import_version . ' to ' . $supplier->import_version;
    }
    $imported = $woo_product->get_meta('_ci_import_timestamp');
    $date_imported = new DateTime($imported ? $imported : '2000-01-01 12:00:00');
    $updated = $wps_product['data']['updated_at'];
    $date_updated = new DateTime($updated);
    // update if imported before last remote update
    if ($date_imported < $date_updated) {
        // $needs_update = true;
        $reasons[] = 'last import ' . $date_imported->format('Y-m-d H:i:s');
    }
    if (should_update_stock_status($woo_product, $wps_product)) {
        $reasons[] = 'stock status changed';
    }
    return $reasons;
}
/**
 *
 * @param WC_Product   $woo_product
 * @param array    $wps_product
 */
function product_needs_update($woo_product, $wps_product)
{
    $reasons = product_needs_update_reasons($woo_product, $wps_product);
    return (bool) count($reasons);
    // $needs_update = false;
    // $import_version = $woo_product->get_meta('_ci_import_version');
    // // update if import version changes
    // if ($import_version != $WxPS_SETTINGS['import_version']) {
    //     $needs_update = true;
    // }
    // $imported = $woo_product->get_meta('_ci_import_timestamp');
    // $date_imported = new DateTime($imported ? $imported : '2000-01-01 12:00:00');
    // $updated = $wps_product['data']['updated_at'];
    // $date_updated = new DateTime($updated);
    // // update if imported before last remote update
    // if ($date_imported < $date_updated) {
    //     $needs_update = true;
    // }
    // return $needs_update;
}
/**
 *
 * @param array    $wps_product
 * @param Report   $report
 */
function insert_western_product($wps_product, $report = new Report())
{
    $supplier_key = 'wps';
    $supplier = WooTools::get_supplier($supplier_key);
    $product = new WC_Product_Variable();
    $sku = get_western_sku($wps_product['data']['id']);
    $product->set_sku($sku);
    $product->update_meta_data('_ci_supplier_key', 'wps');
    $product->update_meta_data('_ci_product_id', $wps_product['data']['id']);
    $product->update_meta_data('_supplier_class', $supplier->supplierClass);
    $product->update_meta_data('_ci_import_version', $supplier->import_version);
    $product->update_meta_data('_ci_import_timestamp', gmdate("c"));

    $product_id = $product->save();
    wp_set_object_terms($product_id, 'variable', 'product_type');
    update_product_attributes($product, $wps_product, $report);
    if ($report->getData('attribute_changes')) {
        $product->save();
    }
    // update_product_variations($product, $wps_product, $report);
    update_western_product($wps_product, $product_id, $report);
    // $product->save();
    // $report->addLog('save()');
    $report->addLog('insert_western_product() sku:' . $sku . ' id: ' . $product_id);
    return $product_id;
}

function update_western_product($wps_product, $product_id, $report = new Report())
{
    $report->addLog('update_western_product()');
    $supplier = \CI\Admin\get_supplier('wps');
    $woo_product = wc_get_product_object('variable', $product_id);
    // $has_variations = count($wps_product['data']['items']['data']) > 0;
    // $is_variable = $product->is_type('variable');
    $report->addData('type', $woo_product->get_type());

    $first_item = $wps_product['data']['items']['data'][0];
    $woo_product->set_name($wps_product['data']['name']);
    $woo_product->set_status('publish');
    $woo_product->set_regular_price($first_item['list_price']);
    $woo_product->set_stock_status('instock');
    $woo_product->update_meta_data('_ci_import_version', $supplier->import_version);
    // $images = get_additional_images($wps_product);
    // $serialized_images = serialize($images);
    // $woo_product->update_meta_data('_ci_additional_images', $serialized_images);

    // if ($has_variations && !$is_variable) {
    // $report->addLog('failed');
    // delete_product($product_id);
    // insert_western_product($wps_product, $report);
    // } else {
    update_product_images($woo_product, $wps_product, $report);
    update_product_taxonomy($woo_product, $wps_product, $report);
    update_product_attributes($woo_product, $wps_product, $report);
    update_product_variations($woo_product, $wps_product, $report);
    update_product_stock_status($woo_product, $wps_product, $report);

    $woo_product->save();
    // }
    return $product_id;
}

function update_product_images($woo_product, $wps_product, $report)
{
    $report->addLog('update_product_images()');
    $images = get_additional_images($wps_product);
    $serialized_images = serialize($images);
    $woo_product->update_meta_data('_ci_additional_images', $serialized_images);
}

function should_update_stock_status($woo_product, $wps_product)
{
    $wps_product_id = $wps_product['data']['id'];
    $woo_stock_status = $woo_product->get_stock_status();
    $wps_stock_status = get_western_stock_status($wps_product_id);
    return $woo_stock_status !== $wps_stock_status;
}

function update_product_stock_status($woo_product, $wps_product, $report)
{
    $wps_product_id = $wps_product['data']['id'];
    $woo_stock_status = $woo_product->get_stock_status();
    $wps_stock_status = get_western_stock_status($wps_product_id);

    if ($woo_stock_status !== $wps_stock_status) {
        $woo_product->set_stock_status($wps_stock_status);
        $report->addData('stock_status', $wps_stock_status);
    }
}
/**
 *
 * @param WC_Product    $product
 * @param array    $wps_product
 * @param Report   $report
 */
// function update_product_taxonomy($product, $wps_product, $report)
// {

//     $taxonomy_terms = [];
//     $items = $wps_product['data']['items']['data'];

//     // collect taxonomy fro each WPS item
//     if (isset($items)) {
//         foreach ($items as $item) {
//             $terms = $item['taxonomyterms']['data'];
//             if (isset($terms) && count($terms)) {
//                 foreach ($terms as $term) {
//                     $taxonomy_terms[$term['name']] = $term;
//                     $taxonomy_terms[$term['name']]['slug'] = sanitize_title($term['slug']);
//                 }
//             }
//         }
//     } else {
//         // $report->addLog('taxonomy skipped - no items');
//         return;
//     }

//     // $report->addData('taxonomy_terms', $taxonomy_terms);

//     // add any categories that don't exist yet
//     foreach ($taxonomy_terms as $term) {
//         if ($term['parent_id']) {
//             $report->addLog('category has parent' . $term['name'] . ' WPS ' . $wps_product['data']['id']);
//         }
//         $term_exists = term_exists($term['name'], 'product_cat');
//         if (!$term_exists) {
//             $report->addLog('insert category ' . $term['name']);
//             wp_insert_category([
//                 'cat_name' => $term['name'],
//                 'category_nicename' => $term['slug'],
//                 'taxonomy' => 'product_cat',
//             ]);
//         } else {
//             $report->addLog('exists category ' . $term['name']);
//         }
//     }

//     // verify product belongs to all necessary categories
//     $woo_id = $product->get_id();

//     foreach ($taxonomy_terms as $term) {
//         $has_term = has_term($term['slug'], 'product_cat', $woo_id);
//         if ($has_term) {
//             $report->addLog('product has term ' . $term['name']);
//         } else {
//             $report->addLog('update product with term ' . $term['name']);
//             wp_set_object_terms($woo_id, $term['slug'], 'product_cat', true);
//         }
//     }
// }

function delete_product($product_id)
{
    $result = wp_delete_post($product_id, true);
    if ($result === false) {
        // write_to_log_file("ERROR! delete_product() " . json_encode(["product_id" => $product_id]));
    }
}

function get_item_images($item)
{
    if (count($item['images']['data'])) {
        return array_map('build_western_image', $item['images']['data']);
    }
    return null;
}

function get_additional_images($wps_product)
{
    $images = array_map('process_images', $wps_product['data']['items']['data']);
    $images = array_filter($images, 'filter_images');
    return $images; //implode(',', $images);
}

function get_all_images($wps_product)
{
    if (is_countable($wps_product['data']['items']['data'])) {
        $images = [];
        foreach ($wps_product['data']['items']['data'] as $item) {
            foreach ($item['images']['data'] as $image) {
                $images[] = build_western_image($image);
            }
        }
    }
    return $images;
}

function process_images($item)
{
    if (count($item['images']['data'])) {
        // show only the first image of each variation
        return build_western_image($item['images']['data'][0]);
    }
    return null;
}

function filter_images($image)
{
    return isset($image);
}
