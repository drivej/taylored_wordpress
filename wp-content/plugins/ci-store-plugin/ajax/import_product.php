<?php

namespace AjaxHandlers;

require_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Report.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/western/import_western_product.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/admin/ci_import_product.php';

function import_product($params)
{
    $supplier_key = \AjaxManager::get_param('supplier_key');
    $product_id = \AjaxManager::get_param('product_id');
    // $success = false;
    ci_error_log(__FILE__, __LINE__, $supplier_key . ':' . $product_id);

    $report = new \Report();
    ci_import_product($supplier_key, $product_id, true, $report);
    return ['report' => $report];
}
