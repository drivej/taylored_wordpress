<?php
/*

https://www.wps-inc.com/data-depot/v4/api/introduction

// TODO: incliude WPS tags as Woo tags - currently they're in early development

 */
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Supplier.php';

class WPSTools
{
    public static function build_western_image_url($img, $size = 200)
    {
        if (!isset($img)) {
            return '';
        }
        return implode('', ['https://', $img['domain'], $img['path'], $size . '_max', '/', $img['filename']]);
    }
}

class Supplier_WPS extends Supplier
{

    public function __construct()
    {
        parent::__construct([
            'key' => 'wps',
            'name' => 'Western Power Sports',
            'supplierClass' => 'WooDropship\\Suppliers\\Western',
            'import_version' => '0.3',
        ]);

        $this->deep_debug = false;
    }

    public function isValidItem($item)
    {
        $status_ids = ['DIR', 'NEW', 'STK'];
        return in_array($item['status_id'], $status_ids);
    }

    public function start_import_products()
    {
        $result = [];
        $result = $this->get_import_status();

        if ($result['is_stalled']) {
            $result['error'] = 'import stalled';
        }

        if ($result['is_running']) {
            $result['error'] = 'import running';
        }

        if ($result['is_scheduled']) {
            $result['error'] = 'import scheduled';
        }

        if (isset($result['error'])) {
            return $result;
        }

        $should_schedule_import = true;

        // if (!$result['is_stopped'] && $result['started_hours_ago'] < 48) {
        //     $should_schedule_import = false;
        //     $result['error'] = 'started ' . $result['started_hours_ago'] . ' hours ago';
        // }

        if ($should_schedule_import) {
            $updated = $result['last_started']->format('Y-m-d'); // updated since
            $products_count = $this->get_products_count($updated);
            $result['report'] = $this->update_import_report([
                'processed' => 0,
                'delete' => 0,
                'update' => 0,
                'ignore' => 0,
                'insert' => 0,
                'patched' => 0,
                'error' => '',
                'updated' => $updated,
                'products_count' => $products_count,
                'cursor' => '',
                'started' => gmdate("c"),
                'stopped' => '',
                'page_size' => 100,
            ]);
            $result['scheduled'] = $this->schedule_import();
        }
        $result['should_schedule_import'] = $should_schedule_import;
        return $result;
    }

