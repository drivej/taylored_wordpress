<?php

namespace AjaxHandlers;

use Exception;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';

function supplier_action($params)
{
    $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);
    if (!$supplier_key) {
        return ['error' => 'missing supplier key'];
    }

    $supplier = \WooTools::get_supplier($supplier_key);
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

    $args = \AjaxManager::get_param('args', [], $params);
    if (!$args) {
        $args = [];
    }

    foreach ($args as &$arg) {
        $parsed = json_decode(stripslashes($arg));
        if (json_last_error() === JSON_ERROR_NONE) {
            $arg = $parsed;
        }
    }

    ksort($args);
    $args = array_values($args);

    try {
        $response = call_user_func([$supplier, $func], ...$args);
        return $response;
    } catch (Exception $e) {
        return $e;
    }

    if (isset($response['data'])) {
        $response['meta'] = isset($response['meta']) ? $response['meta'] : [];
        $response['meta']['supplier_key'] = $supplier_key;
        $response['meta']['func'] = $func;
        $response['meta']['args'] = $args;
        return $response;
    }

    return ['meta' => ['supplier_key' => $supplier_key, 'func' => $func, 'args' => $args], 'data' => $response];
}
