<?php

// include_once __DIR__ . '/woocommerce_before_add_to_cart_button.php';
include_once __DIR__ . '/woocommerce_attribute_label.php';
// include_once __DIR__ . '/woocommerce_before_shop_loop_item.php';
// include_once __DIR__ . '/woocommerce_before_single_product_summary.php';
// include_once __DIR__ . '/woocommerce_before_single_product.php';
// include_once __DIR__ . '/woocommerce_before_single_variation.php';
// include_once __DIR__ . '/woocommerce_cart_item_thumbnail.php';
// include_once __DIR__ . '/woocommerce_get_image_size_shop_single.php';
// include_once __DIR__ . '/woocommerce_placeholder_img.php';
include_once __DIR__ . '/image_downsize.php';
// include_once __DIR__ . '/woocommerce_product_thumbnails.php';
// include_once __DIR__ . '/woocommerce_single_product_image.php';
// include_once __DIR__ . '/woocommerce_single_product_summary.php';
// include_once __DIR__ . '/woocommerce_single_variation.php';
// include_once __DIR__ . '/wp_get_attachment_image_src.php';

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
    } else {
        echo '-';
    }
}

add_action('manage_product_posts_custom_column', 'display_custom_product_list_column', 10, 2);
