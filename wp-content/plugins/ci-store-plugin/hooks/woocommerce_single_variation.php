<?php

// include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/get_product_image.php';
// include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/debug_hook.php';

// function custom_single_variation($output)
// {
//     debug_filter('woocommerce_single_variation');
//     // Get the variation image URL from meta data

//     // print_r(['output' => $output, 'type' => gettype($output)]);
    
//     if (empty($output)) {
//         return;
//     }
//     $variation_id = $output['variation_id'];
//     // $variation_image = get_post_meta($variation_id, '_ci_variation_image', true);

//     $serialized_data = get_post_meta($variation_id, '_ci_additional_images', true);
//     $additional_images = unserialize($serialized_data);

//     if (!empty($additional_images) && is_array($additional_images)) {
//         $src = reset($additional_images);
//         // return '<img title="custom_modifxy_cart_item_thumbnail" src="' . esc_url($src) . '" class="attachment-shop_thumbnail wp-post-image">';

//         $output['image']['thumb_src'] = $src;
//         $output['image']['src'] = $src;
//         $output['image']['srcset'] = '';
//     }

//     // if ($variation_image) {
//     //     // Replace the main product image with the variation image
//     //     $output['image']['thumb_src'] = $variation_image;
//     //     $output['image']['src'] = $variation_image;
//     //     $output['image']['srcset'] = '';
//     // }
//     print_r($output);

//     return $output;
// }

// add_filter('woocommerce_single_variation', 'custom_single_variation');
