<?php

namespace AjaxHandlers;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';

function is_importing_products($params)
{
    $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);
    $supplier = \CI\Admin\get_supplier($supplier_key);
    if ($supplier) {
        $is_importing = $supplier->is_importing();
        return ['supplier_key' => $supplier_key, 'is_importing' => $is_importing];
    }
    return ['error' => 'missing supplier'];
}
