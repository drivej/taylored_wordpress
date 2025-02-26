<?php

// use function CIStore\Suppliers\WPS\Utils\normalize_wps_date;

use function WooTools\upsert_brand;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools/WooTools_upsert_categories.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools/WooTools_upsert_attributes.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools/WooTools_assign_product_categories.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools/WooTools_clean_variation_attributes.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools/WooTools_get_product_info_by_skus.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools/WooTools_assign_multiple_global_attributes_to_product.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools/WooTools_get_mem.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools/WooTools_upsert_brand.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Timer.php';
// include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/wps/Supplier_WPS_Utils.php';

trait Supplier_WPS_Normalize
{
    private function check_memory()
    {
        $capacity = WooTools\memory_capacity();
        if ($capacity > 0.5) {
            gc_collect_cycles();
            throw new Exception('Memory usage high: ' . round($capacity * 100) . '%');
        }
    }

    private function simple_products($products)
    {
        if (is_countable($products)) {
            return array_values(array_map(fn($p) => $p['id'], $products));
        }
        return $products;
    }

    private function pretty_products($products)
    {
        if (is_countable($products)) { // && isset($products[0]['id'])) {
            try {
                return array_map(fn($p) => [
                    'id'         => $p['id'],
                    'woo_id'     => $p['woo_id'],
                    // 'errors'       => $p['errors'],
                    // 'link'       => get_permalink($p['woo_id']),
                    // 'name'         => $p['name'],
                    // 'sku'          => $p['sku'],
                    // 'type'       => $p['type'],
                    // 'woo_type'   => $p['woo_type'],
                    // 'woo_status' => $p['woo_status'] ?? 'none',
                    // 'category_ids' => $p['category_ids'] ?? 'none',
                    // 'categories'   => isset($p['categories']) ? array_keys($p['categories']) : null,
                    // 'attributes' => isset($p['attributes']) ? array_keys($p['attributes']) : null,
                    'variations' => isset($p['variations']) ? array_map(fn($v) => [
                        // 'name'       => $v['name'],
                        // 'sku'          => $v['sku'],
                        'woo_id' => $v['woo_id'],
                        // 'category_ids' => $v['category_ids'] ?? 'none',
                        // 'categories'   => isset($v['categories']) ? array_keys($v['categories']) : null,
                        // 'woo_type'   => $v['woo_type'],
                        // 'attributes' => $v['attributes'],
                    ], $p['variations']) : null,
                ], $products);
            } catch (Exception $e) {
                return $products;
            }
        }
        return $products;
    }

    public function normalize_product_data($product_data)
    {
        return isset($product_data['data']) ? $product_data['data'] : $product_data;
    }

    private function is_normal_product_available($product)
    {
        if (count($product['variations'])) {
            foreach ($product['variations'] as $variation) {
                if ($variation['meta']['_stock_status'] === 'instock') {
                    return true;
                }
            }
        }
        return false;
    }

    private function log_lap($process, $timer)
    {
        $lap = $timer->lap();
        if ($lap > 0) {
            $this->log($process . ' ' . $lap . ' ' . WooTools\get_mem());
            $this->check_memory();
        }
    }

    private function get_product_ids($product)
    {
        return array_map(fn($p) => $p['id'], $product);
    }

    public function delete_products_page($page)
    {
        /** @var Supplier_WPS $this */
        $this->normalize_wps_api_response($page);

        $meta           = $page['meta'];
        $meta['total']  = count($page['data']);
        $meta['errors'] = [];
        $products       = $page['data'];

        foreach ($products as $product) {
            $product = $this->normalize_product($product);
            $sku     = $this->get_product_sku($product['id']);
            $woo_id  = wc_get_product_id_by_sku($sku);

            if ($woo_id) {
                $woo_product = wc_get_product($woo_id);
                if ($woo_product) {
                    $woo_product->delete(true);
                }
            }
        }
        gc_collect_cycles();
        return ['meta' => $meta, 'data' => $products];
    }

    public function normalize_products($page, $save = true)
    {
        /** @var Supplier_WPS $this */
        if (isset($page['error'])) {
            $this->log(__FUNCTION__ . ' no data to import');
            return false;
        }
        $this->normalize_wps_api_response($page);

        $products       = $page['data'];
        $meta           = $page['meta'];
        $meta['total']  = count($page['data']);
        $meta['errors'] = [];
        $meta['save']   = $save;
        $debug          = false;

        if ($debug) {
            $this->log('normalize_product');
        }

        foreach ($products as &$product) {
            $product = $this->normalize_product($product);
        }
        if ($debug) {
            $this->log('process_normalize_products');
        }

        $products = $this->process_normalize_products($products);
        if ($debug) {
            $this->log('custom_normalize_products');
        }

        $products = $this->custom_normalize_products($products, $meta);
        if ($debug) {
            $this->log('delete_normalize_products');
        }

        $products = $this->delete_normalize_products($products, $meta);
        if ($debug) {
            $this->log('assign_normalize_products');
        }

        $products = $this->assign_normalize_products($products, $meta, $save);
        if ($debug) {
            $this->log('assign_product_images');
        }

        $products = $this->assign_product_images($products, $meta);
        if ($debug) {
            $this->log('categorize_normalize_products');
        }

        $products = $this->categorize_normalize_products($products, $meta);

        if ($save) {
            $products = $this->save_normalize_products($products, $meta);
        } else {
            return ['meta' => $meta, 'data' => $products];
        }

        gc_collect_cycles();

        return ['meta' => $meta, 'data' => array_values($products)];
    }

