<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools/WooTools_upsert_brands.php';
trait Supplier_WPS_Brands
{
    public function get_brand($brand_id, $use_cache = true)
    {
        $transient_name = $this->key . __FUNCTION__ . $brand_id;
        $response       = $use_cache ? get_transient($transient_name) : false;

        if (! $response) {
            $res = $this->get_api("/brands/{$brand_id}");
            if (isset($res['data'])) {
                $response            = $res['data'];
                // $response['term_id'] = WooTools::get_or_create_global_attribute_term('brand', $response['name']);
            } else {
                $response = false;
            }
            set_transient($transient_name, $response, WEEK_IN_SECONDS);
        }
        return $response;
    }

    public function get_brands_lookup($use_cache = true)
    {
        $transient_name = $this->key . __FUNCTION__;
        $response       = $use_cache ? get_transient($transient_name) : false;

        if (! $response) {
            $cursor   = '';
            $response = [];
            while (is_string($cursor)) {
                $page = $this->get_api("/brands", ['page' => ['size' => 500, 'cursor' => $cursor]]);
                if ($page['data']) {
                    foreach ($page['data'] as $brand) {
                        $response[$brand['id']] = $brand['name'];
                    }
                }
                $cursor = $page['meta']['cursor']['next'] ?? false;
            }
            unset($page, $cursor);
            set_transient($transient_name, $response, WEEK_IN_SECONDS);
        }
        return $response;
    }

    public function import_brands($use_cache = true)
    {
        $transient_name = $this->key . __FUNCTION__;
        $response       = $use_cache ? get_transient($transient_name) : false;

        if (! $response) {
            $brands      = $this->get_brands_lookup(false);
            $brand_names = array_values($brands);
            $response    = WooTools\upsert_brands($brand_names);
            set_transient($transient_name, $response, WEEK_IN_SECONDS);
        }
        return $response;
    }

    public function get_brands()
    {
        $params = ['page' => ['size' => 1000, 'cursor' => '']];
        $brands = [];
        $res    = $this->get_api('/brands', $params);
        $brands = array_merge($brands, $res['data'] ?? []);
        $cursor = $res['meta']['cursor']['next'] ?? 0;
        if ($cursor) {
            $params['page']['cursor'] = $cursor;
            $res                      = $this->get_api('/brands', $params);
            $brands                   = array_merge($brands, $res['data'] ?? []);
        }
        $allowed = $this->get_allowed_brand_ids();
        $output  = [];
        foreach ($brands as &$brand) {
            $output[] = ['id' => (string) $brand['id'], 'name' => $brand['name'], 'allowed' => (bool) $allowed[$brand['id']]];
        }
        usort($output, function ($a, $b) {
            return strcmp(strtolower($a['name']), strtolower($b['name']));
        });
        return ['data' => $output, 'meta' => ['allowed' => $allowed, 'count' => $res['meta']['cursor']['count']]];
    }

    public function get_allowed_brand_ids()
    {
        $brand_ids = get_option('wps_allow_brand_ids', []);
        if (is_array($brand_ids)) {
            return $brand_ids;
        }
        return [];
    }

    public function set_allowed_brand_ids($brand_ids)
    {
        if (is_array($brand_ids)) {
            update_option('wps_allow_brand_ids', $brand_ids);
            wp_cache_flush();
        }
        return $this->get_brands();
    }
}
