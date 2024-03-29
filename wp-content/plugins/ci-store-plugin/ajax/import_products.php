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

function schedule_daily_import($params)
{
    $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);
    $supplier = \CI\Admin\get_supplier($supplier_key);
    return $supplier->schedule_daily_import();
}

function unschedule_daily_import($params)
{
    $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);
    $supplier = \CI\Admin\get_supplier($supplier_key);
    return $supplier->unschedule_daily_import();
}

function import_products($params)
{
    $updated = \AjaxManager::get_param('updated', null, $params);
    $import_type = \AjaxManager::get_param('import_type', 'resume', $params); // reset | resume
    $patch = \AjaxManager::get_param('patch', null, $params);
    $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);
    $supplier = \CI\Admin\get_supplier($supplier_key);

    $is_importing = $supplier->is_importing();

    if ($is_importing) {
        return ['is_importing' => $is_importing];
    }
    // reset import
    if ($import_type === 'reset') {
        $supplier->clear_import_report();
        $dt = new \DateTime('2020-01-01', new \DateTimeZone('UTC'));
        $last_started = $dt->format('Y-m-d\TH:i:sP');
        $supplier->update_import_report([
            'updated' => $updated,
            'started' => $last_started,
            'completed' => '',
            'patch' => $patch,
        ]);
        return $supplier->start_import_products();
    } else {
        $resumed = $supplier->resume_import();
        return ['resumed' => $resumed];
    }
}
