<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/debug_hook.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/get_product_image.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';

// function custom_change_list_view_image()
// {
//     debug_hook('woocommerce_before_shop_loop_item_title');

//     global $product;

//     // Get the product ID
//     // $product_id = $product->get_id();

//     // Get the image URL from meta data
//     $product_image = get_product_image($product);

//     if ($product_image) {
//         // Replace the default product image with the custom image
//         echo '<img src="' . esc_url($product_image) . '" alt="' . esc_attr($product->get_title()) . '" class="attachment-shop_catalog size-shop_catalog wp-post-image" />';
//     }
// }

// add_action('woocommerce_before_shop_loop_item_title', 'custom_change_list_view_image');

function custom_before_shop_loop_item()
{
    debug_action('woocommerce_before_shop_loop_item');
    // if (isset($_GET['debug'])) {
    //     print('<div class="border">custom_before_shop_loop_item()</div>');
    // }
    // print('custom_before_shop_loop_item');
    global $product;

    if (WooTools::should_update_loop_product($product)) {
        $supplier = WooTools::get_product_supplier($product);
        $supplier->update_loop_product($product);
    }
    // the existence of this meta key indicates all we need to know about this product
    // $update = $product->get_meta('_ci_update_pdp');
    // $single_product_max_age = 1;//24 * 7;

    // if (is_string($update) || $update === false) {
    //     $age = $update ? WooTools::get_age($update, 'hours') : 99999;
    //     $should_update = $age > $single_product_max_age;

    //     // error_log('custom_before_shop_loop_item() ' . json_encode($should_update));

    //     if ($should_update) {
    //         $supplier = WooTools::get_product_supplier($product);
    //         $supplier->update_loop_product($product);
    //     }
    // }

    // $supplier = WooTools::get_product_supplier($product);

    // if ($supplier) {
    //     $result = $supplier->update_loop_product($product);
    //     error_log('custom_before_shop_loop_item() ' . json_encode($result));
    // }

    /*
    $supplier_key = WooTools::get_product_supplier_key($product);
    // print_r(['key' => $supplier_key]);

    if (!$supplier_key) {
    $sku = $product->get_sku();
    $woo_id = $product->get_id();
    if (!$sku) {
    error_log('custom_before_shop_loop_item() - Product has no supplier or sku ' . $woo_id);
    } else {
    error_log('custom_before_shop_loop_item() - Product has no supplier ' . $woo_id . ' ' . $sku);
    }
    }

    $result = WooTools::update_loop_product($product);
    debug_data($result);
     */

    // $product->get_meta('_ci_additional_images', true);

    // $last_updated = $product->get_meta('_last_updated', true);
    // $age = $last_updated ? WooTools::get_age($last_updated, 'hours') : 99999;
    // // print_r(['last_updated' => $last_updated, 'age' => $age]);
    // // return;

    // if ($age > -48) {
    //     print_r(['updated' => true]);
    //     $supplier_product_id = $product->get_meta('_ci_product_id', true);
    //     $supplier_key = $product->get_meta('_ci_supplier_key', true);
    //     $supplier = WooTools::get_supplier($supplier_key);
    //     // $supplier = WooTools::get_product_supplier($product);
    //     $supplier->attach_images(['data' => ['id' => $supplier_product_id]]);
    //     // $product->update_meta('_last_updated', gmdate("c"));

    //     $product_id = $product->get_id();
    //     update_post_meta($product_id, '_last_updated', gmdate("c"));
    // }

    // if (should_debug()) {
    //     $current_stock_status = $product->get_stock_status();
    //     debug_data(['current_stock_status' => $current_stock_status, 'sku' => $product->get_sku()]);
    // }

    // return;

    // Check if it's a variable product
    // print_r(['type'=>$product->get_type()]);

    // if ($product->is_type('variable')) {
    // $serialized_data = $product->get_meta('_ci_additional_images', true);
    // $additional_images = unserialize($serialized_data);
    // echo '<hr />';
    // print_r($additional_images);
    // $src = get_product_image($product);
    // $src = 'https://localhost:3000/assets/default-station-bg.png';
    // echo '<img src="' . esc_url($src) . '" alt="' . esc_attr($product->get_title()) . '" class="attachment-shop_catalog size-shop_catalog wp-post-image" style="border:2px solid blue" />';
    // print($src);
    // return $src;
    // Get the first available variation
    // $variations = $product->get_available_variations();
    // if (!empty($variations)) {
    //     $first_variation = $variations[0];

    //     $variation_id = $first_variation['variation_id'];

    //     $img = get_post_meta($variation_id, '_ci_additional_images', false);
    //     $images = explode(',',$img[0]);
    //     $src = null;

    //     if (count($images) && isset($images[0])) {
    //         $src = $images[0];
    //     }
    //     if (!$src) {
    //         $src = wc_placeholder_img_src();
    //     }

    //     // $meta = get_post_meta($variation_id);
    //     // $src = get_post_meta($variation_id, '_ci_additional_images', true);
    //     print('<pre>' . json_encode(array('img' => $img, 'variation_id' => $variation_id), JSON_PRETTY_PRINT) . '</pre>');
    //     // $src = $img[0];
    //     return '<img src="' . esc_url($src) . '">';

    //     // Modify the product image source to use the first variation's image
    //     // $product->set_image(array('url' => $src));
    // }
    // } else {
    // $product
    // $src = get_product_image($product);
    // $img = $product->get_meta('_ci_additional_images');
    // $images = explode(',', $img);
    // $src = null;

    // if (count($images) && isset($images[0])) {
    //     $src = $images[0];
    // }
    // if (!$src) {
    //     $src = wc_placeholder_img_src();
    // }
    // print '<img src="' . esc_url($src) . '">';
    // $product = wc_get_product_object('product', $product->get_id());
    // }
    // print '<img title="custom_before_shop_loop_item" src="' . esc_url($src) . '">';
}

add_action('woocommerce_before_shop_loop_item', 'custom_before_shop_loop_item');
