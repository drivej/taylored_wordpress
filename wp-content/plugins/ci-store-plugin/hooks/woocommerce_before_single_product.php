<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/get_product_image.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/western/western_utils.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/debug_hook.php';

function custom_before_single_product()
{
    debug_hook('woocommerce_before_single_product');

    global $product;
    $src = get_product_image($product);
    $src = resize_western_image($src, 500);
    // this is duplicative of import code
    if (is_product() && $product) {
        $wps_product_id = $product->get_meta('_ci_product_id', true);
        $woo_stock_status = $product->get_stock_status();
        $wps_stock_status = get_western_stock_status($wps_product_id);

        if ($woo_stock_status !== $wps_stock_status) {
            $product->set_stock_status($wps_stock_status);
        }
    }

    debug_print_r(['wps_stock_status' => $wps_stock_status, 'woo_stock_status' => $woo_stock_status, 'wps_product_id' => $wps_product_id]);

    // $additional_images = get_post_meta(get_the_ID(), '_ci_additional_images', false);

    // display main image - this sucks right now
    // echo '<div class="woocommerce-product-gallery__image"><img src="' . esc_url($src) . '" alt="' . esc_attr(get_the_title()) . '" class="wp-post-image" /></div>';

    if (is_product()) {
        // this helps variable products with a single variation act like simple products
        wp_enqueue_script('custom_before_single_product_script', plugin_dir_url(dirname(__FILE__)) . 'js/custom_before_single_product_script.js', array('jquery'), '0.6', true);
        wp_enqueue_style('custom_before_single_product_style', plugin_dir_url(dirname(__FILE__)) . 'css/custom_before_single_product_style.css', null, '0.2');
    }
    // if ($additional_images) {
    //     // print_r(['test'=>$additional_images]);
    //     // Replace the default image with the first additional image
    //     $first_additional_image = reset($additional_images);
    //     echo '<div class="woocommerce-product-gallery__image"><img src="' . esc_url($first_additional_image) . '" alt="' . esc_attr(get_the_title()) . '" class="wp-post-image" /></div>';
    // }

    // return '<img title="custom_display_first_variation_image" src="' . esc_url($src) . '">';
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

add_action('woocommerce_before_single_product', 'custom_before_single_product', 20);
