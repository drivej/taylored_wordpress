<?php

namespace AjaxHandlers;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';

function western_api($params)
{

    $url = \AjaxManager::get_param('url', null, $params);
   
    $supplier_key = 'wps';
    $supplier = \CI\Admin\get_supplier($supplier_key);

    $queryString = parse_url($url, PHP_URL_QUERY);
    $parsedUrl = parse_url($url);
    $basePath = $parsedUrl['host'] . $parsedUrl['path'];
    // Parse the query string into an associative array
    parse_str($queryString, $params);


    // return ['params'=>$params, 'url'=>$url, 'basePath'=>$basePath];
    // return $supplier->get_product($supplier_product_id);
    return $supplier->get_api($basePath, $params);
}

// https://api.wps-inc.com/unit-of-measurements