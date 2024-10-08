<?php
/*

1. WPS product responses do not include the attribute data. It seems like ti can be included in the request using the search params, but they alwaus return blank
2. To get the attributes, we load them from the WPS API separtely using get_attributes_from_product()
3. "pa_type" is a reserved term so we need to change it to "pa_item_type". See: https://codex.wordpress.org/Reserved_Terms

 */
trait Supplier_WPS_Attributes
{
    // this is specific to WPS because the attribute names are not returned with the API call
    public function get_attributes_from_product($supplier_product) // wps_product
    {
        // $this->log('get_attributes_from_product()');
        $wps_attributekeys = get_option('wps_attributekeys', []);
        $wps_attributekeys_updated = false;

        // cleanup
        foreach ($wps_attributekeys as $id => $attr) {
            if (count(array_keys($wps_attributekeys[$id])) > 2) {
                $wps_attributekeys[$id] = ['name' => $attr['name'], 'slug' => $attr['slug']];
                $wps_attributekeys_updated = true;
            }
            if (!isset($wps_attributekeys[$id]['name']) || !isset($wps_attributekeys[$id]['slug'])) {
                unset($wps_attributekeys[$id]);
                $wps_attributekeys_updated = true;
            }
        }

        // this is a utility because the attribute data is not entirely in the product request
        $attribute_ids = [];

        if (isset($supplier_product['items']['data'])) {
            foreach ($supplier_product['items']['data'] as $item) {
                foreach ($item['attributevalues']['data'] as $attr) {
                    if (!array_key_exists($attr['attributekey_id'], $attribute_ids)) {
                        $attribute_ids[$attr['attributekey_id']] = 0;
                    }
                    $attribute_ids[$attr['attributekey_id']]++;
                }
            }
        }

        $all_ids = array_keys($attribute_ids);

        // find attributevalues not in out nice cached object
        $ids = array_values(array_filter($all_ids, fn($id) => !array_key_exists($id, $wps_attributekeys)));

        $cursor = '';
        $data = [];

        if (count($ids) === 1) {
            // handle request for single item
            $res = $this->get_api('attributekeys/' . implode(',', $ids));
            try {
                // this explodes if another product exists with the same sku
                $res['data']['slug'] = sanitize_title($res['data']['name']);
                // $wps_attributekeys[$ids[0]] = $res['data'];
                if (isset($res['data']['slug']) && isset($res['data']['name'])) {
                    $wps_attributekeys[$ids[0]] = ['name' => $res['data']['name'], 'slug' => $res['data']['slug']];
                }
                $wps_attributekeys_updated = true;
            } catch (\Exception $e) {
                $this->log('CAUGHT!!! wps:get_attributes_from_product()', $res);
            }
            // $attributes[] = $res['data'];
        } else if (count($ids)) {
            // handle request for multiple items
            // gather data with pagination
            while (isset($cursor)) {
                $res = $this->get_api('attributekeys/' . implode(',', $ids), ['page[size]' => 20, 'page[cursor]' => $cursor]);
                if (isset($res['data'])) {
                    foreach ($res['data'] as $attr) {
                        $attr['slug'] = sanitize_title($attr['name']);
                        if (isset($attr['slug']) && isset($attr['name'])) {
                            $wps_attributekeys[$attr['id']] = ['name' => $attr['name'], 'slug' => $attr['slug']];
                            $wps_attributekeys_updated = true;
                        }
                    }
                } else {
                    $this->log('wps:get_attributes_from_product() Warning ' . json_encode($res, JSON_PRETTY_PRINT));
                }
                if (is_array($res['data'])) {
                    array_push($data, ...$res['data']);
                }
                if (isset($res['meta']['cursor']['next'])) {
                    $cursor = $res['meta']['cursor']['next'];
                } else {
                    unset($cursor);
                }
            }
        }

        $valid_ids = array_filter($all_ids, fn($id) => array_key_exists($id, $wps_attributekeys));

        $lookup_by_id = [];
        foreach ($valid_ids as $valid_id) {
            $lookup_by_id[$valid_id] = $wps_attributekeys[$valid_id];
        }

        if ($wps_attributekeys_updated) {
            update_option('wps_attributekeys', $wps_attributekeys);
        }

        return $lookup_by_id;
    }

    private $lookup_global_attribute_id = [];