    public function normalize_product($product)
    {
        /** @var Supplier_WPS $this */
        $product = $this->normalize_product_data($product);

        $output                           = [];
        $output['errors']                 = [];
        $output['id']                     = $product['id'];
        $output['name']                   = isset($product['name']) ? $product['name'] : '';
        $output['sku']                    = $this->get_product_sku($product['id']);
        $output['short_description']      = $this->get_short_description(['data' => $product]);
        $output['description']            = $this->get_description(['data' => $product]);
        $output['meta']                   = [];
        $output['meta']['_ci_product_id'] = $product['id'];
        // $output['meta']['_ci_supplier_updated'] = normalize_wps_date($product['updated_at']); // TODO: hmm...
        $output['attributes']  = [];
        $output['categories']  = [];
        $output['attachments'] = [];
        $output['variations']  = [];
        $master_category_keys  = [];

        if (isset($product['taxonomyterms']['data'])) {
            foreach ($product['taxonomyterms']['data'] as $term) {
                $term_key = (string) $term['id'];
                if (! isset($master_category_keys[$term_key])) {
                    $output['categories'][]          = ['taxonomyterm_id' => $term['id']];
                    $master_category_keys[$term_key] = true;
                }
            }
        }

        if (! empty($product['items']['data'])) {
            foreach ($product['items']['data'] as $item) {
                $product_category_keys = [];
                // if ($this->isValidItem($item)) {
                $variation                                   = [];
                $variation['is_valid']                       = $this->isValidItem($item);
                $variation['id']                             = $item['id'];
                $variation['sku']                            = $this->get_variation_sku($product['id'], $item['id']);
                $variation['name']                           = isset($item['name']) ? ucwords($item['name']) : '';
                $variation['brand']                          = isset($item['brand_id']) ? $item['brand_id'] : 0;
                $variation['meta']                           = [];
                $variation['attributes']                     = [];
                $variation['categories']                     = [];
                $variation['images']                         = [];
                $variation['price']                          = isset($item['list_price']) ? $item['list_price'] : 0;
                $variation['meta']['_stock_status']          = $this->getItemStockStatus($item);
                $variation['meta']['_weight']                = isset($item['weight']) ? $item['weight'] : 0;
                $variation['meta']['_length']                = isset($item['length']) ? $item['length'] : 0;
                $variation['meta']['_width']                 = isset($item['width']) ? $item['width'] : 0;
                $variation['meta']['_height']                = isset($item['height']) ? $item['height'] : 0;
                $variation['meta']['_variation_description'] = isset($item['name']) ? $item['name'] : '';
                $variation['meta']['_ci_product_id']         = $product['id'];
                $variation['meta']['_ci_product_sku']        = isset($item['sku']) ? $item['sku'] : '';

                if (! empty($item['product_type'])) {
                    $term_name                 = $this->sanitize_term($item['product_type']);
                    $variation['categories'][] = ['name' => $term_name];
                    $term_key                  = $term_name;
                    if (! isset($product_category_keys[$term_key])) {
                        if (! isset($master_category_keys[$term_key])) {
                            $output['categories'][]          = ['name' => $term_name];
                            $master_category_keys[$term_key] = true;
                        }
                        $product_category_keys[$term_key] = true;
                    }
                }

                if (! empty($item['taxonomyterms']['data'])) {
                    foreach ($item['taxonomyterms']['data'] as $term) {
                        $variation['categories'][] = ['taxonomyterm_id' => $term['id']];
                        $term_key                  = (string) $term['id'];
                        if (! isset($product_category_keys[$term_key])) {
                            if (! isset($master_category_keys[$term_key])) {
                                $output['categories'][]          = ['taxonomyterm_id' => $term['id']];
                                $master_category_keys[$term_key] = true;
                            }
                            $product_category_keys[$term_key] = true;
                        }
                    }
                }

                if (isset($item['attributevalues']['data'])) {
                    foreach ($item['attributevalues']['data'] as $attr) {
                        $variation['attributes'][$attr['attributekey_id']] = $attr['name'];
                        if (! isset($output['attributes'][$attr['attributekey_id']])) {
                            $output['attributes'][$attr['attributekey_id']] = ['name' => '', 'options' => []];
                        }
                        $output['attributes'][$attr['attributekey_id']]['options'][] = $attr['name'];
                    }
                }

                if (isset($item['images']['data'])) {
                    foreach ($item['images']['data'] as $image) {
                        $variation['images'][] = $this->convert_image_to_attachment_data($image, sprintf('%s (%s)', $item['name'], $item['sku']));
                    }
                }

                $output['variations'][] = $variation;
                // }
            }
        }

        unset($product_category_keys, $variation, $master_category_keys);

        return $output;
    }

