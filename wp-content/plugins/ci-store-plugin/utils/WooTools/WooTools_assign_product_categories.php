<?php
namespace WooTools;

/**
 * Bulk assigns WooCommerce products to categories using direct SQL (fastest method).
 *
 * @param array $product_category_map Associative array where:
 *                                    - Keys are product IDs
 *                                    - Values are arrays of category IDs
 * @param bool  $append               If true, retains existing categories; if false, replaces them.
 */
function assign_product_categories($product_category_map, $append = true, $chunk_size = 100)
{
    global $wpdb;

    if (empty($product_category_map)) {
        return;
    }

    // Delete Existing Assignments if Not Appending**
    if (! $append) {
        $product_id_chunks = array_chunk(array_keys($product_category_map), $chunk_size);
        foreach ($product_id_chunks as $chunk) {
            $placeholders = implode(',', array_fill(0, count($chunk), '%d'));
            $wpdb->query($wpdb->prepare(
                "DELETE FROM {$wpdb->prefix}term_relationships WHERE object_id IN ($placeholders)",
                ...$chunk
            ));
        }
    }

    // Prepare Category Assignments in Chunks**
    $insert_values = [];
    $counter       = 0;

    foreach ($product_category_map as $product_id => $category_ids) {
        foreach ($category_ids as $category_id) {
            $insert_values[] = "($product_id, $category_id)";
            $counter++;

            // When the batch reaches $chunk_size, execute the query
            if ($counter >= $chunk_size) {
                $insert_query = "INSERT IGNORE INTO {$wpdb->prefix}term_relationships (object_id, term_taxonomy_id) VALUES " . implode(',', $insert_values);
                $wpdb->query($insert_query);
                $insert_values = []; // Reset batch
                $counter       = 0;
            }
        }
    }

    // Insert Remaining Assignments (if any)**
    if (! empty($insert_values)) {
        $insert_query = "INSERT IGNORE INTO {$wpdb->prefix}term_relationships (object_id, term_taxonomy_id) VALUES " . implode(',', $insert_values);
        $wpdb->query($insert_query);
    }

    // Clear WooCommerce Term Cache**
    delete_transient('wc_term_counts');
}
