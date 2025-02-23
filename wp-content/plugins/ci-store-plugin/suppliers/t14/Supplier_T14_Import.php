<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Timer.php';
/**
 * @method void Supplier_T14()
 */
trait Supplier_T14_Import
{
    /*
    product id = generated by woo, linked on product slug
    variation name = part_description
    variation sku = use id
    mfr_part_number - variation sku
    Yo may think that the price_group logincally groups the variations - nope

    $woo_product->set_weight($variation['weight']);
    $woo_product->set_length($variation['length']);
    $woo_product->set_width($variation['width']);
    $woo_product->set_height($variation['height']);
    */

    public function get_mem()
    {
        $memoryUsage   = memory_get_usage();           // Memory usage in bytes
        $memoryUsageMB = $memoryUsage / (1024 * 1024); // Convert to MB
        return number_format($memoryUsageMB, 2) . " MB";
    }

    public function import_brand($brand_id, $offset = 0, $limit = -1)
    {
        $mem_check = false;
        $this->log('START', __FUNCTION__, ['brand_id' => $brand_id, 'offset' => $offset, 'limit' => $limit]);

        /** @var Supplier_T14 $this */
        $response = [
            'brand_id' => $brand_id,
            'total'    => 0,
            'offset'   => $offset,
            'limit'    => $limit,
            'complete' => true,
            'error'    => false,
        ];
        // validate brand_id
        if (! $brand_id) {
            $response['error'] = 'brand_id not set';
            return $response;
        }
        // validate brand exists
        $brand = $this->get_api("/brands/{$brand_id}");
        if (! isset($brand['data']['attributes']['name'])) {
            $response['error'] = 'brand not found';
            return $response;
        }
        $brand_name             = $brand['data']['attributes']['name'];
        $response['brand_name'] = $brand_name;

        $brands       = $this->prepare_brands();
        $lookup_brand = array_column($brands, null, 'brand_id');

        if (! isset($lookup_brand[$brand_id])) {
            $this->log(__FUNCTION__, 'Brand not found', $brand_id);
            return $response;
        }
        //
        // Begin import
        //
        $timer = new Timer();
        if ($mem_check) {
            $this->log('START', ['memory' => $this->get_mem()]);
        }

        $grouped          = [];
        $empty_product_id = '000';
        $total_items      = 0;

        // get base products and combone into variable prodcuts
        $this->get_all_pages("/items/brand/{$brand_id}", function ($data) use (&$grouped, $empty_product_id, &$total_items, &$brand_name) {
            // get total items for progress count in result
            $total_items += count($data);

            foreach ($data as $item) {
                $name = $item['attributes']['product_name'];

                if ($name === 'BKM Hand Tools') {
                    $name = $brand_name . ': ' . $item['attributes']['part_description'];
                }

                $cat      = $item['attributes']['category'];
                $subcat   = $item['attributes']['subcategory'];
                $brand_id = $item['attributes']['brand_id'];
                // variable products are grouped by name. Brand added for safety
                $slug = sanitize_title($brand_id . ' ' . $name);
                $meta = [];
                $sku  = $this->get_variation_sku($empty_product_id, $item['id']);

                if (! isset($grouped[$slug])) {
                    $grouped[$slug] = [
                        'woo_id'      => 0,
                        'type'        => 'simple',
                        'id'          => '',
                        'slug'        => $slug,
                        'name'        => $name,
                        'description' => '',
                        'brand_id'    => $brand_id,
                        'terms'       => [],
                        'variations'  => [],
                        'meta'        => [],
                    ];
                }

                // variation meta
                // $meta['_sku']                   = $sku;
                $meta['_supplier_class']        = $this->supplierClass;
                $meta['_ci_product_id']         = $item['id'];
                $meta['_ci_supplier_key']       = $this->key;
                $meta['_ci_import_version']     = $this->import_version;
                $meta['_variation_description'] = $item['attributes']['part_description'];
                $dimension                      = $item['attributes']['dimensions'][0] ?? [];
                $meta['_weight']                = isset($dimension['weight']) ? $dimension['weight'] : '';
                $meta['_length']                = isset($dimension['length']) ? $dimension['length'] : '';
                $meta['_width']                 = isset($dimension['width']) ? $dimension['width'] : '';
                $meta['_height']                = isset($dimension['height']) ? $dimension['height'] : '';
                $meta['_stock_status']          = 'instock';

                $grouped[$slug]['variations'][] = [
                    'price_group' => $item['attributes']['price_group_id'].':'.$item['attributes']['price_group'],
                    'woo_id'      => 0,
                    'id'          => $item['id'],
                    'sku'         => $sku,
                    'name'        => $item['attributes']['part_description'],
                    'description' => '',
                    'images'      => [],
                    'price'       => 0,
                    'meta'        => $meta,
                ];

                if (count($grouped[$slug]['variations']) > 1) {
                    $grouped[$slug]['type'] = 'variable';
                }

                if (! in_array($cat, $grouped[$slug]['terms'])) {
                    $grouped[$slug]['terms'][] = $cat;
                }
                if (! in_array($subcat, $grouped[$slug]['terms'])) {
                    $grouped[$slug]['terms'][] = $subcat;
                }
            }
            unset($item);
            unset($name);
            unset($cat);
            unset($subcat);
            unset($brand_id);
            unset($dimension);
            unset($slug);
            unset($meta);
            unset($sku);
        });

        $grouped           = array_values($grouped);
        $page_size         = $total_items; // if no limit is set
        $response['total'] = $total_items;
        $total_groups      = count($grouped);

        return $grouped;

        if ($offset >= $total_groups) {
            $this->log(__FUNCTION__, 'ERROR', 'offset out of range');
            $response['complete'] = true;
            return $response;
        }
        // paginate process - we need all the data to build the variable products so pagination is virtual
        if ($limit > 0 && $offset < $total_groups - 1) {
            $grouped               = array_slice($grouped, $offset, $limit);
            $page_size             = array_reduce($grouped, fn($s, $g) => $s + count($g['variations']), 0);
            $response['page_size'] = $page_size;
        }

        $response['complete'] = ($offset + $limit) > $total_groups;

        global $wpdb;

        // get variation woo_ids from sku
        $lookup_variation_id_by_sku       = [];
        $lookup_master_id_by_variation_id = [];

        $skus = array_reduce($grouped, fn($sum, $p) => [ ...$sum, ...array_map(fn($v) => $v['sku'], $p['variations'])], []);
        if (count($skus)) {
            $placeholders               = implode(',', array_fill(0, count($skus), '%s'));
            $sql                        = $wpdb->prepare("SELECT meta_value AS sku, post_id AS variation_id FROM {$wpdb->prefix}postmeta WHERE meta_key = '_sku' AND meta_value IN ($placeholders)", ...$skus);
            $results                    = $wpdb->get_results($sql, ARRAY_A);
            $lookup_variation_id_by_sku = array_column($results, 'variation_id', 'sku');
        }

        // get master woo_ids from children ids
        $post_ids = array_column($results, 'variation_id');
        if (count($post_ids)) {
            $placeholders                     = implode(',', array_fill(0, count($post_ids), '%s'));
            $sql                              = $wpdb->prepare("SELECT post_parent, ID FROM {$wpdb->posts} WHERE ID IN ($placeholders)", ...$post_ids);
            $results                          = $wpdb->get_results($sql, ARRAY_A);
            $lookup_master_id_by_variation_id = array_column($results, 'post_parent', 'ID');
        }

        // populate data with exisitng ids
        foreach ($grouped as $group_index => &$product) {
            foreach ($product['variations'] as &$variation) {
                if (isset($lookup_variation_id_by_sku[$variation['sku']])) {
                    $variation['woo_id'] = $lookup_variation_id_by_sku[$variation['sku']];
                }
                if (isset($lookup_master_id_by_variation_id[$variation['woo_id']])) {
                    $product['woo_id'] = $lookup_master_id_by_variation_id[$variation['woo_id']];
                }
            }
        }
        // return $grouped; //////////////////

        unset($placeholders);
        unset($sql);
        unset($results);
        unset($lookup_variation_id_by_sku);
        unset($lookup_master_id_by_variation_id);

        if ($mem_check) {
            $this->log('items', ['time' => $timer->lap(), 'memory' => $this->get_mem()]);
        }

        // get prices
        $this->get_all_pages("/pricing/brand/{$brand_id}", function ($data) use (&$grouped) {
            $lookup_price = array_column($data, null, 'id');
            foreach ($grouped as &$product) {
                foreach ($product['variations'] as &$variation) {
                    if (isset($lookup_price[$variation['id']])) {
                        $variation['price'] = $this->extract_price($lookup_price[$variation['id']]);
                    } else {
                        // $this->log('Error: No price for ' . $variation['id']);
                    }
                }
            }
            unset($lookup_price);
            unset($product);
            unset($variation);
        });

        if ($mem_check) {
            $this->log('price', ['time' => $timer->lap(), 'memory' => $this->get_mem()]);
        }

        // images
        $images             = [];
        $image_urls         = [];
        $image_lookup       = [];
        $description_lookup = [];

        // The "items/data" has images and description
        // TODO: this could run after the products and variations are saved? Maybe it would save memory.

        $this->get_all_pages("/items/data/brand/{$brand_id}", function ($data) use (&$images, &$image_urls, &$image_lookup, &$description_lookup) {
            foreach ($data as $items_data) {
                $image_lookup[] = $items_data;
                // get description
                if (isset($items_data['descriptions']) && is_countable($items_data['descriptions'])) {
                    $description_lookup[$items_data['id']] = implode('', array_map(fn($d) => isset($d['description']) ? ('<li>' . esc_html($d['description']) . '<li>') : '', $items_data['descriptions']));
                }
                // get images
                if (isset($items_data['files']) && is_countable($items_data['files'])) {
                    $files = $items_data['files'];
                    foreach ($files as $file) {
                        if ($file['type'] === 'Image') {
                            $id = $items_data['id'];
                            if (! isset($images[$id])) {
                                $images[$id] = [];
                            }
                            $image_urls[]  = $file['links'][0]['url'];
                            $images[$id][] = $file['links'][0]['url'];
                        }
                    }
                }
            }
            unset($items_data);
            unset($files);
            unset($file);
            unset($id);
        });

        // populate descriptions
        foreach ($grouped as &$product) {
            foreach ($product['variations'] as &$variation) {
                if (isset($description_lookup[$variation['id']])) {
                    $variation['description'] = $description_lookup[$variation['id']];
                }
            }
        }

        unset($description_lookup);

        $lookup_image_url = WooTools::attachment_urls_to_postids($image_urls);

        unset($image_urls);
        if ($mem_check) {
            $this->log('images', ['time' => $timer->lap(), 'memory' => $this->get_mem()]);
        }

        // link attachment ids to variation data
        foreach ($grouped as &$product) {
            foreach ($product['variations'] as &$variation) {
                if (isset($images[$variation['id']])) {
                    $variation['images'] = array_map(fn($i) => $lookup_image_url[$i] ?? '', $images[$variation['id']]);
                }
            }
        }
        unset($lookup_image_url);
        unset($images);

        // return $grouped;

        // commit data
        // With Turn14, we are constructing the variable products by merging items on a slug made from brand_id + product_name.
        // The variations do have predictable SKUs
        // We can lookup the woo_id by first finding a variation and getting the parent OR by finding the slug.
        // The slug might change if the product name changes

        foreach ($grouped as $group_index => &$product) {
            $this->log('--------- count vars=' . count($product['variations']));
            try {
                //
                // Simple Product
                //
                if (count($product['variations']) === 1) {

                    $variation   = $product['variations'][0];
                    $woo_product = wc_get_product($variation['woo_id']);

                    if ($woo_product && $woo_product->get_type() !== 'simple') {
                        $report = WooTools::delete_products([$variation['woo_id']]);
                        $this->log(json_encode($report, JSON_PRETTY_PRINT));
                    }

                    if (! $woo_product) {
                        $woo_product = new WC_Product_Simple();
                        try {
                            $woo_product->set_sku($variation['sku']);
                        } catch (Exception $e) {
                            WooTools::log_exception($e, $this, $variation);
                            // sku fails if product exists
                            // $this->log('ERROR: SKU ' . $variation['sku'] . ' exists');
                            continue;
                        }
                    }
                    $woo_product->update_meta_data('_supplier_class', $this->supplierClass);
                    $woo_product->update_meta_data('_ci_product_id', $product['id']);
                    $woo_product->update_meta_data('_ci_supplier_key', $this->key);
                    $woo_product->update_meta_data('_ci_import_version', $this->import_version);
                    $woo_product->update_meta_data('_ci_import_timestamp', gmdate("c"));
                    // $woo_product->update_meta_data('_ci_update_plp', gmdate("c"));
                    $woo_product->update_meta_data('_ci_update_pdp', gmdate("c"));
                    $woo_product->set_stock_status('instock');
                    $woo_product->set_name($variation['name']);
                    // $woo_product->set_description($variation['meta']['_variation_description']);
                    $woo_product->set_description($variation['description']);
                    $woo_product->set_short_description($variation['meta']['_variation_description']);
                    $woo_product->set_image_id(isset($variation['images'][0]) ? $variation['images'][0] : 0);
                    $woo_product->set_gallery_image_ids(implode(',', array_slice($variation['images'], 1)));
                    $woo_product->set_regular_price($variation['price']);
                    $woo_product->set_weight($variation['meta']['_weight']);
                    $woo_product->set_length($variation['meta']['_length']);
                    $woo_product->set_width($variation['meta']['_width']);
                    $woo_product->set_height($variation['meta']['_height']);

                    // $brands_cat = wp_insert_term('Brands', 'product_cat', ['slug' => 'brands']);

                    // $category_ids   = [];
                    // $term_name      = $variation['product_type'] ?? '';
                    // $category_ids[] = $lookup_terms[$term_name] ?? 0;
                    // foreach ($variation['taxonomyterms']['data'] as $taxonomy_term) {
                    //     $term_name      = $taxonomy_term['name'] ?? '';
                    //     $category_ids[] = $lookup_terms[$term_name] ?? 0;
                    // }
                    // $product['category_ids'] = $category_ids;

                    $category_ids   = [];
                    $category_ids[] = $lookup_brand[$product['brand_id']]['id'];
                    $woo_product->set_category_ids($category_ids);

                    $variation['woo_id'] = $woo_product->save();

                    if ($mem_check) {
                        $this->log('saved', ['time' => $timer->lap(), 'memory' => $this->get_mem()]);
                    }

                    $this->log('saved ' . json_encode(['woo_id' => $variation['woo_id'], 'type' => $woo_product->get_type(), 'progress' => ($group_index + 1) . '|' . count($grouped)]));
                }
                //
                // Variable Product
                //
                if (count($product['variations']) > 1) {
                    foreach ($product['variations'] as &$variation) {
                        // $this->log(json_encode(['sku' => $variation['sku'], 'vid' => $variation['woo_id']]));
                        if ($variation['id'] == 677950) {
                            $this->log('Adding the special ID', $variation);
                        }
                        try {
                            $woo_variation = new WC_Product_Variation($variation['woo_id']);
                        } catch (Exception $e) {
                            // this happens if the woo object is not post_type="product_variation"
                            $this->log('HEY!!!!!   ---- ---!!!!ERROR: WC_Product_Variation init failed - DOES THIS EVER HAPPEN????', $variation);
                            WooTools::log_exception($e, $this, $product);
                            break;
                        }

                        try {
                            $woo_variation->set_sku($variation['sku']);
                        } catch (Exception $e) {
                            $response['error'] = 'sku issue';
                            $dupe_id           = wc_get_product_id_by_sku($variation['sku']);
                            if ($dupe_id) {
                                $this->log('!!!!ERROR: variation not initially found', $variation);
                                $woo_variation = new WC_Product_Variation($dupe_id);
                                $this->log('FOUND name:', ['$dupe_id' => $dupe_id, 'name' => $woo_variation->get_name()]);
                                break;
                            } else {
                                WooTools::log_exception($e, $this, ['$dupe_id' => $dupe_id, 'variation' => $variation]);
                                throw new ErrorException('set_sku failed');
                                break;
                            }
                        }

                        $woo_variation->update_meta_data('_supplier_class', $this->supplierClass);
                        $woo_variation->update_meta_data('_ci_product_id', $variation['id']);
                        $woo_variation->update_meta_data('_ci_supplier_key', $this->key);
                        $woo_variation->update_meta_data('_ci_import_version', $this->import_version);
                        $woo_variation->set_name($variation['name']);
                        $woo_variation->set_description($variation['description']);
                        // $woo_variation->set_description($variation['meta']['_variation_description']); //  this is what shows when variation is selected
                        $woo_variation->set_regular_price($variation['price']);
                        $woo_variation->set_stock_status('instock');
                        $woo_variation->set_weight($variation['meta']['_weight']);
                        $woo_variation->set_length($variation['meta']['_length']);
                        $woo_variation->set_width($variation['meta']['_width']);
                        $woo_variation->set_height($variation['meta']['_height']);
                        $woo_variation->set_image_id(isset($variation['images'][0]) ? $variation['images'][0] : 0);
                        $woo_variation->update_meta_data('_wc_additional_variation_images', implode(',', $variation['images']));
                        // $woo_variation->set_gallery_image_ids($gallery_ids); // probably not needed?
                        $woo_variation->set_parent_id($product['woo_id']);
                        $woo_variation->update_meta_data('attribute_sku', $variation['sku'], true);

                        $variation['woo_id'] = $woo_variation->save();
                        // $this->log(json_encode(['vid2' => $variation['woo_id']]));
                        unset($variation);
                        unset($woo_variation);
                        unset($parent_id);
                    }

                    // TODO: variaation categories must also be added to master product

                    // master product
                    $woo_product       = new WC_Product_Variable($product['woo_id']);
                    $product['woo_id'] = $woo_product->save();

                    $woo_product->update_meta_data('_supplier_class', $this->supplierClass);
                    $woo_product->update_meta_data('_ci_product_id', '');
                    $woo_product->update_meta_data('_ci_supplier_key', $this->key);
                    // we need to manually unlink children to clean out the rogue variations if they exist
                    WooTools::unlink_children($product['woo_id']);

                    $woo_product->update_meta_data('_ci_import_version', $this->import_version);
                    $woo_product->update_meta_data('_ci_import_timestamp', gmdate("c"));
                    // $woo_product->update_meta_data('_ci_update_plp', gmdate("c"));
                    $woo_product->update_meta_data('_ci_update_pdp', gmdate("c"));
                    $woo_product->set_stock_status('instock');
                    $woo_product->set_name($product['name']);
                    $woo_product->set_short_description(''); // TODO
                    $woo_product->set_description('');

                    // attributes
                    $attributes = [];
                    $attr       = new WC_Product_Attribute();
                    $attr->set_name('SKU');
                    $attr->set_options(array_unique(array_map(fn($v) => $v['sku'], $product['variations'])));
                    $attr->set_visible(1);
                    $attr->set_variation(1);
                    $attr->set_position(20);
                    $attributes['sku'] = $attr;
                    $woo_product->set_attributes($attributes);

                    // master image: find variation with image
                    $master_variation = array_filter($product['variations'], fn($v) => count($v['images']));
                    $master_image     = isset($master_variation['images'][0]) ? $master_variation['images'][0] : 0;
                    $woo_product->set_image_id($master_image);

                    // children: variation woo_id's
                    $children = array_unique(array_map(fn($v) => $v['woo_id'], $product['variations']));
                    $woo_product->set_children($children);

                    foreach ($product['variations'] as $variation) {
                        wp_update_post(['ID' => $variation['woo_id'], 'post_parent' => $product['woo_id']]);
                    }

                    $product['woo_id'] = $woo_product->save();
                    if ($mem_check) {
                        $this->log('saved', ['time' => $timer->lap(), 'memory' => $this->get_mem()]);
                    }

                    $this->log('saved ' . json_encode(['woo_id' => $product['woo_id'], 'children' => count($children), 'progress' => ($group_index + 1) . '|' . count($grouped)]));

                    unset($woo_product);
                    unset($attributes);
                    unset($attr);
                    unset($variation);
                    unset($master_image);
                    unset($children);
                }
            } catch (Exception $e) {
                $response['error'] = $e->getMessage();
                WooTools::log_exception($e, $this, $variation);
            }
        }

        if ($mem_check) {
            $this->log('done', ['time' => $timer->lap(), 'memory' => $this->get_mem()]);
        }

        // return $grouped;
        unset($grouped);
        $this->log('END', __FUNCTION__, $response);
        return $response;
    }
}

