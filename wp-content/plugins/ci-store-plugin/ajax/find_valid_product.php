<?php

namespace AjaxHandlers;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/western/get_western_products_page.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/western/western_utils.php';

function find_valid_product($params)
{
    $max_pages = \AjaxManager::get_param('max_pages', 48, $params);
    $page_size = \AjaxManager::get_param('page_size', 48, $params);
    $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);
    $supplier = \CI\Admin\get_supplier($supplier_key);
    $products = [];
    $cursor = null;
    $pages_scanned = 0;
    $products_scanned = 0;

    while (!count($products) && $pages_scanned < $max_pages) {
        $pages_scanned++;
        $page = get_western_products_page($cursor, null, $page_size);
        if (isset($page['data'])) {
            foreach ($page['data'] as $product) {
                $is_available = $supplier->is_available(['data' => $product]);
                if ($is_available) {
                    $products[$product['id']] = $product['name'];
                }
            }
        } else {
            break;
        }

        // if (isset($page['data'])) {
        //     foreach ($page['data'] as $i => $product) {
        //         $products_scanned++;
        //         $is_available = false;

        //         if (isset($product['data']['items']['data'])) {
        //             $is_available = $supplier->is_available(['data' => $product]);
        //             if ($is_available) { //$supplier->is_available($product)) {
        //                 $products[] = $product;
        //             }
        //         }
        //     }
        //     if (isset($page['meta']['cursor']['next'])) {
        //         $cursor = $page['meta']['cursor']['next'];
        //     } else {
        //         break;
        //     }
        // } else {
        //     break;
        // }
    }

    // $products = array_map(fn($p) => ['id' => $p['id']], $products);

    return ['cursor' => $cursor, 'max_pages' => $max_pages, 'page_size' => $page_size, 'pages_scanned' => $pages_scanned, 'products_scanned' => $products_scanned, 'products' => $products];

    // if ($supplier) {
    //     $is_importing = $supplier->is_importing();
    //     return ['supplier_key' => $supplier_key, 'is_importing' => $is_importing];
    // }
    // return ['error' => 'missing supplier'];

}