    public function upsert_global_attribute_id_by_name($attribute_name)
    {
        // $this->log('upsert_global_attribute_id_by_name() ' . $attribute_name . ' esc:' . esc_html($attribute_name));
        if (array_key_exists(esc_html($attribute_name), $this->lookup_global_attribute_id)) {
            // $this->log(json_encode($this->lookup_global_attribute_id[esc_html($attribute_name)]));
            return $this->lookup_global_attribute_id[esc_html($attribute_name)];
        }
        $attribute_key = wc_attribute_taxonomy_name($attribute_name);

        // reserved word
        // if ($attribute_key === 'pa_type') {
        //     $attribute_key = 'pa_item_type';
        // }
        $exists = taxonomy_exists($attribute_key);
        $attribute_id = false;

        // $this->log(json_encode(['exists' => $exists, '$attribute_key' => $attribute_key]));
        if ($exists) {
            $attribute_id = wc_attribute_taxonomy_id_by_name($attribute_name);
        } else {
            $attribute_id = wc_create_attribute(['name' => $attribute_name]);
            // $this->log(json_encode(['attribute_id' => $attribute_id]));
            if (is_wp_error($attribute_id)) {
                error_log("Failed to create attribute: {$attribute_name}");
                throw new Exception("Failed to create attribute: {$attribute_name}");
            }
        }
        $this->lookup_global_attribute_id[esc_html($attribute_name)] = $attribute_id;
        return $attribute_id;
    }

    public function process_product_attributes(&$product)
    {
        // $this->log('process_product_attributes()');
        // extract attributes from product. If they aren't loaded, make an API to WPS call to get them
        // this returns an array where the key is the "attributekey_id" from WPS
        $lookup_attribute_slug = $this->get_attributes_from_product($product);
        // $this->log(json_encode(['get_attributes_from_product()' => $lookup_attribute_slug], JSON_PRETTY_PRINT));
        $product['lookup_attribute_slug'] = $lookup_attribute_slug;

        foreach ($lookup_attribute_slug as &$attribute) {
            $attribute['values'] = [];
        }

        $skus = [];

        // loop the variations and map variation attribute to the WPS attribute values
        foreach ($product['items']['data'] as &$item) {
            $skus[] = ['name' => $item['sku']];
            // $this->log('----------> SKU:' . $item['sku']);

            foreach ($item['attributevalues']['data'] as &$attributevalue) {
                $attr_id = strval($attributevalue['attributekey_id']);
                // $this->log('----------> attr_id:' . $attr_id);
                if (array_key_exists($attr_id, $lookup_attribute_slug)) {
                    // $this->log('Success: ' . $attr_id . ' found');
                    if (!in_array($attributevalue['name'], $lookup_attribute_slug[$attr_id]['values'])) {
                        $lookup_attribute_slug[$attr_id]['values'][] = $attributevalue['name'];
                    }
                    // if (!array_key_exists('key', $lookup_attribute_slug[$attr_id])) {
                    //     $this->log('FOUND YOU!!!! ' . $attr_id);
                    //     $attributevalue['attribute_key'] = 'unknown';
                    // } else {
                    //     $attributevalue['attribute_key'] = $lookup_attribute_slug[$attr_id]['key'];
                    // }
                    $attributevalue['attribute_name'] = $lookup_attribute_slug[$attr_id]['name'];
                    $attributevalue['attribute_slug'] = $lookup_attribute_slug[$attr_id]['slug'];
                } else {
                    // $this->log('attr_id:' . $attr_id . ' not found in lookup_attribute_slug');
                }
            }
            // $this->log(json_encode(['attributevalues' => $item['attributevalues']['data']], JSON_PRETTY_PRINT));
        }

        $attributes = array_values($lookup_attribute_slug);

        foreach ($attributes as &$attribute) {
            foreach ($attribute['values'] as $i => $value) {
                $attribute['values'][$i] = ['name' => $value];
            }
        }

        foreach ($attributes as &$attribute) {
            $this->preprocess_attribute($attribute);
        }
        return $attributes;

        foreach ($product['items']['data'] as $item) {
            foreach ($item['attributevalues']['data'] as $attributevalue) {
                $attr_id = $attributevalue['attributekey_id'];
                if (array_key_exists($attr_id, $lookup_attribute_slug)) {
                    if (!in_array($attributevalue['name'], $lookup_attribute_slug[$attr_id]['values'])) {
                        $lookup_attribute_slug[$attr_id]['values'][] = $attributevalue['name'];
                    }
                }
            }
        }

        $attributes[] = [
            'name' => 'SKU',
            'slug' => 'sku',
            'values' => $skus,
            'key' => 'sku',
            'position' => 20,
        ];

        $product['__attributes'] = $attributes;

        // $this->log(['$attributes' => $attributes]);

        return $attributes;
    }

