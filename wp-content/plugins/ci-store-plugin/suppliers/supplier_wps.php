<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Report.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/western/western_utils.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/western/import_western_product.php';

class Supplier_WPS extends Supplier
{
    public bool $deep_debug = false;

    public function __construct()
    {
        parent::__construct([
            'key' => 'wps',
            'name' => 'Western Power Sports',
            'supplierClass' => 'WooDropship\\Suppliers\\Western',
            'import_version' => '0.3',
        ]);
    }

    public function import_product($supplier_product_id, $force = false, $report = new Report())
    {
        if ($this->deep_debug) {
            ci_error_log('import_product()');
        }

        import_western_product($supplier_product_id, $force, $report);
    }

    public function get_api($path, $params = [])
    {
        $query_string = http_build_query($params);
        $remote_url = implode("/", ["http://api.wps-inc.com", trim($path, '/')]) . '?' . $query_string;
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
            ci_error_log('get_description()');
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
            ci_error_log('get_products_count()');
        }

        $params = [];
        $params['filter[updated_at][gt]'] = $updated;
        $params['countOnly'] = 'true';
        $result = $this->get_api('products', $params);
        return $result['data']['count'] ?? -1;
    }

    public function get_attributes_from_product($supplier_product) // wps_product
    {
        if ($this->deep_debug) {
            ci_error_log('get_attributes_from_product()');
        }

        // this is a utility because the attribute data is not entirely in the product request
        global $WESTERN_ATTRIBUTES_CACHE;
        $attribute_ids = get_western_attributes_tally_from_product($supplier_product);
        $all_ids = array_keys($attribute_ids);
        $ids = array_values(array_filter($all_ids, fn($id) => !array_key_exists($id, $WESTERN_ATTRIBUTES_CACHE)));

        $cursor = '';
        $data = [];
        // ci_error_log(['TEST1' => $ids]);
        
        if (count($ids) === 1) {
            // handle request for single item
            // ci_error_log(__FILE__, __LINE__, 'QUERY attributekeys/' . implode(',', $ids));
            $res = get_western('attributekeys/' . implode(',', $ids));
            // ci_error_log(['TEST2' => $res]);
            // ci_error_log(['TEST2.2' => is_countable($res)]);
            // ci_error_log(['TEST2.2.1' => reset($ids)]);
            try {
                // this explodes if another product exists with the same sku
                $res['data']['slug'] = sanitize_title($res['data']['name']);
                $WESTERN_ATTRIBUTES_CACHE[$ids[0]] = $res['data'];
            } catch (\Exception $e) {
                // ci_error_log('CAUGHT!!! get_attributes_from_product()', $res);

            }
            // ci_error_log(['TEST2.1' => $res]);

            // $attributes[] = $res['data'];
        } else {
            // ci_error_log('TEST3');
            // handle request for multiple items
            // gather data with pagination
            while (isset($cursor)) {
                $res = get_western('attributekeys/' . implode(',', $ids), ['page[size]' => 20, 'page[cursor]' => $cursor]);
                if (isset($res['data'])) {
                    foreach ($res['data'] as $attr) {
                        $attr['slug'] = sanitize_title($attr['name']);
                        $WESTERN_ATTRIBUTES_CACHE[$attr['id']] = $attr;
                    }
                } else {
                    ci_error_log(__FILE__, __LINE__, 'get_attributes_from_product Warning ' . json_encode($res, JSON_PRETTY_PRINT));
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

        $valid_ids = array_filter($all_ids, fn($id) => array_key_exists($id, $WESTERN_ATTRIBUTES_CACHE));
        return array_reduce($valid_ids, 'reduce_ids', []);
    }

    public function get_product($product_id)
    {
        if ($this->deep_debug) {
            ci_error_log('get_product()');
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
            return null; // product doesn't exist
        }
        // // remove items that are not valid
        // $initial_count = count($product['data']['items']['data']);
        // $product['data']['items']['data'] = array_filter($product['data']['items']['data'], 'isDeadItem');
        // $product['data']['items']['items_meta'] = ['original' => $initial_count, 'updated' => count($product['data']['items']['data'])];
        $product['data']['attributekeys']['data'] = $this->get_attributes_from_product($product);
        return $product;
    }

    public function extract_product_name($supplier_product)
    {
        if ($this->deep_debug) {
            ci_error_log('extract_product_name()');
        }

        return isset($supplier_product['data']['name']) ? $supplier_product['data']['name'] : 'error';
    }

    public function extract_variations($supplier_product)
    {
        if ($this->deep_debug) {
            ci_error_log('extract_variations()');
        }

        if (!isset($supplier_product['data']['attributekeys']['data'])) {
            ci_error_log(__FILE__, __LINE__, 'ERROR: extract_variations ' . json_encode(['supplier_product' => $supplier_product], JSON_PRETTY_PRINT));
        }

        if (!isset($supplier_product['data']['items']['data'])) {
            ci_error_log(__FILE__, __LINE__, 'ERROR: extract_variations ' . json_encode(['supplier_product' => $supplier_product], JSON_PRETTY_PRINT));
        }

        $items = isset($supplier_product['data']['items']['data']) && is_array($supplier_product['data']['items']['data']) ? $supplier_product['data']['items']['data'] : [];

        $attr_keys = $supplier_product['data']['attributekeys']['data'];
        $lookup_slug_by_id = [];

        foreach ($attr_keys as $attr_id => $attr) {
            $lookup_slug_by_id[$attr_id] = $attr['slug'];
        }

        $valid_items = array_filter($items, 'isValidItem');
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
            $variation['images'] = get_item_images($item);
            $variation['meta_data'] = [];
            $variation['meta_data'][] = ['key' => '_ci_import_version', 'value' => $this->import_version];
            $variation['meta_data'][] = ['key' => '_ci_supplier_key', 'value' => $this->key];
            $variation['meta_data'][] = ['key' => '_ci_product_id', 'value' => $supplier_product['data']['id']];
            $variation['meta_data'][] = ['key' => '_ci_supplier_sku', 'value' => $item['sku']];
            $variation['meta_data'][] = ['key' => '_ci_additional_images', 'value' => get_item_images($item)];
            $variation['meta_data'][] = ['key' => '_ci_import_timestamp', 'value' => gmdate("c")];

            $variation['attributes'] = [];

            // put measures in there anyways - but the units may change
            $variation['width'] = $item['width'];
            $variation['height'] = $item['height'];
            $variation['length'] = $item['length'];
            $variation['weight'] = $item['weight'];

            if ($item['unit_of_measurement_id'] !== 12) {
                // TODO: need to resolve these unit issues
                ci_error_log(__FILE__, __LINE__, 'unit_of_measurement_id=' . $item['unit_of_measurement_id'] . ' nned to convert');
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
            // this is a dummy attribute so that variable products with a single variation can be selected
            $variation['attributes']['__required_attr'] = '1';

            $variations[] = $variation;
        }

        $validItemsCount = count($valid_items);

        foreach ($attr_count as $attr_slug => $attr_values) {
            foreach ($attr_values as $attr_value => $attr_tally) {
                if ($attr_tally === $validItemsCount) {
                    // ci_error_log('Need to delete attr ' . $attr_slug . ' value ' . $attr_value);

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
                // TODO: troggle this to see if product resolves nicely or not
                // ci_error_log(__FILE__, __LINE__, 'Skip variation. ' . $variation['sku'] . ' is missing attributes ' . implode(',', $missing));
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

        // ci_error_log(['attr_count' => $attr_count, 'valid_items' => count($valid_items)]);

        return $variations;
    }

    public function extract_attributes($supplier_product)
    {
        if ($this->deep_debug) {
            ci_error_log('extract_attributes()');
        }

        if (!$supplier_product) {
            return [];
        }
        // extract an array of valid attributes
        $attr_keys = $supplier_product['data']['attributekeys']['data'];
        $attributes = [];
        $lookup_slug_by_id = [];

        foreach ($attr_keys as $attr_id => $attr) {
            if (!isset($attr['name']) || !isset($attr['slug'])) {
                ci_error_log(__FILE__, __LINE__, 'Error', $attr_keys);
            }
            $attributes[$attr['slug']] = [
                'name' => $attr['name'],
                'options' => [],
                'slug' => $attr['slug'],
            ];
            $lookup_slug_by_id[$attr_id] = $attr['slug'];
        }

        $valid_items = array_filter($supplier_product['data']['items']['data'], 'isValidItem');

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

        if (!count($attributes)) {
            // with no other attributes, a variable product requires something to validate it for adding to cart
            $attributes['__required_attr'] = [
                'name' => '__required_attr',
                'options' => ['1'],
                'slug' => '__required_attr',
                'visible' => 0,
                'variation' => 0,
            ];
        }

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
            ci_error_log('is_available()');
        }

        // this function doesn't need all the product data so for efficiency, try to use the minimal required
        if (isset($supplier_product['data']['items']['data'])) {
            $valid_items = array_filter($supplier_product['data']['items']['data'], 'isValidItem');
            return (bool) count($valid_items);
        }
        return false;
    }

    public function extract_product_updated($supplier_product)
    {
        if ($this->deep_debug) {
            ci_error_log('extract_product_updated()');
        }

        if (isset($supplier_product['data']['updated_at'])) {
            // return wp_date('Y-m-d H:i:s', strtotime($woo_updated_str))
            return strtotime($supplier_product['data']['updated_at']);
        }
        return null;
    }

    public function is_stale($supplier_product)
    {
        if ($this->deep_debug) {
            ci_error_log('is_stale()');
        }

        $supplier_updated = $this->extract_product_updated($supplier_product);
        $woo_product = $this->get_woo_product($supplier_product['data']['id']);
        if ($woo_product) {
            $woo_updated = $woo_product->get_date_modified();
            if ($woo_updated) {
                return $woo_updated->getTimestamp() < $supplier_updated;
            }
        }
        return true;
    }

    public function check_is_available($product_id)
    {
        if ($this->deep_debug) {
            ci_error_log('check_is_available()');
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
            ci_error_log('get_stock_status()');
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
            ci_error_log('get_products_page()');
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
}
