
<?php

    trait WooTools_attachment_urls_to_postids
    {
        // bulk version of wp's attachment_url_to_postid
        public static function attachment_urls_to_postids($all_urls)
        {
            if (! WooTools::is_valid_array($all_urls)) {
                return ['error' => 'urls empty'];
            }
            global $wpdb;
            $all_urls       = array_unique($all_urls);
            $chunks         = array_chunk($all_urls, 10000);
            $lookup_post_id = [];
            $metadata       = [];

            foreach ($chunks as $urls) {
                $posts = [];

                foreach ($urls as $url) {
                    $posts[] = [
                        'post_parent'    => 0,
                        'post_type'      => 'attachment',
                        'post_mime_type' => 'image/jpeg',
                        'post_status'    => 'inherit',
                        'post_name'      => $url,
                    ];
                }

                $lookup         = WooTools::insert_unique_posts($posts);
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

        public static function attachment_data_to_postids($all_images)
        {
            if (! WooTools::is_valid_array($all_images)) {
                return ['error' => 'data empty'];
            }

            $DEFAULT_ATTACHMENT_METADATA = [
                "width"      => 1,
                "height"     => 1,
                "file"       => "",
                "filesize"   => 1000,
                "sizes"      => [],
                "image_meta" => [
                    "aperture"          => 0,
                    "credit"            => "",
                    "camera"            => "",
                    "caption"           => "",
                    "created_timestamp" => 0,
                    "copyright"         => "",
                    "focal_length"      => 0,
                    "iso"               => "0",
                    "shutter_speed"     => 0,
                    "title"             => "",
                    "orientation"       => 0,
                    "keywords"          => [],
                ],
            ];
            global $wpdb;
            // $all_urls = array_unique($all_images);
            $chunks         = array_chunk($all_images, 10000);
            $lookup_post_id = [];
            $metadata       = [];

            foreach ($chunks as $images) {
                $posts = [];
                foreach ($images as $image) {
                    $posts[] = [
                        'post_parent'    => 0,
                        'post_type'      => 'attachment',
                        'post_mime_type' => $image['mime'] ?? 'image/jpeg',
                        'post_status'    => 'inherit',
                        'post_name'      => $image['file'],
                    ];
                }

                $lookup         = WooTools::insert_unique_posts($posts);
                $lookup_post_id = array_merge($lookup_post_id, $lookup);

                foreach ($images as $image) {
                    $url     = $image['file'];
                    $post_id = isset($lookup[$url]) ? $lookup[$url] : 0;
                    if ($post_id) {
                        $metadata[]          = ['post_id' => $post_id, 'meta_key' => '_wp_attached_file', 'meta_value' => $url];
                        $image['image_meta'] = array_merge($DEFAULT_ATTACHMENT_METADATA['image_meta'], $image['image_meta']);
                        $metavalue           = array_merge($DEFAULT_ATTACHMENT_METADATA, $image);
                        // error_log(json_encode($metavalue, JSON_PRETTY_PRINT));
                        $metadata[] = ['post_id' => $post_id, 'meta_key' => '_wp_attachment_metadata', 'meta_value' => serialize($metavalue)];
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

    // _wp_attached_file
    // _wp_attachment_metadata
    /*
    {
    "width": 44,
    "height": 44,
    "file": "2024/07/play-1.png",
    "filesize": 706,
    "sizes": [],
    "image_meta": {
    "aperture": "0",
    "credit": "",
    "camera": "",
    "caption": "",
    "created_timestamp": "0",
    "copyright": "",
    "focal_length": "0",
    "iso": "0",
    "shutter_speed": "0",
    "title": "",
    "orientation": "0",
    "keywords": []
    }
    }
     */