    public function process_normalize_products(&$products)
    {
        /** @var Supplier_WPS $this */
        $dummy_attr_value = 'N/A';

        foreach ($products as &$product) {
            $product['is_available'] = $this->is_normal_product_available($product);

            // skip unavailable product - we delete it later
            if (! $product['is_available']) {
                continue;
            }

            $total_variations = count($product['variations']);
            $product['type']  = $total_variations > 1 ? 'variable' : 'simple';

            $product_attributes = &$product['attributes'];

            // remove unnecessary attributes from master
            foreach ($product_attributes as $attr_slug => &$attr) {
                $unique_values = array_values(array_unique($attr['options']));
                $is_redundant  = (count($attr['options']) === $total_variations) && count($unique_values) === 1;

                if ($is_redundant) {
                    unset($product_attributes[$attr_slug]);
                } else {
                    $attr['options'] = $unique_values;
                }
            }

            // make sure every variation has every attribute - fill in blanks with "N/A"
            $master_keys = array_keys($product_attributes);

            foreach ($product['variations'] as &$variation) {
                $variation['type']    = 'product_variation';
                $variation_attributes = &$variation['attributes'];

                // populate variation with missing master attributes
                foreach ($master_keys as $key) {
                    if (! isset($variation_attributes[$key])) {
                        $variation_attributes[$key] = $dummy_attr_value;
                        if (! in_array($dummy_attr_value, $product_attributes[$key]['options'])) {
                            $product_attributes[$key]['options'][] = $dummy_attr_value;
                        }
                    }
                }

                // delete unnecessary variation attributes
                $variation_attributes = array_intersect_key($variation_attributes, array_flip($master_keys));
            }
        }

        // check variation for facet uniqueness
        // if they are not distinct, use sku as an attribute for force variation selection to work
        $variation_slugs = [];

        foreach ($products as &$product) {
            // skip unavailable product - we delete it later
            if (! $product['is_available']) {
                continue;
            }
            foreach ($product['variations'] as &$variation) {
                // get slug to verify uniqueness of each varition combo
                ksort($variation['attributes']);
                $variation_slugs[] = json_encode($variation['attributes']);
            }
            // variation have duplicate attribution - use SKU as an attribute
            if (count(array_unique($variation_slugs)) < count($variation_slugs)) {
                $master_sku_options = [];
                foreach ($product['variations'] as &$variation) {
                    if (! empty($variation['meta']['_ci_product_sku'])) {
                        $variation['attributes']['sku'] = sanitize_title($variation['meta']['_ci_product_sku']);
                        $master_sku_options[]           = $variation['meta']['_ci_product_sku'];
                    }
                }
                $product['attributes']['sku'] = ['name' => 'SKU', 'options' => $master_sku_options];
                unset($master_sku_options);
            }
        }

        return $products;
    }

    public function custom_normalize_products(&$products, &$meta)
    {
        /** @var Supplier_WPS $this */

        foreach ($products as &$output) {
            // WPS owes us an explanation for this.
            // They periodically have duplicate items under a product. Seriously, this should not be my problem.
            // $output['variations'] = $this->remove_duplicate_wps_items($output['variations']);

            $variation_ids = [];
            foreach ($output['variations'] as &$variation) {
                $variation_ids[] = $variation['id'];
            }
            $unique_variation_ids = array_unique($variation_ids);
            if (count($variation_ids) > count($unique_variation_ids)) {
                $dif = array_diff($unique_variation_ids, $variation_ids);
                $this->log('Error: ' . __FUNCTION__ . ' Why would this happen?? ' . json_encode(['dif' => $dif]));
            }
        }
        $attributes_keys = [];

        foreach ($products as $output) {
            // gather attributes from variations
            $attributes_keys = array_merge($attributes_keys, array_keys($output['attributes']));
        }

        $attributes_keys         = array_unique($attributes_keys);
        $meta['attributes_keys'] = $attributes_keys;
        $lookup_attributes_keys  = array_values(array_unique(array_filter($attributes_keys, fn($a) => $a !== 'sku')));
        $supplier_attributes     = $this->get_attributekeys($lookup_attributes_keys);

        if (isset($supplier_attributes['error'])) {
            $supplier_attributes = [];
        }
        // "type" is a reserved word
        foreach ($supplier_attributes['data'] as &$attr) {
            if (strcasecmp('type', $attr['name']) === 0) {
                $attr['name'] = 'Item Type';
            }
        }

        $supplier_attributes_data = isset($supplier_attributes['data']) ? $supplier_attributes['data'] : [];
        $supplier_attributes      = array_map(fn($a) => [ ...$a, 'slug' => $this->sanitize_attribute($a['name'])], $supplier_attributes_data);
        $lookup_attribute         = array_column($supplier_attributes, null, 'id');
        $lookup_brands            = $this->get_brands_lookup();

        foreach ($products as &$output) {
            $output['$lookup_attribute'] = $lookup_attribute;
            $master_attributes           = [];
            // for WPS, the attribute key id the supplier's ID for that attribute
            // it gets replaced by the generated slug
            foreach ($output['attributes'] as $attr_id => &$attr) {
                // validate attribute
                // Not in love with this but we need to protect the sku attribute
                if ($attr_id === 'sku') {
                    $master_attributes[$attr_id] = $attr;
                } else if (isset($lookup_attribute[$attr_id])) {
                    $supplier_attr            = $lookup_attribute[$attr_id];
                    $slug                     = $supplier_attr['slug'];
                    $attr['name']             = $supplier_attr['name'];
                    $attr['slug']             = $slug;
                    $master_attributes[$slug] = $output['attributes'][$attr_id];
                } else {
                    if (is_numeric($attr_id)) {
                        $this->log(json_encode(['product' => $output['id'], '$supplier_attributes' => $supplier_attributes, '$attr_id' => $attr_id, '$attr' => $attr], JSON_PRETTY_PRINT));
                    }
                    $master_attributes[$attr_id]          = $attr;
                    $master_attributes[$attr_id]['ALERT'] = 'not found';
                }
            }
            $output['attributes'] = $master_attributes;
            //
            if (isset($output['attributes']['pa_sku'])) {
                unset($output['attributes']['pa_sku']);
            }
            $master_attribute_keys = array_keys($output['attributes']);

            foreach ($output['variations'] as &$variation) {
                $variation_attr = [];
                foreach ($variation['attributes'] as $key => &$val) {
                    if (isset($lookup_attribute[$key]['slug'])) {
                        $slug = $lookup_attribute[$key]['slug'];
                        if (in_array($slug, $master_attribute_keys)) {
                            $variation_attr[$slug] = $val;
                        }
                    } else {
                        $variation_attr[$key] = $val;
                    }
                }
                $variation['attributes'] = $variation_attr;

                // should be array of ids - need brand names
                if ($variation['brand'] && is_numeric($variation['brand']) && isset($lookup_brands[$variation['brand']])) {
                    $variation['brand'] = $lookup_brands[$variation['brand']];
                }
            }
        }

        return $products;
    }

