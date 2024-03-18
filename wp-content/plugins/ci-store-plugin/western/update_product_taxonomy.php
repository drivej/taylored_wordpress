<?php

/**
 *
 * @param WC_Product    $product
 * @param array    $wps_product
 * @param Report   $report
 */
function update_product_taxonomy($product, $wps_product, $report)
{
    // $report->addLog('update_product_taxonomy()');
    $taxonomy_terms = [];
    $items = $wps_product['data']['items']['data'];

    // collect taxonomy from each WPS item
    if (isset($items)) {
        foreach ($items as $item) {
            $terms = $item['taxonomyterms']['data'];
            if (isset($terms) && count($terms)) {
                foreach ($terms as $term) {
                    $taxonomy_terms[$term['name']] = $term;
                    $taxonomy_terms[$term['name']]['slug'] = sanitize_title($term['slug']);
                }
            }
        }
    } else {
        // $report->addLog('--> taxonomy skipped - no items');
        return;
    }

    // $report->addData('taxonomy_terms', $taxonomy_terms);

    // add any categories that don't exist yet
    foreach ($taxonomy_terms as $term) {
        if ($term['parent_id']) {
            // $report->addLog('category has parent' . $term['name'] . ' WPS ' . $wps_product['data']['id']);
        }
        $term_exists = term_exists($term['name'], 'product_cat');
        if (!$term_exists) {
            // $report->addLog('insert category ' . $term['name']);
            wp_insert_category([
                'cat_name' => $term['name'],
                'category_nicename' => $term['slug'],
                'taxonomy' => 'product_cat',
            ]);
        } else {
            // $report->addLog('exists category ' . $term['name']);
        }
    }

    // verify product belongs to all necessary categories
    $woo_id = $product->get_id();

    foreach ($taxonomy_terms as $term) {
        $has_term = has_term($term['slug'], 'product_cat', $woo_id);
        if ($has_term) {
            // $report->addLog('product has term ' . $term['name']);
        } else {
            // $report->addLog('update product with term ' . $term['name']);
            wp_set_object_terms($woo_id, $term['slug'], 'product_cat', true);
        }
    }
}
