<?php

namespace AjaxHandlers;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';

function cancel_import_products($params)
{
    $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);
    if ($supplier_key) {
        $supplier = \WooTools::get_supplier($supplier_key);
        return $supplier->cancel_import();
    } else {
        return ['error' => 'no supplier'];
    }
}
