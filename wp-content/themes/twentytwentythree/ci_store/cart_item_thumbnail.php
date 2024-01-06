<?php

function custom_modify_cart_item_thumbnail($product_image, $cart_item, $cart_item_key)
{
    print('custom_modify_cart_item_thumbnail');
    $product_id = $cart_item['product_id'];
    $img = get_post_meta($product_id, '_ci_additional_images', false);
    $src = $img[0];
    return '<img title="custom_modify_cart_item_thumbnail" src="' . $src . '" class="attachment-shop_thumbnail wp-post-image">';
}

add_action('woocommerce_cart_item_thumbnail', 'custom_modify_cart_item_thumbnail', 10, 3);