<?php
namespace WooTools;

function upsert_categories($category_names)
{
    $category_names = array_unique($category_names);
    $category_slugs = array_map('sanitize_title', $category_names);

    // Fetch existing categories by slug
    $categories = get_terms([
        'taxonomy'   => 'product_cat',
        'hide_empty' => false,
        'slug'       => $category_slugs,
    ]);

    $lookup_category = [];

    // Build lookup for existing categories
    foreach ($categories as $category) {
        $lookup_category[$category->slug] = $category->term_id;
        $lookup_category[$category->name] = $category->term_id; // Handle exact name match
    }

    // Find missing categories
    $existing_slugs = array_keys($lookup_category);
    $missing_slugs  = array_diff($category_slugs, $existing_slugs);

    // Create missing categories
    foreach ($missing_slugs as $index => $category_slug) {
        $category_name = $category_names[$index]; // Get the original name
        $term          = wp_insert_term($category_name, 'product_cat', ['slug' => $category_slug]);

        if (! is_wp_error($term)) {
            $category                         = get_term($term['term_id'], 'product_cat');
            $lookup_category[$category->slug] = $category->term_id;
            $lookup_category[$category->name] = $category->term_id;
        }
    }

    return $lookup_category;
}

// function upsert_categories($category_names)
// {
//     $category_names = array_unique($category_names);
//     $categories      = get_terms(['name' => $category_names, 'taxonomy' => 'product_cat', 'hide_empty' => false]);
//     $lookup_category = [];

//     // we need the lookup to match on name and slug
//     foreach ($categories as $category) {
//         $lookup_category[$category->slug] = $category->term_id;
//         $lookup_category[$category->name] = $category->term_id;
//     }

//     $category_slugs = array_map(fn($c) => sanitize_title($c), $category_names);
//     $dif            = array_values(array_diff($category_slugs, array_keys($lookup_category)));

//     // create missing categories
//     foreach ($dif as $category_name) {
//         $term = wp_insert_term($category_name, 'product_cat');
//         if (! is_wp_error($term)) {
//             $category                         = get_term($term['term_id'], 'product_cat');
//             $lookup_category[$category->slug] = $category->term_id;
//             $lookup_category[$category->name] = $category->term_id;
//         }
//     }
//     return $lookup_category;
// }
