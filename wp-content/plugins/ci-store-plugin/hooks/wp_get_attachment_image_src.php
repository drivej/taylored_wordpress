<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/debug_hook.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/get_product_image.php';

function custom_wp_get_attachment_image_src($image, $attachment_id, $size, $icon)
{
    debug_filter('wp_get_attachment_image_src');

    // error_log(json_encode(['image' => $image]));

    // Get the post_name and URL
    $post_name = get_post_field('post_name', $attachment_id);
    $image_url = wp_get_attachment_url($attachment_id);

    // If the image URL is remote, return the full URL with post_name
    if (filter_var($image_url, FILTER_VALIDATE_URL) && strpos($image_url, home_url()) === false) {
        // You can format the return however you like
        return array(
            'post_name' => $post_name,
            'url' => $image_url,
            'full' => $post_name . ' - ' . $image_url,
        );
    }

    // Otherwise, return the default image
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

add_filter('wp_get_attachment_image_src', 'custom_wp_get_attachment_image_src', 50, 4);
