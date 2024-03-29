<?php

namespace AjaxHandlers;

require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Report.php';

function sku_exists($sku)
{
    $variation = new \WC_Product_Variation();
    try {
        // Attempt to set the SKU
        $variation->set_sku($sku);
    } catch (\Exception $e) {
        return false;
    }
    return true;
}

function update_variation_props($variation, $supplier_variation)
{
    // we assume that the sku, parent_id are set - this is for fast updates
    $variation->set_status('publish');
    $variation->set_stock_status('instock');
    $variation->set_regular_price($supplier_variation['list_price']);
    $variation->set_attributes($supplier_variation['attributes']);
}

function populate_variation($variation, $supplier_variation, $parent_id)
{
    try {
        // this explodes if another product exists with the same sku
        $variation->set_sku($supplier_variation['sku']);
    } catch (\Exception $e) {
        // $report->addLog('set_sku failed sku=' . $supplier_variation['sku']);
        return false;
    }

    $variation->set_parent_id($parent_id);
    $variation->set_status('publish');
    $variation->set_stock_status('instock');
    $variation->set_regular_price($supplier_variation['list_price']);
    foreach ($supplier_variation['meta_data'] as $meta) {
        $variation->update_meta_data($meta['key'], $meta['value']);
    }
    $variation->set_attributes($supplier_variation['attributes']);

    // $report->addLog('Create variation for parent ' . $parent_id);

    return true;
}

function supplier_variation_to_object($supplier_variation, $parent_id)
{
    $variation = new \WC_Product_Variation();
    $success = populate_variation($variation, $supplier_variation, $parent_id);
    return $success ? $variation : null;

}

