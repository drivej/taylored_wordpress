<?php
namespace CIStore\Hooks;

function custom_pre_get_posts($query)
{
    // TODO: fix this
    // make tags/cats searchable
    // error_log('hello ' . json_encode([
    //     $query->is_main_query(),
    //     $query->is_search(),
    //     isset($_GET['product_vehicle']),
    // ]));

    if (! is_admin() && $query->is_main_query() && $query->is_search() && isset($_GET['product_vehicle'])) {
        $term = sanitize_text_field($_GET['product_vehicle']);

        // error_log('hello ' . $term);
        // Ensure only products are searched, if desired.
        $query->set('post_type', 'product');

        // Append the tax query.
        $tax_query = [
            [
                'taxonomy' => 'product_vehicle',
                'field'    => 'slug',
                'terms'    => $term,
            ],
        ];
        $query->set('tax_query', $tax_query);
    }
}
