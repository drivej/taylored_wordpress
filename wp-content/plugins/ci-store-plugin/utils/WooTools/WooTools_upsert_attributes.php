<?php
namespace WooTools;

/**
 * Upserts WooCommerce global attributes and merges new attribute values with existing ones.
 *
 * @param array $attributes Associative array where keys are attribute slugs and values contain:
 *                          - 'name' => Human-readable attribute name
 *                          - 'options' => Array of option strings
 *                          - 'slug' => The attribute's slug
 *
 * @return array Associative array mapping attributes to their IDs and merged term IDs.
 */
function upsert_attributes($attributes)
{
    if (isset($attributes['sku'])) {
        unset($attributes['sku']);
    }
    global $wpdb;
    $created_attributes = [];

    // Extract attribute slugs
    $attribute_slugs = array_keys($attributes);

    if (empty($attribute_slugs)) {
        return [];
    }

    $sanitized_slugs = array_map('sanitize_title', $attribute_slugs);

    // Fetch existing attributes in a single query
    $placeholders = implode(',', array_fill(0, count($sanitized_slugs), '%s'));
    $query        = $wpdb->prepare(
        "SELECT attribute_name, attribute_id FROM {$wpdb->prefix}woocommerce_attribute_taxonomies
         WHERE attribute_name IN ($placeholders)",
        $sanitized_slugs
    );
    $existing_attributes = $wpdb->get_results($query, OBJECT_K); // Fetch as key-value object

    foreach ($attributes as $attribute_slug => $attribute_data) {
        $attribute_name = $attribute_data['name'];

        // not sure how this happens
        if (empty($attribute_name)) {
            error_log(__FUNCTION__ . ' Error attribute empty: ' . json_encode(['attributes' => $attributes, 'attribute_slug' => $attribute_slug]));
            continue;
        }
        $new_options = $attribute_data['options'];

        // Check if the attribute exists
        if (isset($existing_attributes[$attribute_slug])) {
            // Attribute exists, store its ID
            $attribute_id = $existing_attributes[$attribute_slug]->attribute_id;
        } else {
            // Create new attribute
            $attribute_id = wc_create_attribute([
                'name'         => $attribute_name,
                'slug'         => $attribute_slug,
                'type'         => 'select',
                'order_by'     => 'menu_order',
                'has_archives' => false,
            ]);

            if (is_wp_error($attribute_id)) {
                error_log(__FUNCTION__ . ' Error creating attribute: ' . $attribute_name . ' - ' . $attribute_id->get_error_message());
                continue;
            }
        }

                                                                 // Register taxonomy immediately so terms can be added
        $taxonomy = wc_attribute_taxonomy_name($attribute_slug); // Converts "outside-diameter" -> "pa_outside-diameter"
        register_taxonomy($taxonomy, ['product']);

        // Fetch existing terms for this attribute (optimized)
        $existing_terms = get_terms([
            'taxonomy'   => $taxonomy,
            'hide_empty' => false,
        ]);

                         // Ensure new terms are merged with existing ones
        $term_data = []; // Will hold term_name => [term_id, slug, name]
        foreach ($existing_terms as $existing_term) {
            $term_data[$existing_term->name] = [
                'term_id' => $existing_term->term_id,
                'slug'    => $existing_term->slug,
                'name'    => $existing_term->name,
            ];
        }

        // Insert new terms if they don't exist
        foreach ($new_options as $term_name) {
            if (! isset($term_data[$term_name])) {
                // Insert new term
                $inserted_term = wp_insert_term($term_name, $taxonomy);
                if (! is_wp_error($inserted_term) && isset($inserted_term['term_id'])) {
                    $term                  = get_term($inserted_term['term_id']); // Fetch the full term data
                    $term_data[$term_name] = [
                        'term_id' => $term->term_id,
                        'slug'    => $term->slug,
                        'name'    => $term->name,
                    ];
                } else {
                    if (is_wp_error($inserted_term) && isset($inserted_term->error_data['term_exists'])) {
                        $term_id = $inserted_term->error_data['term_exists'];
                        $term    = get_term($term_id);
                        if ($term) {
                            $term_data[$term_name] = [
                                'term_id' => $term->term_id,
                                'slug'    => $term->slug,
                                'name'    => $term->name,
                            ];
                        }
                    } else {
                        error_log(__FUNCTION__ . ' Error inserting term: ' . $term_name . ' tax=' . $taxonomy . ' - ' . $inserted_term->get_error_message());
                        error_log(__FUNCTION__ . ' wp_insert_term(' . $term_name . ', ' . $taxonomy . ')');
                        error_log(__FUNCTION__ . ' ' . json_encode(['attributes' => $attributes], JSON_PRETTY_PRINT));
                        error_log(__FUNCTION__ . ' ' . json_encode(['term_data' => $term_data], JSON_PRETTY_PRINT));
                    }
                }
            }
        }

        // Store results in the return array
        $created_attributes[$attribute_slug] = [
            'attribute_id' => $attribute_id,
            'name'         => $attribute_name,
            'terms'        => array_values($term_data), // Return term_id, slug, and name
        ];
    }

    // Flush WooCommerce attribute cache to ensure new attributes are recognized
    delete_transient('wc_attribute_taxonomies');

    return $created_attributes; // Return attribute slug => ID and term data
}

