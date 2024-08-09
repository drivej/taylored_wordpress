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

    $func = $_GET['func'];
    if (!$func) {
        return ['error' => 'missing func', 'func' => $func];
    }

    if (!method_exists($supplier, $func)) {
        return ['error' => 'func not found', 'func' => $func];
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

    //
    //
    include_once CI_STORE_PLUGIN . 'suppliers/WPS.php';

    switch ($func) {
        case 'start_import':
            return \CIStore\Suppliers\WPS\start_import();
            break;
        case 'stop_import':
            return \CIStore\Suppliers\WPS\stop_import();
            break;
        case 'continue_import':
            return \CIStore\Suppliers\WPS\continue_import();
            break;
        case 'reset_import':
            return \CIStore\Suppliers\WPS\reset_import();
            break;
        case 'get_import_info':
            return \CIStore\Suppliers\WPS\get_import_info();
            break;
    }
    //
    //

    try {
        $response = call_user_func([$supplier, $func], ...$args);
        return $response;
    } catch (Exception $e) {
        return $e;
    }
}
