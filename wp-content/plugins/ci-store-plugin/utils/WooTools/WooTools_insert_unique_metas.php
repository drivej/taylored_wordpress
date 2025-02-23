<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Timer.php';

trait WooTools_insert_unique_metas
{
    public static function insert_unique_metas($all_metas)
    {
        if (!WooTools::is_valid_array($all_metas)) {
            return ['error' => 'metas empty'];
        }
        global $wpdb;
        $chunks = array_chunk($all_metas, 10000); // max 1,000,000 characters

        foreach ($chunks as $metas) {
            // Prepare the values and placeholders for the bulk insert query
            $values = [];
            $placeholders = [];
            $post_ids = [];
            $meta_keys = [];

            foreach ($metas as $meta) {
                $placeholders[] = '(%d, %s, %s)';
                $values[] = $meta['post_id'];
                $values[] = $meta['meta_key'];
                $values[] = $meta['meta_value'];//isset($meta['meta_value']) ? $meta['meta_value'] : NULL;
                $post_ids[] = $meta['post_id'];
                $meta_keys[] = $meta['meta_key'];
            }
            $post_ids = array_unique($post_ids);
            $meta_keys = array_unique($meta_keys);

            $placeholders1 = implode(',', array_fill(0, count($post_ids), '%d'));
            $placeholders2 = implode(',', array_fill(0, count($meta_keys), '%s'));
            // bulk delete to remove duplicates
            $delete_sql = "DELETE FROM {$wpdb->postmeta} WHERE post_id IN ($placeholders1) AND meta_key IN ($placeholders2)";
            $delete_query = $wpdb->prepare($delete_sql, array_merge($post_ids, $meta_keys));
            $wpdb->query($delete_query);

            // bulk insert
            $placeholders = implode(',', $placeholders);
            $insert_sql = "INSERT INTO {$wpdb->postmeta} (post_id, meta_key, meta_value) VALUES $placeholders";
            $insert_query = $wpdb->prepare($insert_sql, $values);
            // error_log($insert_query);
            $insert_query = str_replace("'NULL'", "NULL", $insert_query);
            $wpdb->query($insert_query);
        }

        // Check for errors
        if ($wpdb->last_error) {
            return ['error' => 'Error inserting prices: ' . $wpdb->last_error];
        }
        return ['success' => 'metadata added', 'delete_query' => $delete_query, 'insert_query' => $insert_query];
    }
}