    public function remove_unavailable_products(&$products, &$meta)
    {
        $meta['invalid'] = 0;
        foreach ($products as $i => $product) {
            if (! $product['is_available']) {
                $meta['invalid']++;
                unset($products[$i]);
            }
        }
        return $products;
    }

    public function delete_normalize_products(&$products, &$meta)
    {
        // delete unavailable products
        $meta['invalid']    = 0;
        $meta['outofstock'] = 0;

        foreach ($products as $i => $product) {
            if (! $product['is_available']) {
                $woo_id = wc_get_product_id_by_sku($product['sku']);
                if ($woo_id) {
                    $woo_product = wc_get_product($woo_id);
                    if ($woo_product) {
                        $woo_product->set_stock_status('outofstock');
                        $woo_product->save();
                    }
                    $meta['outofstock']++;
                } else {
                    $meta['invalid']++;
                }
                unset($products[$i]);
            }
        }
        return $products;
    }

    public function assign_normalize_products(&$products, &$meta, $save = true)
    {
        //
        // START bulk assignment of ids ------------------------>
        //
        // collect all skus
        $skus = [];
        foreach ($products as &$product) {
            $product['woo_id']           = 0;
            $product['needs_assignment'] = false;
            $skus[]                      = $product['sku'];
            if ($product['type'] === 'variable') {
                foreach ($product['variations'] as &$variation) {
                    $variation['woo_id'] = 0;
                    $skus[]              = $variation['sku'];
                }
            }
        }

        // quick lookup of skus
        $sku_lookup = WooTools\get_product_info_by_skus($skus);
        // $meta['sku_lookup'] = $sku_lookup;

        foreach ($products as &$product) {
            $orphan_variations           = [];
            $product['total_variations'] = count($product['variations']);

            if (isset($sku_lookup[$product['sku']])) {
                $product['woo_id'] = $sku_lookup[$product['sku']]['post_id'];
            } else {
                $product['needs_assignment'] = true;
            }

            foreach ($product['variations'] as &$variation) {
                if (isset($sku_lookup[$variation['sku']])) {
                    $post = $sku_lookup[$variation['sku']];
                    if ($post['post_parent'] == $product['woo_id']) {
                        $variation['woo_id'] = $post['post_id'];
                    } else {
                        $orphan_variations[]         = $post['post_id'];
                        $product['needs_assignment'] = true;
                    }
                } else {
                    $product['needs_assignment'] = true;
                }
            }
        }
        //
        // END bulk assignment of ids ------------------------>
        //

        foreach ($products as &$product) {
            // $master_created     = '';
            $variations_created = [];
            if (! $product['needs_assignment']) {

                continue;
            }
            $woo_id = wc_get_product_id_by_sku($product['sku']);

            if ($product['type'] === 'variable') {
                $woo_product = new WC_Product_Variable($woo_id);
            } else {
                $woo_product = new WC_Product_Simple($woo_id);
            }

            if (! $woo_id) {
                // $master_created = $product['sku'];
                $woo_product->set_name($product['name']);
                $woo_product->update_meta_data('_ci_supplier_key', $this->key);
                $woo_product->set_sku($product['sku']);
                if ($save) {
                    $woo_id = $woo_product->save();
                }
            }

            $product['woo_id'] = $woo_id;
            $children          = [];

            foreach ($product['variations'] as &$variation) {
                if ($product['type'] === 'variable') {
                    $variation_woo_id = wc_get_product_id_by_sku($variation['sku']);
                    $woo_variation    = new WC_Product_Variation($variation_woo_id);

                    if (! $variation_woo_id) {
                        // create variation
                        $variations_created[] = $variation['sku'];
                        $woo_variation->update_meta_data('_ci_supplier_key', $this->key);
                        $woo_variation->set_sku($variation['sku']);
                        $woo_variation->set_parent_id($woo_id);
                        if ($save) {
                            $variation_woo_id = $woo_variation->save();
                        }
                    } else {
                        // assign to parent
                        $parent_id = $woo_variation->get_parent_id();
                        if ($parent_id !== $woo_id) {
                            if ($save) {
                                $woo_variation->save();
                            }
                        }
                    }
                    $children[]          = $variation_woo_id;
                    $variation['woo_id'] = $variation_woo_id;
                } else {
                    $variation['woo_id'] = $woo_id;
                }
            }

            if ($product['type'] === 'variable') {
                $woo_product->set_children($children);
                if ($save) {
                    $woo_product->save();
                }
            }
        }
        return $products;
    }

    public function assign_product_images(&$products, &$meta)
    {
        $images = [];

        foreach ($products as $output) {
            foreach ($output['variations'] as $variation) {
                foreach ($variation['images'] as $image) {
                    $images[$image['file']] = $image;
                }
            }
        }

        $lookup_attachment = WooTools::attachment_data_to_postids($images);
        unset($images);

        foreach ($products as &$product) {
            $product['image_ids'] = [];
            foreach ($product['variations'] as &$variation) {
                $variation['image_ids'] = [];
                foreach ($variation['images'] as $image) {
                    if (isset($lookup_attachment[$image['file']])) {
                        $variation['image_ids'][] = $lookup_attachment[$image['file']];
                        $product['image_ids'][]   = $lookup_attachment[$image['file']];
                    }
                }
            }
        }
        unset($lookup_attachment);

        return $products;
    }

