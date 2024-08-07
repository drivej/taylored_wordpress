<?php

namespace CIStore\Hooks;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/debug_hook.php';

function custom_modify_cart_item_thumbnail($product_image, $cart_item, $cart_item_key)
{
    debug_hook('woocommerce_cart_item_thumbnail');

    // return '<div>HELLO</div>';

    $woo_product_id = $cart_item['product_id'];

    // is this a CI enhanced product?
    if (!get_post_meta($woo_product_id, '_ci_supplier_key')) {
        return $product_image;
    }

    // is this a variation or a master item
    if (!empty($cart_item['variation_id'])) {
        $item_id = $cart_item['variation_id'];
    } else {
        $item_id = $woo_product_id;
    }

    $additional_images = get_post_meta($item_id, '_ci_additional_images', true);
    if (is_serialized($additional_images)) {
        $additional_images = unserialize($additional_images);
    }

    if (!empty($additional_images) && is_array($additional_images)) {
        $src = reset($additional_images);
        return '<img title="custom_modify_cart_item_thumbnail" src="' . esc_url($src) . '" class="attachment-shop_thumbnail wp-post-image">';
    }

    return $product_image;
}

// add_action('woocommerce_cart_item_thumbnail', 'custom_modify_cart_item_thumbnail', 10, 3);
