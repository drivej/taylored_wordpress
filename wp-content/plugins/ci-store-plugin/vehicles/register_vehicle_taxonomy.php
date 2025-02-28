<?php
namespace CIStore\vehicles;

function register_vehicle_taxonomy()
{
    register_taxonomy('product_vehicle', 'product', [
        'label'              => __('Vehicles'),
        'labels'             => [
            'name'              => __('Vehicles'),
            'singular_name'     => __('Vehicle'),
            'menu_name'         => __('Vehicles'),
            'all_items'         => __('All Vehicles'),
            'edit_item'         => __('Edit Vehicle'),
            'view_item'         => __('View Vehicle'),
            'update_item'       => __('Update Vehicle'),
            'add_new_item'      => __('Add New Vehicle'),
            'new_item_name'     => __('New Vehicle Name'),
            'search_items'      => __('Search Vehicles'),
            'parent_item'       => __('Parent'),
            'parent_item_colon' => __('Parent:'),
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

function add_vehicle_query_var($vars)
{
    $vars[] = 'product_vehicle'; // Add 'vehicle' as a recognized query variable
    return $vars;
}

add_filter('query_vars', 'CIStore\vehicles\add_vehicle_query_var');

function filter_relevanssi_by_vehicle($query)
{
    // Only apply this on search pages and when Relevanssi is active
    if (! is_admin() && $query->is_search() && function_exists('relevanssi_do_query')) {
        // Get the vehicle slug from the URL
        $vehicle_slug = get_query_var('product_vehicle');

        // If a vehicle slug is provided, add a tax_query
        if (! empty($vehicle_slug)) {
            // Ensure we're only searching WooCommerce products

//             global $wpdb;

//             $sql_str = "SELECT p.ID, p.post_title
//             FROM {$wpdb->posts} p
//             JOIN {$wpdb->term_relationships} tr ON p.ID = tr.object_id
//             WHERE p.post_type = 'product'
//             AND p.post_status = 'publish'
//             AND tr.term_taxonomy_id = 130023
//             AND (p.post_title LIKE '%brake%' OR p.post_content LIKE '%brake%' OR p.post_title LIKE '%light%' OR p.post_content LIKE '%light%');"

// $sql                        = $wpdb->prepare("SELECT meta_value AS sku, post_id AS variation_id FROM {$wpdb->prefix}postmeta WHERE meta_key = '_sku' AND meta_value IN ($placeholders)", ...$skus);
// $results                    = $wpdb->get_results($sql, ARRAY_A);


            $term    = get_term_by('slug', $vehicle_slug, 'product_vehicle');
            $term_id = isset($term->term_id) ? $term->term_id : 0;
            // error_log(json_encode(['id' => $term_id, 'term' => $term]));

            if ($term_id) {
                // $query->set('s', ''); // kill search
                $query->set('post_type', 'product');
                // Add the taxonomy query for the vehicle term slug
                $tax_query   = [];//$query->get('tax_query') ?: [];
                $tax_query[] = [
                    'taxonomy' => 'product_vehicle', // Replace with your actual taxonomy name
                    'field'    => 'id',
                    'terms'    => $term_id,
                    // 'operator' => 'IN',
                ];
                // $tax_query['relation'] = 'AND';

                $query->set('tax_query', $tax_query);
            }
        }
    }
    // error_log(print_r($query, true));
    return $query;
}

add_filter('relevanssi_modify_wp_query', 'CIStore\vehicles\filter_relevanssi_by_vehicle');

// function custom_relevanssi_where($where) {
//     error_log(__FUNCTION__);
//     if (!is_admin() && is_search() && !empty($_GET['product_vehicle'])) {
//         global $wpdb;

//         $vehicle_slug = sanitize_text_field($_GET['product_vehicle']); // Get slug from URL

//         // Get term_taxonomy_id from slug
//         $term_taxonomy_id = $wpdb->get_var($wpdb->prepare(
//             "SELECT term_taxonomy_id FROM $wpdb->term_taxonomy tt
//             INNER JOIN $wpdb->terms t ON tt.term_id = t.term_id
//             WHERE t.slug = %s AND tt.taxonomy = 'product_vehicle'",
//             $vehicle_slug
//         ));

//         if ($term_taxonomy_id) {
//             $where .= $wpdb->prepare(
//                 " AND EXISTS (
//                     SELECT 1 FROM $wpdb->term_relationships
//                     WHERE $wpdb->term_relationships.object_id = relevanssi.doc
//                     AND $wpdb->term_relationships.term_taxonomy_id = %d
//                 )",
//                 $term_taxonomy_id
//             );

//             error_log('Relevanssi WHERE clause modified for vehicle term slug: ' . $vehicle_slug);
//         }
//     }
//     return $where;
// }

// add_filter('relevanssi_modify_wp_query', 'CIStore\vehicles\custom_relevanssi_where');