    // $attr = [
    //     'name' => 'Color',
    //     'key' => null,
    //     'slug' => null,
    //     'id' => 0,
    //     'values' => [
    //         [
    //             'name' => 'Red',
    //             'id' => 0,
    //         ],
    //         [
    //             'name' => 'Blue',
    //             'id' => 0,
    //         ],
    //     ],
    // ];
    // create/select the taxonomy and return the data
    public function preprocess_attribute(&$attr)
    {
        // $this->log('preprocess_attribute()');

        if (strtolower($attr['name']) === 'type') {
            $attr['name'] = 'Item Type';
        }

        $attr['key'] = wc_attribute_taxonomy_name($attr['name']); // Color => pa_color
        $attr['slug'] = wc_attribute_taxonomy_slug($attr['name']); // Color => color
        $attr['id'] = $this->upsert_global_attribute_id_by_name($attr['name']); // Color => 523
        $names = array_column($attr['values'], 'name');
        $terms = get_terms(['taxonomy' => $attr['key'], 'name' => $names, 'hide_empty' => false]);

        if (!is_array($terms)) {
            $terms = [];
        }
        $lookup_term_name = array_column($terms, 'term_id', 'name');
        // $this->log(json_encode(['lookup_term_name' => $lookup_term_name], JSON_PRETTY_PRINT));
        // $this->log(json_encode($attr, JSON_PRETTY_PRINT));

        foreach ($attr['values'] as &$attr_val) {
            // $this->log('attr_val[name] = ' . $attr_val['name']);
            // $this->log('keys = ' . json_encode(array_keys($lookup_term_name)));

            if (array_key_exists($attr_val['name'], $lookup_term_name)) {
                // found attribute
                // $this->log('found term ' . $attr_val['name']);
                $attr_val['id'] = $lookup_term_name[$attr_val['name']];
            } else if (array_key_exists(esc_html($attr_val['name']), $lookup_term_name)) {
                // account for varoous characters in the name
                // $this->log('found term ' . $attr_val['name']);
                $attr_val['id'] = $lookup_term_name[esc_html($attr_val['name'])];
            } else {
                // attribute needs to be created
                // $this->log('need to create term ' . $attr_val['name']);
                $term_exists = term_exists($attr_val['name'], $attr['key']);
                if (!$term_exists) {
                    $term_exists = wp_insert_term($attr_val['name'], $attr['key']);
                }
                if (is_wp_error($term_exists)) {
                    $error_string = $term_exists->get_error_message();
                    $this->log($error_string);
                    // throw new Exception($error_string);
                } else {
                    if ($term_exists) {
                        $attr_val['id'] = $term_exists['term_id'];
                    }
                    $attr_val['exists'] = (bool) $term_exists;
                }
            }
        }
    }

    public function process_varition_attributes($variation, $product_attributes_lookup)
    {
        // $this->log('process_varition_attributes()');
        $attributes = [];

        foreach ($variation['attributevalues']['data'] as $attr) {
            $attr_name = $attr['attribute_name'];
            if (array_key_exists($attr_name, $product_attributes_lookup)) {
                $attr_val = $attr['name'];
                $attributes[$product_attributes_lookup[$attr_name]['key']] = [
                    'id' => $product_attributes_lookup[$attr_name]['lookup_value'][$attr_val],
                    'value' => $attr_val,
                ];
            }
        }
        return $attributes;
    }

    public function build_attributes_lookup($product_attributes)
    {
        $lookup = [];
        foreach ($product_attributes as $i => $attr) {
            $attr['lookup_value'] = array_column($attr['values'], 'id', 'name');
            $lookup[$attr['name']] = $attr;
        }
        return $lookup;
    }

    public function build_woo_product_attributes($product_attributes)
    {
        // $this->log('build_woo_product_attributes()');
        $woo_attributes = [];
        foreach ($product_attributes as $i => $attribute) {
            $values = $attribute['values'];

            if (!array_key_exists('key', $attribute)) {
                $this->log(json_encode($product_attributes, JSON_PRETTY_PRINT));
            }
            if (count($values) > 1) {
                $attr = new WC_Product_Attribute();
                $attr->set_name($attribute['name']);
                $attr->set_options(array_column($values, 'name'));
                $attr->set_visible(1);
                $attr->set_variation(1);
                $attr->set_position($attribute['position'] ?? $i);
                $woo_attributes[$attribute['key']] = $attr;
            }
        }
        return $woo_attributes;
    }

    public function clean_product_attributes($post_id)
    {
        global $wpdb;

        $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_key LIKE %s",
                $post_id,
                'attribute_%'
            )
        );
    }
}
