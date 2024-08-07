<?php

trait Supplier_WPS_Taxonomy
{
    // private string $import_hook_name = '';

    public function import_taxonomy()
    {
        $cursor = '';
        $supplier_terms = [];

        while (is_string($cursor)) {
            $res = $this->get_api('/taxonomyterms', ['page' => ['cursor' => $cursor, 'size' => 500], 'fields' => ['taxonomyterms' => 'parent_id,name,depth']]);
            $cursor = $res['meta']['cursor']['next'];
            array_push($supplier_terms, ...($res['data'] ?? []));
        }

        foreach ($supplier_terms as &$taxonomy_term) {
            $taxonomy_term['slug'] = sanitize_title($taxonomy_term['name']);
        }

        $lookup_term_id = array_column($supplier_terms, null, 'id');

        foreach ($supplier_terms as &$taxonomy_term) {
            $parent_id = $taxonomy_term['parent_id'];

            if (isset($lookup_term_id[$parent_id])) {
                $parent_slugs = [];
                $loops = 0;
                $parent_term = $taxonomy_term;

                while ($parent_term && $loops < 10) {
                    $parent_slugs[] = $parent_term['slug'];
                    $p_id = $parent_term['parent_id'] ?? 0;

                    if ($p_id && isset($lookup_term_id[$p_id])) {
                        $parent_term = $lookup_term_id[$p_id];
                    } else {
                        $parent_term = false;
                    }
                    $loops++;
                }
                $taxonomy_term['slug_path'] = sanitize_title(implode('-', array_reverse($parent_slugs)));
            } else {
                $taxonomy_term['slug_path'] = sanitize_title($taxonomy_term['slug']);
                unset($taxonomy_term['parent_id']);
            }
        }

        return $supplier_terms;

        // ------------------------------------------------------------>
        // START: Bulk Terms
        // ------------------------------------------------------------>
        $term_names = [];

        // find terms
        foreach ($supplier_terms as $taxonomy_term) {
            $term_names[] = $taxonomy_term['name'];
        }
        $terms = get_terms(['name' => $term_names, 'taxonomy' => 'product_cat', 'hide_empty' => false]);
        $lookup_terms = array_column($terms, 'term_id', 'name');

        $term_names = array_unique($term_names);
        $new_terms = 0;

        // create terms
        foreach ($term_names as $term_name) {
            if (is_string($term_name) && strlen($term_name) > 1 && !$lookup_terms[$term_name] && !$lookup_terms[esc_html($term_name)]) {
                $term = wp_insert_term($term_name, 'product_cat');
                if (!is_wp_error($term)) {
                    $lookup_terms[$term_name] = $term['term_id'];
                    $new_terms++;
                }
            }
        }

        return ['$new_terms' => $new_terms, '$lookup_terms' => $lookup_terms, '$supplier_terms' => $supplier_terms];

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
        // ------------------------------------------------------------>
        // END: Bulk Terms
        // ------------------------------------------------------------>

        // return $lookup_term;
    }
}
