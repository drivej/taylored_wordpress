<?php

namespace CIStore\Ajax;

include_once CI_STORE_PLUGIN . 'utils/WooTools.php';
include_once CI_STORE_PLUGIN . 'suppliers/Suppliers.php';

function test_action()
{
    $result = [];

    // $variation_id = 192138;
    // $variation = wc_get_product($variation_id);
    // $result['woo_sku'] = $variation->get_sku();
    // $result['supplier_sku'] = $variation->get_meta('_ci_product_sku');

    // return $result;

    // $sku = 'MASTER_WPS_369438';
    // $woo_id = wc_get_product_id_by_sku($sku);
    // $result['woo_id'] = $woo_id;
    // $result['sku'] = $sku;

    // if ($woo_id) {
    //     $woo_product = wc_get_product($woo_id);
    //     $result['woo_sku'] = $woo_product->get_sku();
    //     $result['meta_sku'] = $woo_product->get_meta('_sku', true, 'edit');
    //     return $result;

    //     $product_type = $woo_product->get_type();
    //     $supplier = \WooTools::get_product_supplier($woo_product);
    //     $supplier_product_id = $woo_product->get_meta('_ci_product_id');
    //     $supplier_product = $supplier->get_product($supplier_product_id);
    //     $supplier_sku_key = '_ci_product_sku';
    //     $current_sku = $woo_product->get_meta($supplier_sku_key, true);

    //     if (empty($current_sku)) {
    //         $supplier_sku = $supplier_product['data']['items']['data'][0]['sku'] ?? '';
    //         if ($supplier_sku) {
    //             $woo_product->update_meta_data($supplier_sku_key, $supplier_sku);
    //             $woo_product->save();
    //         }
    //     }
    //     $woo_meta = $woo_product->get_meta_data();

    //     // return ['woo_id' => $woo_id, 'type' => $product_type, 'meta' => $woo_meta, 'supplier_sku' => $supplier_sku, 'supplier_product' => $supplier_product];
    // }
    // // return ['woo_id' => $woo_id];

    // $supplier_key = 'wps';
    // $supplier = \CIStore\Suppliers\get_supplier($supplier_key);
    // return $supplier->patch_products_page();

    // $term_names = ["Piston kits & Components"];
    // $terms = get_terms(['name' => $term_names, 'taxonomy' => 'product_cat', 'hide_empty' => false]);
    // $lookup_terms = array_column($terms, 'term_id', 'name');

    // foreach ($lookup_terms as $term_name => $term_id) {
    //     $sanitized_term_name = esc_html($term_name);
    //     if ($sanitized_term_name !== $term_name) {
    //         $lookup_terms[$sanitized_term_name] = $term_id;
    //     }
    //     $decoded_term_name = wp_specialchars_decode($term_name);
    //     if ($decoded_term_name !== $term_name) {
    //         $lookup_terms[$decoded_term_name] = $term_id;
    //     }
    // }

    // return $lookup_terms;

    $supplier_key = 'wps';
    $supplier = \CIStore\Suppliers\get_supplier($supplier_key);

    // $product_ids = [20909, 21077, 21099, 21138, 21153, 21163, 21167, 21169, 21203, 21207, 21215, 21217, 21226, 21228, 21233, 21234, 21235, 21236, 21241, 21242, 21249, 21256, 21260, 21264, 21276, 21284, 21299, 21300, 21309, 21319, 21355, 21381, 21385, 21387, 21389, 21391, 21393, 21411, 21412, 21416, 21455, 21456, 21479, 21499, 21508, 21514, 21524, 21525];
    // $products = [];
    // foreach ($product_ids as $product_id) {
    //     $products[] = $supplier->get_product($product_id);
    // }
    // $result = $products;

    $supplier_product_id = 221936;
    $woo_sku = $supplier->get_product_sku($supplier_product_id);
    $woo_id = wc_get_product_id_by_sku($woo_sku);

    if ($woo_id) {
        $woo_product = $supplier->get_woo_product($supplier_product_id);
        $woo_product->delete(true);
        $result['data'] = $woo_product->get_data();
    }

    $result['supplier_product_id'] = $supplier_product_id;
    $result['woo_sku'] = $woo_sku;
    $result['woo_id'] = $woo_id;

    // $result = $supplier->import_product($product_id);

    // $cursor = 'JqKPYxrzMNDv';
    // $result = $supplier->import_products_page($cursor, '2023-01-01');

    return $result;
}
