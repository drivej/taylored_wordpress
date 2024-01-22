<?php

include_once __DIR__ . './../utils/print_utils.php';
include_once __DIR__ . './../western/get_western_product.php';
include_once __DIR__ . './../western/import_western_product.php';
include_once __DIR__ . './../western/update_product_attributes.php';
include_once __DIR__ . './../western/western_utils.php';
require_once __DIR__ . './../western/wps_settings.php';
include_once __DIR__ . './../utils/Report.php';

function wps_product_action($wps_product_id)
{
    global $WPS_SETTINGS;

    if (!isset($wps_product_id) || empty($wps_product_id)) {
        return;
    }
    $res = [];

    $wps_product = get_western_product($wps_product_id);
    $is_valid = isValidProduct($wps_product);
    $res['is_valid'] = $is_valid;
    $res['woo_product_id'] = 'not found';
    // $res['wps_product'] = $wps_product;

    // printData(['is_valid' => $is_valid, 'reasons' => $reasons, 'wps_product' => $wps_product]);

    if ($is_valid) {
        $sku = get_western_sku($wps_product['data']['id']);
        $res['sku'] = $sku;
        $woo_product_id = wc_get_product_id_by_sku($sku);
        $res['woo_product_id'] = $woo_product_id;
        // $woo_product = wc_get_product($woo_product_id);
        // printData(['sku' => $sku, 'woo_product_id' => $woo_product_id, 'woo_product' => $woo_product]);
        $res['has_images'] = wps_product_has_images($wps_product);
        $res['wps_stock_status'] = get_western_stock_status($wps_product_id);
        $woo_product = wc_get_product_object('product', $woo_product_id);
        $res['woo_stock_status'] = $woo_product->get_meta('_stock_status', true);

        $res['import_version'] = $woo_product->get_meta('_ci_import_version');
        $res['current_import_version'] = $WPS_SETTINGS['import_version'];


        $res['needs_update'] = product_needs_update($woo_product, $wps_product);

    } else {
        $res['reasons'] = isInvalidReasons($wps_product);
    }
    printData($res);
    printData($wps_product);

}
