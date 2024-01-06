<?php

include_once __DIR__ . "/get_western_product.php";
include_once __DIR__ . "/get_western_products_page.php";

/*

http://tayloredlocal.local/wp-admin/admin-ajax.php?action=wps_ajax_handler&cmd=product&product_id=6
http://tayloredlocal.local/wp-admin/admin-ajax.php?action=wps_ajax_handler&cmd=products&size=200

*/

function wps_ajax_handler()
{
    $cmd = $_GET['cmd'];

    switch ($cmd) {

        case 'product':
            $product_id = $_GET['product_id'];
            wp_send_json(get_western_product($product_id));
            break;

        case 'products':
            $cursor = $_GET['cursor'];
            $size = $_GET['size'];
            $updated = $_GET['updated'];
            wp_send_json(get_western_products_page($cursor, $updated, $size));
            break;
    }
    wp_send_json(['error' => 'command not found']);

}

add_action('wp_ajax_wps_ajax_handler', 'wps_ajax_handler');
