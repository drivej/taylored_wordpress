<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/western/western_utils.php';

class Supplier_WPS extends Supplier
{
    public function __construct()
    {
        parent::__construct([
            'key' => 'wps',
            'name' => 'Western Power Sports',
            'supplierClass' => 'WooDropship\\Suppliers\\Western',
            'import_version' => '0.1',
        ]);
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

    public function get_products_count($updated = '2020-01-01')
    {
        $params = [];
        $params['filter[updated_at][gt]'] = $updated;
        $params['countOnly'] = 'true';
        $result = $this->get_api('products', $params);
        return $result['data']['count'] ?? -1;
    }

    public function get_attributes_from_product($supplier_product) // wps_product
    {
        // this is a utility because the attribute data is not entirely in the product request
        global $WESTERN_ATTRIBUTES_CACHE;
        $attribute_ids = get_western_attributes_tally_from_product($supplier_product);
        $all_ids = array_keys($attribute_ids);
        $ids = array_filter($all_ids, fn($id) => !array_key_exists($id, $WESTERN_ATTRIBUTES_CACHE));

        $cursor = '';
        $data = [];

        if (count($ids) === 1) {
            // handle request for single item
            $res = get_western('attributekeys/' . implode(',', $ids));
            $res['data']['slug'] = sanitize_title($res['data']['name']);
            $WESTERN_ATTRIBUTES_CACHE[$ids[0]] = $res['data'];
            // $attributes[] = $res['data'];
        } else {
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
                    error_log('get_attributes_from_product Warning ' . json_encode($res['data'], JSON_PRETTY_PRINT));
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
        return $supplier_product['data']['name'];
    }

    public function extract_variations($supplier_product)
    {
        if (!isset($supplier_product['data']['attributekeys']['data'])) {
            error_log('extract_variations ' . json_encode($supplier_product, JSON_PRETTY_PRINT));
        }

        $attr_keys = $supplier_product['data']['attributekeys']['data'];
        $lookup_slug_by_id = [];

        foreach ($attr_keys as $attr_id => $attr) {
            $lookup_slug_by_id[$attr_id] = $attr['slug'];
        }

        $valid_items = array_filter($supplier_product['data']['items']['data'], 'isValidItem');
        $variations = [];

        foreach ($valid_items as $item) {
            $variation = [];
            $variation['sku'] = $this->get_variation_sku($supplier_product['data']['id'], $item['id']);
            $variation['name'] = $item['name'];
            $variation['list_price'] = $item['list_price'];
            $variation['images'] = get_item_images($item);
            $variation['attributes'] = [];

            foreach ($item['attributevalues']['data'] as $attr) {
                $attr_id = $attr['attributekey_id'];
                $attr_value = $attr['name'];
                $attr_slug = $lookup_slug_by_id[$attr_id];
                $variation['attributes'][$attr_slug] = $attr_value;
            }
            // this is a dummy attribute so that variable products with a single variation can be selected
            $variation['attributes']['__required_attr'] = '1';

            $variations[] = $variation;
        }
        return $variations;
    }

    public function extract_attributes($supplier_product)
    {
        if (!$supplier_product) {
            return [];
        }
        /*
        extract an array of valid attributes
        [
        {
        "id": 15,
        "name": "Color",
        "slug": "color",
        "options": [
        "Black/Blue",
        "Black/Grey",...
        ]
        }, {...
        ]
         */
        $attr_keys = $supplier_product['data']['attributekeys']['data'];
        $attributes = [];
        $lookup_slug_by_id = [];

        foreach ($attr_keys as $attr_id => $attr) {
            $attributes[$attr['slug']] = [
                'name' => $attr['name'],
                'options' => [],
                'slug' => $attr['slug'],
            ];
            $lookup_slug_by_id[$attr_id] = $attr['slug'];
        }

        $valid_items = array_filter($supplier_product['data']['items']['data'], 'isDeadItem');
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

        return array_values($attributes);

        //['changes'=>$changes, 'valid_items_count'=>$valid_items_count, 'attributes' => array_values($attributes), 'lookup_slug_by_id' => $lookup_slug_by_id];

        // $attr_keys = $supplier_product['data']['attributekeys']['data'];
        // $items = array_filter($supplier_product['data']['items']['data'], 'isDeadItem');
        // $items_count = count($items);

        // foreach ($items as $item) {
        //     foreach ($item['attributevalues']['data'] as $item_attr) {
        //         $attr_id = $item_attr['attributekey_id'];
        //         if (!isset($attr_keys[$attr_id]['options'])) {
        //             $attr_keys[$attr_id] = ['options' => []];
        //         }
        //         if (!isset($attr_keys[$attr_id]['options'][$item_attr['name']])) {
        //             $attr_keys[$attr_id]['options'][$item_attr['name']] = 0;
        //         }
        //         $attr_keys[$attr_id]['options'][$item_attr['name']]++;
        //     }
        // }

        // foreach ($attr_keys as $i => $attr_key) {
        //     unset($attr_keys[$i]['created_at']);
        //     unset($attr_keys[$i]['updated_at']);
        //     $options = [];
        //     foreach ($attr_key['options'] as $option_name => $option_count) {
        //         if ($option_count < $items_count) {
        //             $options[] = $option_name;
        //         }
        //     }
        //     $attr_keys[$i]['options'] = $options;
        // }

        // foreach ($attr_keys as $i => $attr_key) {
        //     if (!count($attr_key['options'])) {
        //         unset($attr_keys[$i]);
        //     }
        // }

        // return array_values($attr_keys);
    }

    public function is_available($supplier_product)
    {
        if (isset($supplier_product['data']['items']['data'])) {
            $valid_items = array_filter($supplier_product['data']['items']['data'], 'isValidItem');
            return (bool) count($valid_items);
        }
        return false;
    }

    public function extract_product_updated($supplier_product)
    {
        if (isset($supplier_product['data']['updated_at'])) {
            return strtotime($supplier_product['data']['updated_at']);
        }
        return null;
    }

    public function is_stale($supplier_product)
    {
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
        $status = 'notfound';
        $params = [];
        $params['include'] = implode(',', [
            'items',
            'items:filter(status_id|NLA|ne)',
        ]);
        $supplier_product = $this->get_api('products/' . $product_id, $params);
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
