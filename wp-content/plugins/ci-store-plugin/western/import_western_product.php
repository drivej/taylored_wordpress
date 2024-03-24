<?php

// require_once __DIR__ . './../western/western_utils.php';
require_once __DIR__ . '/update_product_attributes.php';
require_once __DIR__ . '/update_product_taxonomy.php';
require_once __DIR__ . '/update_product_variations.php';
require_once __DIR__ . '/update_product_images.php';
require_once __DIR__ . './../utils/Report.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
/**
 *
 * @param array    $wps_product
 * @param Report   $report
 */
// function insert_western_product($wps_product, $report = new Report())
// {
//     $supplier_key = 'wps';
//     $supplier = WooTools::get_supplier($supplier_key);
//     $product_id = $supplier->create_product($wps_product['data']['id']);
//     update_western_product($wps_product, $product_id, $report);
//     return $product_id;
// }

function update_western_product($wps_product, $product_id, $report = new Report())
{
    $supplier = \CI\Admin\get_supplier('wps');

    if (!isset($wps_product['data']['items']['data'])) {
        ci_error_log('update_western_product() Product data is bad. product_id=' . $product_id . ' wps_product=' . json_encode($wps_product));
        return;
    }

    $woo_product = wc_get_product_object('variable', $product_id);
    $first_item = $wps_product['data']['items']['data'][0];
    $woo_product->set_name($wps_product['data']['name']);
    $woo_product->set_status('publish');
    $woo_product->set_regular_price($first_item['list_price']);
    $woo_product->set_stock_status('instock');
    $woo_product->update_meta_data('_ci_import_version', $supplier->import_version);
    $woo_product->update_meta_data('_ci_import_timestamp', gmdate("c"));
    $woo_product->set_description($supplier->get_description($wps_product));

    update_product_images($woo_product, $wps_product, $report);
    update_product_taxonomy($woo_product, $wps_product, $report);
    update_product_attributes($woo_product, $wps_product, $report);
    update_product_variations($woo_product, $wps_product, $report);

    $woo_product->save();

    return $product_id;
}
