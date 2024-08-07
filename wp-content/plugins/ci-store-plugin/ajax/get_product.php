<?php

namespace AjaxHandlers;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';

function get_product($params)
{
    $supplier_product_id = \AjaxManager::get_param('product_id', null, $params);
    $light = (bool) \AjaxManager::get_param('light', false, $params);

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

    return $supplier->get_product($supplier_product_id, $light ? 'basic' : 'full');
}
