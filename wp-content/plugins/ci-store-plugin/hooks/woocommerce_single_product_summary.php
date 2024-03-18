<?php

function custom_enqueue_product_details_script()
{
    // Enqueue the custom JavaScript file
    wp_enqueue_script('product-details-script', plugin_dir_url(__FILE__) . '/js/product-details.js', array('jquery'), null, true);

    // Pass product data and variations to the script using wp_localize_script()
    global $product;
    $product_data = array(
        'id' => $product->get_id(),
        'name' => $product->get_name(),
        'attributes' => array_map(fn($a) => $a->get_data(), $product->get_attributes()),
        'variations' => $product->get_available_variations(),
    );
    wp_localize_script('product-details-script', 'woo_product_details', $product_data);
}

add_action('woocommerce_before_single_product', 'custom_enqueue_product_details_script', 25);
