<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';

add_action('pre_get_posts', 'check_products_before_display');

function check_products_before_display($query)
{
    // Check if it's the main query and it's not an admin query
    print_r([
        'is_main' => (bool)$query->is_main_query(), //
        'admin' => (int)is_admin(),
        'test1' => (int)$query->is_post_type_archive('product'), 
        'test2' => (int)$query->is_tax('product_cat'), 
        'test3' => (int)$query->is_tax('product_tag'),
        'IDS' => wp_list_pluck($query->posts, 'ID'),
    ]);
    if ($query->is_main_query() && !is_admin()) {
        // Check if the query is for WooCommerce products
        if ($query->is_post_type_archive('product') || $query->is_tax('product_cat') || $query->is_tax('product_tag')) {
            // Get the list of product IDs about to be displayed
            $product_ids = wp_list_pluck($query->posts, 'ID');

            // Perform your update check logic here
            foreach ($product_ids as $product_id) {
                if (needs_update($product_id)) {
                    update_product($product_id);
                }
            }
        }
    }
}

function needs_update($product_id)
{
    // Add your logic to determine if a product needs an update
    // For example, check the last modified date or any custom criteria
    // $last_updated = get_post_meta($product_id, '_last_updated', true);
    $needs_update = true; //...; // Your custom logic here

    return $needs_update;
}

function update_product($product_id)
{
    // Add your logic to update the product
    // For example, refresh data from an external API
    // Update product meta data, etc.

    $supplier_product_id = get_post_meta($product_id, '_ci_product_id', true);
    $supplier_key = get_post_meta($product_id, '_ci_supplier_key', true);
    $supplier = WooTools::get_supplier($supplier_key);
    // $supplier = WooTools::get_product_supplier($product);
    $supplier->attach_images(['data' => ['id' => $supplier_product_id]]);

    // update_post_meta($product_id, '_last_updated', current_time('mysql'));
}
