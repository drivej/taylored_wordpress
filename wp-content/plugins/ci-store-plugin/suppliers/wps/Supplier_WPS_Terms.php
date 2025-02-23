<?php
// TODO: combine with taxonomy trait
trait Supplier_WPS_Terms
{
    // process WPS products page to get all terms out as a flat array on string values
    public function extract_term_names($items)
    {
        if (! WooTools::is_valid_array($items['data'])) {
            return [];
        }
        $term_names = [];

        // find terms
        foreach ($items['data'] as &$product) {
            foreach ($product['items']['data'] as &$variation) {
                $term_names[] = $variation['product_type'];
                foreach ($variation['taxonomyterms']['data'] as $taxonomy_term) {
                    $term_names[] = $taxonomy_term['name'];
                }
            }
        }
        $term_names = array_values(array_unique($term_names));
        return $term_names;
    }

    public function upsert_terms_slugs($term_slugs, $return_full_data = false)
    {
        $terms = get_terms(['name' => $term_slugs, 'taxonomy' => 'product_cat', 'hide_empty' => false]);
        // [term name] => [supplier term id]
        return $terms;
        $lookup_terms = array_column($terms, 'term_id', 'name');

        $term_names = array_unique($term_slugs);

        // create terms
        foreach ($term_names as $term_name) {
            if (is_string($term_name) && strlen($term_name) > 1 && ! isset($lookup_terms[$term_name]) && ! isset($lookup_terms[esc_html($term_name)])) {
                $term = wp_insert_term($term_name, 'product_cat');
                if (! is_wp_error($term)) {
                    $lookup_terms[$term_name] = $term['term_id'];
                    if ($return_full_data) {
                        $terms[] = $term;
                    }
                }
            }
        }
        // build mapping for escaped/unescaped version of term name
        // wp_insert_term() automatically escapes term names
        // get_terms() returns names as escaped
        foreach ($lookup_terms as $term_name => $term_id) {
            $sanitized_term_name = esc_html($term_name);
            if ($sanitized_term_name !== $term_name) {
                $lookup_terms[$sanitized_term_name] = $term_id;
            }
            $decoded_term_name = wp_specialchars_decode($term_name);
            if ($decoded_term_name !== $term_name) {
                $lookup_terms[$decoded_term_name] = $term_id;
            }
        }

        if ($return_full_data) {
            // create unique names that may match the source value
            foreach ($terms as &$term) {
                $term->__meta         = (object) [];
                $names                = [];
                $names[]              = esc_html($term->name);
                $names[]              = wp_specialchars_decode($term->name);
                $term->__meta->lookup = array_unique($names);
            }
            return $terms;
        }
        return $lookup_terms;
    }
    // take an array of terms, slugify and find their wp ids or insert a new term
    // return an lookup for terms
    public function upsert_terms($term_names, $return_full_data = false)
    {
        $terms = get_terms(['name' => $term_names, 'taxonomy' => 'product_cat', 'hide_empty' => false]);
        // [term name] => [supplier term id]
        $lookup_terms = array_column($terms, 'term_id', 'name');

        $term_names = array_unique($term_names);

        // create terms
        foreach ($term_names as $term_name) {
            if (is_string($term_name) && strlen($term_name) > 1 && ! isset($lookup_terms[$term_name]) && ! isset($lookup_terms[esc_html($term_name)])) {
                $term = wp_insert_term($term_name, 'product_cat');
                if (! is_wp_error($term)) {
                    $lookup_terms[$term_name] = $term['term_id'];
                    if ($return_full_data) {
                        $terms[] = $term;
                    }
                }
            }
        }
        // build mapping for escaped/unescaped version of term name
        // wp_insert_term() automatically escapes term names
        // get_terms() returns names as escaped
        foreach ($lookup_terms as $term_name => $term_id) {
            $sanitized_term_name = esc_html($term_name);
            if ($sanitized_term_name !== $term_name) {
                $lookup_terms[$sanitized_term_name] = $term_id;
            }
            $decoded_term_name = wp_specialchars_decode($term_name);
            if ($decoded_term_name !== $term_name) {
                $lookup_terms[$decoded_term_name] = $term_id;
            }
        }

        if ($return_full_data) {
            // create unique names that may match the source value
            foreach ($terms as &$term) {
                $term->__meta         = (object) [];
                $names                = [];
                $names[]              = esc_html($term->name);
                $names[]              = wp_specialchars_decode($term->name);
                $term->__meta->lookup = array_unique($names);
            }
            return $terms;
        }
        return $lookup_terms;
    }

    // takes a list of WPS items, extract the terms, upsert the terms, return a lookup array to be used in saving the products
    public function process_items_terms($items)
    {
        // TODO: need to extract term slugs based on their parent-child breadcrumb
        // need to be able to look up the WPS term id and get the wood is back based on slug
        $term_names   = $this->extract_term_names($items);
        $lookup_terms = $this->upsert_terms($term_names);
        return $lookup_terms;
    }
}
