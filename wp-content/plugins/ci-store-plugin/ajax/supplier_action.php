<?php

namespace AjaxHandlers;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';

function supplier_action($params)
{
    $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);
    if (!$supplier_key) {
        return ['error' => 'missing supplier key'];
    }

    $supplier = \CI\Admin\get_supplier($supplier_key);
    if (!$supplier) {
        return ['error' => 'supplier not found', 'supplier_key' => $supplier_key];
    }

    $func = \AjaxManager::get_param('func', null, $params);
    if (!$func) {
        return ['error' => 'missing func', 'func' => $func];
    }

    if (!method_exists($supplier, $func)) {
        return ['error' => 'func not found', 'func' => $func];
    }

    $args = \AjaxManager::get_param('args', null, $params);
    if (!$args) {
        $args = [];
    }

    // convert truthy to boolean
    $args = array_map(function ($arg) {
        return $arg === 'true' ? true : ($arg === 'false' ? false : $arg);
    }, $args);

    $response = call_user_func_array([$supplier, $func], $args);

    return ['meta' => ['supplier_key' => $supplier_key, 'func' => $func, 'args' => $args], 'data' => $response];
}
