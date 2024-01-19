<?php
// TODO: link to wps image size generator

function custom_modify_get_image_size_shop_single($size)
{
    print('<div class="border">custom_modify_get_image_size_shop_single()</div>');
    print_r($size);
    print_r('<div><h1>Hello!</h1></div>');
}

add_filter('woocommerce_get_image_size_shop_single', 'custom_modify_get_image_size_shop_single');