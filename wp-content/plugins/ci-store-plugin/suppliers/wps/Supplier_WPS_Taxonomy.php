<?php

trait Supplier_WPS_Taxonomy
{
    // from supplier: 'ATV Sport & Race'
    // from wp: 'ATV Sport &amp; Race'\
    // esc_html changes 'ATV Sport & Race' to 'ATV Sport &amp; Race';
    // wp_specialchars_decode Specifically deals with: &, <, >, ", and '.
    // get_terms will accept 'ATV Sport & Race' or 'ATV Sport &amp; Race' and successfully return the correct term.

    // normalize the term names so  the input/output or term get/set is the same and can be compared if necessary
    // we're using the slug to compare now so the name is not necesary to sanitize
    // extra credit: clean up html entities like funky quote
    public function sanitize_term($term)
    {
        // TODO: keep this updated as weird stuff appears
        $term = esc_html($term);
        $term = str_replace('&#039;', "'", $term);
        return $term;
    }

    public function sanitize_attribute($term)
    {
        // TODO: keep this updated as weird stuff appears
        $term = esc_html($term);
        $term = sanitize_title($term);
        $term = str_replace('&#039;', "'", $term);
        return $term; //"pa_{$term}";
    }

    public function get_wps_product_category_counts()
    {
        $terms = $this->get_all_terms();
        foreach ($terms as &$term) {
            $res = $this->get_api("/taxonomyterms/{$term['id']}/products", ['countOnly' => 'true']);
            if (isset($res['data']['count'])) {
                $term['count'] = $res['data']['count'];
            }
        }
        return $terms;
    }

    public function get_woo_product_category_counts()
    {
        // Get all product categories (set 'hide_empty' to false to include categories with no products).
        $args = [
            'taxonomy'   => 'product_cat',
            'hide_empty' => false,
        ];

        $categories = get_terms($args);

        // If there was an error, return an empty array.
        if (is_wp_error($categories)) {
            return [];
        }

        $results = [];

        // Loop through each category and build the result.
        foreach ($categories as $category) {
            $results[] = [
                'id'    => $category->term_id,
                'name'  => $category->name,
                'slug'  => $category->slug,
                'count' => $category->count,
            ];
        }

        return $results;
    }

    private $terms_transient_name        = "get_wps_term_slugs";
    private $wps_taxonomy_transient_name = "wps_taxonomy";

    // get the term for a WPS taxonomy and creates it if it doesn't exist
    public function get_wps_category($taxonomyterm_id)
    {
        $transient_name = __FUNCTION__ . "_{$taxonomyterm_id}";
        $response       = get_transient($transient_name);

        if ($response) {
            return $response;
        }
        // in some case, wp does not have the WPS taxonomy loaded so we need to get the WPS category and save it to wp
        $res = $this->get_api("/taxonomyterms/{$taxonomyterm_id}");

        if (isset($res['data']) && isset($res['data']['name'])) {
            $term_id       = 0;
            $name          = $this->sanitize_term($res['data']['name']);
            $path          = [$name];
            $slug          = wc_attribute_taxonomy_slug($res['data']['name']);
            $parent_id     = $res['data']['parent_id'];
            $woo_parent_id = 0;

            if (is_numeric($parent_id) && $parent_id > 0) {
                $p = $this->get_wps_category($parent_id);
                if ($p) {
                    $woo_parent_id = $p['woo_id'];
                    array_unshift($path, $p['slug']);
                }
            }

            $slug    = wc_attribute_taxonomy_slug(implode('_', $path));
            $new_cat = wp_insert_term($res['data']['name'], 'product_cat', ['slug' => $slug, 'parent' => $woo_parent_id]);

            if (is_wp_error($new_cat)) {
                if (isset($new_cat->error_data) && isset($new_cat->error_data['term_exists'])) {
                    $term_id = $new_cat->error_data['term_exists'];
                    $status  = 'exists';
                } else {
                    $status = 'error';
                }
            } else {
                $status  = 'created';
                $term_id = $new_cat['term_id'];
            }

            $response = [
                "name"   => $name,
                "slug"   => $slug,
                "woo_id" => $term_id,
                "status" => $status,
            ];

            set_transient($transient_name, $response, WEEK_IN_SECONDS);
            return $response;
        }
        return false;
    }

    // TODO: delete
    public function get_supplier_category_slug_lookup($supplier_category_ids = [])
    {
        $categories = $this->import_taxonomy();
        $subset     = count($supplier_category_ids) ? array_filter($categories, fn($c) => in_array($c['id'], $supplier_category_ids)) : $categories;
        return array_column($subset, 'slug', 'id');
    }

