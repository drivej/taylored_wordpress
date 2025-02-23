<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Timer.php';

trait WooTools_insert_unique_posts
{
    public static function insert_unique_posts($all_posts)
    {
        // WARNING: this assumes post_names are unique
        if (!isset($all_posts) || !is_array($all_posts) || !count($all_posts)) {
            return ['error' => 'posts empty'];
        }
        global $wpdb;
        $post_date = date('Y-m-d H:i:s');
        $post_date_gmt = get_gmt_from_date($post_date);

        $DEFAULT_ROW = [
            'post_author' => 1,
            'post_date' => $post_date,
            'post_date_gmt' => $post_date_gmt,
            'post_content' => '',
            'post_title' => '',
            'post_excerpt' => '',
            'post_status' => 'publish',
            'comment_status' => 'open',
            'ping_status' => 'closed',
            'post_password' => '',
            'post_name' => '',
            'to_ping' => '',
            'pinged' => '',
            'post_modified' => $post_date,
            'post_modified_gmt' => $post_date_gmt,
            'post_content_filtered' => '',
            'post_parent' => 0,
            'guid' => '',
            'menu_order' => 0,
            'post_type' => 'product',
            'post_mime_type' => '',
            'comment_count' => 0,
        ];
        ksort($DEFAULT_ROW);

        $DEFAULT_ROW_TYPE = [
            'post_author' => '%d',
            'post_date' => '%s',
            'post_date_gmt' => '%s',
            'post_content' => '%s',
            'post_title' => '%s',
            'post_excerpt' => '%s',
            'post_status' => '%s',
            'comment_status' => '%s',
            'ping_status' => '%s',
            'post_password' => '%s',
            'post_name' => '%s',
            'to_ping' => '%s',
            'pinged' => '%s',
            'post_modified' => '%s',
            'post_modified_gmt' => '%s',
            'post_content_filtered' => '%s',
            'post_parent' => '%d',
            'guid' => '%s',
            'menu_order' => '%d',
            'post_type' => '%s',
            'post_mime_type' => '%s',
            'comment_count' => '%d',
        ];
        ksort($DEFAULT_ROW_TYPE);

        $chunks = array_chunk($all_posts, 10000); // max 1,000,000 characters
        $lookup_woo_id = [];

        foreach ($chunks as $posts) {
            $values = [];
            $insert_placeholders = [];
            $insert_placeholder = '(' . implode(",", array_values($DEFAULT_ROW_TYPE)) . ')';
            // $post_names = [];

            // TODO: skip posts that already exist

            $post_names = array_column($posts, 'post_name');
            $names_placeholders = implode(',', array_fill(0, count($post_names), '%s'));
            $select_sql = "SELECT ID, post_name FROM {$wpdb->posts} WHERE post_name IN ($names_placeholders)";
            $select_query = $wpdb->prepare($select_sql, $post_names);
            $results = $wpdb->get_results($select_query);
            // return $results;
            // $post_names_lookup = array_column($posts, 'post_name');
            $lookup_post = array_column($results, 'ID', 'post_name');
            // $keepers = array_diff($post_names_lookup, $lookup);

            // return ['$post_names' => $post_names, '$post_names_lookup' => $post_names_lookup, '$lookup' => $lookup, '$keepers' => $keepers];

            foreach ($posts as $post) {
                $post_name = $post['post_name'];
                $post_id = isset($lookup_post[$post_name]) ? $lookup_post[$post_name] : 0;
                if ($post_id) {
                    // skip - this exists
                    $lookup_woo_id[$post_name] = $post_id;
                } else {
                    $post = array_merge($DEFAULT_ROW, $post);
                    ksort($post);
                    $insert_placeholders[] = $insert_placeholder;
                    $values = array_merge($values, array_values($post));
                    $post_names[] = $post_name;
                }
            }

            // return ['values' => $values, 'lookup_woo_id' => $lookup_woo_id, '$post_names' => $post_names, '$post_names_lookup' => $post_names_lookup, '$lookup' => $lookup, '$keepers' => $keepers];

            // bulk insert
            if (count($values)) {
                $insert_placeholders = implode(',', $insert_placeholders);
                $fields = implode(',', array_keys($DEFAULT_ROW));
                $insert_sql = "INSERT INTO {$wpdb->posts} ($fields) VALUES $insert_placeholders";
                $insert_query = $wpdb->prepare($insert_sql, $values);
                $wpdb->query($insert_query);

                if ($wpdb->last_error) {
                    return ['error' => 'Error inserting posts: ' . $wpdb->last_error];
                }
            }

            $names_placeholders = implode(',', array_fill(0, count($post_names), '%s'));
            $select_sql = "SELECT ID, post_name FROM {$wpdb->posts} WHERE post_name IN ($names_placeholders)";
            $select_query = $wpdb->prepare($select_sql, $post_names);
            $results = $wpdb->get_results($select_query);
            $lookup = array_column($results, 'ID', 'post_name');
            $lookup_woo_id = array_merge($lookup_woo_id, $lookup);
        }

        return $lookup_woo_id;
    }
}
