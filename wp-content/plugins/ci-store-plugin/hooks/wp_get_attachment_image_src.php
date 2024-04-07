<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/debug_hook.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/get_product_image.php';

function custom_wp_get_attachment_image_src($image, $attachment_id, $size, $icon)
{
    debug_filter('wp_get_attachment_image_src');
    return $image;
    // print_r($image);
    // $woo_product_id = get_the_ID();
    // $woo_product = wc_get_product($woo_product_id);
    // // print_r($woo_product);
    // $src = $image;

    // if (isset($product)) {
    //     $src = get_product_image($product);
    //     // $serialized_data = $product->get_meta('_ci_additional_images', true);
    //     // $additional_images = unserialize($serialized_data);

    //     // if (!empty($additional_images) && is_array($additional_images)) {
    //     //     $src = reset($additional_images);
    //     // } else {
    //     //     $src = wc_placeholder_img_src();
    //     // }
    // }
    // // $image = get_product_image($woo_product);
    // // $src = 'https://cdn.wpsstatic.com/images/200_max/dee2-609e874f00790.jpg';
    // return $src;
}

// add_filter('wp_get_attachment_image_src', 'custom_wp_get_attachment_image_src', 50, 4);