    // these relate to the taxonomyterms from WPS
    // generate a array [WPS term id] => [wp term_id] for product import to use for categorizing
    public function get_wps_term_slugs()
    {
        $transient_name = $this->terms_transient_name;
        $response       = get_transient($transient_name);

        if ($response) {
            return $response;
        }

        $terms = $this->import_taxonomy();
        // map the supplier taxonomy id directly to the woo id
        $lookup = array_column($terms, 'woo_id', 'id');
        set_transient($this->terms_transient_name, $lookup, WEEK_IN_SECONDS);
    }

    public function get_all_terms($use_cache = true)
    {
        $terms  = [];
        $cursor = '';

        // load all taxonomy terms for WPS. There's < 1000 so this works. Many more might be a problem
        while (is_string($cursor)) {
            $res    = $this->get_api('/taxonomyterms', ['page' => ['cursor' => $cursor, 'size' => 500], 'fields' => ['taxonomyterms' => 'parent_id,name,depth']], $use_cache);
            $cursor = $res['meta']['cursor']['next'];
            foreach ($res['data'] as &$item) {
                // normalize name to match what wp returns
                $item['name'] = $this->sanitize_term($item['name']);
            }
            array_push($terms, ...($res['data'] ?? []));
        }
        return $terms;
    }

    public function refresh_taxonomy()
    {
        delete_transient($this->terms_transient_name);
        delete_transient($this->wps_taxonomy_transient_name);
        return $this->get_wps_term_slugs();
    }

    /*

    return

    [
        {
        "id": 1,
        "parent_id": null,
        "name": "Plow",
        "depth": 0,
        "slug": "plow",
        "woo_id": 29224,
        "parent_woo_id": 0
        },
        {
        "id": 2,
        "parent_id": 1720,
        "name": "Lighting",
        "depth": 1,
        "slug": "electrical_lighting",
        "woo_id": 29225,
        "parent_woo_id": 29225
        },
    ]
    */
    public function import_taxonomy($use_cache = true)
    {
        if ($use_cache) {
            $response = get_transient($this->wps_taxonomy_transient_name);

            if ($response) {
                return $response;
            }
        }

        $supplier_terms = $this->get_all_terms($use_cache);
        // clean names
        foreach ($supplier_terms as &$term) {
            $term['name'] = $this->sanitize_term($term['name']);
        }
        // generate breadcrumb slug
        $lookup_supplier_term_by_id   = array_column($supplier_terms, null, 'id');
        $term_slugs                   = [];
        $term_names                   = [];
        $lookup_supplier_term_by_name = [];

        foreach ($supplier_terms as &$term) {
            $t    = $term;
            $path = [];
            while ($t) {
                array_unshift($path, $t['name']);
                $t = $lookup_supplier_term_by_id[$t['parent_id']] ?? null;
            }
            $term['slug']                                = wc_attribute_taxonomy_slug(implode('_', $path));
            $term_slugs[]                                = $term['slug'];
            $term_names[]                                = $term['name'];
            $lookup_supplier_term_by_name[$term['name']] = $term;
        }

        $terms               = get_terms(['slug' => $term_slugs, 'taxonomy' => 'product_cat', 'hide_empty' => false]);
        $lookup_term_by_slug = array_column($terms, null, 'slug');

        foreach ($supplier_terms as &$term) {
            if (isset($lookup_term_by_slug[$term['slug']])) {
                $term['woo_id'] = $lookup_term_by_slug[$term['slug']]->term_id;
            } else {
                $new_term = wp_insert_term($term['name'], 'product_cat', ['slug' => $term['slug']]);
                if (is_wp_error($new_term)) {
                    $this->log($new_term->get_error_message());
                    $term['woo_id'] = 0;
                } else {
                    $term['woo_id'] = $new_term['term_id'];
                }
            }
        }

        $lookup_term_by_id = array_column($supplier_terms, null, 'id');

        foreach ($supplier_terms as &$term) {
            $term['parent_woo_id'] = 0;
            if (is_numeric($term['parent_id']) && $term['parent_id'] > 0 && isset($lookup_term_by_id[$term['parent_id']])) {
                $parent_term           = $lookup_term_by_id[$term['parent_id']];
                $term['parent_woo_id'] = $parent_term['woo_id'];

                if (isset($lookup_term_by_slug[$term['slug']])) {
                    $parent = $lookup_term_by_slug[$term['slug']]->parent;
                    if ($parent != $parent_term['woo_id']) {
                        $update = wp_update_term($term['woo_id'], 'product_cat', ['parent' => $term['parent_woo_id']]);
                        if (is_wp_error($update)) {
                            $this->log($update->get_error_message());
                        } else {
                            $term['parent_woo_id'] = $update['term_id'];
                        }
                    }
                }
            }
        }

        set_transient($this->wps_taxonomy_transient_name, $supplier_terms, WEEK_IN_SECONDS);

        return $supplier_terms;
    }
}
