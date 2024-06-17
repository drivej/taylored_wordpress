<?php

namespace AjaxHandlers;

use Exception;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';

function update_woo_product($params)
{
    try {
        $woo_product_id = \AjaxManager::get_param('woo_product_id', null, $params);
        $start_time = microtime(true);
        $product = wc_get_product_object('variable', $woo_product_id);
        $output = ['woo_product_id' => $woo_product_id, 'updated' => false];
        if ($product) {
            try {
                if ($product->meta_exists('_ci_supplier_key') && $product->meta_exists('_ci_product_id')) {
                    $supplier_key = $product->get_meta('_ci_supplier_key');
                    $supplier_product_id = $product->get_meta('_ci_product_id');
                    $output['supplier_product_id'] = $supplier_product_id;
                    $output['supplier_key'] = $supplier_key;
                    $supplier = \CI\Admin\get_supplier($supplier_key);
                    // $supplier_product = $supplier->get_product_light($supplier_product_id);
                    if ($supplier) {
                        $output['result'] = $supplier->update_product($supplier_product_id);
                        $output['updated'] = true;

                        // $is_available = $supplier->is_available($supplier_product);
                        // $output['is_available'] = $is_available;
                        // if (!$is_available) {
                        //     $output['deleted'] = $supplier->delete_product($supplier_product_id, false);
                        // }
                    }
                }
            } catch (Exception $e) {
                $output['error'] = $e;
            }
        } else {
            $output['invalid'] = true;
        }
        $end_time = microtime(true);
        $exetime = $end_time - $start_time;
        $output['exetime'] = $exetime;
        return $output;
    } catch (Exception $e) {
        return $e;
    }
}
