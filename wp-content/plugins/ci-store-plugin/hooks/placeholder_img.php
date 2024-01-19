<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/get_product_image.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/western/western_utils.php';

function custom_modify_product_image($image_html, $product, $size, $attr)
{
    if (isset($_GET['debug'])) {
        print('<div class="border">custom_modify_product_image()</div>');
    }
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

function custom_modify_placeholder_img($a, $b, $c)
{
    if (isset($_GET['debug'])) {
        print('<div class="border">custom_modify_placeholder_img()</div>');
    }
    // print('custom_modify_placeholder_img');
    print_r([$a, $b, $c]);
    global $product;
    $src = get_product_image($product);
    // return $src;

    return '<img
        width="100%"
        height="auto"
        title="custom_modify_placeholder_img"
        src="' . $src . '"
        class="woocommerce-placeholder wp-post-image"
        alt=""
        style="max-width:100%;object-fit:contain;object-position:center;aspect-ratio:1/1"
        decoding="async"
        fetchpriority="low"
    >';
}

// add_filter('woocommerce_placeholder_img', 'custom_modify_placeholder_img', 10, 3);