    public function import_products_page()
    {
        $this->ping();
        $this->set_is_import_running(true);
        $report = $this->get_import_report();

        // fix page_size=0
        if (!is_numeric($report['page_size']) || $report['page_size'] < 10) {
            $this->update_import_report(['page_size' => 10]);
        }
        $this->log(json_encode(['cursor' => $report['cursor'], 'page_size' => $report['page_size'], 'updated' => $report['updated']]));
        $products = $this->get_products_page($report['cursor'], $report['page_size'], $report['updated']);

        // sometimes the data doesn't return anything - try again
        if (!isset($products['data'])) {
            $this->log('api failed - sleep 10, the try again');
            sleep(10);
            $products = $this->get_products_page($report['cursor'], $report['page_size'], $report['updated']);
        }

        $cancelled = false;
        $stalled = false;

        if (isset($products['data'])) {
            $tally = ['insert' => [], 'update' => [], 'delete' => [], 'ignore' => [], 'patched' => []];
            $this->log('Recieved ' . count($products['data']) . ' products');

            foreach ($products['data'] as $product) {
                $action = $this->get_update_action($product); //
                $product_id = $product['id'];

                if ($report['patch']) {
                    //
                    // Begin:Patch
                    //
                    if ($action === 'update' || $action === 'ignore') {
                        // eficient availability check
                        $is_available = $this->is_available(['data' => $product]);
                        if ($is_available) {
                            $this->patch($report['patch'], $product_id);
                            $action = 'patch';
                        } else {
                            $action = 'ignore';
                        }
                        $tally[$action][] = $product_id;
                        $this->log($this->key . ':' . $product_id . ' ' . $action . ':' . $report['patch']);
                    }
                    //
                    // End: Patch
                    //
                } else {
                    $tally[$action][] = $product_id;
                    $this->log($this->key . ':' . $product_id . ' ' . $action);

                    switch ($action) {
                        case 'insert':
                            $this->insert_product($product_id);
                            break;

                        case 'update':
                            $this->update_product($product_id);
                            break;

                        case 'delete':
                            $this->delete_product($product_id);
                            break;

                        case 'ignore':
                            break;
                    }
                }
                // let wp know we are alive
                $this->ping();

                // escape hatch
                if ($this->should_cancel_import()) {
                    $cancelled = true;
                    $this->log('Import cancelled');
                    break;
                }

                // for testing
                if ($this->should_stall_import()) {
                    $stalled = true;
                    $this->log('Import force stalled');
                    break;
                }
            }

            // log pretty useful data
            $useful_data = array_filter($tally, fn($v) => count($v));
            $results = '';
            foreach ($useful_data as $k => $v) {
                $results .= "\n\t" . $k . ': (' . count($v) . ') ' . implode(',', $v);
            }
            $this->log($results);

            $cursor = $products['meta']['cursor']['next'];

            if ($stalled) {
                $this->clear_stall_test();
                return;
            }

            if (!$cancelled) {
                $this->update_import_report([
                    'processed' => $report['processed'] + count($products['data']),
                    'cursor' => $cursor,
                    'delete' => $report['delete'] + count($tally['delete']),
                    'update' => $report['update'] + count($tally['update']),
                    'ignore' => $report['ignore'] + count($tally['ignore']),
                    'insert' => $report['insert'] + count($tally['insert']),
                    'patched' => $report['patched'] + count($tally['patched']),
                ]);

                if (!$cursor) {
                    $this->update_import_report(['completed' => gmdate("c")]);
                    $this->set_is_import_running(false);
                } else if ($this->should_cancel_import()) {
                    $this->set_is_import_running(false);
                } else {
                    // schedule and event to load the next page of products
                    $flag = $this->import_products_page_flag;
                    $is_scheduled = (bool) wp_next_scheduled($flag);
                    if (!$is_scheduled) {
                        $scheduled = wp_schedule_single_event(time(), $flag);
                        if (!$scheduled) {
                            $this->set_is_import_running(false);
                            $this->update_import_report(['error' => 'schedule failed']);
                            $this->log('schedule failed');
                        }
                    } else {
                        $this->log('schedule page import already scheduled - How did this duplicate?');
                    }
                }
            } else {
                $this->set_is_import_running(false);
            }
        } else {
            // failed after trying to load the page again - this is an error
            $this->set_is_import_running(false);
            $this->update_import_report([
                'stopped' => gmdate("c"),
                'error' => 'Product page data empty',
            ]);
            $this->log('Product page data empty');
        }
    }

    public function patch($patch, $supplier_product_id)
    {
        $supplier_product = $this->get_product($supplier_product_id);
        if (!$supplier_product) {
            $this->log('patch() API Error' . $supplier_product_id);
            return;
        }
        $is_available = $this->is_available($supplier_product);

        if (!$is_available) {
            $this->log('patch() Product not available wps:' . $supplier_product_id);
            return;
        }

        $supplier_product_id = $supplier_product['data']['id'];
        $woo_product_id = $this->get_woo_id($supplier_product_id);

        if (!$woo_product_id) {
            $this->log('patch() wps:' . $supplier_product_id . ' no woo product found for update');
            return;
        }

        $woo_product = wc_get_product_object('variable', $woo_product_id);

        if ($patch === 'tags') {
            $this->update_product_taxonomy($woo_product, $supplier_product);
        }

        if ($patch === 'attributes') {
            $this->update_product_attributes($woo_product, $supplier_product);
            $this->update_product_variations($woo_product, $supplier_product);
        }

        if ($patch === 'images') {
            WooTools::removeProductAttribute($woo_product_id, '__required_attr');
            $this->update_product_images($woo_product, $supplier_product);
        }
    }

