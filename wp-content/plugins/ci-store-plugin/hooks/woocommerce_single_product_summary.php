<?php
// TODO: delete
// function custom_enqueue_product_details_script()
// {
    // Enqueue the custom JavaScript file
    // wp_enqueue_script(
    //     'product-details-script',
    //     plugin_dir_url(__FILE__) . '/js/product-details.js',
    //     ['jquery'],
    //     CI_VERSION,
    //     true
    // );

    // Pass product data and variations to the script using wp_localize_script()
    // global $product;

    // $variations = $product->get_available_variations();
    // foreach($variations as &$variation){
    //     $variation['_ci_product_sku'] = get_post_meta($variation['variation_id'], '_ci_product_sku', true);
    // }

    // if ($attribute === 'sku') {
    //     $variations = $product->get_children();
    //     foreach ($variations as $variation_id) {
    //         $variation_sku = get_post_meta($variation_id, 'attribute_sku', true);
    //         if (strcasecmp($name, $variation_sku) === 0) {
    //             // TODO: lock down _ci_product_sku for every variation
    //             $sku         = get_post_meta($variation_id, '_ci_product_sku', true);
    //             $product_id  = get_post_meta($variation_id, '_ci_product_id', true);
    //             $description = get_post_meta($variation_id, '_variation_description', true);
    //             return esc_html($description . ' (' . ($sku ? $sku : $product_id) . ')');
    //         }
    //     }
    // }


    // $product_data = [
    //     'id'         => $product->get_id(),
    //     'name'       => $product->get_name(),
    //     'attributes' => array_map(fn($a) => $a->get_data(), $product->get_attributes()),
    //     'variations' => $variations,//$product->get_available_variations(),
    //     'version'    => CI_VERSION,
    // ];
    // wp_localize_script('product-details-script', 'woo_product_details', $product_data);
// }

// add_action('woocommerce_before_single_product', 'custom_enqueue_product_details_script', 25);
