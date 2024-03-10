<?php

namespace CI\Admin;

require_once __DIR__ . '/index.php';

function get_supplier($supplier_key)
{
    global $SUPPLIERS;
    if (isset($SUPPLIERS[$supplier_key])) {
        return $SUPPLIERS[$supplier_key];
    }
    return null;
}

function get_suppliers()
{
    global $SUPPLIERS;
    $result = [];
    foreach ($SUPPLIERS as $supplier_key => $supplier) {
        $result[] = ['key' => $supplier_key, 'name' => $supplier->name];
    }
    return $result;
}
