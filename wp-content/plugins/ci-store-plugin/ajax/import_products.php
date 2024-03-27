<?php

namespace AjaxHandlers;

require_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';

function stall_import($params)
{
    $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);
    $supplier = \CI\Admin\get_supplier($supplier_key);
    $supplier->stall_import();
    return ['stall attempted'];
}

function import_products($params)
{
    $updated = \AjaxManager::get_param('updated', null, $params);
    $reset = (bool) \AjaxManager::get_param('reset', null, $params);
    $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);
    $supplier = \CI\Admin\get_supplier($supplier_key);

    $is_running = $supplier->is_import_running();
    if ($is_running) {
        return ['is_running' => $is_running];
    }
    if ($reset) {
        $supplier->clear_import_report();
    }

    if (isset($updated)) {
        $dt = new \DateTime('2020-01-01', new \DateTimeZone('UTC'));
        $last_started = $dt->format('Y-m-d\TH:i:sP');
        $r = $supplier->update_import_report(['updated' => $updated, 'started' => $last_started, 'completed' => '']);
    }
    return $supplier->start_import_products();
}
