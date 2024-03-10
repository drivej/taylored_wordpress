<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/debug_hook.php';
/*
function custom_product_thumbnails()
{
    debug_hook('woocommerce_product_thumbnails');
    // global $post;
    // print_r(json_encode($post));
    // return
    return;'<div>hello</div>';

    print '<h1>Custom Thumbnails</h1>';

    global $product;

    // Check if the product has variations
    if ($product->is_type('variable')) {
        // Get the variations
        $variations = $product->get_available_variations();
        // echo '<pre>'.json_encode($variations, JSON_PRETTY_PRINT).'</pre>';
        // return;

        // Display the variations
        if (!empty($variations)) {
            echo '<div class="product-variations d-flex flex-wrap">';
            foreach ($variations as $variation) {
                $variation_id = $variation['variation_id'];
                $serialized_data = get_post_meta($variation_id, '_ci_additional_images', true);

                if (is_serialized($serialized_data)) {
                    $additional_images = unserialize($serialized_data);
                    $src = '';

                    if ($additional_images !== false && !empty($additional_images) && is_array($additional_images)) {
                        // Replace the default variation image with the first additional image
                        $src = reset($additional_images);
                    } else {
                        $src = wc_placeholder_img_src();
                    }
                } else {
                    error_log('');
                    $src = wc_placeholder_img_src();
                }

                // $img = get_post_meta($variation_id, '_ci_additional_images', true);
                // $src = $img[0];
                // print_r($src);
                // continue;
                $variation_attributes = $variation['attributes'];

                // Customize the display of each variation
                echo '<div class="variation">';
                echo '<a href="' . esc_url(get_permalink($variation_id)) . '">'; // Link to the variation
                echo '<span class="variation-title">' . esc_html(implode(', ', $variation_attributes)) . '</span>';
                echo '<img title="custom_modify_product_thumbnails" class="product-thumbnail" width="100" height="100" src="' . $src . '" /></a>';
                echo '</div>';
            }
            echo '</div>';
        }
    }
}
// deprecated!!!
add_action('woocommerce_product_thumbnails', 'custom_product_thumbnails', 10);
*/

function custom_single_product_image_thumbnail_html($html, $attachment_id)
{
    debug_filter('woocommerce_single_product_image_thumbnail_html');
    // Get the image URL from your custom meta property
    // $custom_image_url = get_post_meta($post_id, '_ci_additional_images', true);

    $post_id = get_the_ID();
    $serialized_data = get_post_meta($post_id, '_ci_additional_images', true);

    if (is_serialized($serialized_data)) {
        $additional_images = unserialize($serialized_data);

        if (!empty($additional_images) && is_array($additional_images)) {
            // Replace the default variation image with the first additional image
            $src = reset($additional_images);
            $html = '<img src="' . esc_url($src) . '" alt="" />';
            // echo '<div class="woocommerce-variation single_variation"><div class="woocommerce-variation-thumbnail">' . '<img src="' . esc_url($src) . '" alt="' . esc_attr(get_the_title($variation_id)) . '" class="wp-post-image" /></div></div>';
        }
    } else {
        if (wp_http_validate_url($serialized_data)) {
            $src = $serialized_data;
            $html = '<img src="' . esc_url($src) . '" alt="" />';
        }
    }

    // If a custom image URL is found, replace the default thumbnail HTML
    // if ($custom_image_url) {
    //     $html = '<img src="' . esc_url($custom_image_url) . '" alt="" />';
    // }

    return $html;
}

add_filter('woocommerce_single_product_image_thumbnail_html', 'custom_single_product_image_thumbnail_html', 10, 2);
