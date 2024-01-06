<?php

function product_exists($supplier_key, $sku)
{
    global $wpdb;

    $post_id = $wpdb->get_var(
        $wpdb->prepare(
            "SELECT DISTINCT p1.post_id FROM wp_postmeta p1
            INNER JOIN wp_postmeta p2 ON p1.post_id = p2.post_id
            WHERE (p1.meta_key = '_ci_supplier_key' AND p1.meta_value = %s)
            AND (p2.meta_key = '_ci_product_id' AND p2.meta_value = %s)",
            $supplier_key,
            $sku
        )
    );

    return $post_id;
}