    public function categorize_normalize_products(&$products, &$meta)
    {
        /** @var Supplier_WPS $this */
        // WPS category data is separate from the product object
        // we need to combine this data so we can handle this better
        $supplier_categories  = $this->import_taxonomy();
        $lookup_category_slug = [];
        // chatgpt - more efficient to do this
        foreach ($supplier_categories as $c) {
            $lookup_category_slug[$c['id']] = [
                'name'   => $c['name'],
                'slug'   => $c['slug'],
                'woo_id' => $c['woo_id'],
            ];
        }
        unset($supplier_categories);
        $categories = [];
        // $brands     = [];

        // each prodouct/variation category is either the taxonomy id from the supplier or a name - both need to be resolved
        foreach ($products as &$product) {
            // merge categories
            foreach ($product['categories'] as &$category) {
                if (isset($category['taxonomyterm_id'])) {
                    if (isset($lookup_category_slug[$category['taxonomyterm_id']])) {
                        // matching supplier taxonomy
                        $category                      = $lookup_category_slug[$category['taxonomyterm_id']];
                        $categories[$category['slug']] = $category;
                    } else {
                        $new_cat = $this->get_wps_category($category['taxonomyterm_id']);
                        if ($new_cat) {
                            $category                     = $new_cat;
                            $categories[$new_cat['slug']] = $new_cat;
                        } else {
                            $this->log('WPS cat not found - error');
                        }
                    }
                } else if (isset($category['name'])) {
                    $categories[$category['name']] = $category;
                }
            }

            foreach ($product['variations'] as &$variation) {
                foreach ($variation['categories'] as &$category) {
                    if (isset($category['taxonomyterm_id'])) {
                        if (isset($lookup_category_slug[$category['taxonomyterm_id']])) {
                            // matching supplier taxonomy
                            $category                      = $lookup_category_slug[$category['taxonomyterm_id']];
                            $categories[$category['slug']] = $category;
                        } else {
                            $new_cat = $this->get_wps_category($category['taxonomyterm_id']);
                            if ($new_cat) {
                                $category                     = $new_cat;
                                $categories[$new_cat['slug']] = $new_cat;
                            } else {
                                $this->log('WPS cat not found - error');
                            }
                        }
                    } else if (isset($category['name'])) {
                        $categories[$category['name']] = $category;
                    }

                    // if (! empty($variation['brand'])) {
                    //     $brands[] = $variation['brand'];
                    // }
                }
            }
        }

        // $brands              = array_values(array_unique($brands));
        // $brand_terms         = \WooTools\upsert_brands($brands);
        // $lookup_brand        = array_column($brand_terms, 'term_id', 'name');
        // $meta['brand_terms'] = $brand_terms;

        // gather new categories
        $new_categories       = array_values(array_filter($categories, fn($c) => ! isset($c['woo_id']) || ! $c['woo_id']));
        $new_categories_names = array_map(fn($c) => $c['name'], $new_categories);

        // create new categories
        $lookup_category = WooTools\upsert_categories($new_categories_names);
        // $product_categories = [];

        // return $products;

        // assign wp category id to products and build master list of product/category mapping for bulk import
        foreach ($products as &$product) {
            $product['category_ids'] = [];
            // $product['brands']       = [];

            foreach ($product['categories'] as &$category) {
                if (! isset($category['woo_id'])) {
                    if (isset($category['name']) && isset($lookup_category[$category['name']])) {
                        $category['woo_id'] = $lookup_category[$category['name']];
                    } else {
                        $this->log('Error: Category not found. ' . json_encode($category));
                    }
                }
                // if (! isset($category['woo_id']) && isset($category['name']) && isset($lookup_category[$category['name']])) {
                //     $category['woo_id'] = $lookup_category[$category['name']];
                // }
                if (isset($category['woo_id']) && ! in_array($category['woo_id'], $product['category_ids'])) {
                    $product['category_ids'][] = $category['woo_id'];
                }
            }
            // $product_categories[$product['woo_id']] = $product['category_ids'];

            foreach ($product['variations'] as &$variation) {
                $variation['category_ids'] = [];

                foreach ($variation['categories'] as &$category) {
                    if (! isset($category['woo_id'])) {
                        if (isset($category['name']) && isset($lookup_category[$category['name']])) {
                            $category['woo_id'] = $lookup_category[$category['name']];
                        } else {
                            $this->log('Error: Category not found. ' . json_encode($category));
                        }
                    }
                    // if (! isset($category['woo_id']) && isset($lookup_category[$category['name']])) {
                    //     $category['woo_id'] = $lookup_category[$category['name']];
                    // }
                    if (isset($category['woo_id']) && ! in_array($category['woo_id'], $variation['category_ids'])) {
                        $variation['category_ids'][] = $category['woo_id'];
                    }
                }

                // if (! empty($variation['brand'])) {
                //     $product['brands'][] = $variation['brand'];
                // }
                // if (! empty($variation['brand']) && isset($lookup_brand[$variation['brand']])) {
                // $variation['category_ids'][] = $lookup_brand[$variation['brand']];
                // $variation['brand_ids'][] = $lookup_brand[$variation['brand']];
                // }

                // $product_categories[$variation['woo_id']] = $variation['category_ids'];
            }
        }
        // return $products;

        // bulk import product/category mapping
        // $save = false;

        // if ($save) {
        //     \WooTools\assign_product_categories($product_categories, false);
        // } else {
        //     $meta['product_categories'] = $product_categories;
        // }

        // foreach ($products as &$product) {
        //     $woo = wc_get_product($product['woo_id']);
        //     if ($woo) {
        //         $woo->set_category_ids($product['category_ids']);
        //         $product['WOO_CATEGORY_IDS'] = $woo->get_category_ids();
        //     }
        //     foreach ($product['variations'] as &$variation) {
        //         $woo = wc_get_product($variation['woo_id']);
        //         if ($woo) {
        //             $woo->set_category_ids($variation['category_ids']);
        //             $variation['WOO_CATEGORY_IDS'] = $woo->get_category_ids();
        //         }
        //     }
        // }

        return $products;

        // $categories         = array_values(array_unique($categories));
        // $meta['categories'] = $categories;
        // $lookup_category    = WooTools\upsert_categories($categories);

        // ksort($lookup_category);
        // $meta['lookup_category'] = $lookup_category;
        // $product_categories      = [];

        // foreach ($products as &$product) {
        //     // master categories
        //     $product['category_ids'] = [];

        //     foreach ($product['categories'] as $category) {
        //         if (isset($lookup_category[$category])) {
        //             $product['category_ids'][] = $lookup_category[$category];
        //         } else {
        //             $meta['errors'][] = 'category not found ' . $category;
        //         }
        //     }
        //     $product_categories[$product['woo_id']] = $product['category_ids'];
        // }

        // return $product_categories;

        // \WooTools\assign_product_categories($product_categories);

        // return $products;
    }

