<?php
/**
 * Taylored Power Sports - Ecomm 4 Theme functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package Taylored Power Sports - Ecomm 4
 * @since 1.0.0
 */

/**
 * Define Constants
 */
define('CHILD_THEME_TAYLORED_POWER_SPORTS_ECOMM_4_VERSION', '1.0.0');

/**
 * Enqueue styles
 */
function child_enqueue_styles()
{
    wp_enqueue_style('taylored-power-sports-ecomm-4-theme-css', get_stylesheet_directory_uri() . '/style.css', array('storefront-theme-css'), CHILD_THEME_TAYLORED_POWER_SPORTS_ECOMM_4_VERSION, 'all');

}

add_action('wp_enqueue_scripts', 'child_enqueue_styles', 15);

// https://stackoverflow.com/questions/50122236/change-woocommerce-images-by-image-url-from-custom-field
// function XXcustom_modify_placeholder_img($size)
// {
//     print('custom_modify_placeholder_img');
//     global $post;

//     //check for the custom image url
//     //$src = get_post_meta( $post->ID, '_image_url', false );

//     $img = get_post_meta($post->ID, '_ci_additional_images', false);

// // print_r(json_encode($src));
// // print('<hr />');
// // print_r(($img[0]));
//     $src = $img[0];
// // print('<hr />');
// // print_r(($src));
// // print('<hr />');
// // print_r(get_post_meta($post->ID));

//     //if not image url is found, use the default
//     if (!$src) {
//         $src = wc_placeholder_img_src();
//     }

//     return '<img src="' . $src . '" />';
// }

// add_filter('woocommerce_placeholder_img', 'custom_modify_placeholder_img');

// function Xcustom_modify_get_image_size_shop_single($size)
// {
//     print('custom_modify_get_image_size_shop_single');
//     print_r($size);
//     print_r('<div><h1>Hello!</h1></div>');
// }

// add_filter('woocommerce_get_image_size_shop_single', 'custom_modify_get_image_size_shop_single');

// function Xcustom_modify_before_single_product_summary()
// {
//     print('custom_modify_before_single_product_summary');
//     global $post;
//     $img = get_post_meta($post->ID, '_ci_additional_images', false);
//     $src = $img[0];
//     return '<img src="' . $src . '" alt="Product Image">';
// }

// add_action('woocommerce_before_single_product_summary', 'custom_modify_before_single_product_summary');

// function Xcustom_modify_cart_item_thumbnail($product_image, $cart_item, $cart_item_key)
// {
//     print('custom_modify_cart_item_thumbnail');
//     $product_id = $cart_item['product_id'];
//     $img = get_post_meta($product_id, '_ci_additional_images', false);
//     $src = $img[0];
//     return '<img src="' . $src . '" class="attachment-shop_thumbnail wp-post-image">';
// }

// add_action('woocommerce_cart_item_thumbnail', 'custom_modify_cart_item_thumbnail', 10, 3);

// function Xcustom_modify_single_product_image()
// {
//     print('custom_modify_single_product_image');
//     global $product;

//     // Check if the product has variations
//     if ($product->is_type('variable')) {
//         print_r(json_encode($product));
//         // $product_id = $product->get_id();
//         // $img = get_post_meta($product_id, '_ci_additional_images', false);

//         $variation_id = $product->get_available_variations()[0]['variation_id'];
//         $img = get_post_meta($variation_id, '_ci_additional_images', false);
//         $meta = get_post_meta($variation_id);
//         print_r(json_encode($meta));
//         $src = $img[0];

//         // Get the variation image URL from a custom field (adjust the field name)
//         // $custom_image_url = get_post_meta($variation_id, '_your_custom_field_key', true);

//         // If the custom field is empty, fall back to the featured image
//         // if (empty($custom_image_url)) {
//         //     $custom_image_url = wp_get_attachment_url($product->get_image_id());
//         // }

//         // Modify the image HTML to use the new URL
//         return '<img src="' . esc_url($src) . '" alt="' . esc_attr($product->get_title()) . '">';
//     } else {
//         print_r(json_encode($product));
//         $img = get_post_meta($product->get_id(), '_ci_additional_images', false);
//         $src = $img[0];
//         return '<img src="' . esc_url($src) . '" alt="' . esc_attr($product->get_title()) . '">';
//     }
// }

// add_action('woocommerce_single_product_image', 'custom_modify_single_product_image', 10);

// function Xcustom_modify_product_thumbnails()
// {
//     print('custom_modify_product_thumbnails');
//     // global $post;
//     // print_r(json_encode($post));
//     // return '<div>hello</div>';

//     global $product;

//     // Check if the product has variations
//     if ($product->is_type('variable')) {
//         // Get the variations
//         $variations = $product->get_available_variations();

//         // Display the variations
//         if (!empty($variations)) {
//             echo '<div class="product-variations d-flex flex-wrap">';
//             foreach ($variations as $variation) {
//                 $variation_id = $variation['variation_id'];
//                 $img = get_post_meta($variation_id, '_ci_additional_images', false);
//                 $src = $img[0];
//                 // print_r($meta);
//                 $variation_attributes = $variation['attributes'];

//                 // Customize the display of each variation
//                 echo '<div class="variation">';
//                 echo '<a href="' . esc_url(get_permalink($variation_id)) . '">'; // Link to the variation
//                 echo '<span class="variation-title">' . esc_html(implode(', ', $variation_attributes)) . '</span>';
//                 echo '<img class="product-thumbnail" width="100" height="100" src="' . $src . '" /></a>';
//                 echo '</div>';
//             }
//             echo '</div>';
//         }
//     }
// }