    public function insert_product($supplier_product_id)
    {
        $supplier_product = $this->get_product($supplier_product_id);
        if (!$supplier_product) {
            $this->log('insert_product() API Error' . $supplier_product_id);
            return;
        }
        $is_available = $this->is_available($supplier_product);

        if (!$is_available) {
            $this->log('insert_product() Product not available wps:' . $supplier_product_id);
            return;
        }
        $product_id = $this->create_product($supplier_product_id);
        $this->log('create_product() wps:' . $supplier_product_id . ' => woo:' . $product_id);
        $this->update_product_action($supplier_product);
    }

    public function update_product($supplier_product_id)
    {
        $supplier_product = $this->get_product($supplier_product_id);
        if (!$supplier_product) {
            $this->log('update_product() API Error' . $supplier_product_id);
            return ['error' => 'update_product() API Error' . $supplier_product_id];
        }
        $is_available = $this->is_available($supplier_product);

        if (!$is_available) {
            $this->log('update_product() Product not available wps:' . $supplier_product_id);
            return ['error' => 'update_product() Product not available wps:' . $supplier_product_id];
        }
        return $this->update_product_action($supplier_product);
    }

    public function update_product_action($supplier_product)
    {
        try {
            $supplier_product_id = $supplier_product['data']['id'];
            $this->log('update_product_action() ' . $supplier_product_id);
            $woo_product_id = $this->get_woo_id($supplier_product_id);

            if (!$woo_product_id) {
                $this->log('wps:' . $supplier_product_id . ' no woo product found for update');
                return;
            }

            $woo_product = wc_get_product_object('variable', $woo_product_id);
            $first_item = $supplier_product['data']['items']['data'][0];
            $woo_product->set_name($supplier_product['data']['name']);
            $woo_product->set_status('publish');
            $woo_product->set_regular_price($first_item['list_price']);
            $woo_product->set_stock_status('instock');
            $woo_product->update_meta_data('_ci_import_version', $this->import_version);
            $woo_product->update_meta_data('_ci_import_timestamp', gmdate("c"));
            $woo_product->set_description($this->get_description($supplier_product));

            // $time_start = microtime(true);
            $this->update_product_taxonomy($woo_product, $supplier_product);
            // $time_end = microtime(true);
            // $execution_time = $time_end - $time_start;
            // $this->log('update_product_taxonomy ' . $execution_time . 's');

            // $time_start = microtime(true);
            $this->update_product_attributes($woo_product, $supplier_product);
            // $time_end = microtime(true);
            // $execution_time = $time_end - $time_start;
            // $this->log('update_product_attributes ' . $execution_time . 's');

            // $time_start = microtime(true);
            $this->update_product_variations($woo_product, $supplier_product);
            // $time_end = microtime(true);
            // $execution_time = $time_end - $time_start;
            // $this->log('update_product_variations ' . $execution_time . 's');

            $time_start = microtime(true);
            $this->update_product_images($woo_product, $supplier_product);
            $time_end = microtime(true);
            $execution_time = $time_end - $time_start;
            $this->log('update_product_images ' . $execution_time . 's');

            $woo_id = $woo_product->save();
            if (!$woo_id) {
                $this->log('wps:' . $supplier_product_id . ' save failed for woo:' . $woo_id);
            }
            return ['updated' => true];
        } catch (Exception $e) {
            return ['error' => $e];
        }
        // $this->log('update_product_action() ' . $this->key . ':' . $supplier_product['data']['id'].' => woo:'.$woo_id);
    }

    public function update_product_images($woo_product, $supplier_product)
    {
        WooTools::sync_images($woo_product, $supplier_product, $this);
        // $images = [];
        // if (isset($supplier_product['data']['items']['data'])) {
        //     $items = $supplier_product['data']['items']['data'];
        //     foreach ($items as $item) {
        //         if (isset($item['images']['data'])) {
        //             if (count($item['images']['data']) && isset($item['images']['data'][0])) {
        //                 // show only the first image of each variation
        //                 $images[] = WPSTools::build_western_image_url($item['images']['data'][0]);
        //             }
        //         }
        //     }
        // }
        // $serialized_images = serialize($images);
        // $woo_product->update_meta_data('_ci_additional_images', $serialized_images);
    }

