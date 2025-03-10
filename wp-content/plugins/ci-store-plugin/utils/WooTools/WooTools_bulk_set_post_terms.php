<?php
namespace WooTools;

use Exception;

function bulk_set_post_terms($post_term_map, $taxonomy, $append = false)
{
    global $wpdb;

    if (empty($post_term_map) || ! is_array($post_term_map)) {
        return false;
    }

    $term_relationship_table = $wpdb->term_relationships;
    $term_taxonomy_table     = $wpdb->term_taxonomy;
    $post_ids                = array_map('intval', array_keys($post_term_map));

    // Collect unique term IDs
    $all_term_ids = array_unique(array_merge(...array_filter($post_term_map, 'is_array')));
    if (empty($all_term_ids)) {
        return false;
    }

    // Fetch term_taxonomy_ids
    $tt_id_map = $wpdb->get_results($wpdb->prepare("
        SELECT term_id, term_taxonomy_id FROM $term_taxonomy_table
        WHERE taxonomy = %s AND term_id IN (" . implode(',', array_fill(0, count($all_term_ids), '%d')) . ")",
        array_merge([$taxonomy], $all_term_ids)
    ), OBJECT_K);
    if (empty($tt_id_map)) {
        return false;
    }

    $wpdb->query('START TRANSACTION');

    try {
        // Optimized DELETE for existing terms
        if (! $append && ! empty($post_ids) && ! empty($all_term_ids)) {
            $placeholders_clear = implode(',', array_fill(0, count($post_ids), '%d'));
            $placeholders_tt    = implode(',', array_fill(0, count($all_term_ids), '%d'));

            $wpdb->query($wpdb->prepare("
                DELETE tr FROM $term_relationship_table tr
                INNER JOIN $term_taxonomy_table tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
                WHERE tt.taxonomy = %s
                AND tr.object_id IN ($placeholders_clear)
                AND tt.term_id IN ($placeholders_tt)",
                array_merge([$taxonomy], $post_ids, $all_term_ids)
            ));
        }

        // Bulk Insert with chunking
        $insert_values = [];
        foreach ($post_term_map as $post_id => $term_ids) {
            foreach ($term_ids as $term_id) {
                if (! isset($tt_id_map[$term_id])) {
                    continue;
                }

                $insert_values[] = (int) $post_id;
                $insert_values[] = (int) $tt_id_map[$term_id]->term_taxonomy_id;
            }
        }

        if (! empty($insert_values)) {
            $chunked_insert_values = array_chunk($insert_values, 1000);
            foreach ($chunked_insert_values as $chunk) {
                $placeholders_string = implode(',', array_fill(0, count($chunk) / 2, "(%d, %d)"));
                $wpdb->query($wpdb->prepare("
                    INSERT INTO $term_relationship_table (object_id, term_taxonomy_id)
                    VALUES $placeholders_string
                    ON DUPLICATE KEY UPDATE term_taxonomy_id = VALUES(term_taxonomy_id)",
                    $chunk
                ));
            }
        }

        $wpdb->query('COMMIT');
        return true;
    } catch (Exception $e) {
        $wpdb->query('ROLLBACK');
        // error_log("ERROR: " . $e->getMessage());
        return false;
    }
}
