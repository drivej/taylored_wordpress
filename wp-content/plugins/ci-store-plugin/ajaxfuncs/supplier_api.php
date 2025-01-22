<?php

namespace CIStore\Ajax;

include_once CI_STORE_PLUGIN . 'suppliers/Suppliers.php';

function supplier_api()
{
    $supplier_key = $_GET['supplier_key'];
    $supplier = \CIStore\Suppliers\get_supplier($supplier_key);
    $url = $_GET['url'];
    $parsedUrl = parse_url($url);
    $queryString = isset($parsedUrl['query']) ? $parsedUrl['query'] : '';
    $params = [];
    parse_str($queryString, $params);
    return $supplier->get_api($parsedUrl['path'], $params);
}
