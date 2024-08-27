<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/debug_hook.php';

function custom_modify_get_image_size_shop_single($size)
{
    debug_filter('woocommerce_get_image_size_shop_single');
    // debug_print('<div class="border">custom_modify_get_image_size_shop_single()</div>');
    // debug_print_r($size);
    // debug_print_r('<div><h1>Hello!</h1></div>');
}

// add_filter('woocommerce_get_image_size_shop_single', 'custom_modify_get_image_size_shop_single');
