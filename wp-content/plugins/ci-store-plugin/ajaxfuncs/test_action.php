<?php

namespace CIStore\Ajax;

include_once CI_STORE_PLUGIN . 'utils/WooTools.php';
include_once CI_STORE_PLUGIN . 'suppliers/Suppliers.php';

function test_action()
{
    $woo_id = wc_get_product_id_by_sku('MASTER_WPS_369438');
    if ($woo_id) {
        $woo_product = wc_get_product($woo_id);
        $product_type = $woo_product->get_type();
        $supplier = \WooTools::get_product_supplier($woo_product);
        $supplier_product_id = $woo_product->get_meta('_ci_product_id');
        $supplier_product = $supplier->get_product($supplier_product_id);
        $supplier_sku_key = '_ci_product_sku';
        $current_sku = $woo_product->get_meta($supplier_sku_key, true);
        
        if (empty($current_sku)) {
            $supplier_sku = $supplier_product['data']['items']['data'][0]['sku'] ?? '';
            if ($supplier_sku) {
                $woo_product->update_meta_data($supplier_sku_key, $supplier_sku);
                $woo_product->save();
            }
        }
        $woo_meta = $woo_product->get_meta_data();

        return ['woo_id' => $woo_id, 'type' => $product_type, 'meta' => $woo_meta, 'supplier_sku' => $supplier_sku, 'supplier_product' => $supplier_product];
    }
    return ['woo_id' => $woo_id];

    $supplier_key = 'wps';
    $supplier = \CIStore\Suppliers\get_supplier($supplier_key);
    return $supplier->patch_products_page();
}
