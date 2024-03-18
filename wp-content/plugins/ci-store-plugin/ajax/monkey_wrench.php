<?php

namespace AjaxHandlers;

require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Report.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/western/western_utils.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/western/update_product_attributes.php';

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

function update_variation_props($variation, $supplier_variation, $report = new \Report())
{
    // we assume that the sku, parent_id are set - this is for fast updates
    $variation->set_status('publish');
    $variation->set_stock_status('instock');
    $variation->set_regular_price($supplier_variation['list_price']);
    $variation->set_attributes($supplier_variation['attributes']);
}

function populate_variation($variation, $supplier_variation, $parent_id, $report = new \Report())
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

function supplier_variation_to_object($supplier_variation, $parent_id, $report = new \Report())
{
    // $report->addLog('wps_item_to_variation_object()');
    $variation = new \WC_Product_Variation();

    $success = populate_variation($variation, $supplier_variation, $parent_id, $report);

    // try {
    //     // this explodes if another product exists with the same sku
    //     $variation->set_sku($supplier_variation['sku']);
    // } catch (\Exception $e) {
    //     $report->addLog('set_sku failed sku=' . $supplier_variation['sku']);
    //     return null;
    // }

    // $variation->set_parent_id($parent_id);
    // $variation->set_status('publish');
    // $variation->set_stock_status('instock');
    // $variation->set_regular_price($supplier_variation['list_price']);
    // foreach ($supplier_variation['meta_data'] as $meta) {
    //     $variation->update_meta_data($meta['key'], $meta['value']);
    // }
    // $variation->set_attributes($supplier_variation['attributes']);

    // $report->addLog('Create variation for parent ' . $parent_id . ' ' . ($success ? 'Success' : 'Failed'));

    return $success ? $variation : null;
    // return $actions;

}

