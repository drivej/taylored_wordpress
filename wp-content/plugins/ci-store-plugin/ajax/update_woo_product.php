<?php

namespace AjaxHandlers;

use Exception;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';
include_once './get_woo_products.php';

// TODO: can I use bigger sql queries to speed up import?
function update_woo_products($params)
{
    $cursor = \AjaxManager::get_param('cursor', '', $params);
    $woo_products = get_woo_products(['paged' => 0, 'posts_per_page' => 50]);
    $supplier_key = 'wps'; //$product->get_meta('_ci_supplier_key');
    $supplier = \CI\Admin\get_supplier($supplier_key);
    // get products from supplier
    $supplier_products = $supplier->get_products_page($cursor, 50, '2020-01-01');
    $valid_supplier_products = [];
    $skus = [];

    foreach ($supplier_products['data'] as $i => $supplier_product) {
        if ($supplier->is_available(['data' => $supplier_product])) {
            $sku = $supplier->get_product_sku($supplier_product['id']);
            $skus[] = $sku;
            $supplier_products['data'][$i]['sku'] = $sku;
            $valid_supplier_products[] = $supplier_products['data'][$i];
        }
    }
    $woo_products = \WooTools::get_product_ids_by_skus($skus);

    global $wpdb;
    $placeholders = implode(',', array_fill(0, count($skus), '%s'));
    $sql = $wpdb->prepare("SELECT meta_value AS sku, post_id AS variation_id FROM {$wpdb->prefix}postmeta WHERE meta_key = '_sku' AND meta_value IN ($placeholders)", ...$skus);
    $results = $wpdb->get_results($wpdb->prepare($sql, $skus), ARRAY_A);
    $sku_to_variation_id = array_column($results, 'variation_id', 'sku');
    
    return $sku_to_variation_id;


    // $args = [
    //     'post_type' => 'product',
    //     'posts_per_page' => $report['input']['posts_per_page'],
    //     'paged' => $report['input']['paged'],
    //     'fields' => 'ids',
    // ];

    // // $query = new \WP_Query($args);

    // get_posts(['post_type'=>'product', 'post_id'=>])

    // foreach ($valid_supplier_products as $i => $supplier_product) {
    //     $supplier_product['woo_id'] = $woo_products[$supplier_product['sku']];
    // }

    return ['woo_products'=>$woo_products, 'count'=> count($valid_supplier_products), 'orig'=>count($supplier_products['data']), 'supplier_products' => $valid_supplier_products];
}

function update_woo_product($params)
{
    try {
        $woo_product_id = \AjaxManager::get_param('woo_product_id', null, $params);
        $start_time = microtime(true);
        $product = wc_get_product_object('variable', $woo_product_id);
        $output = ['woo_product_id' => $woo_product_id, 'updated' => false];
        if ($product) {
            try {
                if ($product->meta_exists('_ci_supplier_key') && $product->meta_exists('_ci_product_id')) {
                    $supplier_key = $product->get_meta('_ci_supplier_key');
                    $supplier_product_id = $product->get_meta('_ci_product_id');
                    $output['supplier_product_id'] = $supplier_product_id;
                    $output['supplier_key'] = $supplier_key;
                    $supplier = \CI\Admin\get_supplier($supplier_key);
                    // $supplier_product = $supplier->get_product_light($supplier_product_id);
                    if ($supplier) {
                        $output['result'] = $supplier->update_product($supplier_product_id);
                        $output['updated'] = true;

                        // $is_available = $supplier->is_available($supplier_product);
                        // $output['is_available'] = $is_available;
                        // if (!$is_available) {
                        //     $output['deleted'] = $supplier->delete_product($supplier_product_id, false);
                        // }
                    }
                }
            } catch (Exception $e) {
                $output['error'] = $e;
            }
        } else {
            $output['invalid'] = true;
        }
        $end_time = microtime(true);
        $exetime = $end_time - $start_time;
        $output['exetime'] = $exetime;
        return $output;
    } catch (Exception $e) {
        return $e;
    }
}
