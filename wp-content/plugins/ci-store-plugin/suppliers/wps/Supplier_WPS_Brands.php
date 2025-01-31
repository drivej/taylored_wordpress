<?php

trait Supplier_WPS_Brands
{
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
