<?php

trait Supplier_WPS_Data
{
    public function normalize_wps_api_response(&$response)
    {
        // if the result happens to return a single item, the api does not nest it in an array
        // offending endpoint are the /vehicles/23,23,37 - when there's a single id
        if (isset($response['data'])) {
            if (isset($response['data']['id'])) {
                $response['data'] = [$response['data']];
            }
        } else {
            $response['data'] = [];
        }
        return $response;
    }

    public function get_params_for_query($flag = 'basic')
    {
        $params   = [];
        $fields   = [];
        $includes = [];

        if ($flag === 'stock') {
            $includes = [
                'items:filter(status_id|STK)',
            ];
            $fields['products'] = 'name,description';
            $fields['items']    = 'status_id';
        }

        if ($flag === 'price') {
            $includes = [
                'items:filter(status_id|STK)',
            ];
            $fields['products'] = 'id';
            $fields['items']    = 'sku,list_price';
        }

        if ($flag === 'custom') {
            $includes = [
                'items:filter(status_id|STK)',
            ];
            $fields['products'] = 'id';
            $fields['items']    = 'id,sku';
        }

        if ($flag === 'id') {
            $fields['products'] = 'id';
        }

        if ($flag === 'plp') {
            $includes = [
                'items.images',
                'items.taxonomyterms',
                // 'items:filter(status_id|STK)',
            ];
            $fields['items']    = 'brand_id,name,list_price,status_id,product_type';
            $fields['products'] = 'name,description';
            $fields['items']    = 'brand_id,sku,name,list_price,status_id,product_type';
        }

        if ($flag === 'pdp') {
            $includes = [
                'features', //
                'tags',
                'blocks',
                'taxonomyterms',
                'attributekeys',   // these are always blank - API error?
                'attributevalues', // these are always blank - API error?
                'items.images',
                'items.attributevalues',
                'items.taxonomyterms',
                // 'items.vehicles',
                // 'items:filter(status_id|STK)',
            ];
            $fields['products']        = 'name,description,updated_at';
            $fields['items']           = 'updated_at,brand_id,sku,name,list_price,length,width,height,weight,status_id,product_type';
            $fields['attributevalues'] = 'attributekey_id,name';
            $fields['taxonomyterms']   = 'name,slug';
            $fields['images']          = 'domain,path,filename,mime,width,height,size';
            $fields['features']        = 'name';
            // $fields['vehicles']        = 'id';
        }

        if ($flag === 'pdp_count') {
            $includes = [
                'items',
            ];
            $fields['products'] = 'id';
            $fields['items']    = 'id';
        }

        if ($flag === 'vehicle') {
            $includes = [
                'items.vehicles',
                'items:filter(status_id|STK)',
            ];
            $fields['products'] = 'id';
            $fields['items']    = 'id,status_id';
            $fields['vehicles'] = 'id';
        }

        if (count($includes)) {
            $params['include'] = implode(',', $includes);
        }

        if (count($fields)) {
            $params['fields'] = $fields;
        }
        return $params;
    }

    public function get_product($product_id, $flag = 'pdp')
    {
        if (! isset($product_id)) {
            $message = "No product id passed";
            throw new InvalidArgumentException($message);
            return ['error' => $message];
        }

        $params  = $this->get_params_for_query($flag);
        $product = $this->get_api('products/' . $product_id, $params);

        if (isset($product['status_code']) && $product['status_code'] === 404) {
            $product['data'] = ['id' => $product_id];
            return $product;
        }
        return $product;
    }

    public function get_products($product_ids, $flag = 'basic')
    {
        if (! count($product_ids)) {
            $message = "No products ids passed";
            throw new InvalidArgumentException($message);
            return ['error' => $message];
        }
        // remove duplicate products ids
        $product_ids = array_unique($product_ids);
        // get API include params
        $params = $this->get_params_for_query($flag);
        // call API
        $products = $this->get_api('products/' . implode(',', $product_ids), $params);

        if (count($products['data']) < count($product_ids)) {
            // missing some products - probably they do not exist
            $found_ids = array_column($products['data'], 'id');
            $lost_ids  = array_diff($product_ids, $found_ids);

            foreach ($lost_ids as $lost_id) {
                $product = $this->get_product($lost_id);
                if ($product['status_code'] === 404) {
                    // fill this data so we can handle the unavailable id
                    $products['data'][] = ['id' => $lost_id, 'items' => [], 'status_code' => 404];
                }
            }
        }
        return $products;
    }

