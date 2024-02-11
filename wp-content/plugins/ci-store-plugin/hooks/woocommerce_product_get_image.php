<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/get_product_image.php';
// include_once WP_PLUGIN_DIR . '/ci-store-plugin/western/western_utils.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/debug_hook.php';

function custom_modify_product_image($image_html, $product, $size, $attr)
{
    debug_filter('woocommerce_product_get_image');

    $src = get_product_image($product);
    $alt = $product->get_name();
    $custom_image_html = '<div class="custom-product-image">
        <img 
            src="'.$src.'" 
            class="wp-post-image" 
            alt="'.esc_attr($alt).'" 
            decoding="async" 
            fetchpriority="high" 
            srcset=""
            data-size="'.esc_attr(json_encode($size)).'"
            style="max-width:100%; max-height:100%; width:100%; object-fit:contain; object-position:center; aspect-ratio:1/1"
        />
    </div>';

    // $custom_image_html = '<div class="custom-product-image">' . $image_html . '<img src="'.$src.'" /></div>';

    return $custom_image_html;
}

add_filter('woocommerce_product_get_image', 'custom_modify_product_image', 10, 4);