<?php

require_once __DIR__ . './../log/write_to_log_file.php';

function variation_needs_update($woo_variation, $wps_item)
{
    global $WPS_SETTINGS;
    $needs_update = false;
    $import_version = $woo_variation->get_meta('_ci_import_version');
    // update if import version changes
    if ($import_version != $WPS_SETTINGS['import_version']) {
        $needs_update = true;
    }
    $imported = $woo_variation->get_meta('_ci_import_timestamp');
    $date_imported = new DateTime($imported ? $imported : '2000-01-01 12:00:00');
    $updated = $wps_item['updated_at'];
    $date_updated = new DateTime($updated);
    // update if imported before last remote update
    if ($date_imported < $date_updated) {
        $needs_update = true;
    }
    return $needs_update;
}
/**
 *
 * @param WC_Product    $product
 * @param array    $wps_product
 * @param Report   $report
 */
function update_product_variations($product, $wps_product, $report)
{
    $report->addLog('update_product_variations()');
    global $WPS_SETTINGS;
    $product_id = $product->get_id();
    $product_attributes = $product->get_attributes();
    $product_attribute_lookup = array_reduce(array_keys($product_attributes), fn($c, $v) => [$product_attributes[$v]->get_name() => [...$product_attributes[$v]->get_data(), 'key' => $v], ...$c], []);
    $product_children = $product->get_children();
    $lookup_variation_by_sku = array_reduce($product_children, function ($c, $variation_id) {
        $variation = wc_get_product($variation_id);
        $c[$variation->get_sku()] = $variation;
        return $c;
    }, []);

    $product_type = $product->get_type();
    $report->addData('product_type', $product_type);

    $valid_items = array_filter($wps_product['data']['items']['data'], 'isValidItem');
    $lookup_item_by_sku = array_reduce($valid_items, fn($c, $item) => [...$c, get_western_variation_sku($wps_product, $item) => $item], []);
    $current_skus = array_keys($lookup_variation_by_sku);
    $allow_skus = array_keys($lookup_item_by_sku);
    $report->addData('current_skus', $current_skus);
    $report->addData('allow_skus', $allow_skus);
    $report->addData('product_children', $product_children);

    $deletes = array_diff($current_skus, $allow_skus);
    $inserts = array_diff($allow_skus, $current_skus);
    $updates = array_intersect($allow_skus, $current_skus);

    // foreach ($updates as $variation_sku) {
    //     $item = $lookup_item_by_sku[$variation_sku];
    //     $report->addLog($variation_sku);
    //     $variation = $lookup_variation_by_sku[$variation_sku];
    //     $report->addData($variation_sku, $variation);
    //     $_ci_import_version = $variation->get_meta('_ci_import_version');
    //     $report->addData($_ci_import_version, $_ci_import_version);
    //     $needs_update = variation_needs_update($variation, $item);
    //     $report->addLog($variation->get_sku() . ' needs update ' . $needs_update);
    // }

    // delete invalid variations
    foreach ($deletes as $variation_sku) {
        $variation = $lookup_variation_by_sku[$variation_sku];
        $variation->delete(true);
        $report->addLog('delete variations ' . $variation_sku);
    }

    // insert new variations
    foreach ($inserts as $variation_sku) {
        $item = $lookup_item_by_sku[$variation_sku];
        // maybe orphaned variation exists
        $variation_id = wc_get_product_id_by_sku($variation_sku);
        if ($variation_id) {
            // variation exists - maybe orphaned?
            $variation = wc_get_product($variation_id);
            // Note: setting the sku of an existing variation causes issues - I think
            $report->addLog('variations ' . $variation_sku . ' already exists WTH?');
            write_to_log_file('variations ' . $variation_sku . ' already exists WTH? parent=' . $variation->get_parent_id() . ' this pid=' . $product_id);
        } else {
            // create variation
            $variation = new WC_Product_Variation();
            $variation->set_parent_id($product_id);
            $variation->set_sku($variation_sku);
        }
        $variation->set_name($item['name']);
        $variation->set_status('publish');
        $variation->set_regular_price($item['list_price']);
        $variation->set_stock_status('instock');
        $variation->update_meta_data('_ci_supplier_key', 'wps');
        $variation->update_meta_data('_ci_product_id', $item['id']);
        $variation->update_meta_data('_ci_supplier_key', 'wps');
        $variation->update_meta_data('_ci_additional_images', serialize(get_item_images($item)));
        $variation->update_meta_data('_ci_import_version', $WPS_SETTINGS['import_version']);
        $variation->update_meta_data('_ci_import_timestamp', gmdate("c"));
        $variation_attributes = [];
        foreach ($item['attributevalues']['data'] as $attr_value) {
            $attr_key_id = $attr_value['attributekey_id'];
            $attr_name = $wps_product['data']['attributekeys']['data'][$attr_key_id]['name'];
            $attr_val = $attr_value['name'];
            $attr_key = $product_attribute_lookup[$attr_name]['key'];
            $variation_attributes[$attr_key] = $attr_val;
        }
        $variation->set_attributes($variation_attributes);
        $variation->save();
        $report->addLog('insert variations ' . $variation_sku);
    }

    // update existing variations
    foreach ($updates as $key => $variation_sku) {
        $item = $lookup_item_by_sku[$variation_sku];
        $variation = $lookup_variation_by_sku[$variation_sku];
        $needs_update = variation_needs_update($variation, $item);
        if ($needs_update) {
            $variation->set_name($item['name']);
            $variation->set_status('publish');
            $variation->set_regular_price($item['list_price']);
            $variation->set_stock_status('instock');
            $variation->update_meta_data('_ci_supplier_key', 'wps');
            $variation->update_meta_data('_ci_product_id', $item['id']);
            $variation->update_meta_data('_ci_supplier_key', 'wps');
            $variation->update_meta_data('_ci_additional_images', serialize(get_item_images($item)));
            $variation->update_meta_data('_ci_import_version', $WPS_SETTINGS['import_version']);
            $variation->update_meta_data('_ci_import_timestamp', gmdate("c"));
            $variation_attributes = [];
            foreach ($item['attributevalues']['data'] as $attr_value) {
                $attr_key_id = $attr_value['attributekey_id'];
                $attr_name = $wps_product['data']['attributekeys']['data'][$attr_key_id]['name'];
                $attr_val = $attr_value['name'];
                $attr_key = $product_attribute_lookup[$attr_name]['key'];
                $variation_attributes[$attr_key] = $attr_val;
            }
            $variation->set_attributes($variation_attributes);
            $variation->save();
            $report->addLog('update variations ' . $variation_sku);
        } else {
            unset($updates[$key]);
        }
    }

    $report->addData('variation_inserts', $inserts);
    $report->addData('variation_updates', $updates);
    $report->addData('variation_deletes', $deletes);
}