    public function get_products_page($cursor = '', $flag = 'pdp', $updated = null, $page_sizes = [1, 5, 10], $item_limit = 500)
    {
        // $this->log("get_products_page('$cursor', '$flag', '$updated')");
        // attempt to load the max, then step down in count until response is valid
        // $page_sizes      = [1, 5, 10]; //[1, 4, 16, 32]; // with vehical data it takes much longer
        $page_size       = end($page_sizes);
        $page_size_index = count($page_sizes) - 1;
        $items           = [];
        $fails           = 0;
        $params          = $this->get_params_for_query($flag);
        if ($updated) {
            $params['filter[updated_at][gt]'] = $updated;
        }

        while (is_string($cursor) && $page_size >= 1) {
            $page_size      = $page_sizes[$page_size_index];
            $params['page'] = ['cursor' => $cursor, 'size' => $page_size];
            $items          = $this->get_api('/products', $params);

            // timeout indicates that the response is probably too large
            $timeout = isset($items['status_code']) && $items['status_code'] === 408;

            if ($timeout) {
                $this->log(__FUNCTION__, 'timeout', $items);
            }

            // validate data
            if (! $timeout && (! isset($items['data']) || ! is_countable($items['data']))) {
                $this->log(__FUNCTION__, 'WHAT IS THIS ERROR? API throttled' . json_encode($items));
            }

            if (isset($items['error']) && $page_size > 1) {
                $fails++;
                $sleep_time      = $fails * 5;
                $page_size_index = max(0, $page_size_index - $fails);
                if ($page_size_index < 3) {
                    $this->log('---------- throttled (' . $sleep_time . 's sleep) ---------- page_size=' . $page_size);
                    // maybe we're being throttled
                    sleep($sleep_time);
                }
            } else {
                // what is this steaming pile of fun? It limit the number of variations that are to be processed - Woo is a memory hog
                $total_items    = 0;
                $new_page_size  = 0;
                $new_page_index = 0;

                if (isset($items['data'])) {
                    foreach ($items['data'] as $i => $product) {
                        if (isset($product['items']['data'])) {
                            $total_items += count($product['items']['data']);
                        }
                        if (($total_items > $item_limit) && $new_page_size === 0) {
                            $new_page_size  = $i;
                            $new_page_index = count($page_sizes) - 1;
                            while ($new_page_index > 0 && ($page_sizes[$new_page_index] > $new_page_size)) {
                                $new_page_index--;
                            }
                        }
                    }
                    unset($product);
                }

                // $items['meta']['total_items']   = $total_items;
                // $items['meta']['new_page_size'] = $new_page_size;

                if ($page_size > 1) {
                    // data success, count items for limit
                    if ($new_page_size) {
                        $page_size_index = $new_page_index;
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }
        }

        if (isset($items['error'])) {
            $this->log(json_encode(['cursor' => $cursor, 'size' => $page_size, 'fails' => $fails]));
        }
        return $items;
    }

    // public function get_items_page($cursor = '', $updated = null)
    // {
    //                             // $this->log("get_products_page('$cursor', '$flag', '$updated')");
    //                             // attempt to load the max, then step down in count until response is valid
    //     $page_sizes      = [1]; //, 5, 10];
    //     $page_size       = end($page_sizes);
    //     $page_size_index = count($page_sizes) - 1;
    //     $items           = [];
    //     // $fails           = 0;
    //     $params = [
    //         'include'               => [
    //             'vehicles',
    //         ],
    //         'filter[status_id][ne]' => 'NLA',
    //         'fields'                => [
    //             'items'    => 'id,sku,status_id',
    //             'vehicles' => 'id',
    //         ],
    //     ];

    //     if ($updated) {
    //         $params['filter[updated_at][gt]'] = $updated;
    //     }

    //     $page_size      = $page_sizes[$page_size_index];
    //     $params['page'] = ['cursor' => $cursor, 'size' => $page_size];
    //     $items          = $this->get_api('/items', $params);
    //     return $items;
    // }

    public function get_total_remote_products($updated_at = null)
    {
        $updated_at = $updated_at ?? $this->default_updated_at;
        $result     = $this->get_api('products', [
            'filter[updated_at][gt]' => empty($updated_at) ? '2020-01-01' : $updated_at,
            'countOnly'              => 'true',
        ]);
        return $result['data']['count'] ?? -1;
    }

    // public function get_attributekeys($ids)
    // {
    //     // normalize the response to always return an array
    //     $ids = array_unique($ids);
    //     $res = $this->get_api('attributekeys/' . implode(',', $ids));
    //     if (isset($res['data']) && ! array_is_list($res['data'])) {
    //         $res['data'] = [$res['data']];
    //     }
    //     return $res;
    // }

    public function get_attributekeys($ids, $chunk_size = 10)
    {
        $ids         = array_unique($ids); // Ensure unique IDs
        $all_results = ['data' => []];     // Initialize response structure

        // Chunk the IDs into batches of `chunk_size`
        $chunks = array_chunk($ids, $chunk_size);

        foreach ($chunks as $chunk) {
            // NOTE: this specific API breaks when more than 10 id's are sent
            $res = $this->get_api('attributekeys/' . implode(',', $chunk));

            // Ensure response is always an array
            if (isset($res['data']) && ! array_is_list($res['data'])) {
                $res['data'] = [$res['data']];
            }

            // Merge chunk results
            if (isset($res['data'])) {
                $all_results['data'] = array_merge($all_results['data'], $res['data']);
            }
        }

        return $all_results;
    }

}
