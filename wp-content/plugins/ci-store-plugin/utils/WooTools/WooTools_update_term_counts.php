<?php
namespace WooTools;

/**
 * Updates the term counts for a given set of term_taxonomy_ids in a specific taxonomy,
 * optimized for large numbers of terms by processing in batches.
 *
 * @param string $taxonomy The taxonomy slug (e.g., 'category', 'post_tag', 'product_vehicle').
 * @param array $tt_ids Array of term_taxonomy_ids whose counts need updating.
 * @param int $batch_size The number of term_taxonomy_ids to process per batch. Default is 1000.
 * @return void
 */
function update_term_counts_for_taxonomy($taxonomy, $tt_ids, $batch_size = 1000)
{
    // TODO: execute this somewhere!!
    global $wpdb;

    // Exit early if no term_taxonomy_ids are provided
    if (empty($tt_ids) || ! is_array($tt_ids)) {
        return;
    }

    // Sanitize and deduplicate term_taxonomy_ids
    $tt_ids = array_map('intval', $tt_ids);
    $tt_ids = array_unique($tt_ids);

    if (empty($tt_ids)) {
        return;
    }

    $term_taxonomy_table     = $wpdb->term_taxonomy;
    $term_relationship_table = $wpdb->term_relationships;

    // Split the term_taxonomy_ids into batches
    $batches = array_chunk($tt_ids, $batch_size);

    foreach ($batches as $batch) {
        // Create placeholders for the IN clause
        $placeholders = implode(',', array_fill(0, count($batch), '%d'));

        // Update counts for this batch
        $wpdb->query($wpdb->prepare("
            UPDATE $term_taxonomy_table tt
            SET tt.count = (
                SELECT COUNT(*)
                FROM $term_relationship_table tr
                WHERE tr.term_taxonomy_id = tt.term_taxonomy_id
            )
            WHERE tt.taxonomy = %s
            AND tt.term_taxonomy_id IN ($placeholders)",
            array_merge([$taxonomy], $batch)
        ));
    }
}