// code to remove redundant copy fro variation name
/*
        foreach ($grouped as &$product) {
            if (count($product['variations']) > 1) {
                $fullnames  = array_column($product['variations'], 'name');
                // remove the spaces around dash to make that a compound word. In most cases, these are connected attributes
                $fullnames  = array_map(fn($s) => str_replace(' - ', '-', $s), $fullnames);
                $names      = array_map('\WooTools::split_words', $fullnames);
                $min_length = min(array_map('count', $names));
                $i          = 0;
                $passed     = true;

                while ($i < $min_length && $passed) {
                    foreach ($names as $name) {
                        // check for equality ALSO check if one is plural and one is singular = common typo in the data
                        if ($name[$i] !== $names[0][$i] && (rtrim($name[$i], "s") !== rtrim($names[0][$i], "s"))) {
                            $passed = false;
                            break;
                        }
                    }
                    if ($passed) {
                        $i++;
                    }
                }

                $start_slice = strlen(implode(' ', array_slice($names[0], 0, $i)));

                foreach ($product['variations'] as &$variation) {
                    // $variation['fullname'] = $variation['name'];
                    // replace spaces around dash to prettify the name
                    $variation['name'] = str_replace('-', ' - ', trim(substr($variation['name'], $start_slice)));
                }
            }
        }
        */
