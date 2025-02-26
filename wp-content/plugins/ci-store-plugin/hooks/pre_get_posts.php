<?php
namespace CIStore\Hooks;

function custom_pre_get_posts($query)
{
    // return;
    // TODO: fix this
    // make tags/cats searchable

    if (! is_admin() && $query->is_main_query() && $query->is_search() && isset($_GET['product_vehicle'])) {
        // error_log(__FUNCTION__ . json_encode([
        //     'is_admin'        => is_admin(),
        //     'is_main_query'   => $query->is_main_query(),
        //     'is_search'       => $query->is_search(),
        //     'product_vehicle' => isset($_GET['product_vehicle']) ? $_GET['product_vehicle'] : null,
        // ], JSON_PRETTY_PRINT));

        $s = trim(get_query_var('s') ? get_query_var('s') : '');

        if (str_contains(strtolower($s), 'oil')) { // strcasecmp($s, 'oil') === 0) {
            $query->set('posts_per_page', 3);
        } else {

            // $term = sanitize_text_field($_GET['product_vehicle']);

            // // error_log('hello ' . $term);
            // // Ensure only products are searched, if desired.
            // $query->set('post_type', 'product');

            // // Append the tax query.
            // $tax_query = [
            //     [
            //         'taxonomy' => 'product_vehicle',
            //         'field'    => 'slug',
            //         'terms'    => $term,
            //         // 'paged'    => get_query_var('paged') ? get_query_var('paged') : 1,
            //     ],
            // ];
            // $query->set('tax_query', $tax_query);
            $query->set('posts_per_page', 12);
        }
        $query->set('paged', get_query_var('paged') ? get_query_var('paged') : 1);

        // error_log($query->get('posts_per_page'));

        // $args = [
        //     's'              => get_query_var('s') ? get_query_var('s') : '',
        //     'post_type'      => 'product',
        //     'posts_per_page' => 3, // Limit results per page
        //     'paged'          => get_query_var('paged') ? get_query_var('paged') : 1,
        // ];

        // $query = new WP_Query($args);
    }
}
