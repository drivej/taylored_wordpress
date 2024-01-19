<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/get_product_image.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/western/western_utils.php';

function custom_display_first_variation_image($a)
{
    if (isset($_GET['debug'])) {
        print('<div class="border">custom_display_first_variation_image()</div>');
    }

    global $product;
    $src = get_product_image($product);
    $src = resize_western_image($src, 500);

    // $additional_images = get_post_meta(get_the_ID(), '_ci_additional_images', false);

    echo '<div class="woocommerce-product-gallery__image"><img src="' . esc_url($src) . '" alt="' . esc_attr(get_the_title()) . '" class="wp-post-image" /></div>';

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

add_action('woocommerce_before_single_product', 'custom_display_first_variation_image', 20, 1);

function custom_replace_variation_image($variation_id)
{
    print('<div class="border">custom_replace_variation_image()</div>');
    $serialized_data = get_post_meta($variation_id, '_ci_additional_images', true);
    $additional_images = unserialize($serialized_data);

    if (!empty($additional_images) && is_array($additional_images)) {
        // Replace the default variation image with the first additional image
        $src = reset($additional_images);
        echo '<div class="woocommerce-variation single_variation"><div class="woocommerce-variation-thumbnail">' . '<img src="' . esc_url($src) . '" alt="' . esc_attr(get_the_title($variation_id)) . '" class="wp-post-image" /></div></div>';
    }
}

add_action('woocommerce_before_single_variation', 'custom_replace_variation_image', 10, 1);

function custom_change_variation_image($output)
{
    // Get the variation image URL from meta data
    if (isset($_GET['debug'])) {
        print('<div>custom_change_variation_image()</div>');
    }
    print_r(['output' => $output, 'type' => gettype($output)]);
    if (empty($output)) {
        return;
    }
    $variation_id = $output['variation_id'];
    // $variation_image = get_post_meta($variation_id, '_ci_variation_image', true);

    $serialized_data = get_post_meta($variation_id, '_ci_additional_images', true);
    $additional_images = unserialize($serialized_data);

    if (!empty($additional_images) && is_array($additional_images)) {
        $src = reset($additional_images);
        // return '<img title="custom_modifxy_cart_item_thumbnail" src="' . esc_url($src) . '" class="attachment-shop_thumbnail wp-post-image">';

        $output['image']['thumb_src'] = $src;
        $output['image']['src'] = $src;
        $output['image']['srcset'] = '';
    }

    // if ($variation_image) {
    //     // Replace the main product image with the variation image
    //     $output['image']['thumb_src'] = $variation_image;
    //     $output['image']['src'] = $variation_image;
    //     $output['image']['srcset'] = '';
    // }
    print_r($output);

    return $output;
}

add_filter('woocommerce_single_variation', 'custom_change_variation_image');
