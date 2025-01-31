<?php
/*

Answer Racing
Baja Designs
Bikemaster
Burly Brand
DragonFire Racing
Firstgear
Kuryakyn
 *ProTaper* (Most Important)
Quadboss
RiverRoad
Speed and Strength
Twin Power
Vance & Hines

 */
trait Supplier_T14_Brands
{
    public function get_brands($allowed_only = false)
    {
        $brands  = $this->get_api('/brands');
        $allowed = $this->get_allowed_brand_ids();
        $output  = [];
        foreach ($brands['data'] as &$brand) {
            $isAllowed = in_array($brand['id'], $allowed);
            if ($allowed_only===true ? $isAllowed : true) {
                $output[] = [
                    'id'      => (string) $brand['id'],
                    'name'    => $brand['attributes']['name'],
                    'allowed' => $isAllowed,
                ];
            }
        }
        return ['data' => $output, 'meta' => ['allowed' => $allowed]];
    }

    public function validate_brand_ids($brand_ids)
    {
        $brands       = $this->get_api('/brands');
        $lookup_brand = array_column($brands['data'], 'id');
        $validated    = array_values(array_intersect($brand_ids, $lookup_brand));
        return $validated;
    }

    public function get_allowed_brand_ids()
    {
        $brand_ids = get_option('t14_allow_brand_ids', []);

        if (is_array($brand_ids)) {
            $brand_ids = $this->validate_brand_ids($brand_ids);
            sort($brand_ids);
            return $brand_ids;
        }
        return [];
    }

    public function set_allowed_brand_ids($brand_ids)
    {
        if (is_array($brand_ids)) {
            $brand_ids = $this->validate_brand_ids($brand_ids);
            update_option('t14_allow_brand_ids', $brand_ids);
        } else {
            error_log('FAIL $brand_ids ' . $brand_ids . ' ' . gettype($brand_ids));
        }
        wp_cache_flush();
        return $this->get_brands();
    }

    public function get_brands_info()
    {
        $brands         = $this->get_brands();
        $brands['data'] = array_values(array_filter($brands['data'], fn($b) => $b['allowed']));
        $total          = 0;
        foreach ($brands['data'] as $i => $brand) {
            $brands['data'][$i]['total'] = $this->get_total_items("/items/brand/{$brand['id']}");
            $total += $brands['data'][$i]['total'];
        }
        $brands['meta']['total'] = $total;
        return $brands;
    }

    public function get_brand_info($brand_id, $get_total = false)
    {
        $brand = $this->get_api("/brands/{$brand_id}");
        if (isset($brand['data'])) {
            $allowed   = $this->get_allowed_brand_ids();
            $isAllowed = in_array($brand_id, $allowed);
            $response  = [
                'id'      => $brand_id,
                'name'    => $brand['data']['attributes']['name'],
                'allowed' => $isAllowed,
            ];
            if ($get_total) {
                $response['total'] = $get_total ? $this->get_total_items("/items/brand/{$brand_id}") : -1;
            }
            return $response;
        }
        return false;
    }

    public function get_brand_items($brand_id)
    {
        return $this->get_all_pages("/items/brand/{$brand_id}");
    }
}
