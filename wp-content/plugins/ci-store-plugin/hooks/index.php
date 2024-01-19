<?php

include_once __DIR__ . '/before_shop_loop_item.php';
include_once __DIR__ . '/before_single_product_summary.php';
include_once __DIR__ . '/before_single_product.php';
include_once __DIR__ . '/cart_item_thumbnail.php';
include_once __DIR__ . '/image_size.php';
include_once __DIR__ . '/placeholder_img.php';
include_once __DIR__ . '/product_thumbnails.php';
include_once __DIR__ . '/single_product_image.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/log/write_to_log_file.php';

function custom_product_list_column($columns)
{
    // Add last imported column
    $columns['last_import'] = 'Imported';
    return $columns;
}

add_filter('manage_product_posts_columns', 'custom_product_list_column');

function display_custom_product_list_column($column, $post_id)
{
    if ($column === 'last_import') {
        $imported = get_post_meta($post_id, '_ci_import_timestamp', true);
        $date_imported = new DateTime($imported ? $imported : '2000-01-01 12:00:00');
        $currentDateTime = new DateTime();
        $interval = $currentDateTime->diff($date_imported);
        $daysDifference = $interval->days;
        echo $daysDifference. ' days';
    }
}

add_action('manage_product_posts_custom_column', 'display_custom_product_list_column', 10, 2);
