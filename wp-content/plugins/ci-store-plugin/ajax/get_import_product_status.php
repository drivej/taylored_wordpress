<?php

namespace AjaxHandlers;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';

function get_import_product_status($params)
{
    $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);
    $product_id = \AjaxManager::get_param('product_id', null, $params);

    if (!$product_id) {
        return ['error' => 'no product'];
    }
    if (!$supplier_key) {
        return ['error' => 'no supplier'];
    }
    $supplier = \CI\Admin\get_supplier($supplier_key);

    if (!$supplier) {
        return ['error' => 'supplier not found', 'supplier_key' => $supplier_key];
    }

    $is_import_product_running = $supplier->is_import_product_running($product_id);
    $is_import_product_scheduled = $supplier->is_import_product_scheduled($product_id);

    return [
        'supplier_key' => $supplier_key,
        'product_id' => $product_id,
        'is_import_product_scheduled' => $is_import_product_scheduled,
        'is_import_product_running' => $is_import_product_running,
    ];
}
