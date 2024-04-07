<?php

// include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/debug_hook.php';

// function custom_change_placeholder_image($placeholder_url) {
//     // Replace 'your-custom-placeholder-image.jpg' with the path or URL of your custom placeholder image
//     if (isset($_GET['debug'])) {
//         print('<div class="border">custom_change_placeholder_image()</div>');
//     }
//     // $custom_image_url = 'your-custom-placeholder-image.jpg';

//     // return $custom_image_url;
// }

// add_filter('woocommerce_placeholder_img_src', 'custom_change_placeholder_image');

// customize the image that shows in the admin products table

// function custom_modify_placeholder_img($a, $b, $c)
// {
//     debug_filter('woocommerce_placeholder_img');
//     // print('custom_modify_placeholder_img');
//     debug_print_r([$a, $b, $c]);
//     global $product;
//     $src = get_product_image($product);
//     // return $src;

//     return '<img
//         width="100%"
//         height="auto"
//         title="custom_modify_placeholder_img"
//         src="' . $src . '"
//         class="woocommerce-placeholder wp-post-image"
//         alt=""
//         style="max-width:100%;object-fit:contain;object-position:center;aspect-ratio:1/1"
//         decoding="async"
//         fetchpriority="low"
//     >';
// }

// add_filter('woocommerce_placeholder_img', 'custom_modify_placeholder_img', 10, 3);
