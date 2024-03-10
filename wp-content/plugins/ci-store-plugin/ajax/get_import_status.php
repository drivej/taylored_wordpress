<?php

namespace AjaxHandlers;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';

function get_import_status($params)
{
    $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);
    $supplier = \CI\Admin\get_supplier($supplier_key);
    $is_import_running = $supplier->is_import_running();
    $is_import_scheduled = $supplier->is_import_scheduled();
    $is_stalled = $is_import_running && $supplier->is_import_stalled();
    $report = $supplier->get_import_report();
    $should_cancel_import = $supplier->should_cancel_import();

    return [
        'supplier' => $supplier_key,
        'is_import_scheduled' => $is_import_scheduled,
        'is_import_running' => $is_import_running,
        'is_stalled' => $is_stalled,
        'should_cancel_import' => $should_cancel_import,
        'report' => $report,
    ];

    if ($supplier_key) {
        $supplier = \CI\Admin\get_supplier($supplier_key);
        $is_import_running = $supplier->is_import_running();
        $is_import_scheduled = $supplier->is_import_scheduled();
        $last_ping = $supplier->seconds_since_last_ping();
        $is_stalled = $supplier->is_import_stalled();
        $report = $supplier->get_import_report();
        $should_cancel_import = $supplier->should_cancel_import();
        return [
            'is_stalled' => $is_stalled,
            'last_ping' => $last_ping,
            'report' => $report,
            'should_cancel_import' => $should_cancel_import,
            'is_import_scheduled' => $is_import_scheduled,
            'is_import_running' => $is_import_running,
            'supplier' => $supplier_key,
        ];
    } else {
        return ['error' => 'no supplier'];
    }
}
