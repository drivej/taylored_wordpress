<?php
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/get_product_image.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/western/western_utils.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/debug_hook.php';

function custom_modify_single_product_image($html, $post_id)
{
    debug_hook('woocommerce_single_product_image');

    $html = '';
    return $html;

    // global $product;
    // $src = get_product_image($product);
    // $src = resize_western_image($src, 500);
    // print_r(['product' => $product]);
    // return '<img title="custom_modify_single_product_image" src="' . esc_url($src) . '">';

    // global $product;

    // // Check if the product has variations
    // if ($product->is_type('variable')) {
    //     print_r(json_encode($product));
    //     // $product_id = $product->get_id();
    //     // $img = get_post_meta($product_id, '_ci_additional_images', false);

    //     $variation_id = $product->get_available_variations()[0]['variation_id'];
    //     $img = get_post_meta($variation_id, '_ci_additional_images', false);
    //     $meta = get_post_meta($variation_id);
    //     print_r(json_encode($meta));
    //     $src = $img[0];

    //     // Get the variation image URL from a custom field (adjust the field name)
    //     // $custom_image_url = get_post_meta($variation_id, '_your_custom_field_key', true);

    //     // If the custom field is empty, fall back to the featured image
    //     // if (empty($custom_image_url)) {
    //     //     $custom_image_url = wp_get_attachment_url($product->get_image_id());
    //     // }

    //     // Modify the image HTML to use the new URL
    //     return '<img title="custom_modify_single_product_image" src="' . esc_url($src) . '" alt="' . esc_attr($product->get_title()) . '">';
    // } else {
    //     print_r(json_encode($product));
    //     $img = get_post_meta($product->get_id(), '_ci_additional_images', false);
    //     $src = $img[0];
    //     return '<img title="custom_modify_single_product_image" src="' . esc_url($src) . '" alt="' . esc_attr($product->get_title()) . '">';
    // }
}

// add_action('woocommerce_single_product_image', 'custom_modify_single_product_image', 10, 2);
