<?php

namespace AjaxHandlers;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';

function start_cronjob($params)
{
    $action = \AjaxManager::get_param('cronjob_action', null, $params);
    $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);

    if (!$supplier_key) {
        return ['error' => 'missing supplier'];
    }

    $supplier = \WooTools::get_supplier($supplier_key);
    if (!$supplier) {
        return ['error' => 'supplier not found', 'supplier_key' => $supplier_key];
    }

    return $supplier->start_cronjob($action);
}

function get_cronjob_status($params)
{
    $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);
    if (!$supplier_key) {
        return ['error' => 'missing supplier'];
    }

    $supplier = \WooTools::get_supplier($supplier_key);
    if (!$supplier) {
        return ['error' => 'supplier not found', 'supplier_key' => $supplier_key];
    }

    return $supplier->get_cronjob_status();
}

function stop_cronjob($params)
{
    $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);
    if (!$supplier_key) {
        return ['error' => 'missing supplier'];
    }

    $supplier = \WooTools::get_supplier($supplier_key);
    if (!$supplier) {
        return ['error' => 'supplier not found', 'supplier_key' => $supplier_key];
    }

    // return $supplier->cronjob->stop();
    return $supplier->stop_cronjob();
}

function continue_cronjob($params)
{
    $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);
    if (!$supplier_key) {
        return ['error' => 'missing supplier'];
    }

    $supplier = \WooTools::get_supplier($supplier_key);
    if (!$supplier) {
        return ['error' => 'supplier not found', 'supplier_key' => $supplier_key];
    }

    // return $supplier->cronjob->stop();
    return $supplier->continue_cronjob();
}
