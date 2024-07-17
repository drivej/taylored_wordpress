
<?php

trait WooTools_attachment_urls_to_postids
{
    // bulk version of wp's attachment_url_to_postid
    public static function attachment_urls_to_postids($all_urls)
    {
        if (!isset($all_urls) || !is_array($all_urls) || !count($all_urls)) {
            // error_log('WooTools_attachment_urls_to_postids $urls is empty');
            return ['error' => 'urls empty'];
        }
        global $wpdb;
        $all_urls = array_unique($all_urls);
        $chunks = array_chunk($all_urls, 10000);
        $lookup_post_id = [];
        $metadata = [];

        foreach ($chunks as $urls) {
            $posts = [];

            foreach ($urls as $url) {
                $posts[] = [
                    'post_parent' => 0,
                    'post_type' => 'attachment',
                    'post_mime_type' => 'image/jpeg',
                    'post_status' => 'inherit',
                    'post_name' => $url,
                ];
            }

            $lookup = WooTools::insert_unique_posts($posts);
            $lookup_post_id = array_merge($lookup_post_id, $lookup);

            foreach ($urls as $url) {
                $post_id = isset($lookup[$url]) ? $lookup[$url] : 0;
                if ($post_id) {
                    $metadata[] = ['post_id' => $post_id, 'meta_key' => '_wp_attached_file', 'meta_value' => $url];
                }
            }
        }

        WooTools::insert_unique_metas($metadata);

        // Check for errors
        if ($wpdb->last_error) {
            return ['error' => 'Error inserting attachments: ' . $wpdb->last_error];
        }
        return $lookup_post_id;
    }
}
