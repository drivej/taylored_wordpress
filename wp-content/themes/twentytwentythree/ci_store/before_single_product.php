<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/get_product_image.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/western/western_utils.php';

function custom_display_first_variation_image()
{
    print('custom_display_first_variation_image');

    global $product;
    $src = get_product_image($product);
    $src = resize_western_image($src, 500);
    return '<img title="custom_display_first_variation_image" src="' . esc_url($src) . '">';
    // global $product;
    // if ($product->is_type('variable')) {
    //     $variations = $product->get_available_variations();
    //     if (!empty($variations)) {
    //         $first_variation = $variations[0];
    //         $variation_id = $first_variation['variation_id'];
    //         $src = get_post_meta($variation_id, '_ci_additional_images', true);
    //         return '<img title="custom_display_first_variation_image" src="' . esc_url($src) . '">';
    //     } else {
    //         $img = get_post_meta($product->get_id(), '_ci_additional_images', true);
    //         $src = $img[0];
    //         return '<h1>This is it2!</h1><img src="' . esc_url($src) . '">';
    //     }
    // }
    // if ($product->is_type('simple')) {
    //     print_r('simple product');
    // }
}

add_action('woocommerce_before_single_product', 'custom_display_first_variation_image');