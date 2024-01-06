<?php

function custom_modify_product_thumbnails()
{
    print('custom_modify_product_thumbnails');
    // global $post;
    // print_r(json_encode($post));
    // return '<div>hello</div>';

    global $product;

    // Check if the product has variations
    if ($product->is_type('variable')) {
        // Get the variations
        $variations = $product->get_available_variations();
        echo '<pre>'.json_encode($variations, JSON_PRETTY_PRINT).'</pre>';
        return;

        // Display the variations
        if (!empty($variations)) {
            echo '<div class="product-variations d-flex flex-wrap">';
            foreach ($variations as $variation) {
                $variation_id = $variation['variation_id'];
                $img = get_post_meta($variation_id, '_ci_additional_images', false);
                $src = $img[0];
                // print_r($meta);
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
add_action('woocommerce_product_thumbnails', 'custom_modify_product_thumbnails', 10);
