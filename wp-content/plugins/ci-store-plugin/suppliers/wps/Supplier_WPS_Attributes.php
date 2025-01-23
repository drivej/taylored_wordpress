<?php
/*

1. WPS product responses do not include the attribute data. It seems like ti can be included in the request using the search params, but they alwaus return blank
2. To get the attributes, we load them from the WPS API separtely using get_attributes_from_product()
3. "pa_type" is a reserved term so we need to change it to "pa_item_type". See: https://codex.wordpress.org/Reserved_Terms

 */
trait Supplier_WPS_Attributes {
    public function get_attributes_from_product_id($supplier_product_id) {
        $supplier_product = $this->get_product($supplier_product_id);
        // return $supplier_product;
        return $this->get_attributes_from_product($supplier_product);
    }
    // this is specific to WPS because the attribute names are not returned with the API call
    public function get_attributes_from_product($supplier_product) {
        // $this->log('get_attributes_from_product()');
        $wps_attributekeys         = get_option('wps_attributekeys', []);
        $wps_attributekeys_updated = false;

        // cleanup
        foreach ($wps_attributekeys as $id => $attr) {
            if (count(array_keys($wps_attributekeys[$id])) > 2) {
                $wps_attributekeys[$id]    = ['name' => $attr['name'], 'slug' => $attr['slug']];
                $wps_attributekeys_updated = true;
            }
            if (! isset($wps_attributekeys[$id]['name']) || ! isset($wps_attributekeys[$id]['slug'])) {
                unset($wps_attributekeys[$id]);
                $wps_attributekeys_updated = true;
            }
        }

        // this is a utility because the attribute data is not entirely in the product request
        $attribute_ids = [];

        if (isset($supplier_product['items']['data'])) {
            foreach ($supplier_product['items']['data'] as $item) {
                foreach ($item['attributevalues']['data'] as $attr) {
                    if (! array_key_exists($attr['attributekey_id'], $attribute_ids)) {
                        $attribute_ids[$attr['attributekey_id']] = 0;
                    }
                    $attribute_ids[$attr['attributekey_id']]++;
                }
            }
        }

        $all_ids = array_keys($attribute_ids);

        // find attributevalues not in our nice cached object
        $ids = array_values(array_filter($all_ids, fn($id) => ! array_key_exists($id, $wps_attributekeys)));

        $cursor = '';
        $data   = [];

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
        } elseif (count($ids)) {
            // handle request for multiple items
            // gather data with pagination
            while (isset($cursor)) {
                $res = $this->get_api('attributekeys/' . implode(',', $ids), ['page[size]' => 20, 'page[cursor]' => $cursor]);
                if (isset($res['data'])) {
                    foreach ($res['data'] as $attr) {
                        $attr['slug'] = sanitize_title($attr['name']);
                        if (isset($attr['slug']) && isset($attr['name'])) {
                            $wps_attributekeys[$attr['id']] = ['name' => $attr['name'], 'slug' => $attr['slug']];
                            $wps_attributekeys_updated      = true;
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

    private $__lookup_global_attribute_id = [];

    public function upsert_global_attribute_id_by_name($attribute_name) {
        // $this->log('upsert_global_attribute_id_by_name() ' . $attribute_name . ' esc:' . esc_html($attribute_name));
        if (array_key_exists(esc_html($attribute_name), $this->__lookup_global_attribute_id)) {
            // $this->log(json_encode($this->__lookup_global_attribute_id[esc_html($attribute_name)]));
            return $this->__lookup_global_attribute_id[esc_html($attribute_name)];
        }
        $attribute_key = wc_attribute_taxonomy_name($attribute_name);

        // reserved word
        // if ($attribute_key === 'pa_type') {
        //     $attribute_key = 'pa_item_type';
        // }
        $exists       = taxonomy_exists($attribute_key);
        $attribute_id = false;

        // $this->log('upsert_global_attribute_id_by_name() '.json_encode(['exists' => $exists, '$attribute_key' => $attribute_key]));
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
        $this->__lookup_global_attribute_id[esc_html($attribute_name)] = $attribute_id;
        // $this->log(json_encode('attribute_id '.$attribute_id));
        return $attribute_id;
    }

    public function process_product_attributes(&$product) {
        // $this->log('process_product_attributes()');
        // extract attributes from product. If they aren't loaded, make an API to WPS call to get them
        // this returns an array where the key is the "attributekey_id" from WPS
        $lookup_attribute_slug = $this->get_attributes_from_product($product);

        // TODO: make sure every variation has every attribute - fill in blanks with "N/A"
        // gather unique attribute ids
        $attributekey_ids      = [];
        $dummy_attributes      = [];
        $item_attributekey_ids = [];
        foreach ($product['items']['data'] as $i => $item) {
            $item_attributekey_ids[$item['id']] = [];
            foreach ($item['attributevalues']['data'] as $ii => $attributevalue) {
                $attributekey_ids[] = $attributevalue['attributekey_id'];
                if (! in_array($item['id'], $item_attributekey_ids)) {
                    $item_attributekey_ids[$item['id']][]                 = $attributevalue['attributekey_id'];
                    $dummy_attributes[$attributevalue['attributekey_id']] = [
                         ...$attributevalue,
                        'name' => 'N/A',
                    ];
                }
            }
        }
        $attributekey_ids = array_values(array_unique($attributekey_ids));

        // append dummy attributes where necessary
        $log_attribute_error = false;
        foreach ($product['items']['data'] as $i => $item) {
            if (count($item['attributevalues']['data']) < count($attributekey_ids)) {
                // error_log('found missing attr');
                $dif = array_diff($attributekey_ids, $item_attributekey_ids[$item['id']]);
                foreach ($dif as $attributekey_id) {
                    $product['items']['data'][$i]['attributevalues']['data'][] = $dummy_attributes[$attributekey_id];
                }
                $log_attribute_error = true;
            }
        }
        if ($log_attribute_error) {
            error_log('product ' . $product['id'] . ' has inconsistent attributes');
        }

        // This code processes a product's attribute values to identify and handle duplicate attributes
        // (based on their attributekey_id) within each item's data. When duplicate attribute values are found,
        // it combines them into a single entry with their names concatenated.

        foreach ($product['items']['data'] as $i => $item) {
            $dupes  = [];
            $lookup = [];
            foreach ($item['attributevalues']['data'] as $ii => $attributevalue) {
                $dupes[$attributevalue['attributekey_id']][] = $attributevalue['name'];
                $lookup[$attributevalue['attributekey_id']]  = $attributevalue;
            }
            foreach ($dupes as $attributekey_id => $dupe) {
                if (count($dupe) > 1) {
                    sort($dupe);
                    $attr     = $lookup[$attributekey_id];
                    $new_attr = [
                        //  ...$attr,
                        "id"              => $attr['id'],
                        "attributekey_id" => $attr['attributekey_id'],
                        "name"            => implode(', ', $dupe),
                    ];

                    // remove stupid attributes
                    $attributes = array_filter($item['attributevalues']['data'], fn($e) => $e['attributekey_id'] !== $attributekey_id);

                    $attributes[]                                            = $new_attr;
                    $product['items']['data'][$i]['attributevalues']['data'] = $attributes;
                }
            }
        }

        //
        // Identify attributes that have the same value across all product variations and removes them if they are redundant.
        $dupes            = [];
        $removed_attr     = [];
        $count_variations = count($product['items']['data']);
        foreach ($product['items']['data'] as $i => $item) {
            foreach ($item['attributevalues']['data'] as $ii => $attributevalue) {
                $dupes[$attributevalue['attributekey_id']][] = $attributevalue['name'];
            }
        }
        foreach ($dupes as $attributekey_id => $dupe) {
            $unique_values = array_unique($dupe);
            if (count($unique_values) === 1) {
                if (count($dupe) === $count_variations) {
                    $removed_attr[] = $attributekey_id;
                    unset($lookup_attribute_slug[$attributekey_id]);
                }
            }
        }
        //
        //
        //

        $product['lookup_attribute_slug'] = $lookup_attribute_slug;

        foreach ($lookup_attribute_slug as &$attribute) {
            $attribute['values'] = [];
        }

        $skus = [];

        // loop the variations and map variation attribute to the WPS attribute values
        foreach ($product['items']['data'] as $i => $item) {
            $skus[] = ['name' => $item['sku']];
            foreach ($item['attributevalues']['data'] as $ii => &$attributevalue) {
                $attr_id = strval($attributevalue['attributekey_id']);
                if (array_key_exists($attr_id, $lookup_attribute_slug)) {
                    if (! in_array($attributevalue['name'], $lookup_attribute_slug[$attr_id]['values'])) {
                        $lookup_attribute_slug[$attr_id]['values'][] = $attributevalue['name'];
                    }
                    // $attributevalue['attribute_name'] = $lookup_attribute_slug[$attr_id]['name'];
                    $product['items']['data'][$i]['attributevalues']['data'][$ii]['attribute_name'] = $lookup_attribute_slug[$attr_id]['name'];
                    // $attributevalue['attribute_slug'] = $lookup_attribute_slug[$attr_id]['slug'];
                    $product['items']['data'][$i]['attributevalues']['data'][$ii]['attribute_slug'] = $lookup_attribute_slug[$attr_id]['slug'];
                } else {
                    if (in_array($attr_id, $removed_attr)) {
                        // $this->log('ITS OK attr_id:' . $attr_id . ' not found in lookup_attribute_slug');
                    } else {
                        // $this->log('attr_id:' . $attr_id . ' not found in lookup_attribute_slug');
                    }
                }
            }
        }

        $attributes = array_values($lookup_attribute_slug);

        foreach ($attributes as &$attribute) {
            foreach ($attribute['values'] as $i => $value) {
                $attribute['values'][$i] = ['name' => $value];
            }
        }

        // $this->log(json_encode($attributes));

        foreach ($attributes as &$attribute) {
            $this->preprocess_attribute($attribute);
        }
        // $this->log(json_encode($attribute, JSON_PRETTY_PRINT));

        // foreach ($product['items']['data'] as $item) {
        //     foreach ($item['attributevalues']['data'] as $attributevalue) {
        //         // Ensure 'attributekey_id' exists in the current attribute value
        //         if (isset($attributevalue['attributekey_id'])) {
        //             $attr_id = $attributevalue['attributekey_id'];
        
        //             // Check if the attribute key exists in the lookup array
        //             if (isset($lookup_attribute_slug[$attr_id])) {
        //                 // Avoid duplicates by checking before adding
        //                 if (!in_array($attributevalue['name'], $lookup_attribute_slug[$attr_id]['values'], true)) {
        //                     $lookup_attribute_slug[$attr_id]['values'][] = $attributevalue['name'];
        //                 }
        //             }
        //         }
        //     }
        // }

        // check if we need the sku facet
        // does each variation have a unique facet arrangement
        $varattrs = [];
        foreach ($product['items']['data'] as $item) {
            $varattrs[] = implode('|', array_values(array_column($item['attributevalues']['data'], 'name', 'attribute_name')));
        }
        $use_sku = count(array_unique($varattrs)) < count($product['items']['data']);

        if ($use_sku) {
            $attributes[] = [
                'name'     => 'SKU',
                'slug'     => 'sku',
                'values'   => $skus,
                'key'      => 'sku',
                'position' => 20,
            ];
        }

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
    public function preprocess_attribute(&$attr) {
        // $this->log('preprocess_attribute()');

        if (strtolower($attr['name']) === 'type') {
            $attr['name'] = 'Item Type';
        }

        $attr['key']  = wc_attribute_taxonomy_name($attr['name']);                // Color => pa_color
        $attr['slug'] = wc_attribute_taxonomy_slug($attr['name']);                // Color => color
        $attr['id']   = $this->upsert_global_attribute_id_by_name($attr['name']); // Color => 523
        $names        = array_column($attr['values'], 'name');
        $terms        = get_terms(['taxonomy' => $attr['key'], 'name' => $names, 'hide_empty' => false]);

        if (! is_array($terms)) {
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
            } elseif (array_key_exists(esc_html($attr_val['name']), $lookup_term_name)) {
                // account for varoous characters in the name
                // $this->log('found term ' . $attr_val['name']);
                $attr_val['id'] = $lookup_term_name[esc_html($attr_val['name'])];
            } else {
                // attribute needs to be created
                // $this->log('need to create term ' . $attr_val['name']);
                $term_exists = term_exists($attr_val['name'], $attr['key']);
                if (! $term_exists) {
                    $term_exists = wp_insert_term($attr_val['name'], $attr['key']);
                }
                if (is_wp_error($term_exists)) {
                    $error_string = $term_exists->get_error_message();
                    $this->log('error_string: ' . $error_string);
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

    public function process_varition_attributes($variation, $product_attributes_lookup) {
        // $this->log('process_varition_attributes() ' . $variation['id']);
        // $this->log(json_encode($product_attributes_lookup, JSON_PRETTY_PRINT));
        // $this->log(json_encode($variation['attributevalues']['data'], JSON_PRETTY_PRINT));

        $attributes = [];

        if (is_countable($variation['attributevalues']['data'])) {
            foreach ($variation['attributevalues']['data'] as $attr) {
                if (! array_key_exists('attribute_name', $attr)) {
                    // $this->log('process_varition_attributes() FOUND YOU!!' . json_encode($attr)); // TODO: WTF?
                } else {
                    $attr_name = $attr['attribute_name'];
                    if (array_key_exists($attr_name, $product_attributes_lookup)) {
                        $attr_val                                                  = $attr['name'];
                        $attributes[$product_attributes_lookup[$attr_name]['key']] = [
                            'id'    => $product_attributes_lookup[$attr_name]['lookup_value'][$attr_val],
                            'value' => $attr_val,
                        ];
                    }
                }
            }
        }
        return $attributes;
    }

    public function build_attributes_lookup($product_attributes) {
        $lookup = [];
        foreach ($product_attributes as $i => $attr) {
            $attr['lookup_value']  = array_column($attr['values'], 'id', 'name');
            $lookup[$attr['name']] = $attr;
        }
        return $lookup;
    }

    public function build_woo_product_attributes($product_attributes) {
        // $this->log('build_woo_product_attributes()');
        $woo_attributes = [];
        foreach ($product_attributes as $i => $attribute) {
            $values = $attribute['values'];

            if (! array_key_exists('key', $attribute)) {
                $this->log('build_woo_product_attributes() No Key ' . json_encode($product_attributes, JSON_PRETTY_PRINT));
            }
            // if (count($values) > 1) {
            $attr = new WC_Product_Attribute();
            $attr->set_name($attribute['name']);
            $attr->set_options(array_column($values, 'name'));
            $attr->set_visible(1);
            $attr->set_variation(1);
            $attr->set_position($attribute['position'] ?? $i);
            $woo_attributes[$attribute['key']] = $attr;
            // }
        }
        return $woo_attributes;
    }

    public function delete_product_attributes($post_id) {
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
