<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/debug_hook.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/get_product_image.php';

function custom_change_list_view_image()
{
    debug_hook('woocommerce_before_shop_loop_item_title');

    global $product;

    // Get the product ID
    // $product_id = $product->get_id();

    // Get the image URL from meta data
    $product_image = get_product_image($product);

    if ($product_image) {
        // Replace the default product image with the custom image
        echo '<img src="' . esc_url($product_image) . '" alt="' . esc_attr($product->get_title()) . '" class="attachment-shop_catalog size-shop_catalog wp-post-image" />';
    }
}

// add_action('woocommerce_before_shop_loop_item_title', 'custom_change_list_view_image');

function custom_before_shop_loop_item()
{
    debug_action('woocommerce_before_shop_loop_item');
    // if (isset($_GET['debug'])) {
    //     print('<div class="border">custom_before_shop_loop_item()</div>');
    // }
    // print('custom_before_shop_loop_item');
    global $product;

    $current_stock_status = $product->get_meta('_stock_status', true);

    debug_data(['current_stock_status' => $current_stock_status, 'sku'=>$product->get_sku()]);

    return;

    // Check if it's a variable product
    // print_r(['type'=>$product->get_type()]);

    if ($product->is_type('variable')) {
        $serialized_data = $product->get_meta('_ci_additional_images', true);
        $additional_images = unserialize($serialized_data);
        echo '<hr />';
        print_r($additional_images);
        $src = get_product_image($product);
        echo '<img src="' . esc_url($src) . '" alt="' . esc_attr($product->get_title()) . '" class="attachment-shop_catalog size-shop_catalog wp-post-image" style="border:2px solid blue" />';
        // print($src);
        // return $src;
        // Get the first available variation
        // $variations = $product->get_available_variations();
        // if (!empty($variations)) {
        //     $first_variation = $variations[0];

        //     $variation_id = $first_variation['variation_id'];

        //     $img = get_post_meta($variation_id, '_ci_additional_images', false);
        //     $images = explode(',',$img[0]);
        //     $src = null;

        //     if (count($images) && isset($images[0])) {
        //         $src = $images[0];
        //     }
        //     if (!$src) {
        //         $src = wc_placeholder_img_src();
        //     }

        //     // $meta = get_post_meta($variation_id);
        //     // $src = get_post_meta($variation_id, '_ci_additional_images', true);
        //     print('<pre>' . json_encode(array('img' => $img, 'variation_id' => $variation_id), JSON_PRETTY_PRINT) . '</pre>');
        //     // $src = $img[0];
        //     return '<img src="' . esc_url($src) . '">';

        //     // Modify the product image source to use the first variation's image
        //     // $product->set_image(array('url' => $src));
        // }
        // } else {
        // $product
        // $src = get_product_image($product);
        // $img = $product->get_meta('_ci_additional_images');
        // $images = explode(',', $img);
        // $src = null;

        // if (count($images) && isset($images[0])) {
        //     $src = $images[0];
        // }
        // if (!$src) {
        //     $src = wc_placeholder_img_src();
        // }
        // print '<img src="' . esc_url($src) . '">';
        // $product = wc_get_product_object('product', $product->get_id());
    }
    // print '<img title="custom_before_shop_loop_item" src="' . esc_url($src) . '">';
}

add_action('woocommerce_before_shop_loop_item', 'custom_before_shop_loop_item');
