<?php
namespace WooTools;

/**
 * Bulk removes outdated WooCommerce variation attributes before updating with new attributes,
 * using chunking and query size checks.
 *
 * @param array $variation_attributes_map Associative array where:
 *                                        - Keys are variation IDs
 *                                        - Values are arrays of valid attribute names (e.g., ['color', 'size']).
 * @param int $chunk_size                 Number of variations per batch (default: 1000).
 * @param int $max_query_length           Maximum SQL query length allowed (default: 1,000,000 characters).
 */
function clean_variation_attributes($variation_attributes_map, $chunk_size = 200, $max_query_length = 1000000)
{
    global $wpdb;

    if (empty($variation_attributes_map)) {
        return;
    }

    // Chunk into manageable batches (default 1000 variations per batch)
    $chunks = array_chunk($variation_attributes_map, $chunk_size, true);

    foreach ($chunks as $chunk) {
        $query_conditions = [];
        $query_params     = [];
        $query_base       = "DELETE FROM {$wpdb->postmeta} WHERE ";

        foreach ($chunk as $variation_id => $valid_attributes) {
            if (! empty($valid_attributes)) {
                // Format valid attribute keys with `pa_` prefix
                $valid_meta_keys = array_map(fn($attr) => 'attribute_' . wc_attribute_taxonomy_name($attr), $valid_attributes);
                $placeholders    = implode(',', array_fill(0, count($valid_meta_keys), '%s'));

                // Delete only attributes that are NOT in the valid list
                $query_conditions[] = "(post_id = %d AND meta_key LIKE 'attribute_%%' AND meta_key NOT IN ($placeholders))";
                $query_params       = array_merge($query_params, [$variation_id], $valid_meta_keys);
            } else {
                // Delete all `attribute_pa_*` metadata if no valid attributes exist
                $query_conditions[] = "(post_id = %d AND meta_key LIKE 'attribute_%%')";
                $query_params[]     = $variation_id;
            }

            // **Check query length BEFORE executing**
            if (! empty($query_conditions)) {
                $temp_query     = $query_base . implode(' OR ', $query_conditions);
                $prepared_query = $wpdb->prepare($temp_query, $query_params);

                if (strlen($prepared_query) >= $max_query_length) {
                    // Execute current batch if query length is too long
                    $wpdb->query($prepared_query);
                    // Reset batch conditions and params
                    $query_conditions = [];
                    $query_params     = [];
                }
            }
        }

        // **Execute final batch (if any)**
        if (! empty($query_conditions)) {
            $final_query = $query_base . implode(' OR ', $query_conditions);
            $wpdb->query($wpdb->prepare($final_query, $query_params));
        }
    }
}
