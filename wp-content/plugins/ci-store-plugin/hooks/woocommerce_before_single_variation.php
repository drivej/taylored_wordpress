<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/debug_hook.php';

function custom_before_single_variation($variation_id)
{
    debug_hook('woocommerce_before_single_variation');

    $serialized_data = get_post_meta($variation_id, '_ci_additional_images', true);
    $additional_images = unserialize($serialized_data);

    if (!empty($additional_images) && is_array($additional_images)) {
        // Replace the default variation image with the first additional image
        $src = reset($additional_images);
        echo '<div class="woocommerce-variation single_variation"><div class="woocommerce-variation-thumbnail">' . '<img src="' . esc_url($src) . '" alt="' . esc_attr(get_the_title($variation_id)) . '" class="wp-post-image" /></div></div>';
    }
}

// add_action('woocommerce_before_single_variation', 'custom_before_single_variation', 10, 1);