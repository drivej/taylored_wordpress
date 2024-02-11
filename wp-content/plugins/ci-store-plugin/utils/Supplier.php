<?php

class Supplier
{
    public string $key;
    public string $name;
    public string $supplierClass;
    public string $import_version = '0.1';

    public function __construct($config)
    {
        $this->key = $config['key'];
        $this->name = $config['name'];
        $this->supplierClass = $config['supplierClass'];
        $this->import_version = $config['import_version'];
    }

    public function get_api($path, $params = [])
    {
        return [];
    }

    public function get_product($product_id)
    {
        return [];
    }

    public function get_product_sku($product_id)
    {
        return implode('_', ['MASTER', 'WPS', $product_id]);
    }

    public function get_variation_sku($product_id, $variation_id)
    {
        return implode('_', ['MASTER', 'WPS', $product_id, 'VARIATION', $variation_id]);
    }
}
