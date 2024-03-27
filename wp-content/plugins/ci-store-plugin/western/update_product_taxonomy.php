<?php

/**
 *
 * @param WC_Product    $product
 * @param array    $wps_product
 * @param Report   $report
 */
function update_product_taxonomy($woo_product, $wps_product, $report)
{
    $supplier = WooTools::get_product_supplier($woo_product);
    $tags = $supplier->extract_product_tags($wps_product);
    $woo_id = $woo_product->get_id();
    $result = wp_set_object_terms($woo_id, $tags, 'product_tag', true);
    return;

    // $product_tags = [];

    // // make WPS product_type from each item a product_tag
    // if (is_countable($wps_product['items']['data'])) {
    //     foreach ($wps_product['items']['data'] as $item) {
    //         // WPS product_type
    //         if (isset($item['product_type']) && !empty($item['product_type'])) {
    //             $product_tags[] = sanitize_title($item['product_type']);
    //         }
    //         // WPS taxonomy terms
    //         if (is_countable($item['taxonomyterms']['data'])) {
    //             foreach ($item['taxonomyterms']['data'] as $term) {
    //                 $product_tags[] = sanitize_title($term['slug']);
    //             }
    //         }
    //     }
    // }

    // // save product tags
    // $product_tags = array_unique($product_tags);
    // wp_set_object_terms($woo_id, $product_tags, 'product_tag', true);

    // //
    // //
    // //

    // $taxonomy_terms = [];
    // $items = isset($wps_product['data']['items']['data']) ? $wps_product['data']['items']['data'] : [];

    // // collect taxonomy from each WPS item
    // if (isset($items)) {
    //     foreach ($items as $item) {
    //         $terms = $item['taxonomyterms']['data'];
    //         if (isset($terms) && count($terms)) {
    //             foreach ($terms as $term) {
    //                 $taxonomy_terms[$term['name']] = $term;
    //                 $taxonomy_terms[$term['name']]['slug'] = sanitize_title($term['slug']);
    //             }
    //         }
    //     }
    // } else {
    //     // $report->addLog('--> taxonomy skipped - no items');
    //     return;
    // }

    // // $report->addData('taxonomy_terms', $taxonomy_terms);

    // // add any categories that don't exist yet
    // foreach ($taxonomy_terms as $term) {
    //     if ($term['parent_id']) {
    //         // $report->addLog('category has parent' . $term['name'] . ' WPS ' . $wps_product['data']['id']);
    //     }
    //     $term_exists = term_exists($term['name'], 'product_cat');
    //     if (!$term_exists) {
    //         // $report->addLog('insert category ' . $term['name']);
    //         wp_insert_category([
    //             'cat_name' => $term['name'],
    //             'category_nicename' => $term['slug'],
    //             'taxonomy' => 'product_cat',
    //         ]);
    //     } else {
    //         // $report->addLog('exists category ' . $term['name']);
    //     }
    // }

    // // verify product belongs to all necessary categories

    // foreach ($taxonomy_terms as $term) {
    //     $has_term = has_term($term['slug'], 'product_cat', $woo_id);
    //     if ($has_term) {
    //         // $report->addLog('product has term ' . $term['name']);
    //     } else {
    //         // $report->addLog('update product with term ' . $term['name']);
    //         wp_set_object_terms($woo_id, $term['slug'], 'product_cat', true);
    //     }
    // }
}
