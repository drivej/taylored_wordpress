<?php
namespace WooTools;

/**
 * Assigns multiple global attributes to a WooCommerce product.
 *
 * @param int   $product_id       The ID of the product.
 * @param array $attributes_data  Associative array where:
 *                                - Keys are attribute names (e.g., 'color', 'size')
 *                                - Values are arrays of term names (e.g., ['Red', 'Blue'])
 */
function assign_multiple_global_attributes_to_product($product_id, $attributes_data)
{
    if (empty($attributes_data)) {
        return false; // No attributes provided
    }

    $product_attributes = get_post_meta($product_id, '_product_attributes', true) ?: [];

    // need to undo the global sku stuff - this can probably be removed later
    if (isset($product_attributes['pa_sku'])) {
        unset($product_attributes['pa_sku']);
    }

    // type is a reserved word
    if (isset($attributes_data['type'])) {
        // reserved word - need to alter it slightly
        $attributes_data['item_type'] = $attributes_data['type'];
        unset($attributes_data['type']);
    }

    foreach ($attributes_data as $attribute_name => $term_names) {
        if (strcasecmp('sku', $attribute_name) === 0) {
            $product_attributes[$attribute_name] = [
                'name'         => $attribute_name,
                'value'        => implode('|', array_map('sanitize_title', array_unique($term_names))), // Pipe-separated term slugs
                'position'     => 20,
                'is_visible'   => 1,
                'is_variation' => 1, // Change to 0 if not for variations
                'is_taxonomy'  => 0, // Marks it as a global attribute
            ];
        } else {
            $attr_name = $attribute_name;
            if (strcasecmp('type', $attribute_name) === 0) {
                // reserved word
                $attr_name = 'item_type';
            }
            $taxonomy = wc_attribute_taxonomy_name($attr_name); // Converts 'color' → 'pa_color'

            // Get current terms assigned to the product
            $existing_term_ids = wp_get_object_terms($product_id, $taxonomy, ['fields' => 'ids']);

            if (is_wp_error($existing_term_ids)) {
                $existing_term_ids = [];
            }

            // Get term IDs for the new attribute
            $term_ids = [];
            foreach ($term_names as $term_name) {
                $term = get_term_by('name', $term_name, $taxonomy);
                if ($term) {
                    $term_id = (int) $term->term_id;
                    // Only add term if it's not already assigned
                    if (! in_array($term_id, $existing_term_ids)) {
                        $term_ids[] = $term_id;
                    }
                }
            }

            // Assign terms to the product if there are new terms
            // Ensure unique term IDs before assigning
            $all_term_ids = array_unique(array_merge($existing_term_ids, $term_ids));

            // Assign terms only if they have changed
            if ($all_term_ids !== $existing_term_ids) {
                wp_set_object_terms($product_id, $all_term_ids, $taxonomy);
            }

            // Update `_product_attributes` post meta
            if (is_array($existing_term_ids) && is_array($term_ids)) {
                $product_attributes[$taxonomy] = [
                    'name'         => $taxonomy,
                    'value'        => implode('|', array_map(fn($t) => get_term($t)->slug, array_merge($existing_term_ids, $term_ids))), // Pipe-separated term slugs
                    'is_visible'   => 1,
                    'is_variation' => 1, // Change to 0 if not for variations
                    'is_taxonomy'  => 1, // Marks it as a global attribute
                ];
            } else {
                throw new \ErrorException('existing_term_ids and existing_term_ids');
            }
        }
    }

    update_post_meta($product_id, '_product_attributes', $product_attributes);

    return true; // Success
}
