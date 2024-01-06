<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/get_product_image.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/western/western_utils.php';

// customize the image that shows in the admin products table

function custom_modify_placeholder_img($size)
{
    global $product;
    $src = get_product_image($product);

    return '<img 
        width="80" 
        height="80" 
        title="custom_modify_placeholder_img"
        src="'.$src.'" 
        class="woocommerce-placeholder wp-post-image" 
        alt="" 
        style="max-width:100%;object-fit:contain;" 
        decoding="async" 
        fetchpriority="low"
    >';
}

add_filter('woocommerce_placeholder_img', 'custom_modify_placeholder_img');