    public function update_product_taxonomy($woo_product, $wps_product)
    {
        $tags = $this->extract_product_tags($wps_product);
        $tag_ids = $this->get_tag_ids($tags);
        $woo_id = $woo_product->get_id();
        wp_set_object_terms($woo_id, $tag_ids, 'product_tag', true);
    }

    public function update_product_attributes($woo_product, $supplier_product)
    {
        $supplier_attributes = $this->extract_attributes($supplier_product);
        WooTools::sync_attributes($woo_product, $supplier_attributes);
    }

    public function update_product_variations($woo_product, $supplier_product)
    {
        $supplier_variations = $this->extract_variations($supplier_product);
        WooTools::sync_variations($woo_product, $supplier_variations);
    }

    public function get_api($path, $params = [])
    {
        if (!isset($path)) {
            $this->log('WPS.get_api() ERROR path not set path=' . $path . '' . 'params=' . json_encode($params));
            return ['error' => 'path not set'];
        }
        $query_string = http_build_query($params);
        $remote_url = implode("/", ["http://api.wps-inc.com", trim($path, '/')]) . '?' . $query_string;
        if ($this->deep_debug) {
            $this->log('get_api() ' . $path . '?' . urldecode($query_string));
        }
        $response = wp_safe_remote_request($remote_url, ['headers' => [
            'Authorization' => "Bearer aybfeye63PtdiOsxMbd5f7ZAtmjx67DWFAQMYn6R",
            'Content-Type' => 'application/json',
        ]]);
        if (is_wp_error($response)) {
            return ['error' => 'Request failed'];
        }
        $response_body = wp_remote_retrieve_body($response);
        $data = json_decode($response_body, true);
        if (isset($data['message'])) {
            $data['error'] = $data['message'];
        }
        return $data;
    }

    public function get_description($supplier_product)
    {
        if ($this->deep_debug) {
            $this->log('get_description()');
        }

        $htm = [];
        if (isset($supplier_product['data']['description'])) {
            $htm[] = '<p>' . $supplier_product['data']['description'] . '</p>';
        }
        if (isset($supplier_product['data']['features']['data'])) {
            $htm[] = '<ul>';
            foreach ($supplier_product['data']['features']['data'] as $feature) {
                $htm[] = '<li>' . $feature['name'] . '</li>';
            }
            $htm[] = '<ul>';
        }
        return implode('', $htm);
    }

    public function get_products_count($updated = '2020-01-01')
    {
        if ($this->deep_debug) {
            $this->log('get_products_count()');
        }

        $params = [];
        $params['filter[updated_at][gt]'] = $updated;
        $params['countOnly'] = 'true';
        $result = $this->get_api('products', $params);
        return $result['data']['count'] ?? -1;
    }

    public function get_cached_attributekeys()
    {
        wp_cache_flush();
        return get_option('wps_attributekeys', []);
    }

