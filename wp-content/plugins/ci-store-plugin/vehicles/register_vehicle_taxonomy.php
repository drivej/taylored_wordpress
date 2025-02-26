<?php
namespace CIStore\vehicles;

function register_vehicle_taxonomy()
{
    register_taxonomy('product_vehicle', 'product', [
        'label'              => __('Vehicles', 'your-text-domain'),
        'labels'             => [
            'name'              => __('Vehicles', 'your-text-domain'),
            'singular_name'     => __('Vehicle', 'your-text-domain'),
            'menu_name'         => __('Vehicles', 'your-text-domain'),
            'all_items'         => __('All Vehicles', 'your-text-domain'),
            'edit_item'         => __('Edit Vehicle', 'your-text-domain'),
            'view_item'         => __('View Vehicle', 'your-text-domain'),
            'update_item'       => __('Update Vehicle', 'your-text-domain'),
            'add_new_item'      => __('Add New Vehicle', 'your-text-domain'),
            'new_item_name'     => __('New Vehicle Name', 'your-text-domain'),
            'search_items'      => __('Search Vehicles', 'your-text-domain'),
            'parent_item'       => __('Parent Make', 'your-text-domain'),
            'parent_item_colon' => __('Parent Make:', 'your-text-domain'),
        ],
        'publicly_queryable' => true,
        'rewrite'            => ['slug' => 'vehicles'],
        'show_in_menu'       => true,
        'show_in_quick_edit' => false,
        'hierarchical'       => true, // ✅ Allows Make > Model structure
        'show_ui'            => true,
        'show_admin_column'  => false,
        'show_in_rest'       => true, // ✅ Enables Gutenberg & API Support
        'public'             => true, // ✅ Allows frontend access
        'query_var'          => true, // ✅ Enables URL query filtering
    ]);
}

// function add_term($name, $slug = 0)
// {
//     $term = term_exists($name, 'product_vehicle');
//     if (! $term) {
//         $term = wp_insert_term($name, 'product_vehicle', ['slug' => 0]);
//     }

//     if (is_wp_error($term)) {
//         if (isset($term->error_data['term_exists'])) {
//             return $term->error_data['term_exists'];
//         } else {
//             return 0;
//         }
//     } else {
//         return $term['term_id'];
//     }
// }

// function add_vehicle_make($make_name)
// {
//     $term = term_exists($make_name, 'product_vehicle');
//     if (! $term) {
//         $term = wp_insert_term($make_name, 'product_vehicle');
//     }

//     if (is_wp_error($term)) {
//         if (isset($term->error_data['term_exists'])) {
//             return $term->error_data['term_exists'];
//         } else {
//             return 0;
//         }
//     } else {
//         return $term['term_id'];
//     }
// }

// function add_vehicle_model($make_id, $model_id, $model_name)
// {
//     $term = term_exists($model_name, 'product_vehicle');

//     if (! $term) {
//         $term = wp_insert_term($model_name, 'product_vehicle', ['parent' => $make_id]);
//     }

//     return ! is_wp_error($term) ? $term['term_id'] : 0;
// }

// function assign_product_to_vehicle($product_id, $model_id) {
//     wp_set_post_terms($product_id, [$model_id], 'product_vehicle', true);
// }

// ✅ Example: Add "Corolla" under "Toyota"
// $corolla_id = add_vehicle_model($toyota_id, 'Corolla');

// ✅ Example: Add "Toyota" as a Make
// $toyota_id = add_vehicle_make('Toyota');

add_action('init', 'CIStore\vehicles\register_vehicle_taxonomy');
