<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/debug_hook.php';

function custom_modify_cart_item_thumbnail($product_image, $cart_item, $cart_item_key)
{
    debug_hook('woocommerce_cart_item_thumbnail');
    // print('<div class="border">custom_modify_cart_item_thumbnail()</div>');
    $woo_product_id = $cart_item['product_id'];
    $serialized_data = get_post_meta($woo_product_id, '_ci_additional_images', true);
    $additional_images = unserialize($serialized_data);

    if (!empty($additional_images) && is_array($additional_images)) {
        $src = reset($additional_images);
        return '<img title="custom_modify_cart_item_thumbnail" src="' . esc_url($src) . '" class="attachment-shop_thumbnail wp-post-image">';
    }

    return $product_image;
}

add_action('woocommerce_cart_item_thumbnail', 'custom_modify_cart_item_thumbnail', 10, 3);