    public function get_attributes_from_product($supplier_product) // wps_product
    {
        $wps_attributekeys = $this->get_cached_attributekeys();
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

        if ($this->deep_debug) {
            $this->log('get_attributes_from_product()');
        }

        // this is a utility because the attribute data is not entirely in the product request
        $attribute_ids = [];

        if (isset($supplier_product['data']['items']['data'])) {
            foreach ($supplier_product['data']['items']['data'] as $item) {
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

        $av = [];
        foreach ($valid_ids as $valid_id) {
            $av[$valid_id] = $wps_attributekeys[$valid_id];
        }

        if ($wps_attributekeys_updated) {
            update_option('wps_attributekeys', $wps_attributekeys);
        }

        return $av;
    }

    public function extract_product_tags($supplier_product)
    {
        $product_tags = [];
        $tag_slugs = [];
        // make WPS product_type from each item a product_tag
        if (is_countable($supplier_product['data']['items']['data'])) {
            foreach ($supplier_product['data']['items']['data'] as $item) {
                // WPS product_type
                if (isset($item['product_type']) && !empty($item['product_type'])) {
                    $name = $item['product_type'];
                    $slug = sanitize_title($name);
                    if (!isset($tag_slugs[$slug])) {
                        $product_tags[] = ['name' => $name, 'slug' => $slug];
                        $tag_slugs[$slug] = true;
                    }
                }
                // WPS taxonomy terms
                if (is_countable($item['taxonomyterms']['data'])) {
                    foreach ($item['taxonomyterms']['data'] as $term) {
                        $name = $term['name'];
                        $slug = sanitize_title($name);
                        if (!isset($tag_slugs[$slug])) {
                            $product_tags[] = ['name' => $name, 'slug' => $slug];
                            $tag_slugs[$slug] = true;
                        }
                    }
                }
            }
        }

        // get only unique tags
        return $product_tags;
        // $unique_tags = [];

        // foreach ($$product_tags as $tag) {
        //     if (!isset($unique_tags[$tag['slug']])) {
        //         $unique_tags[$tag['slug']] = $tag;
        //     }
        // }

        // $product_tags = array_values($unique_tags);

        return $product_tags;
    }

    public function get_product($product_id)
    {
        if ($this->deep_debug) {
            $this->log('get_product()');
        }
        if (empty($product_id)) {
            return null;
        }

        $params = [];
        $params['include'] = implode(',', [
            'features', //
            'tags',
            'attributekeys',
            'attributevalues',
            'items',
            'items.images',
            'items.inventory',
            'items.attributevalues',
            'items.taxonomyterms',
            'taxonomyterms',
            'items:filter(status_id|NLA|ne)',
        ]);
        $product = $this->get_api('products/' . $product_id, $params);
        if (isset($product['status_code']) && $product['status_code'] === 404) {
            $product['data'] = ['id' => $product_id];
            return $product; //['error' => 'not found', 'status_code' => 404]; // product doesn't exist
        }
        // // remove items that are not valid
        // $initial_count = count($product['data']['items']['data']);
        // $product['data']['items']['data'] = array_filter($product['data']['items']['data'], 'isDeadItem');
        // $product['data']['items']['items_meta'] = ['original' => $initial_count, 'updated' => count($product['data']['items']['data'])];
        $product['data']['attributekeys']['data'] = $this->get_attributes_from_product($product);
        return $product;
    }

    public function get_product_light($product_id)
    {
        if ($this->deep_debug) {
            $this->log('get_product_light()');
        }
        $params = [];
        $params['include'] = implode(',', [
            'items',
            'items:filter(status_id|NLA|ne)',
        ]);
        $product = $this->get_api('products/' . $product_id, $params);
        if (isset($product['status_code']) && $product['status_code'] === 404) {
            return null; // product doesn't exist
        }
        return $product;
    }

    public function extract_product_name($supplier_product)
    {
        if ($this->deep_debug) {
            $this->log('extract_product_name()');
        }

        return isset($supplier_product['data']['name']) ? $supplier_product['data']['name'] : 'error';
    }

    public function extract_variations($supplier_product)
    {
        if ($this->deep_debug) {
            $this->log('extract_variations()');
        }

        if (!isset($supplier_product['data']['attributekeys']['data'])) {
            $this->log(__FILE__, __LINE__, 'ERROR: extract_variations ' . json_encode(['supplier_product' => $supplier_product], JSON_PRETTY_PRINT));
        }

        if (!isset($supplier_product['data']['items']['data'])) {
            $this->log(__FILE__, __LINE__, 'ERROR: extract_variations ' . json_encode(['supplier_product' => $supplier_product], JSON_PRETTY_PRINT));
        }

        $items = isset($supplier_product['data']['items']['data']) && is_array($supplier_product['data']['items']['data']) ? $supplier_product['data']['items']['data'] : [];

        $attr_keys = isset($supplier_product['data']['attributekeys']['data']) ? $supplier_product['data']['attributekeys']['data'] : [];
        $lookup_slug_by_id = [];

        foreach ($attr_keys as $attr_id => $attr) {
            $lookup_slug_by_id[$attr_id] = $attr['slug'];
        }

        $valid_items = array_filter($items, [$this, 'isValidItem']);
        $variations = [];
        $attr_count = [];

        foreach ($valid_items as $item) {
            $variation = [];
            $variation['import_version'] = $this->import_version;
            $variation['id'] = $item['id'];
            $variation['sku'] = $this->get_variation_sku($supplier_product['data']['id'], $item['id']);
            $variation['supplier_sku'] = $item['sku'];
            $variation['name'] = $item['name'];
            $variation['list_price'] = $item['list_price'];
            $variation['images'] = $this->get_item_images($item);
            $variation['images_data'] = $this->get_item_images_data($item);
            $variation['meta_data'] = [];
            $variation['meta_data'][] = ['key' => '_ci_import_version', 'value' => $this->import_version];
            $variation['meta_data'][] = ['key' => '_ci_supplier_key', 'value' => $this->key];
            $variation['meta_data'][] = ['key' => '_ci_product_id', 'value' => $supplier_product['data']['id']];
            $variation['meta_data'][] = ['key' => '_ci_supplier_sku', 'value' => $item['sku']];
            $variation['meta_data'][] = ['key' => '_ci_additional_images', 'value' => $this->get_item_images($item)];
            $variation['meta_data'][] = ['key' => '_ci_import_timestamp', 'value' => gmdate("c")];

            $variation['attributes'] = [];

            // put measures in there anyways - but the units may change
            $variation['width'] = $item['width'];
            $variation['height'] = $item['height'];
            $variation['length'] = $item['length'];
            $variation['weight'] = $item['weight'];

            if ($item['unit_of_measurement_id'] !== 12) {
                // TODO: need to resolve these unit issues - currently not authorized to access this
                $this->log('wps:extract_variations() unit_of_measurement_id=' . $item['unit_of_measurement_id']);
            }

            foreach ($item['attributevalues']['data'] as $attr) {
                $attr_id = $attr['attributekey_id'];
                $attr_value = $attr['name'];
                $attr_slug = $lookup_slug_by_id[$attr_id];
                $variation['attributes'][$attr_slug] = $attr_value;
                if (!array_key_exists($attr_slug, $attr_count)) {
                    $attr_count[$attr_slug] = [];
                }
                if (!array_key_exists($attr_value, $attr_count[$attr_slug])) {
                    $attr_count[$attr_slug][$attr_value] = 0;
                }
                $attr_count[$attr_slug][$attr_value]++;
            }

            $variation['attributes']['supplier_sku'] = $variation['supplier_sku'];
            // NOT NEEDED!!! Woo Hoo!!!! this is a dummy attribute so that variable products with a single variation can be selected
            // $variation['attributes']['__required_attr'] = '1';

            $variations[] = $variation;
        }

        $validItemsCount = count($valid_items);

        foreach ($attr_count as $attr_slug => $attr_values) {
            foreach ($attr_values as $attr_value => $attr_tally) {
                if ($attr_tally === $validItemsCount) {
                    // $this->log('Need to delete attr ' . $attr_slug . ' value ' . $attr_value);

                    foreach ($variations as $variation) {
                        unset($variation['attributes'][$attr_slug]);
                    }
                }
            }
        }

        // check against master attributes
        // some items have an errant attribute that doesn't allow it to be selected for purchase

        $master_attributes = $this->extract_attributes($supplier_product);
        $master_slugs = array_column($master_attributes, 'slug');

        foreach ($variations as $i => $variation) {
            $variations[$i]['__delete'] = false;
            $variation_slugs = array_keys($variation['attributes']);

            // Test 1: check for missing attributes - this is cause my bad data from the 3rd party - nobody's perfect!
            $missing = array_diff($master_slugs, $variation_slugs);

            if (count($missing)) {
                // assume this attribute is not applicable to this variation
                foreach ($missing as $missingAttr) {
                    // TODO: fix product attribute like the regy helmet at WPS_381514
                }
                // TODO: troggle this to see if product resolves nicely or not
                // $this->log(__FILE__, __LINE__, 'Skip variation. ' . $variation['sku'] . ' is missing attributes ' . implode(',', $missing));
                // $variations[$i]['__delete'] = true;
                // no need to continue, this variation is junked
                continue;
            }

            // Test 2: check for attributes that don't need to be there
            $deletes = array_diff($variation_slugs, $master_slugs);

            foreach ($deletes as $attr_slug) {
                unset($variations[$i]['attributes'][$attr_slug]);
            }
        }

        $variations = array_filter($variations, fn($v) => $v['__delete'] === false);
        return $variations;
    }

    public function get_item_images($item)
    {
        if (isset($item['images']['data'])) {
            if (count($item['images']['data'])) {
                return array_map('WPSTools::build_western_image_url', $item['images']['data']);
            }
        }
        return null;
    }

    public function get_item_images_data($item)
    {
        $images = [];
        if (isset($item['images']['data']) && is_countable($item['images']['data']) && count($item['images']['data'])) {
            foreach ($item['images']['data'] as $image) {
                $file = WPSTools::build_western_image_url($image);
                $width = isset($image['width']) ? $image['width'] : 200;
                $height = isset($image['height']) ? $image['height'] : 200;
                $filesize = isset($image['size']) ? $image['size'] : 0;
                $images[] = ['file' => $file, 'width' => $width, 'height' => $height, 'filesize' => $filesize];
            }
        }
        return $images;
    }

    public function extract_attributes($supplier_product)
    {
        if ($this->deep_debug) {
            $this->log('extract_attributes()');
        }

        if (!$supplier_product) {
            return [];
        }
        // extract an array of valid attributes
        $attr_keys = $supplier_product['data']['attributekeys']['data'];
        $attributes = [];
        $lookup_slug_by_id = [];

        if (is_countable($attr_keys)) {
            foreach ($attr_keys as $attr_id => $attr) {
                if (!isset($attr['name']) || !isset($attr['slug'])) {
                    $this->log(__FILE__, __LINE__, 'Error', $attr_keys);
                }
                $attributes[$attr['slug']] = [
                    'name' => $attr['name'],
                    'options' => [],
                    'slug' => $attr['slug'],
                ];
                $lookup_slug_by_id[$attr_id] = $attr['slug'];
            }
        }

        $items = isset($supplier_product['data']['items']['data']) ? $supplier_product['data']['items']['data'] : [];

        $valid_items = array_filter($items, [$this, 'isValidItem']);

        foreach ($valid_items as $item) {
            foreach ($item['attributevalues']['data'] as $item_attr) {
                $attr_id = $item_attr['attributekey_id'];
                $attr_value = $item_attr['name'];
                $attr_slug = $lookup_slug_by_id[$attr_id];

                if (!isset($attributes[$attr_slug]['options'][$attr_value])) {
                    $attributes[$attr_slug]['options'][$attr_value] = 0;
                }
                $attributes[$attr_slug]['options'][$attr_value]++;
            }
        }

        $changes = [];
        $valid_items_count = count($valid_items);
        foreach ($attributes as $attr_slug => $attribute) {
            foreach ($attribute['options'] as $attr_value => $option_count) {
                if ($option_count === 0 || $option_count === $valid_items_count) {
                    unset($attribute['options'][$attr_value]);
                    $changes[] = "remove {$attr_slug} -> {$attr_value}";
                }
            }

            if (count($attribute['options'])) {
                $attributes[$attr_slug]['options'] = array_keys($attributes[$attr_slug]['options']);
            } else {
                unset($attributes[$attr_slug]);
                $changes[] = "delete {$attr_slug}";
            }
        }

        // if (!count($attributes)) {
        //     // with no other attributes, a variable product requires something to validate it for adding to cart
        //     $attributes['__required_attr'] = [
        //         'name' => '__required_attr',
        //         'options' => ['1'],
        //         'slug' => '__required_attr',
        //         'visible' => 0,
        //         'variation' => 0,
        //     ];
        // }

        $valid_skus = array_map(fn($v) => $v['sku'], $valid_items);

        // if (count($valid_skus)) {
        // if there's only 1 sku, we don't need a sku selector
        $attributes['supplier_sku'] = [
            'name' => 'supplier_sku',
            'options' => array_map(fn($v) => $v['sku'], $valid_items),
            'slug' => 'supplier_sku',
        ];
        // }

        return array_values($attributes);
    }

    public function is_available($supplier_product)
    {
        if ($this->deep_debug) {
            $this->log('is_available()');
        }
        if (isset($supplier_product['status_code']) && $supplier_product['status_code'] === 404) {
            return false;
        }

        // this function doesn't need all the product data so for efficiency, try to use the minimal required
        if (isset($supplier_product['data']['items']['data']) && is_countable($supplier_product['data']['items']['data'])) {
            $valid_items = array_filter($supplier_product['data']['items']['data'], [$this, 'isValidItem']);
            return (bool) count($valid_items);
        }
        return false;
    }

    public function extract_product_updated($supplier_product)
    {
        if ($this->deep_debug) {
            $this->log('extract_product_updated()');
        }

        if (isset($supplier_product['data']['updated_at'])) {
            // return wp_date('Y-m-d H:i:s', strtotime($woo_updated_str))
            return strtotime($supplier_product['data']['updated_at']);
        }
        return null;
    }

    public function check_is_available($product_id)
    {
        if ($this->deep_debug) {
            $this->log('check_is_available()');
        }

        $params = [];
        $params['include'] = implode(',', [
            'items',
            'items:filter(status_id|NLA|ne)',
        ]);
        $supplier_product = $this->get_api('products/' . $product_id, $params);
        if (isset($supplier_product['status_code']) && $supplier_product['status_code'] === 404) {
            $supplier_product = null; // product doesn't exist
        }
        return $this->is_available($supplier_product);
    }

    public function get_stock_status($product_id)
    {
        if ($this->deep_debug) {
            $this->log('get_stock_status()');
        }

        $status = 'notfound';
        $params = [];
        $params['include'] = implode(',', [
            'items',
            'items:filter(status_id|NLA|ne)',
        ]);
        $supplier_product = $this->get_api('products/' . $product_id, $params);

        if (isset($supplier_product['error'])) {
            return 'error';
        }
        if (isset($supplier_product['status_code']) && $supplier_product['status_code'] === 404) {
            $status = 'notfound';
            $supplier_product = null;
        }
        if ($supplier_product) {
            if ($this->is_available($supplier_product)) {
                $status = 'instock';
            } else {
                $status = 'outofstock';
            }
        }
        return $status;
    }

    public function get_products_page($cursor = '', $size = 10, $updated = '2020-01-01')
    {
        if ($this->deep_debug) {
            $this->log('get_products_page()');
        }

        $params = [];
        $params['include'] = implode(',', [
            'items:filter(status_id|NLA|ne)', // we don't want to consider products that are no longer available
        ]);
        $params['filter[updated_at][gt]'] = $updated;
        if (isset($cursor)) {
            $params['page[cursor]'] = $cursor;
        }
        $params['page[size]'] = $size;
        $params['fields[items]'] = 'id,updated_at,status_id';
        $params['fields[products]'] = 'id,name,updated_at';

        return $this->get_api('products', $params);
    }

    public function resize_image($src, $width = 200)
    {
        // https://www.wps-inc.com/data-depot/v4/api/services/images
        // 200_max, 500_max, 1000_max, full
        $size_str = '200_max';

        if ($width <= 1000) {
            $size_str = '1000_max';
        }
        if ($width <= 500) {
            $size_str = '500_max';
        }
        if ($width <= 200) {
            $size_str = '200_max';
        }
        if ($width > 1000) {
            $size_str = 'full';
        }
        return str_replace('200_max', $size_str, $src);
    }
}
