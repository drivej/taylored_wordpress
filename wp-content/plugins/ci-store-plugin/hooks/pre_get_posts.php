<?php
namespace CIStore\Hooks;

function custom_pre_get_posts($query)
{
    if (! is_admin() && $query->is_main_query() && $query->is_tax('product_vehicle')) {
        $query->set('posts_per_page', 12);
        $query->set('update_post_term_cache', false);
        $query->set('update_post_meta_cache', false);
        $paged = (get_query_var('paged')) ? get_query_var('paged') : 1;
        $query->set('paged', $paged);
    }
}
