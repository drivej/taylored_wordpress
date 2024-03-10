<?php

namespace AjaxHandlers;

require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Report.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/western/western_utils.php';

function monkey_wrench()
{
    $wps_product_id = 326440; //26;
    $report = new \Report();

    $supplier = \CI\Admin\get_supplier('wps');

    $sku = $supplier->get_product_sku($wps_product_id);
    $supplier_product = $supplier->get_product($wps_product_id);

    $imgs = get_additional_images($supplier_product);
    return ['imgs' => $imgs];

    $valid_items = array_filter($supplier_product['data']['items']['data'], 'isValidItem');
    $variations = [];

    foreach ($valid_items as $item) {
        $variation = [];
        $variation['sku'] = $supplier->get_variation_sku($supplier_product['data']['id'], $item['id']);
        $variation['images'] = get_item_images($item);
        $variations[] = $variation;
    }

    return ['variations' => $variations];

    $woo_product_id = wc_get_product_id_by_sku($sku);
    $woo_product = wc_get_product_object('variable', $woo_product_id);
    $supplier_variations = $supplier->extract_variations($supplier_product);
    \WooTools::sync_variations($woo_product, $supplier_variations, $report);
    // get_western_attributes_from_product( $supplier_product)
    return ['report' => $report];
}

// get_western_attributes_from_product
