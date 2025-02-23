<?php
namespace WooTools;

function get_product_info_by_skus($skus)
{
    global $wpdb;

    if (empty($skus)) {
        return []; // Return empty array if no SKUs provided
    }

    $placeholders = implode(',', array_fill(0, count($skus), '%s'));
    $sql = $wpdb->prepare("
        SELECT pm.meta_value AS sku, p.ID AS post_id, p.post_parent, p.post_type 
        FROM {$wpdb->prefix}postmeta pm
        INNER JOIN {$wpdb->prefix}posts p ON pm.post_id = p.ID
        WHERE pm.meta_key = '_sku' 
        AND pm.meta_value IN ($placeholders)
    ", ...$skus);

    $results = $wpdb->get_results($sql, ARRAY_A);

    return array_column($results, null, 'sku');
}
