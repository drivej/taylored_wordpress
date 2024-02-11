<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Supplier.php';

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
        $product['data']['attributekeys']['data'] = get_western_attributes_from_product($product);
        return $product;
    }
}
