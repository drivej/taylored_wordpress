<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/get_product_image.php';

function custom_before_shop_loop_item()
{
    // print('custom_before_shop_loop_item');
    global $product;

    // Check if it's a variable product
    if ($product->is_type('variable')) {
        // $src = get_product_image($product);
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
    } else {
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
