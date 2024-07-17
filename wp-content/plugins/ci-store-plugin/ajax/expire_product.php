<?php

namespace AjaxHandlers;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';

function expire_product($params)
{
    $supplier_product_id = \AjaxManager::get_param('product_id', null, $params);

    if (!$supplier_product_id) {
        return ['error' => 'missing product id'];
    }
    $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);
    if (!$supplier_key) {
        return ['error' => 'missing supplier'];
    }

    $supplier = \WooTools::get_supplier($supplier_key);
    if (!$supplier) {
        return ['error' => 'supplier not found', 'supplier_key' => $supplier_key];
    }

    $woo_product = $supplier->get_woo_product($supplier_product_id);
    $time_ago = strtotime('-3 weeks');
    $new_date = gmdate("c", $time_ago);

    if ($woo_product) {
        $woo_product->update_meta_data('_ci_import_timestamp', $new_date);
    }

    return ['new_data' => $new_date, 'meta_data' => $woo_product->get_meta('_ci_import_timestamp')];
}
