<?php
namespace WooTools;
// TODO: replaced with has_term('', tax);
function product_has_term( $product_id, $taxonomy ) {
    global $wpdb;
    $query = $wpdb->prepare(
        "SELECT 1
         FROM {$wpdb->term_relationships} tr
         INNER JOIN {$wpdb->term_taxonomy} tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
         WHERE tr.object_id = %d
         AND tt.taxonomy = %s
         LIMIT 1",
        $product_id,
        $taxonomy
    );
    return (bool) $wpdb->get_var( $query );
}