<?php
namespace CIStore\Hooks;

function custom_pre_get_posts($query) {
    // make tags/cats searchable
    if (! is_admin() && $query->is_search() && $query->is_main_query()) {
        // Add product categories and tags to the search query
        $query->set('tax_query', [
            'relation' => 'OR',
            [
                'taxonomy' => 'product_cat',
                'field'    => 'name',
                'terms'    => $query->query_vars['s'],
                'operator' => 'LIKE',
            ],
            [
                'taxonomy' => 'product_tag',
                'field'    => 'name',
                'terms'    => $query->query_vars['s'],
                'operator' => 'LIKE',
            ],
        ]);
    }
}