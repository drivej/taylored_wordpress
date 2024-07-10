<?php

namespace AjaxHandlers;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';

function get_products_page($params)
{

    $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);
    $cursor = \AjaxManager::get_param('cursor', null, $params);
    $supplier = \CI\Admin\get_supplier($supplier_key);

    // $queryString = parse_url($url, PHP_URL_QUERY);
    // $parsedUrl = parse_url($url);
    // $basePath = $parsedUrl['host'] . $parsedUrl['path'];
    // Parse the query string into an associative array
    // parse_str($queryString, $params);


    // return ['params'=>$params, 'url'=>$url, 'basePath'=>$basePath];
    // return $supplier->get_product($supplier_product_id);
    return $supplier->get_products_page($cursor);
}