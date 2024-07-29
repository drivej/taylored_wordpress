<?php

namespace AjaxHandlers;

require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';

function western_api($params)
{
    $url = \AjaxManager::get_param('url', null, $params);
    $parsedUrl = parse_url($url);
    $queryString = isset($parsedUrl['query']) ? $parsedUrl['query'] : '';
    $params = [];
    parse_str($queryString, $params);
    $supplier_key = 'wps';
    $supplier = \WooTools::get_supplier($supplier_key);

    return $supplier->get_api($parsedUrl['path'], $params);
    /*

// $queryString = parse_url($url, PHP_URL_QUERY) || '';
$queryString = isset($parsedUrl['query']) ? $parsedUrl['query'] : '';
$parsedUrl = parse_url($url);

return $parsedUrl;
$params = [];
parse_str($queryString, $params);

// get path
$host = isset($parsedUrl['host']) ? $parsedUrl['host'] : '';
$basePath = $host . $parsedUrl['path'];

// Parse the query string into an associative array
parse_str($queryString, $params);

// return ['params'=>$params, 'url'=>$url, 'basePath'=>$basePath];
// return $supplier->get_product($supplier_product_id);
return $supplier->get_api($basePath, $params);
 */
}

// https://api.wps-inc.com/unit-of-measurements
