<?php

function custom_woocommerce_product_query($query, $context)
{
    // Get the product IDs that will be shown
    error_log('custom_woocommerce_product_query()');
    // error_log('query: ' . json_encode($query));
    // error_log('context: ' . json_encode($context));
    $product_ids = [];//$query->get('post__in');

    // if (empty($product_ids)) {
    //     $query->set('fields', 'ids');
    //     $query->get_posts();
    //     $product_ids = $query->posts;
    // }

    error_log('product_ids: ' . json_encode($product_ids));
    // // If the product IDs are not already set, fetch them from the query
    // if (empty($product_ids)) {
    //     $q->set('fields', 'ids');
    //     $q->get_posts();
    //     $product_ids = $q->posts;
    // }

    // // Now you have access to the product IDs that will be shown
    // error_log('Product IDs: ' . implode(', ', $product_ids));

    // Add your custom logic here
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