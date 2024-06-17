<?php

namespace AjaxHandlers;

require_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Report.php';

function get_woo_products($params)
{
    $paged = \AjaxManager::get_param('paged', 0, $params);
    $posts_per_page = \AjaxManager::get_param('posts_per_page', 10, $params);

    $args = [
        'post_type' => 'product',
        'posts_per_page' => $posts_per_page,
        'paged' => $paged,
        'fields' => 'ids',
    ];

    $query = new \WP_Query($args);
    $output = ['total' => 0, 'posts_per_page' => $posts_per_page, 'paged' => intval($paged), 'products' => [], 'progress' => 0];
    $output['total'] = $query->found_posts;

    // this is faster
    if ($query->have_posts()) {
        foreach ($query->posts as $post_id) {
            $output['products'][] = ['woo_product_id' => $post_id];
        }
    }

    // while ($query->have_posts()) {
    //     $query->the_post();
    //     $post_id = get_the_ID();
    //     $supplier_product_id = null; //get_post_meta($post_id, '_ci_product_id', true);
    //     $output['products'][] = ['supplier_product_id' => $supplier_product_id, 'woo_product_id' => $post_id];
    // }

    wp_reset_postdata();
    $output['isLastPage'] = max(1, $query->get('paged')) >= $query->max_num_pages;
    return $output;
}
