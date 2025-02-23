<?php
namespace WooTools;
// TODO: unused
function empty_taxonomy($taxonomy, $batch_size = 5000)
{
    global $wpdb;

    if (! $taxonomy) {
        return false;
    }

    // $taxonomy      = 'product_vehicle';
    $total_deleted = 0;

    do {
        // ✅ Step 1: Fetch a batch of term IDs
        $term_ids = $wpdb->get_col($wpdb->prepare("
            SELECT term_id FROM {$wpdb->term_taxonomy}
            WHERE taxonomy = %s
            LIMIT %d
        ", $taxonomy, $batch_size));

        if (empty($term_ids)) {
            break; // No more terms left to delete
        }

        // ✅ Step 2: Delete term relationships (detach terms from products)
        $wpdb->query("
            DELETE FROM {$wpdb->term_relationships}
            WHERE term_taxonomy_id IN (
                SELECT term_taxonomy_id FROM {$wpdb->term_taxonomy} WHERE term_id IN (" . implode(',', $term_ids) . ")
            )
        ");

        // ✅ Step 3: Delete from `wp_term_taxonomy`
        $wpdb->query("
            DELETE FROM {$wpdb->term_taxonomy}
            WHERE term_id IN (" . implode(',', $term_ids) . ")
        ");

        // ✅ Step 4: Delete from `wp_terms`
        $wpdb->query("
            DELETE FROM {$wpdb->terms}
            WHERE term_id IN (" . implode(',', $term_ids) . ")
        ");

        // ✅ Step 5: Clear WordPress taxonomy cache
        clean_term_cache($term_ids, $taxonomy);
        delete_transient('wc_term_counts'); // Clear WooCommerce term counts

        $total_deleted += count($term_ids);

        // ✅ Step 6: Free memory
        gc_collect_cycles();
        sleep(1); // Prevent overloading the database

    } while (! empty($term_ids)); // Keep looping until all terms are removed

    return "Total {$total_deleted} terms removed from '{$taxonomy}'";
}

// TODO: unused
function empty_taxonomy_like($taxonomy, $like_pattern, $batch_size = 5000)
{
    global $wpdb;

    $total_deleted = 0;

    do {
        // ✅ Step 1: Fetch a batch of term IDs where slug matches the LIKE pattern
        $term_ids = $wpdb->get_col($wpdb->prepare("
            SELECT t.term_id
            FROM {$wpdb->terms} t
            INNER JOIN {$wpdb->term_taxonomy} tt ON t.term_id = tt.term_id
            WHERE tt.taxonomy = %s
            AND t.slug LIKE %s
            LIMIT %d
        ", $taxonomy, $like_pattern, $batch_size));

        if (empty($term_ids)) {
            break; // No more matching terms left to delete
        }

        // ✅ Step 2: Delete term relationships (detach terms from products)
        $wpdb->query("
            DELETE FROM {$wpdb->term_relationships}
            WHERE term_taxonomy_id IN (
                SELECT term_taxonomy_id FROM {$wpdb->term_taxonomy} WHERE term_id IN (" . implode(',', $term_ids) . ")
            )
        ");

        // ✅ Step 3: Delete from `wp_term_taxonomy`
        $wpdb->query("
            DELETE FROM {$wpdb->term_taxonomy}
            WHERE term_id IN (" . implode(',', $term_ids) . ")
        ");

        // ✅ Step 4: Delete from `wp_terms`
        $wpdb->query("
            DELETE FROM {$wpdb->terms}
            WHERE term_id IN (" . implode(',', $term_ids) . ")
        ");

        // ✅ Step 5: Clear WordPress taxonomy cache
        clean_term_cache($term_ids, $taxonomy);
        delete_transient('wc_term_counts'); // Clear WooCommerce term counts

        $total_deleted += count($term_ids);

        // ✅ Step 6: Free memory and prevent DB overload
        gc_collect_cycles();
        sleep(1);

    } while (! empty($term_ids)); // Keep looping until all matching terms are removed

    return "Total {$total_deleted} terms removed from '{$taxonomy}' where slug LIKE '{$like_pattern}'.";
}

// ✅ Run the function for `product_vehicle` taxonomy with slugs matching `%_vehicle%`
// echo batch_delete_terms_by_slug('product_vehicle', '%_vehicle%', 5000);