    public function save_normalize_products(&$products, &$meta)
    {
        // gather bulk data
        $attributes           = [];
        $variation_attributes = [];
        $variation_ids        = [];
        $product_categories   = [];

        foreach ($products as &$output) {
            $output['brand_ids'] = [];

            if ($output['type'] === 'variable') {
                foreach ($output['attributes'] as $key => &$attribute) {
                    if (isset($attributes[$key])) {
                        // merge options
                        $attributes[$key]['options'] = array_merge($attributes[$key]['options'], $attribute['options']);
                    } else {
                        $attributes[$key] = $attribute;
                    }
                }
            }

            // if sku is active, gather variations to clean up old global sku format
            if (isset($output['attributes']['sku'])) {
                foreach ($output['variations'] as $variation) {
                    $variation_ids[] = $variation['woo_id'];

                    if (isset($variation['brand']) && ! empty($variation['brand'])) {
                        $output['brand_ids'][] = upsert_brand($variation['brand']);
                    }
                }
                $output['brand_ids'] = array_values(array_unique($output['brand_ids']));
            }
        }


        // save categories
        foreach ($products as $product) {
            $product_categories[$product['woo_id']] = $product['category_ids'];
            wp_set_post_terms($product['woo_id'], $product['category_ids'], 'product_cat');
            $saved = wp_set_post_terms($product['woo_id'], $product['brand_ids'], 'product_brand');
            if (is_wp_error($saved)) {
                $this->log(__FUNCTION__ . ' Error: ' . json_encode(['woo_id' => $product['woo_id'], 'brand_ids' => $product['brand_ids']]));
            }
            // $this->log(json_encode(['$saved' => $saved]));
            // foreach ($output['variations'] as $variation) {
            //     $product_categories[$variation['woo_id']] = $variation['category_ids'];
            // }
        }

        // \WooTools\assign_product_categories($product_categories, false);

        // remove the unnecessary global sku values
        $this->cleanup_sku_attribute($variation_ids);

        // remove duplicate attribute options, human sort
        foreach ($attributes as $key => &$attribute) {
            $attribute['options'] = array_unique($attribute['options']);
            natsort($attribute['options']);
            $attribute['options'] = array_values($attribute['options']);
        }

        // select/insert data
        $lookup_attribute = WooTools\upsert_attributes($attributes);
        // $lookup_attachment    = WooTools::attachment_data_to_postids($images);
        $variation_attributes = [];

        foreach ($lookup_attribute as $key => $val) {
            $lookup_attribute[$key] = array_column($val['terms'], 'slug', 'name');
        }

        // identify woo ids
        foreach ($products as &$output) {
            // $output['meta']['_product_attributes']  = [];
            $output['meta']['_supplier_class']      = $this->supplierClass;
            $output['meta']['_ci_supplier_key']     = $this->key;
            $output['meta']['_ci_import_version']   = CI_IMPORT_VERSION;
            $output['meta']['_ci_import_timestamp'] = gmdate("c");
            // $output['meta']['_ci_update_plp']       = gmdate("c");
            $output['meta']['_ci_update_pdp'] = gmdate("c");
            $output['attr']                   = [];

            if ($output['type'] === 'variable') {
                foreach ($output['attributes'] as $attr_key => $attr) {
                    $output['attr'][$attr_key] = $attr['options'];
                }
                WooTools\assign_multiple_global_attributes_to_product($output['woo_id'], $output['attr']);
            }

            // unset($output['meta']['_product_attributes']);

            if ($output['type'] === 'variable') {
                foreach ($output['variations'] as &$variation) {
                    if (! isset($variation['woo_id'])) {
                        $this->log('variation failed ' . json_encode($output, JSON_PRETTY_PRINT));
                    }
                    // attributes
                    foreach ($variation['attributes'] as $attr_key => $attr_value) {
                        $attr_name                     = $attr_key === 'sku' ? 'attribute_sku' : 'attribute_' . wc_attribute_taxonomy_name($attr_key);
                        $variation['meta'][$attr_name] = $lookup_attribute[$attr_key][$attr_value] ?? $attr_value;
                    }
                    $variation_attributes[$variation['woo_id']] = array_keys($variation['attributes']);
                    // $variation['image_ids']                     = array_map(fn($image) => $lookup_attachment[$image['file']], $variation['images']);
                    $variation['meta']['_supplier_class']  = $this->supplierClass;
                    $variation['meta']['_ci_supplier_key'] = $this->key;
                    // $variation['meta']['_ci_import_version']   = CI_IMPORT_VERSION;
                    // $variation['meta']['_ci_import_timestamp'] = gmdate("c");
                    // $variation['meta']['_ci_update_plp']       = gmdate("c");
                    $variation['meta']['_ci_update_pdp'] = gmdate("c");
                    // we need a unique identifier for the WPS item so we can efficiently attach vehicle data later
                    $variation['meta']['_ci_variation_id'] = $this->key . '_' . $variation['id'] . '_' . $variation['sku'];
                }
            }

            foreach ($output['variations'] as &$variation) {
                if (isset($variation['brand']['term_id'])) {
                    WooTools::assign_product_to_brand_category($output['woo_id'], $variation['brand']['name']);
                }
            }
        }

        \WooTools\clean_variation_attributes($variation_attributes);

        $metadata = [];

        foreach ($products as $output) {
            if ($output['type'] === 'variable') {
                foreach ($output['meta'] as $meta_key => $meta_value) {
                    $val        = is_array($meta_value) ? serialize($meta_value) : $meta_value;
                    $metadata[] = ['post_id' => $output['woo_id'], 'meta_key' => $meta_key, 'meta_value' => $val];
                }

                foreach ($output['variations'] as $variation) {
                    foreach ($variation['meta'] as $meta_key => $meta_value) {
                        $val        = is_array($meta_value) ? serialize($meta_value) : $meta_value;
                        $metadata[] = ['post_id' => $variation['woo_id'], 'meta_key' => $meta_key, 'meta_value' => $val];
                    }
                }
            } else {
                $m = array_merge($output['meta'], $output['variations'][0]['meta']);
                foreach ($m as $meta_key => $meta_value) {
                    $val        = is_array($meta_value) ? serialize($meta_value) : $meta_value;
                    $metadata[] = ['post_id' => $output['woo_id'], 'meta_key' => $meta_key, 'meta_value' => $val];
                }
            }
        }

        WooTools::insert_unique_metas($metadata);

        $saved = 0;

        foreach ($products as &$output) {
            $woo_id = $output['woo_id'];

            if ($output['type'] === 'simple') {
                $woo_product = new WC_Product_Simple($woo_id);
                $woo_product->set_name($output['name']);
                $woo_product->set_slug(sanitize_title($this->key . '-' . $output['id'] . '-' . $output['name']));
                $woo_product->set_description($output['description']);
                $woo_product->set_short_description($output['short_description']);
                $image_ids = $output['variations'][0]['image_ids']; //array_map(fn($image) => $lookup_attachment[$image['file']], $output['variations'][0]['images']);
                $woo_product->set_image_id(isset($image_ids[0]) ? $image_ids[0] : 0);
                $woo_product->set_gallery_image_ids(array_slice($image_ids, 1));
                $woo_product->set_regular_price($output['variations'][0]['price']);
                $woo_product->save();
            }

            if ($output['type'] === 'variable') {
                $woo_product = new WC_Product_Variable($woo_id);
                $children    = [];

                foreach ($output['variations'] as &$variation) {
                    $children[]    = $variation['woo_id'];
                    $woo_variation = new WC_Product_Variation($variation['woo_id']);
                    $woo_variation->set_image_id(isset($variation['image_ids'][0]) ? $variation['image_ids'][0] : 0);
                    $woo_variation->set_gallery_image_ids($variation['image_ids']);
                    $woo_variation->set_regular_price($variation['price']);
                    $woo_variation->set_name($variation['name']);
                    $woo_variation->save();
                    $saved++;
                }

                $woo_product->set_name($output['name']);
                $woo_product->set_slug(sanitize_title($this->key . '-' . $output['id'] . '-' . $output['name']));
                $woo_product->set_description($output['description']);
                $woo_product->set_short_description($output['short_description']);
                $woo_product->set_image_id(isset($output['image_ids'][0]) ? $output['image_ids'][0] : 0);
                $woo_product->save();
                $saved++;
            }
        }

        foreach ($products as $product) {
            $children = [];
            foreach ($output['variations'] as $variation) {
                $children[] = $variation['woo_id'];
            }
            $this->bulk_update_children($product['woo_id'], $children);
        }

        return $products;
    }

