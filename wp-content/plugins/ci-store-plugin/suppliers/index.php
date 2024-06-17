<?php

include_once __DIR__ . '/supplier_wps.php';
include_once __DIR__ . '/supplier_t14.php';

$SUPPLIERS = [
    'wps' => new Supplier_WPS(),
    // 't14' => new Supplier_t14(),
];
