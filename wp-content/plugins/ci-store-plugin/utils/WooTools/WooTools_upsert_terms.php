<?php
namespace WooTools;

/*

$new_terms = [
    ['name' => 'term_name', 'slug' => 'term-slug', 'parent' => 0],
    ['name' => 'term_name', 'slug' => 'term-slug', 'parent' => 23],
    ...
]

*/
function upsert_terms($new_terms, $taxonomy = 'product_cat', $chunk_size = 50)
{
    if (empty($new_terms)) {
        return [];
    }

    $response = [];

    // Process terms in chunks to reduce memory load
    $term_chunks = array_chunk($new_terms, $chunk_size);
    $new_count   = 0;

    foreach ($term_chunks as $chunk) {
        // Generate slugs only for new terms
        foreach ($chunk as $index => $term) {
            if (! isset($term['slug'])) {
                $chunk[$index]['slug'] = wc_attribute_taxonomy_slug($term['name']);
            }
        }

        // Fetch only relevant terms from DB to reduce memory usage
        $term_slugs  = array_map(fn($t) => $t['slug'], $chunk);
        $found_terms = get_terms([
            'slug'       => $term_slugs,
            'taxonomy'   => $taxonomy,
            'hide_empty' => false,
        ]);

        // Build lookup table for existing terms
        $lookup_term_by_slug = [];
        foreach ($found_terms as $found_term) {
            $lookup_term_by_slug[$found_term->slug] = $found_term->term_id;
        }
        unset($found_terms); // Free memory

        // Process each term
        foreach ($chunk as $index => $term) {
            if (isset($lookup_term_by_slug[$term['slug']])) {
                $chunk[$index]['term_id'] = $lookup_term_by_slug[$term['slug']];
            } else {
                $new_count++;
                // Insert new term
                $new_term = wp_insert_term(
                    $term['name'],
                    $taxonomy,
                    ['slug' => $term['slug'], 'parent' => $term['parent'] ?? 0]
                );

                if (is_wp_error($new_term)) {
                    // Handle existing term case properly
                    if (isset($new_term->error_data['term_exists'])) {
                        $chunk[$index]['term_id'] = $new_term->error_data['term_exists'];
                    } else {
                        $chunk[$index]['term_id'] = 0; // Mark as failed
                    }
                } else {
                    $chunk[$index]['term_id'] = $new_term['term_id'];
                }
            }
        }

        // Append processed terms to response
        $response = array_merge($response, $chunk);

        // Free memory after each chunk
        unset($chunk, $lookup_term_by_slug);
        gc_collect_cycles();
    }

    return $response;
}
/*

$new_terms = ['name' => 'term_name', 'slug' => 'term-slug', 'parent' => 0]

*/
// upsert_term(['name' => 'Vehicles', 'slug' => wc_attribute_taxonomy_slug('vehicles')]);

function upsert_term($new_term, $taxonomy = 'product_cat')
{
    $terms = upsert_terms([$new_term], $taxonomy);
    return isset($terms[0]) ? $terms[0] : false;
}