function monkey_wrench($params)
{
    $report = new \Report();
    $woo_variations = [];
    $supplier_key = \AjaxManager::get_param('supplier_key');
    $supplier_product_id = \AjaxManager::get_param('product_id');
    $custom = \AjaxManager::get_param('custom');
    $supplier = \CI\Admin\get_supplier($supplier_key);
    $supplier_product = $supplier->get_product($supplier_product_id);
    $supplier_variations = $supplier->extract_variations($supplier_product);
    $woo_product_id = $supplier->get_woo_id($supplier_product_id);
    $master_attributes = $supplier->extract_attributes($supplier_product);
    $woo_product = $supplier->get_woo_product($supplier_product_id);

    // $woo_variations = \WooTools::get_variations($woo_product, 'edit');

    // get variations manually to avoid loading all the data at once
    $woo_children = $woo_product ? $woo_product->get_children() : []; // removed get_children with false
    $woo_has_children = count($woo_children);
    //
    // test
    //

    if ($custom === 'wp_get_schedules') {
        return wp_get_schedules();
    }

    if ($custom === 'turn14') {
        $supplier = \CI\Admin\get_supplier('t14');
        $response = $supplier->getAccessToken();
        $brands = $supplier->get_api('/brands');
        return ['token' => $response, 'brands' => $brands];
    }

    if ($custom === 'get_update_action') {
        $update_action = $supplier->get_update_action($supplier_product);
        return ['update_action' => $update_action];
    }

    // if ($custom === 'update_product_attributes') {
        // $b = array_map(fn($a) => $a->get_data(), $woo_product->get_attributes('edit'));
        // update_product_attributes($woo_product, $supplier_product, $report);
        // $a = array_map(fn($a) => $a->get_data(), $woo_product->get_attributes('edit'));
        // return ['before' => $b, 'after' => $a, 'report' => $report];
    // }

    if ($custom === 'fix_attributes') {

        // $a = $woo_product->get_attributes();
        // $r = [];
        // foreach($a as $at){
        //     $r[] = $at->get_data();
        // }
        // return ['a'=>$r];

        $master_attributes = $supplier->extract_attributes($supplier_product);
        $master_slugs = array_column($master_attributes, 'slug');
        $notes = [];

        foreach ($supplier_variations as $i => $variation) {
            $variation_slugs = array_keys($variation['attributes']);

            // check for missing attributes - this is cause my bad data from the 3rd party - nobody's perfect!
            $missing = array_diff($master_slugs, $variation_slugs);
            $supplier_variations[$i]['missing'] = $missing;

            if (count($missing)) {
                $notes[] = $variation['sku'] . 'is missing attributes ' . implode(',', $missing);
                $supplier_variations[$i]['delete'] = true;
                continue;
            }
            // chcek for attributes that don't need to be there
            $deletes = array_diff($variation_slugs, $master_slugs);
            $supplier_variations[$i]['deletes'] = $deletes;

            foreach ($deletes as $attr_slug) {
                $notes[] = $variation['sku'] . ' has extra attributes ' . implode(',', $deletes);
                unset($supplier_variations[$i]['attributes'][$attr_slug]);
            }
        }

        $supplier_variations = array_filter($supplier_variations, fn($v) => $v['delete'] !== true);

        return ['notes' => $notes, 'master_slugs' => $master_slugs, 'supplier_variations' => $supplier_variations];

        $variations = [];
        $woo_variations = \WooTools::get_variations_objects($woo_product);
        foreach ($woo_variations as $woo_variation) {
            $sku = $woo_variation->get_sku();
            $attributes = $woo_variation->get_attributes('edit');
            $variations[$sku] = $attributes;
        }
        // foreach ($supplier_variations as $supplier_variation) {
        //     $woo_variation = \WooTools::supplier_variation_to_object($supplier_variation, $woo_product_id, $report);
        // }

        return ['$master_attributes' => $master_attributes, 'variations' => $variations, 'supplier_variations' => $supplier_variations];
    }
    //
    // clean variations - removes variations with empy SKU
    //
    if ($custom === 'clean') {
        if ($woo_has_children) {
            $cleaned = \WooTools::cleanup_variations($woo_product->get_id());
            $woo_children_after = $woo_product->get_children();
            return ['cleaned' => $cleaned, 'woo_children' => $woo_children, 'woo_children_after' => $woo_children_after];
        } else {
            return 'Nothing to clean';
        }
    }
    //
    // delete all variations
    //
    if ($custom === 'flush') {
        if ($woo_has_children) {
            $delete = \WooTools::delete_variations($woo_product->get_id());
            $woo_children_after = $woo_product->get_children(false);
            return ['delete' => $delete, 'woo_children' => $woo_children, 'woo_children_after' => $woo_children_after];
        } else {
            return 'Nothing to clean';
        }
    }
    //
    // explore the variations data
    //
    if ($custom === 'explore') {
        if (isset($supplier_product['data']['items']['data'])) {
            $action[] = 'Found ' . count($supplier_product['data']['items']['data']) . ' unfiltered supplier children';
        }
        $action[] = 'Found ' . count($supplier_variations) . ' valid supplier children';

        if ($woo_has_children) {
            $action[] = 'Found ' . $woo_has_children . ' woo children';
            $woo_variations = [];

            foreach ($woo_children as $i => $woo_variation_id) {
                $variation = new \WC_Product_Variation($woo_variation_id);
                $woo_variations[] = $variation->get_data();
                $woo_variation_sku = $variation->get_sku('edit');

                if ($woo_variation_sku) {
                    $action[] = 'Variation ' . $woo_variation_id . ' has sku sku=' . $woo_variation_sku;
                } else {
                    $action[] = 'Variation ' . $woo_variation_id . ' has an empty sku sku=' . $woo_variation_sku;
                }
            }
        } else {
            $action[] = 'No woo children found';
        }

        return ['woo_product_id' => $woo_product_id, 'action' => $action];
    }
    //
    // mock up what would happen if we updated
    //
    if ($custom === 'fix') {
        \WooTools::fix_variations($supplier_variations, $woo_product_id);
        return ['fix_variations' => '?'];
    }

    if ($custom === 'sync') {
        \WooTools::sync_variations($woo_product, $supplier_variations);
        return ['report' => '?'];
    }

    return 'That wasn\'t so productive';
}
