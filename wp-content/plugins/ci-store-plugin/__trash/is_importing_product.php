<?php

namespace AjaxHandlers;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';

function is_importing_product()
{
    $supplier_key = \AjaxManager::get_param('supplier_key');
    $product_id = \AjaxManager::get_param('product_id');
    $supplier = \CI\Admin\get_supplier($supplier_key);
    if ($supplier) {
        $is_importing = $supplier->is_importing($product_id);
        return ['supplier_key' => $supplier_key, 'product_id' => $product_id, 'is_importing' => $is_importing];
    }
    return ['error' => 'missing supplier'];
}
