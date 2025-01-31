<?php

trait Supplier_WPS_Data
{
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

        if ($flag === 'plp') {
            $includes = [
                'items.images',
                'items:filter(status_id|STK)',
            ];
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
                'items:filter(status_id|STK)',
            ];
            $fields['products']        = 'name,description';
            $fields['items']           = 'brand_id,sku,name,list_price,length,width,height,weight,status_id,product_type';
            $fields['attributevalues'] = 'attributekey_id,name';
            $fields['taxonomyterms']   = 'name,slug';
            $fields['images']          = 'domain,path,filename,mime,width,height,size';
            $fields['features']        = 'name';
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

    public function get_products_page($cursor = '', $flag = 'pdp', $updated = null)
    {
        // $this->log("get_products_page('$cursor', '$flag', '$updated')");
        // attempt to load the max, then step down in count until response is valid
        $page_sizes      = [1, 8, 16, 32];
        $page_size       = end($page_sizes);
        $page_size_index = count($page_sizes) - 1;
        $items           = [];
        $fails           = 0;
        $params          = $this->get_params_for_query($flag);
        if ($updated) {
            $params['filter[updated_at][gt]'] = $updated;
        }

        while (is_string($cursor) && $page_size > 1) {
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
                $this->log(__FUNCTION__, 'WHAT IS THIS ERROR? API throttled' . $items);
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
                break;
            }
        }

        if (isset($items['error'])) {
            $this->log(json_encode(['cursor' => $cursor, 'size' => $page_size, 'fails' => $fails]));
        }
        return $items;
    }

    public function get_total_remote_products($updated_at = null)
    {
        $updated_at = $updated_at ?? $this->default_updated_at;
        $result     = $this->get_api('products', [
            'filter[updated_at][gt]' => $updated_at,
            'countOnly'              => 'true',
        ]);
        return $result['data']['count'] ?? -1;
    }
}