function monkey_wrench($params)
{
    $report = new \Report();
    $info = [];
    $errors = [];
    $actions = [];
    $saved = false;
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
    if (empty($custom)) {
        return 'That wasn\'t so productive';
    }

    if ($custom === 'get_update_action') {
        $update_action = $supplier->get_update_action($supplier_product);
        // $woo_import_version = $woo_product ? $woo_product->get_meta('_ci_import_version') : '';
        // $woo_updated_str = 'red'; //get_post_meta($woo_product_id, '_ci_import_version', true);
        // $woo_updated = date('Y-m-d H:i:s', strtotime($woo_product->get_date_modified()));

        // $date_imported_str = $woo_product->get_meta('_ci_import_timestamp');
        // $woo_updated = ''; //new \DateTime($woo_updated_str || '2000-01-01 12:00:00');

        return [
            // 'params' => $params,
            'update_action' => $update_action,
            // 'woo_import_version' => $woo_import_version,
            // 'woo_updated_str' => $woo_updated_str,
            // 'woo_updated' => $woo_updated
        ];
    }

    if ($custom === 'update_product_attributes') {
        $b = array_map(fn($a) => $a->get_data(), $woo_product->get_attributes('edit'));
        update_product_attributes($woo_product, $supplier_product, $report);
        $a = array_map(fn($a) => $a->get_data(), $woo_product->get_attributes('edit'));
        return ['before' => $b, 'after' => $a, 'report' => $report];
    }

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
        \WooTools::fix_variations($supplier_variations, $woo_product_id, $report);
        return ['report' => $report];
    }

    if ($custom === 'sync') {
        // do_sync_variations($woo_product, $supplier_variations, $report = new \Report());
        \WooTools::sync_variations($woo_product, $supplier_variations, $report = new \Report(), true);
        return ['report' => $report];
    }

    if ($custom === 'mock') {
        \WooTools::sync_variations($woo_product, $supplier_variations, $report = new \Report(), false);
        // foreach ($supplier_variations as $supplier_variation) {
        //     $variation = supplier_variation_to_object($supplier_variation, $woo_product_id, $report);
        // }
        return ['report' => $report];
    }

    // if ($custom === 'update') {

    //     foreach ($supplier_variations as $supplier_variation) {
    //         $variation = supplier_variation_to_object($supplier_variation, $woo_product_id, $report);
    //         $variation_sku = $variation->get_sku('edit');

    //         try {
    //             $saved = $variation->save();
    //             $report->addLog($variation_sku . ' save success??');
    //         } catch (\Exception $e) {
    //             $saved = false;
    //             $report->addLog($variation_sku . ' save failed' . $e);
    //         }
    //     }
    //     return ['report' => $report];
    // }

    // $woo_variations = \WooTools::get_variations($woo_product, 'edit');

    // foreach($woo_children as $i=>$woo_variation_id){
    //     $variation = new \WC_Product_Variation($woo_variation_id);
    //     $actions[] = $variation->get_data();
    //     $attributes = $variation->get_attributes();
    //     $actions[] = 'related sku '.$supplier_variations[$i]['sku'];

    //     foreach($attributes as $attr_slug=>$attr_value){
    //         $actions[] = 'test '.$attr_slug.'='.$attr_value;
    //     }

    //     foreach($supplier_variations as $supplier_variation){
    //         $actions[] = ['supp_att'=>$supplier_variation];
    //     }
    // }

    // return ['woo_children' => $woo_children, 'actions'=>$actions];

    // $lookup_woo_variation_by_sku = [];

    // if ($woo_product) {
    //     // $woo_product->get_children();
    //     $woo_variations = \WooTools::get_variations($woo_product, 'edit');
    //     foreach ($woo_variations as $woo_variation) {
    //         $lookup_woo_variation_by_sku[$woo_variation['sku']] = $woo_variation;
    //     }
    // }

    // return ['lookup_woo_variation_by_sku' => $lookup_woo_variation_by_sku, 'cleaned' => $cleaned];

    // get lookup os woo skus to check if they exist or not

    foreach ($supplier_variations as $supplier_variation) {
        $variation_sku = $supplier_variation['sku'];

        $variation_id = wc_get_product_id_by_sku($variation_sku);
        $actions[] = $variation_sku . ' id=' . $variation_id;

        // $variation_exists = array_key_exists($variation_sku, $lookup_woo_variation_by_sku);
        // $variation_exists = sku_exists($variation_sku);
        // $info[$variation_sku] = ['exists' => $variation_exists];
        // $actions[] = 'sku $variation_exists=' . ($variation_exists ? 'Yes' : 'No');
        $variation = null;

        if ($variation_id) {

            $variation = new \WC_Product_Variation($variation_id);
            $actions[] = $variation_sku . ' get_sku=' . $variation->get_sku();
            $actions[] = $variation_sku . ' get_attributes=' . json_encode($variation->get_attributes(), JSON_PRETTY_PRINT);

            // $variation->set_attributes(['__required_attr'=>1]);
            // $variation->save();
            continue;
            // continue;
            // $variations = wc_get_products(['sku' => $variation_sku]);
            // // $variations = $query->get_products();
            // $variation = reset($variations);
            // $actions[] = 'update sku ' . $variation_sku;
            // continue;
            // $info[$variation_sku]['action'] = $variations;

            // $info[$variation->get_id()] = $variation;

            // $variation_id = wc_get_product_id_by_sku($variation_sku);
            // if ($variation_id) {
            //     $variation = wc_get_product($variation_id);
            // }
            $variation = new \WC_Product_Variation($variation_id);
            if ($variation) {
                $actions[] = $variation_sku . ' pulled variation sku ' . $variation_sku;
            } else {
                $actions[] = $variation_sku . ' failed pulled variation sku ' . $variation_sku;
                continue;
            }
        } else {
            $variation = new \WC_Product_Variation();
            $variation->set_parent_id($woo_product_id);
            try {
                // Attempt to set the SKU
                $variation->set_sku($supplier_variation['sku']);
            } catch (\Exception $e) {
                $actions[] = $variation_sku . ' Could not set_sku of ' . $supplier_variation['sku'] . $e;
                // Handle the exception
                // echo 'Error setting SKU: ' . $e->getMessage();
                // continue;
            }
            $actions[] = 'insert sku ' . $variation_sku;
        }
        continue;

        // $variation = new \WC_Product_Variation();
        $variation->set_status('publish');
        $variation->set_stock_status('instock');
        $variation->set_regular_price($supplier_variation['list_price']);
        $variation->update_meta_data('_ci_supplier_key', 'wps');
        $variation->update_meta_data('_ci_product_id', $supplier_variation['id']);
        $variation->update_meta_data('_ci_supplier_sku', isset($supplier_variation['supplier_sku']) ? $supplier_variation['supplier_sku'] : '');
        $variation->update_meta_data('_ci_additional_images', serialize($supplier_variation['images']));
        $variation->update_meta_data('_ci_import_version', $supplier_variation['import_version']);
        $variation->update_meta_data('_ci_import_timestamp', gmdate("c"));

        $attributes = [];
        foreach ($supplier_variation['attributes'] as $attr_name => $attr_value) {
            // $actions[] = ['attr_name'=>$attr_name, 'attr_variation'=>$attr_value];
            $attr = new \WC_Product_Attribute();
            $attr->set_id(0);
            $attr->set_name($attr_name);
            $attr->set_visible(true);
            $attr->is_taxonomy(true);
            $attr->set_options([$attr_value]);
            $attr->set_variation(true);
            // $attributes[] = $attr;
            $attributes[$attr_name] = $attr_value;
        }
        // $actions[] = [$variation_sku.'_attributes'=>$attributes];

        // continue;
        try {
            // Attempt to set the SKU
            $variation->set_attributes($attributes);
            $actions[] = $variation_sku . ' set_attributes success ' . $supplier_variation['sku'];
            // continue;
        } catch (\Exception $e) {
            $actions[] = $variation_sku . ' set_attributes failed ' . $supplier_variation['sku'] . $e;
            // $actions[] = $attributes;
            // Handle the exception
            // echo 'Error setting SKU: ' . $e->getMessage();
            // continue;
        }
        // continue;

        try {
            // $saved = $variation->save();
            $actions[] = $variation_sku . ' save success??';
        } catch (\Exception $e) {
            $saved = false;
            $actions[] = $variation_sku . ' save failed' . $e;
            // $actions[] = $attributes;
            // Handle the exception
            // echo 'Error setting SKU: ' . $e->getMessage();
            // continue;
        }
        $actions[] = $variation_sku . ' saved ' . ($saved ? 'saved' : 'not saved');

        break;
    }

    return [
        // 'cleaned' => $cleaned,
        'woo_product_id' => $woo_product_id,
        'woo_children' => $woo_children,
        'actions' => $actions,
        'errors' => $errors,
        'info' => $info,
        'woo_variations' => $woo_variations,
        // 'lookup_woo_variation_by_sku' => $lookup_woo_variation_by_sku,
        'master_attributes' => $master_attributes,
        'supplier_key' => $supplier_key,
        'supplier_product_id' => $supplier_product_id,
        'supplier_variations' => count($supplier_variations),
        'saved' => $saved,
    ];
    //
    //
    //
    //
    //
    $report = new \Report();
    $wps_product_id = 326440; //26;
    $supplier = \CI\Admin\get_supplier('wps');
    $supplier_product = $supplier->get_product($wps_product_id);
    $sku = $supplier->get_product_sku($wps_product_id);
    $woo_product_id = wc_get_product_id_by_sku($sku);
    $woo_product = wc_get_product_object('variable', $woo_product_id);

    // $placeholder_id = 180499;
    // set_post_thumbnail($woo_product_id, $placeholder_id);

    // $existing_gallery_image_ids = get_post_meta($woo_product_id, '_product_image_gallery', true);

    // $woo_product->set_width();

    $dimensions = $woo_product->get_dimensions();
    return ['d' => $dimensions];

    // return ['existing_gallery_image_ids' => $existing_gallery_image_ids];
    /////
    $wps_product_id = 326440; //26;
    $report = new \Report();

    $supplier = \CI\Admin\get_supplier('wps');

    $sku = $supplier->get_product_sku($wps_product_id);
    $supplier_product = $supplier->get_product($wps_product_id);

    $imgs = get_additional_images($supplier_product);
    $imgs = get_all_images($supplier_product);
    return ['imgs' => $imgs];

    $valid_items = array_filter($supplier_product['data']['items']['data'], 'isValidItem');
    $variations = [];

    foreach ($valid_items as $item) {
        $variation = [];
        $variation['sku'] = $supplier->get_variation_sku($supplier_product['data']['id'], $item['id']);
        $variation['images'] = get_item_images($item);
        $variations[] = $variation;
    }

    return ['variations' => $variations];

    /////

    $woo_product_id = wc_get_product_id_by_sku($sku);
    $woo_product = wc_get_product_object('variable', $woo_product_id);
    $supplier_variations = $supplier->extract_variations($supplier_product);
    \WooTools::sync_variations($woo_product, $supplier_variations, $report);
    // get_western_attributes_from_product( $supplier_product)
    return ['report' => $report];
}

// get_western_attributes_from_product