    public function save_product_plp(&$products, &$meta)
    {
        //
        // PLP ONLY!!!
        //
        foreach ($products as &$output) {
            $woo_id = $output['woo_id'];

            if ($output['type'] === 'simple') {
                $woo_product = new WC_Product_Simple($woo_id);
                $woo_product->set_name($output['name']);
                $woo_product->set_slug(sanitize_title($this->key . '-' . $output['id'] . '-' . $output['name']));
                // $woo_product->set_description($output['description']);
                $woo_product->set_short_description($output['short_description']);
                // $image_ids = array_map(fn($image) => $lookup_attachment[$image['file']], $output['variations'][0]['images']);
                $woo_product->set_image_id(isset($output['image_ids'][0]) ? $output['image_ids'][0] : 0);
                // $woo_product->set_gallery_image_ids(array_slice($image_ids, 1));
                $woo_product->set_regular_price($output['variations'][0]['price']);
                $woo_product->save();
            }

            if ($output['type'] === 'variable') {
                $woo_product = new WC_Product_Variable($woo_id);
                $images      = [];
                // WooTools::unlink_children($woo_id);

                foreach ($output['variations'] as &$variation) {
                    // $children[]    = $variation['woo_id'];
                    $woo_variation = new WC_Product_Variation($variation['woo_id']);

                    if (count($variation['image_ids'])) {
                        $images = array_merge($images, $variation['image_ids']);
                    }
                    $woo_variation->set_image_id(isset($variation['image_ids'][0]) ? $variation['image_ids'][0] : 0);
                    // $woo_variation->set_gallery_image_ids($variation['image_ids']);
                    $woo_variation->set_regular_price($variation['price']);
                    $woo_variation->set_name($variation['name']);
                    $woo_variation->save();
                }
                $woo_product->set_name($output['name']);
                $woo_product->set_slug(sanitize_title($this->key . '-' . $output['id'] . '-' . $output['name']));
                // $woo_product->set_description($output['description']);
                $woo_product->set_short_description($output['short_description']);
                $woo_product->set_image_id(isset($images[0]) ? $images[0] : 0);
                $woo_product->save();
            }
        }
    }

