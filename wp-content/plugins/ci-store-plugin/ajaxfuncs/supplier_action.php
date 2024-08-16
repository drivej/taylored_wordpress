<?php

namespace CIStore\Ajax;

use Exception;

include_once CI_STORE_PLUGIN . 'utils/WooTools.php';
include_once CI_STORE_PLUGIN . 'suppliers/Suppliers.php';

function supplier_action()
{
    $supplier_key = $_GET['supplier_key'];
    if (!$supplier_key) {
        return ['error' => 'missing supplier key'];
    }

    $supplier = \CIStore\Suppliers\get_supplier($supplier_key);
    if (!$supplier) {
        return ['error' => 'supplier not found', 'supplier_key' => $supplier_key];
    }

    $func_group = $_GET['func_group'] ?? '';

    $func = $_GET['func'];
    if (!$func) {
        return ['error' => 'missing func', 'func' => $func];
    }

    $args = $_GET['args'] ?? [];

    foreach ($args as &$arg) {
        $parsed = json_decode(stripslashes($arg));
        if (json_last_error() === JSON_ERROR_NONE) {
            $arg = $parsed;
        }
    }

    ksort($args);
    $args = array_values($args);

    // special cvase to target importer functions
    switch ($func_group) {
        case 'importer':
            $importer = $supplier->get_importer();

            // return ['args' => $args];
            
            if ($importer) {
                if (method_exists($importer, $func)) {
                    return call_user_func([$importer, $func], ...$args);
                }
            }
            break;
    }

    if (!method_exists($supplier, $func)) {
        return ['error' => 'func not found', 'func' => $func];
    }

    try {
        $response = call_user_func([$supplier, $func], ...$args);
        return $response;
    } catch (Exception $e) {
        return $e;
    }
}
