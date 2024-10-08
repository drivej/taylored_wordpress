<?php

// namespace CIStore\Hooks;

include_once __DIR__ . '/woocommerce_before_shop_loop_item.php';
include_once __DIR__ . '/woocommerce_before_single_product.php';
include_once __DIR__ . '/woocommerce_cart_item_thumbnail.php';
include_once __DIR__ . '/image_downsize.php';
include_once __DIR__ . '/user_profile.php';


// include_once __DIR__ . '/woocommerce_before_add_to_cart_button.php';
// include_once __DIR__ . '/woocommerce_attribute_label.php';
// include_once __DIR__ . '/woocommerce_before_single_product_summary.php';
// include_once __DIR__ . '/woocommerce_before_single_variation.php';
// include_once __DIR__ . '/woocommerce_product_query.php'; // TODO: in progress for checking products before query
// include_once __DIR__ . '/woocommerce_get_image_size_shop_single.php';
// include_once __DIR__ . '/woocommerce_placeholder_img.php';
// include_once __DIR__ . '/pre_get_posts.php';
// include_once __DIR__ . '/woocommerce_product_thumbnails.php';
// include_once __DIR__ . '/woocommerce_single_product_image.php';
// include_once __DIR__ . '/woocommerce_single_product_summary.php';
// include_once __DIR__ . '/woocommerce_single_variation.php';
// include_once __DIR__ . '/wp_get_attachment_image_src.php';

// function custom_wp_get_attachment_url($url, $post_id)
// {
//     // Check if the attribute name matches the one you want to customize
//     error_log('custom_wp_get_attachment_url()' . json_encode(['url' => $url, 'post_id' => $post_id]));
//     return $url;
// }

// add_filter('wp_get_attachment_url', 'custom_wp_get_attachment_url', 10, 2);

// function custom_woocommerce_single_product_image($html, $post_id)
// {
//     debug_hook('woocommerce_single_product_image');
//     print '<h1>custom_woocommerce_single_product_image</h1>';
//     return $html;
// }
// add_action('woocommerce_single_product_image', 'custom_woocommerce_single_product_image', 10, 2);

// function custom_manage_product_posts_columns($columns)
// {
//     // Add last imported column to admin products table
//     $columns['last_import'] = 'Imported';
//     return $columns;
// }

// add_filter('manage_product_posts_columns', 'custom_manage_product_posts_columns');

// function custom_manage_product_posts_custom_column($column, $post_id)
// {
//     if ($column === 'last_import') {
//         $imported = get_post_meta($post_id, '_ci_import_timestamp', true);
//         $date_imported = new \DateTime($imported ? $imported : '2000-01-01 12:00:00');
//         $currentDateTime = new \DateTime();
//         $interval = $currentDateTime->diff($date_imported);
//         $daysDifference = $interval->days;
//         echo $daysDifference . ' days';
//     } else {
//         echo '-';
//     }
// }

// add_action('manage_product_posts_custom_column', 'custom_manage_product_posts_custom_column', 10, 2);
