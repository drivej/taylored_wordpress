<?php
namespace WooTools;

// $brands: array of strings
// gather brand names from supplier and send them here

function upsert_brands($brands)
{
    // find/create brand parent
    $taxonomy = 'product_brand';
    $brand_parent    = wp_insert_term('Brands', $taxonomy, ['slug' => wc_attribute_taxonomy_slug('brands')]);
    $brand_parent_id = 0;
    if (is_wp_error($brand_parent)) {
        if (isset($brand_parent->error_data) && isset($brand_parent->error_data['term_exists'])) {
            $brand_parent_id = $brand_parent->error_data['term_exists'];
        }
    } else {
        $brand_parent_id = $brand_parent['term_id'];
    }

    $brand_terms = [];
    $brand_slugs = [];

    foreach ($brands as $brand_name) {
        $name          = esc_html($brand_name); // just in case
        $slug          = wc_attribute_taxonomy_slug('brand_' . $brand_name);
        $brand_terms[] = ['name' => $name, 'slug' => $slug];
        $brand_slugs[] = $slug;
    }

    $terms               = get_terms(['slug' => $brand_slugs, 'taxonomy' => $taxonomy, 'hide_empty' => false]);
    $lookup_term_by_slug = array_column($terms, null, 'slug');

    foreach ($brand_terms as &$term) {
        if (isset($lookup_term_by_slug[$term['slug']])) {
            $term['term_id'] = $lookup_term_by_slug[$term['slug']]->term_id;
        } else {
            $new_term = wp_insert_term($term['name'], $taxonomy, ['slug' => $term['slug'], 'parent' => $brand_parent_id]);
            if (is_wp_error($new_term)) {
                $term['term_id'] = 0;
            } else {
                $term['term_id'] = $new_term['term_id'];
            }
        }
    }

    return $brand_terms;
}
