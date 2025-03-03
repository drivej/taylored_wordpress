<?php
namespace CIStore\Hooks;

function custom_pre_get_posts($query)
{
    return;

    // if (! is_admin() && $query->is_main_query() && $query->is_search()) {
    //     $search_term = strtolower(trim($query->get('s', '')));

        // error_log('Search Term: ' . $search_term);

        // if (! empty($_GET['product_vehicle'])) {
        //     error_log('vehicle search');
        //     $vehicle_slug = sanitize_text_field($_GET['product_vehicle']);
        //     $query->set('post_type', 'product');
        //     $tax_query = [
        //         'relation' => 'AND',
        //         [
        //             'taxonomy' => 'product_vehicle',
        //             'field'    => 'slug',
        //             'terms'    => $vehicle_slug,
        //         ],
        //     ];
        //     $query->set('tax_query', $tax_query);
        // }

        // Optimize "oil" searches to prevent memory issues
        // if (str_contains(strtolower($search_term), 'oil')) {
        //     $query->set('posts_per_page', 12);
        // } else {
        //     $query->set('posts_per_page', 12);
        // }

        // error_log(print_r($query, true));
    // }
}

/*
function XXXcustom_pre_get_posts($query)
{
    // return;
    // TODO: fix this
    // make tags/cats searchable

    if (! is_admin() && $query->is_main_query() && $query->is_search()) {

        // error_log(__FUNCTION__ . json_encode([
        //     'is_admin'        => is_admin(),
        //     'is_main_query'   => $query->is_main_query(),
        //     'is_search'       => $query->is_search(),
        //     'product_vehicle' => isset($_GET['product_vehicle']) ? $_GET['product_vehicle'] : null,
        // ], JSON_PRETTY_PRINT));

        $search_term  = trim(get_query_var('s') ? get_query_var('s') : '');
        $search_words = explode(' ', $search_term);

        foreach ($search_words as $word) {
            $plural   = $search_term . 's';
            $singular = rtrim($search_term, 's');
            $query->set('s', $plural . ' ' . $singular);
        }

        $query->set('paged', get_query_var('paged') ? get_query_var('paged') : 1);

        if (isset($_GET['product_vehicle'])) {
            if (str_contains(strtolower($search_term), 'oil')) { // strcasecmp($s, 'oil') === 0) {
                                                                     // oil has too many vehicle matches and runs out of memory
                $query->set('posts_per_page', 3);
            } else {
            }
        } else {

            if (str_contains(strtolower($search_term), 'oil')) { // strcasecmp($s, 'oil') === 0) {
                                                                     // oil has too many vehicle matches and runs out of memory
                $query->set('posts_per_page', 3);
            } else {

                // Set posts per page (optional)
                $query->set('posts_per_page', 12);

                                               // Define the custom taxonomy
                $taxonomy = 'product_vehicle'; // Replace with your actual taxonomy

                // Get the search term and split it into individual words
                // $search_term  = $query->get('s');
                // $search_words = explode(' ', $search_term); // Break search into words

                // Create an array to store multiple tax_query conditions
                $tax_query = ['relation' => 'OR'];

                foreach ($search_words as $word) {
                    $tax_query[] = [
                        'taxonomy' => $taxonomy,
                        'field'    => 'name',
                        'terms'    => $word,  // Search for each word separately
                        'operator' => 'LIKE', // Allows partial matches
                    ];
                }

                // Apply the taxonomy filter
                $query->set('tax_query', $tax_query);

                error_log(__FUNCTION__ . json_encode(['$tax_query' => $tax_query], JSON_PRETTY_PRINT));

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
                // $query->set('posts_per_page', 12);
            }
        }

        // $query->set('paged', get_query_var('paged') ? get_query_var('paged') : 1);

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
*/
