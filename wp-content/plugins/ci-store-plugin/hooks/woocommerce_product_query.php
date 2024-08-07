<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';

function custom_woocommerce_product_query($query, $context)
{
    // Add a static variable to keep track of the hook state
    static $is_running = false;

    // If the hook is already running, exit to prevent recursion
    if ($is_running) {
        return;
    }

    // Set the flag to true to indicate the hook is running
    $is_running = true;

    // Get the product IDs that will be shown
    error_log('custom_woocommerce_product_query()');
    $product_ids = $query->get('post__in');

    if (empty($product_ids)) {
        $query->set('fields', 'ids');
        $query->get_posts();
        $product_ids = $query->posts;
    }

    if (empty($product_ids)) {
        return;
    }

    global $wpdb;
    $product_ids_list = implode(',', $product_ids);
    $query = "SELECT post_id, meta_key, meta_value
        FROM {$wpdb->postmeta}
        WHERE meta_key IN ('_ci_supplier_key', '_ci_update_plp', '_ci_product_id')
        AND post_id IN ($product_ids_list)";
    $results = $wpdb->get_results($query, ARRAY_A);
    $suppliers = [];
    $max_age = WooTools::get_max_age('plp');
    // $max_age = 0;

    // filter rows that need update based on age
    $should_update_rows = array_filter($results, fn($row) => $row['meta_key'] === '_ci_update_plp' && WooTools::get_age($row['meta_value'], 'minutes') > $max_age);
    $should_update_ids = array_values(array_map(fn($row) => $row['post_id'], $should_update_rows));
    $lookup_product_id = [];

    // map woo_id to supplier_id
    foreach ($results as $row) {
        if ($row['meta_key'] === '_ci_product_id') {
            $lookup_product_id[$row['post_id']] = $row['meta_value'];
        }
    }

    foreach ($results as $row) {
        if ($row['meta_key'] === '_ci_supplier_key' && in_array($row['post_id'], $should_update_ids)) {
            if (!isset($suppliers[$row['meta_value']])) {
                $suppliers[$row['meta_value']] = [];
            }
            $suppliers[$row['meta_value']][] = $lookup_product_id[$row['post_id']];
        }
    }

    $prices = [];

    foreach ($suppliers as $supplier_key => $ids) {
        // load suppliers data for each product
        $supplier = WooTools::get_supplier($supplier_key);
        $products = $supplier->get_products($ids);

        error_log('products: ' . json_encode($products));

        // foreach ($ids as $woo_id) {
        //     $supplier_product_id = $lookup_product_id[$woo_id];
        //     // $supplier_product = $supplier->get_product($supplier_product_id);
        //     // error_log('supplier_product: ' . json_encode($supplier_product));

        //     $woo_product = wc_get_product($woo_id);
        //     $type = $woo_product->get_type();
        //     error_log('type: '.$woo_id. ' '.$type);
        //     // $price = $woo_product->get_price();
        //     // $woo_product->set_regular_price((float)$price - 0.01);
        //     // $woo_product->save();

        //     $prices[] = $supplier_product_id;//(float)$price - 0.01;
        // }
    }

    error_log('prices: ' . json_encode($prices));
    error_log('suppliers: ' . json_encode($suppliers));
    // error_log('should_update_rows: ' . json_encode($should_update_rows, JSON_PRETTY_PRINT));

// Reset the flag to false to allow the hook to run again in the future
    $is_running = false;
}

add_action('woocommerce_product_query', 'custom_woocommerce_product_query', 10, 2);

// function custom_pre_get_posts($query) {
//     error_log('pre_get_posts()');
//     error_log('query: ' . json_encode($query));

//     // Ensure this only runs on the main WooCommerce product query
//     if (!is_admin() && $query->is_main_query() && (is_shop() || is_product_category() || is_product_tag())) {
//         // Add your custom query modifications here
//         $query->set('posts_per_page', 12);

//         // Example of adding a meta query
//         $meta_query = $query->get('meta_query');
//         $meta_query[] = [
//             'key' => '_price',
//             'value' => 50,
//             'compare' => '>',
//             'type' => 'NUMERIC'
//         ];
//         $query->set('meta_query', $meta_query);
//     }
// }

// add_action('pre_get_posts', 'custom_pre_get_posts');
