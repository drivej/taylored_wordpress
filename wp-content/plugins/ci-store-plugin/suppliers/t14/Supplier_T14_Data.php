<?php

trait Supplier_T14_Data
{
    public function get_product($supplier_product_id, $flag = 'pdp')
    {
        /** @var Supplier_T14 $this */
        $response = $this->get_api("/items/{$supplier_product_id}");

        if (isset($response['error'])) {
            return $response;
        }

        if ($flag === 'pdp') {
            $item_data = $this->get_api("/items/data/{$supplier_product_id}");
            $fitments  = $this->get_api("/items/fitment/{$supplier_product_id}");
            $pricing   = $this->get_api("/pricing/{$supplier_product_id}");
            $brand_id  = $response['data']['attributes']['brand_id'];
            if (isset($brand_id)) {
                $brand                     = $this->get_api("/brands/{$brand_id}");
                $response['data']['brand'] = $brand['data'];
            } else {
                $response['data']['brand'] = false;
            }

            $response['data']['item_data'] = $item_data['data'][0];
            $response['data']['fitment']   = $fitments['data'];
            $response['data']['pricing']   = $pricing['data'];
            $response['meta']              = $this->build_product_meta($response);
        }
        return $response;
    }

    public function get_all_pages($path, callable $processFunction = null)
    {
        /** @var Supplier_T14 $this */
        $page        = 1;
        $total_pages = 1;
        $data        = [];

        while ($page <= $total_pages) {
            $items = $this->get_api($path, ['page' => $page]);

            if (isset($items['data']) && is_countable($items['data'])) {
                // Apply processing function if provided
                if ($processFunction) {
                    $items['data'] = $processFunction($items['data']);
                } else {
                    $a    = array_map(fn($item) => $item, $items['data']);
                    $data = [ ...$data, ...$a];
                }
                $total_pages = $items['meta']['total_pages'];
            }
            $page++;
        }

        sort($data);

        return ['meta' => $items['meta'], 'data' => $data];
    }

    public function get_total_items($path, $params = [])
    {
        if (isset($params['page'])) {
            unset($params['page']);
        }

        $first_page  = $this->get_api($path, [ ...$params, 'page' => 1]);
        $page_size   = count($first_page['data']);
        $total_pages = isset($first_page['meta']['total_pages']) ? $first_page['meta']['total_pages'] : 0;

        if ($total_pages === 1) {
            return $page_size;
        }
        $last_page_size = 0;
        if (isset($first_page['links']['last'])) {
            $last_page      = $this->get_api($first_page['links']['last'], $params);
            $last_page_size = count($last_page['data']);
        }
        $total = (($total_pages - 1) * $page_size) + $last_page_size;
        return $total;
    }

