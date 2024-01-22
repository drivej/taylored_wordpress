<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/debug_hook.php';

function custom_modify_before_single_product_summary()
{
    debug_hook('woocommerce_before_single_product_summary');
    // if (isset($_GET['debug'])) {
    //     print('<div class="border">woocommerce_before_single_product_summary()</div>');
    // }
    // global $post;
    // $img = get_post_meta($post->ID, '_ci_additional_images', false);
    // $src = $img[0];
    // return '<img title="custom_modify_before_single_product_summary" src="' . $src . '" alt="Product Image">';
}

add_action('woocommerce_before_single_product_summary', 'custom_modify_before_single_product_summary');
