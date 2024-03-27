<?php

namespace AjaxHandlers;

require_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Report.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/western/import_western_product.php';
// require_once WP_PLUGIN_DIR . '/ci-store-plugin/admin/ci_import_product.php';

function import_product($params)
{
    $supplier_key = \AjaxManager::get_param('supplier_key', '', $params);
    $supplier = \CI\Admin\get_supplier($supplier_key);
    $supplier_product_id = \AjaxManager::get_param('product_id', '', $params);
    $report = new \Report();
    $supplier->import_product($supplier_product_id, $report);
    return ['report' => $report];
}