    // experimental
    public function get_all_brand_data($brand_id)
    {
        error_log('mem1:' . memory_get_usage());
        $brand = $this->get_api("/brands/{$brand_id}");
        error_log('mem2:' . memory_get_usage());
        unset($brand);
        $items = $this->get_all_pages("/items/brand/{$brand_id}");
        error_log('mem3:' . memory_get_usage());
        unset($items);
        $items_data = $this->get_all_pages("/items/data/brand/{$brand_id}");
        error_log('mem4:' . memory_get_usage());
        unset($items_data);
        $items_pricing = $this->get_all_pages("/pricing/brand/{$brand_id}");
        error_log('mem5:' . memory_get_usage());
        unset($items_pricing);
        $items_fitment = $this->get_all_pages("/items/fitment/brand/{$brand_id}");
        error_log('mem6:' . memory_get_usage());
        unset($items_fitment);
        error_log('memX:' . memory_get_usage());
        return 'he';

        return [
            'brand_id' => $brand_id,
            'brand'    => $brand['data'],
            'items'    => $items['data'],
            'data'     => $items_data['data'],
            'pricing'  => $items_pricing['data'],
            'fitment'  => $items_fitment['data'],
        ];
    }
    /**
     * Loads the next page of products for the current brand in the query and updates the query state.
     *
     * @param array $query {
     *     Required. A reference to an array of arguments.
     *
     *     @type bool   $has_more      Indicates if there are more pages/brands to load.
     *     @type array  $brand_ids     The list of brand IDs to paginate through.
     *     @type int    $brand_index   The index of the current brand in the list.
     *     @type int    $page_index    The current page number for pagination.
     *     @type int    $total_pages   The total number of pages for the current brand.
     *     @type int    $count         The total number of products retrieved in the current page.
     *     @type array  $data          The list of product data for the current page.
     * }
     *
     * @return bool Indicates if there are more pages or brands to load (true if yes, false if no).
     *
     *  @example
     *   $query = [];
     *
     *   while ($supplier->load_next_brand_page($query)) {
     *       // Process each page of products here.
     *   }
     */
    public function load_next_brand_page(&$query)
    {
        $this->log(__CLASS__ . '::load_next_brand_page()');
        /** @var Supplier_T14 $this */

        if (! array_key_exists('brand_ids', $query)) {
            $query['has_more']    = false;
            $query['brand_ids']   = $this->get_allowed_brand_ids();
            $query['brand_index'] = 0;
            $query['page_index']  = 1;
            $query['total_pages'] = 1;
            $query['count']       = 0;
            $query['page_size']   = 0;
            $query['data']        = [];
        }

        if ($query['page_index'] <= $query['total_pages']) {
            $brand_id      = $query['brand_ids'][$query['brand_index']];
            $items         = $this->get_products_page_ext(['brand_id' => $brand_id, 'page' => $query['page_index']]);
            $query['data'] = [];

            if (! empty($items['data']) && ! empty($items['meta'])) {
                foreach ($items['data'] as $i => $item) {
                    $query['data'][] = $item['id'] . ' ' . $item['attributes']['product_name'];
                }
                $query['page_size'] = count($query['data']);
                $query['count'] += count($query['data']);
                $query['total_pages'] = $items['meta']['total_pages'];
            } else {
                return false;
            }
        }
        $query['page_index']++;

        if ($query['page_index'] > $query['total_pages']) {
            $query['total_pages'] = 1;
            $query['page_index']  = 1;
            $query['brand_index']++;
        }
        $has_more = $query['brand_index'] < count($query['brand_ids']);

        return $has_more;
    }
    /**
     * Get products with optional filters.
     *
     * @param array $args {
     *     Optional. An array of arguments.
     *
     *     @type int    $page   The page number for pagination. Default is 1.
     *     @type int    $days   The number of days for filtering updated products. Default is null.
     *     @type int    $brand_id  The brand name to filter products by. Default is null.
     * }
     * @return array An array of products.
     */
    public function get_products_page_ext($query = [])
    {
        $path       = 'items';
        $expiration = null;
        $args       = ['page' => 1];

        if (array_key_exists('page', $query) && is_numeric($query['page'])) {
            $args['page'] = $query['page'];
        }

        if (array_key_exists('days', $query) && is_numeric($query['days']) && $query['days'] >= 1 && $query['days'] <= 15) {
            $args['days'] = $query['days'];
            $path         = 'items/updates';
            $expiration   = DAY_IN_SECONDS;
        }

        if (array_key_exists('brand_id', $query) && is_numeric($query['brand_id'])) {
            // "days" has no effect on the brand response
            $path = "items/brand/{$query['brand_id']}";
        }

        return $this->get_api($path, [ ...$args], true, $expiration);
    }

    public function get_products_page($page = 1, $days = null, $updated = '') // required to jive with the parent class
    {
        /** @var Supplier_T14 $this */
        $path       = 'items';
        $expiration = null;
        $args       = ['page' => 1];

        // If days are provided, change the path and add expiration
        if ($days && $days >= 1 && $days <= 15) {
            $args['days'] = $days;
            $path         = 'items/updates';
            $expiration   = DAY_IN_SECONDS;
        }

        $items = $this->get_api($path, [ ...$args, 'page' => $page], true, $expiration);
        return $items;
    }

    // TODO: add brands filter
    public function get_total_remote_products($days = null)
    {
        return $this->get_total_items('/items', $days ? ['days' => $days] : []);
    }
}
