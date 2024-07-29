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
    public function get_brands()
    {
        $brands = $this->get_api('/brands');
        $allowed = $this->get_allowed_brand_ids();
        $output = [];
        foreach ($brands['data'] as &$brand) {
            $output[] = ['id' => (string) $brand['id'], 'name' => $brand['attributes']['name'], 'allowed' => (bool) $allowed[$brand['id']]];
        }
        return ['data' => $output, 'meta' => ['allowed' => $allowed]];
    }

    public function get_allowed_brand_ids()
    {
        $brand_ids = get_option('t14_allow_brand_ids', []);
        if (is_array($brand_ids)) {
            return $brand_ids;
        }
        return [];
    }

    public function set_allowed_brand_ids($brand_ids)
    {
        error_log('set_allowed_brand_ids() is_array=' . is_array($brand_ids));
        if (is_array($brand_ids)) {
            error_log('set_allowed_brand_ids() ' . implode(',', $brand_ids));
            update_option('t14_allow_brand_ids', $brand_ids);
        } else {
            error_log('FAIL $brand_ids ' . $brand_ids . ' ' . gettype($brand_ids));
        }
        wp_cache_flush();
        return $this->get_brands();
    }

    public function apply_allowed_brands()
    {

    }
}