// add_action('woocommerce_product_thumbnails', 'custom_modify_product_thumbnails', 10);

// function Xcustom_modify_variation_image($html, $attachment_id, $variation_id, $variation)
// {
//     print('custom_modify_variation_image');
//     // Check if the variation has specific image data

//     if (isset($variation['image']['src'])) {
//         $img = get_post_meta($variation_id, '_ci_additional_images', true);
//         $src = $img[0];
//         return '<img src="' . esc_url($src) . '">';

//         $image_src = esc_url($variation['image']['src']);
//         $image_alt = esc_attr($variation['image']['alt']);

//         // Modify the image HTML
//         $html = '<img src="' . $image_src . '" alt="' . $image_alt . '" class="single-product-variation-image" />';
//     }

//     return $html;
// }

// function Xcustom_display_first_variation_image()
// {
//     print('custom_display_first_variation_image');
//     global $product;
//     if ($product->is_type('variable')) {
//         $variations = $product->get_available_variations();
//         if (!empty($variations)) {
//             $first_variation = $variations[0];
//             $variation_id = $first_variation['variation_id'];
//             $src = get_post_meta($variation_id, '_ci_additional_images', true);
//             return '<img src="' . esc_url($src) . '">';
//         } else {
//             $img = get_post_meta($product->get_id(), '_ci_additional_images', true);
//             $src = $img[0];
//             return '<h1>This is it2!</h1><img src="' . esc_url($src) . '">';
//         }
//     }
//     if ($product->is_type('simple')) {
//         print_r('simple product');
//     }
// }

// add_action('woocommerce_before_single_product', 'custom_display_first_variation_image');

// function Xcustom_before_shop_loop_item()
// {
//     print('custom_before_shop_loop_item');
//     global $product;

//     // Check if it's a variable product
//     if ($product->is_type('variable')) {
//         // Get the first available variation
//         $variations = $product->get_available_variations();
//         if (!empty($variations)) {
//             $first_variation = $variations[0];

//             $variation_id = $first_variation['variation_id'];
//             $meta = get_post_meta($variation_id);
//             $src = get_post_meta($variation_id, '_ci_additional_images', true);
//             print('<pre>' . json_encode(array('src' => $src, 'meta' => $meta, 'variation_id' => $variation_id), JSON_PRETTY_PRINT) . '</pre>');
//             // $src = $img[0];
//             return '<img src="' . esc_url($src) . '">';

//             // Modify the product image source to use the first variation's image
//             // $product->set_image(array('url' => $src));
//         }
//     } else {
//     }
// }

// add_action('woocommerce_before_shop_loop_item', 'custom_before_shop_loop_item');

// function custom_change_category_image($category) {
//     print('woocommerce_before_subcategory_title');

//     global $post;
//     $img = get_post_meta($post->ID, '_ci_additional_images', false);
//     $src = $img[0];
//     return '<img src="' . esc_url($src) . '" alt="Product Image">';

//     // Modify the image source URL
//     // $new_image_src = 'your_new_image_url_here'; // Replace with the desired image URL

//     // Output the modified image
//     // echo '<img src="' . esc_url($new_image_src) . '" alt="' . esc_attr($category->name) . '" />';
// }

// add_action('woocommerce_before_subcategory_title', 'custom_change_category_image');

// function custom_before_shop_loop_item_title($category)
// {
//     print('custom_before_shop_loop_item_title');
//     $id = get_the_ID();
//     $product = wc_get_product(get_the_ID());
//     $img = get_post_meta($id, '_ci_additional_images', true);
//     print('<pre>' . json_encode(array('img'=>$img, 'id'=>$id), JSON_PRETTY_PRINT) . '</pre>');
//     $src = $img[0];
//     print '<img src="' . esc_url($src) . '">';
// }

// add_action('woocommerce_before_shop_loop_item_title', 'custom_before_shop_loop_item_title', 10, 1);

// function custom_single_product_image_html()
// {
//     print('custom_single_product_image_html');
// }
// add_filter('woocommerce_single_product_image_html', 'custom_single_product_image_html', 10, 4);


// function custom_modify_variation_is_active($active, $variation)
// {
//     print('custom_modify_variation_is_active');
// //     // Check if the variation is active
//     if ($active) {
//         print('woocommerce_variation_is_active');
//         // Get the variation ID
//         $variation_id = $variation->get_ID();

//         // Get the custom field that contains the image URL (adjust the field name)
//         $src = get_post_meta($variation_id, '_ci_additional_images', true);
//         // print('<pre>' . json_encode(array('src'=>$src, 'variation_id'=>$variation_id), JSON_PRETTY_PRINT) . '</pre>');
//         // $src = $img[0];
//         // If the custom field is empty, fall back to the variation image
//         if (!empty($src)) {
//             // $src = $variation->get_image()['url'];

//             // Modify the variation image URL
//             $methods = get_class_methods($variation);
//             print('<pre>' . json_encode(array('methods'=>$methods), JSON_PRETTY_PRINT) . '</pre>');
        
//             // $variation->set_image(array('url' => $src));
//         }
//     }

//     return $active;
// }

// add_filter('woocommerce_variation_is_active', 'custom_modify_variation_is_active', 10, 2);
