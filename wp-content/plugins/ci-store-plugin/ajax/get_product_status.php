<?php

namespace AjaxHandlers;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';

function get_product_status($params)
{
    $supplier_key = \AjaxManager::get_param('supplier_key');
    $product_id = \AjaxManager::get_param('product_id');

    if (empty($supplier_key)) {
        return ['error' => 'missing supplier'];
    }
    $supplier = \CI\Admin\get_supplier($supplier_key);

    if (!isset($supplier)) {
        return ['error' => 'invalid supplier'];
    }

    $data = [];
    $data['needs_update'] = false;
    $data['needs_update_reasons'] = [];
    $data['supplier'] = [];
    $data['woo'] = [];
    // $data['product'] = [];
    // $data['supplier_key'] = $supplier_key;
    // $data['product_id'] = $product_id;
    $data['supplier']['id'] = $product_id;
    $data['supplier']['provider'] = $supplier->name;
    $data['supplier']['stock_status'] = $supplier->get_stock_status($product_id);
    $data['supplier']['import_version'] = $supplier->import_version;
    $data['woo']['id'] = '';
    $data['woo']['stock_status'] = 'notfound';
    $data['woo']['import_version'] = '0.0';
    // $data['woo_product_exists'] = false;
    // $data['check_is_available'] = $supplier->check_is_available($product_id);
    $supplier_product = $supplier->get_product($product_id);
    $supplier_variations = [];
    $woo_variations = [];
    ci_error_log(['test' => $supplier_product]);

    if ($supplier_product) {
        // $data['product']['name'] = $supplier->extract_product_name($supplier_product);
        $data['supplier']['name'] = $supplier->extract_product_name($supplier_product);
        // $data['is_available'] = $supplier->is_available($supplier_product);
        // $data['product']['variations'] = count($supplier->extract_variations($supplier_product));
        $supplier_variations = $supplier->extract_variations($supplier_product);
        $data['supplier']['variations'] = count($supplier_variations);
        $data['supplier']['updated'] = date('Y-m-d H:i:s', $supplier->extract_product_updated($supplier_product));
        // $data['supplier_product_exists'] = true;
        $data['is_stale'] = $supplier->is_stale($supplier_product);
        $sku = $supplier->get_product_sku($product_id);
        $data['woo']['sku'] = $sku;
        $woo_id = $supplier->get_woo_id($product_id);

        // $data['woo_product_exists'] = (bool) $woo_id;
        if ($woo_id) {
            $data['woo']['id'] = $woo_id;
            $woo_product = $supplier->get_woo_product($product_id);
            if ($woo_product) {
                $cleaned = \WooTools::cleanup_variations($woo_id);
                $data['woo']['cleaned'] = $cleaned;
                $data['woo']['name'] = $woo_product->get_name();
                $data['woo']['type'] = $woo_product->get_type();
                $data['woo']['stock_status'] = $woo_product->get_stock_status();
                // $woo_variations = $woo_product->get_children();
                $woo_variations = \WooTools::get_variations($woo_product, 'edit');

                $data['test'] = [];
                foreach ($woo_variations as $variation) {
                    if (empty($variation['sku'])) {
                        $data['test'][] = $variation;
                    }
                }

                $data['woo']['variations_raw'] = $woo_variations;
                $data['woo']['variations'] = count($woo_variations);
                $data['woo']['updated'] = date('Y-m-d H:i:s', strtotime($woo_product->get_date_modified()));
                $data['woo']['import_version'] = $woo_product->get_meta('_ci_import_version', true);
            }
        }
    } else {
        $woo_id = $supplier->get_woo_id($product_id);
        if ($woo_id) {
            $data['needs_update_reasons'][] = 'Delete Woo product';
            $data['needs_update'] = true;
        }
    }

    $woo_skus = array_column($woo_variations, 'sku');
    $supplier_skus = array_column($supplier_variations, 'sku');
    $deletes = array_values(array_diff($woo_skus, $supplier_skus));
    $inserts = array_values(array_diff($supplier_skus, $woo_skus));
    $updates = array_values(array_diff($woo_skus, $deletes, $inserts));

    $data['supplier_skus'] = $supplier_skus;
    $data['woo_skus'] = $woo_skus;

    if (count($deletes)) {
        $data['needs_update_reasons'][] = 'Delete ' . count($deletes) . ' Variations';
        $data['needs_update'] = true;
    }
    if (count($inserts)) {
        $data['needs_update_reasons'][] = 'Insert ' . count($inserts) . ' Variations';
        $data['needs_update'] = true;
    }
    if (count($updates)) {
        $data['needs_update_reasons'][] = '(Maybe) Update ' . count($updates) . ' Variations';
        $data['needs_update'] = true;
    }

    return $data;
}