    public function bulk_update_children($parent_id, $variation_ids)
    {
        global $wpdb;
        // $parent_id = 5678; // New parent variable product ID
        // $variation_ids = [1234, 1235, 1236]; // Array of variation IDs to update
        $wpdb->query("
            UPDATE {$wpdb->posts}
            SET post_parent = $parent_id
            WHERE ID IN (" . implode(',', array_map('absint', $variation_ids)) . ")
            AND post_type = 'product_variation'
        ");
    }

    public function cleanup_sku_attribute($variation_ids, $batch_size = 100)
    {
        global $wpdb;

        if (empty($variation_ids) || ! is_array($variation_ids)) {
            return;
        }

        // Split variation IDs into smaller chunks
        $chunks = array_chunk($variation_ids, $batch_size);

        foreach ($chunks as $batch) {
            // Prepare placeholders for SQL query
            $placeholders = implode(',', array_fill(0, count($batch), '%d'));

            // Run the DELETE query in batches
            $sql = $wpdb->prepare(
                "DELETE FROM {$wpdb->postmeta} WHERE post_id IN ($placeholders) AND meta_key = 'attribute_pa_sku'",
                ...$batch
            );
            $wpdb->query($sql);
        }
    }

    /**
     * Get WooCommerce product IDs for an array of exact SKUs using `IN`.
     *
     * @param array $sku_list An array of full SKUs to search for.
     * @return array An array of matching products with product_id and sku.
     */
    public function get_products_by_sku(array $sku_list)
    {
        global $wpdb;

        if (empty($sku_list)) {
            return [];
        }

        // Create placeholders for each SKU in the array
        $placeholders = implode(',', array_fill(0, count($sku_list), '%s'));

        // Construct the SQL query using `IN`
        // Query all SKUs, including trashed products
        $query = $wpdb->prepare("
            SELECT p.ID AS product_id, pm.meta_value AS sku, p.post_status, p.post_type
            FROM {$wpdb->posts} p
            INNER JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id
            WHERE pm.meta_key = '_sku'
            AND pm.meta_value IN ($placeholders)
        ", $sku_list);
        // Execute the query
        $results = $wpdb->get_results($query, ARRAY_A);
        return $results ? $results : []; // Return empty array if no results
    }

    /**
     * Get WooCommerce product types for multiple product IDs.
     *
     * @param array $product_ids An array of WooCommerce product IDs.
     * @return array Associative array of product_id => product_type.
     */
    // public function get_woo_product_types(array $product_ids)
    // {
    //     global $wpdb;

    //     if (empty($product_ids)) {
    //         return [];
    //     }

    //     // Create placeholders for the SQL query
    //     $placeholders = implode(',', array_fill(0, count($product_ids), '%d'));

    //     // SQL Query to fetch product type
    //     $query = $wpdb->prepare("
    //         SELECT tr.object_id AS product_id, t.name AS product_type
    //         FROM {$wpdb->term_relationships} tr
    //         INNER JOIN {$wpdb->term_taxonomy} tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
    //         INNER JOIN {$wpdb->terms} t ON tt.term_id = t.term_id
    //         WHERE tt.taxonomy = 'product_type'
    //         AND tr.object_id IN ($placeholders)
    //     ", $product_ids);

    //     // Execute the query
    //     $results = $wpdb->get_results($query, OBJECT_K);

    //     // Convert results to an array of product_id => product_type
    //     $product_types = [];
    //     foreach ($results as $product_id => $row) {
    //         $product_types[$product_id] = $row->product_type;
    //     }

    //     return $product_types;
    // }

    // private function remove_duplicate_wps_items($items)
    // {
    //     $seen_ids        = []; // Stores unique product IDs
    //     $unique_products = []; // Stores filtered product list

    //     foreach ($items as $product) {
    //         $product_id = $product['id'];

    //         // Check if this ID has already been seen
    //         if (! isset($seen_ids[$product_id])) {
    //             $seen_ids[$product_id] = true;     // Mark ID as seen
    //             $unique_products[]     = $product; // Keep only the first occurrence
    //         }
    //     }

    //     return $unique_products;
    // }
}