// /**
//  * Creates multiple WooCommerce global attributes and adds attribute values if they don't exist.
//  *
//  * @param array $attributes An associative array where keys are attribute names, and values are arrays of terms.
//  * Example: ['color' => ['Red', 'Blue'], 'size' => ['Small', 'Large']]
//  * * ['color' => ['name' => 'Color', 'options' => ['a', 'b'], 'slug' => 'color']
//  *
//  * @return array Associative array mapping attributes to their IDs and term IDs.
//  */
// function upsert_attributes($attributes)
// {
//     // if (! class_exists('WC_Product_Attributes')) {
//     //     return [];
//     // }

//     global $wpdb;
//     $created_attributes = [];

//     // Extract only attribute names
//     $attribute_names = array_keys($attributes);
//     $sanitized_names = array_map('sanitize_title', $attribute_names);

//     // Fetch existing attributes in a single query
//     $placeholders = implode(',', array_fill(0, count($sanitized_names), '%s'));
//     $query        = $wpdb->prepare(
//         "SELECT attribute_name, attribute_id FROM {$wpdb->prefix}woocommerce_attribute_taxonomies WHERE attribute_name IN ($placeholders)",
//         $sanitized_names
//     );

//     $existing_attributes = $wpdb->get_results($query, OBJECT_K); // Fetch as key-value object
//     // return ['$existing_attributes' => $existing_attributes, 'a' => $attribute_names, 'b' =>  $sanitized_names];

//     foreach ($attributes as $attribute_name => $terms) {
//         $attribute_slug = sanitize_title($attribute_name);
//         $attribute_name = ucfirst($attribute_name);

//         if (isset($existing_attributes[$attribute_slug])) {
//             // Attribute exists, store its ID
//             $attribute_id = $existing_attributes[$attribute_slug]->attribute_id;

//             error_log(json_encode([
//                 'name'         => $attribute_name,
//                 'slug'         => $attribute_slug,
//                 'type'         => 'select',
//                 'order_by'     => 'menu_order',
//                 'has_archives' => false,
//             ]));
//         } else {
//             // Create new attribute
//             $attribute_id = wc_create_attribute([
//                 'name'         => $attribute_name,
//                 'slug'         => $attribute_slug,
//                 'type'         => 'select',
//                 'order_by'     => 'menu_order',
//                 'has_archives' => false,
//             ]);

//             if (is_wp_error($attribute_id)) {
//                 error_log('Error creating attribute: ' . $attribute_name . ' - ' . $attribute_id->get_error_message());
//                 continue;
//             }
//         }

//                                                                  // Register taxonomy immediately so terms can be added
//         $taxonomy = wc_attribute_taxonomy_name($attribute_name); // Converts "color" -> "pa_color"
//         register_taxonomy($taxonomy, ['product']);

//         // Ensure terms exist for this attribute
//         $term_ids = [];
//         foreach ($terms as $term_name) {
//             $term = get_term_by('name', $term_name, $taxonomy);
//             if (! $term) {
//                 $inserted_term = wp_insert_term($term_name, $taxonomy);
//                 if (! is_wp_error($inserted_term)) {
//                     $term_ids[$term_name] = $inserted_term['term_id'];
//                 } else {
//                     error_log('Error inserting term: ' . $term_name . ' - ' . $inserted_term->get_error_message());
//                 }
//             } else {
//                 $term_ids[$term_name] = $term->term_id;
//             }
//         }

//         $created_attributes[$attribute_name] = [
//             'attribute_id' => $attribute_id,
//             'name' => $attribute_name,
//             'terms'        => $term_ids,
//         ];
//     }

//     // Flush WooCommerce attribute cache to ensure new attributes are recognized
//     delete_transient('wc_attribute_taxonomies');

//     return $created_attributes; // Return attribute name => ID and term IDs
// }
