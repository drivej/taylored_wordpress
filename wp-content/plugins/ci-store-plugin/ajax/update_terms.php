<?php

namespace AjaxHandlers;

// use Exception;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';
// include_once './get_woo_products.php';

// TODO: can I use bigger sql queries to speed up import?
function update_terms($params)
{

    // $slugs = ["vehicle_id_10350", "vehicle_id_6099",
    //     "vehicle_id_6112",
    //     "vehicle_id_6098"];
    // // $exclude = get_terms(['slug' => $slugs, 'taxonomy' => 'product_tag', 'hide_empty' => false]);
    // return $exclude;

    $supplier_key = \AjaxManager::get_param('supplier_key', '', $params);
    $supplier_product_id = \AjaxManager::get_param('product_id', '', $params);
    $supplier = \WooTools::get_supplier($supplier_key);
    $supplier_product = $supplier->get_product($supplier_product_id);
    $terms = $supplier->extract_terms($supplier_product);
    $term_ids = $supplier->get_tag_ids($terms);
    return $term_ids;

    $slugs = array_column($terms, 'slug');
    $exclude = get_terms(['slug' => $slugs, 'taxonomy' => 'product_tag', 'hide_empty' => false]);
    $lookup_term = array_column($exclude, null, 'slug');
    $created = 0;

    foreach ($terms as $i => $term) {
        if (isset($lookup_term[$term['slug']])) {
            $terms[$i]['id'] = $lookup_term[$term['slug']]->term_id;
        } else {
            $woo_tag = wp_insert_term($term['name'], 'product_tag', ['slug' => $term['slug']]);
            $terms[$i]['id'] = $woo_tag; //->term_id;
            $created++;
        }
    }

    return ['created' => $created, 'lookup_term' => $lookup_term, 'terms' => $terms, 'slugs' => $slugs, 'exclude' => $exclude, 'product' => $supplier_product];

    return $terms;

    // get products from supplier
    // $supplier_products = $supplier->get_products_page($cursor, 50, '2020-01-01');
    // $valid_supplier_products = [];
    // $skus = [];

    // foreach ($supplier_products['data'] as $i => $supplier_product) {
    //     if ($supplier->is_available(['data' => $supplier_product])) {
    //         $sku = $supplier->get_product_sku($supplier_product['id']);
    //         $skus[] = $sku;
    //         $supplier_products['data'][$i]['sku'] = $sku;
    //         $valid_supplier_products[] = $supplier_products['data'][$i];
    //     }
    // }
    // $woo_products = \WooTools::get_product_ids_by_skus($skus);

    // global $wpdb;
    // $placeholders = implode(',', array_fill(0, count($skus), '%s'));
    // $sql = $wpdb->prepare("SELECT meta_value AS sku, post_id AS variation_id FROM {$wpdb->prefix}postmeta WHERE meta_key = '_sku' AND meta_value IN ($placeholders)", ...$skus);
    // $results = $wpdb->get_results($wpdb->prepare($sql, $skus), ARRAY_A);
    // $sku_to_variation_id = array_column($results, 'variation_id', 'sku');

    // return $sku_to_variation_id;

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

    // return ['woo_products'=>$woo_products, 'count'=> count($valid_supplier_products), 'orig'=>count($supplier_products['data']), 'supplier_products' => $valid_supplier_products];
}
