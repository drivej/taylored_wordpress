<?php

namespace CIStore\Ajax;

include_once CI_STORE_PLUGIN . 'utils/WooTools.php';
include_once CI_STORE_PLUGIN . 'suppliers/Suppliers.php';

function test_action()
{
    $result = [];

    $variation_id = 192138;
    $variation = wc_get_product($variation_id);
    $result['woo_sku'] = $variation->get_sku();
    $result['supplier_sku'] = $variation->get_meta('_ci_product_sku');

    return $result;

    $sku = 'MASTER_WPS_369438';
    $woo_id = wc_get_product_id_by_sku($sku);
    $result['woo_id'] = $woo_id;
    $result['sku'] = $sku;

    if ($woo_id) {
        $woo_product = wc_get_product($woo_id);
        $result['woo_sku'] = $woo_product->get_sku();
        $result['meta_sku'] = $woo_product->get_meta('_sku', true, 'edit');
        return $result;

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

        // return ['woo_id' => $woo_id, 'type' => $product_type, 'meta' => $woo_meta, 'supplier_sku' => $supplier_sku, 'supplier_product' => $supplier_product];
    }
    // return ['woo_id' => $woo_id];
    return $result;

    $supplier_key = 'wps';
    $supplier = \CIStore\Suppliers\get_supplier($supplier_key);
    return $supplier->patch_products_page();
}
