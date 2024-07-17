<?php

namespace AjaxHandlers;

require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';

function turn14_api($params)
{

    $url = \AjaxManager::get_param('url', null, $params);

    $supplier_key = 't14';
    $supplier = \WooTools::get_supplier($supplier_key);

    $queryString = parse_url($url, PHP_URL_QUERY) || '';
    $parsedUrl = parse_url($url);
    $host = isset($parsedUrl['host']) ? $parsedUrl['host'] : '';
    $path = isset($parsedUrl['path']) ? $parsedUrl['path'] : '';
    $basePath = $host . $path;
    // Parse the query string into an associative array
    parse_str($queryString, $params);

    // return ['params'=>$params, 'url'=>$url, 'basePath'=>$basePath];
    // return $supplier->get_product($supplier_product_id);
    return $supplier->get_api($basePath, $params);
}

function get_turn14_brands($params)
{
    $supplier = \WooTools::get_supplier('t14');
    return $supplier->get_api('/brands');
}

function set_turn14_brands($params)
{

    $url = \AjaxManager::get_param('url', null, $params);

    $supplier_key = 't14';
    $supplier = \WooTools::get_supplier($supplier_key);

    $queryString = parse_url($url, PHP_URL_QUERY);
    $parsedUrl = parse_url($url);
    $host = isset($parsedUrl['host']) ? $parsedUrl['host'] : '';
    $path = isset($parsedUrl['path']) ? $parsedUrl['path'] : '';
    $basePath = $host . $path;
    // Parse the query string into an associative array
    parse_str($queryString, $params);

    // return ['params'=>$params, 'url'=>$url, 'basePath'=>$basePath];
    // return $supplier->get_product($supplier_product_id);
    return $supplier->get_api($basePath, $params);
}

// https://api.wps-inc.com/unit-of-measurements
