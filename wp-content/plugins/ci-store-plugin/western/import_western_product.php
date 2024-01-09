<?php

require_once __DIR__ . './../log/write_to_log_file.php';
require_once __DIR__ . './../western/get_western_products_page.php';
require_once __DIR__ . './../western/get_western_product.php';
require_once __DIR__ . './../western/western_utils.php';
require_once __DIR__ . './../western/wps_settings.php';
require_once __DIR__ . '/update_product_attributes.php';
require_once __DIR__ . './../utils/Report.php';

/**
 *
 * @param int    $wps_product_id
 * @param bool   $force_update
 * @param Report $report
 */
function import_western_product($wps_product_id, $force_update = false, $report = new Report())
{
    $start_time = microtime(true);
    $action = '';
    $product_id = '';
    $sku = '';

    // try {
    $wps_product = get_western_product($wps_product_id);
    $report->addData('wps_product_id', $wps_product_id);

    if (isset($wps_product['error'])) {
        $action = 'error';
    } else {
        $sku = get_western_sku($wps_product);
        $product_id = wc_get_product_id_by_sku($sku);
        $report->addData('product_sku', $sku);
        $report->addData('product_id', $product_id);
        $is_valid = isValidProduct($wps_product['data']);

        if ($is_valid) {
            if ($product_id) {
                $product = wc_get_product_object('product', $product_id);
                $needs_update = $force_update === true || product_needs_update($product, $wps_product);
                if ($needs_update) {
                    $action = 'update';
                } else {
                    $action = 'ignore';
                }
            } else {
                $action = 'insert';
            }
        } else {
            if ($product_id) {
                $action = 'delete';
            } else {
                $action = 'ignore';
            }
        }
    }

    // write_to_log_file("import_western_product() " . json_encode(['action' => $action, "wps_product_id" => $wps_product_id, "product_id" => $product_id]));

    switch ($action) {
        case 'insert':
            $product_id = insert_western_product($wps_product, $report);
            break;
        case 'update':
            update_western_product($wps_product, $product_id, $report);
            break;
        case 'delete':
            delete_product($product_id, $report);
            break;
        case 'ignore':
        case 'error':
        default:
    }

    $report->addData('action', $action);
    $report->addData('product_id', $product_id);

    // } catch (Exception $e) {
    //     write_to_log_file("ERROR! import_western_product() " . json_encode(["wps_product_id" => $wps_product_id, 'e'=>$e]));
    // }
    $end_time = microtime(true);
    $time_taken = $end_time - $start_time;
    write_to_log_file('import_western_product()' . json_encode(['wps_product_id' => $wps_product_id, 'action' => $action, 'time' => $time_taken]));
    // return $report; //['wps_product_id' => $wps_product_id, 'product_id' => $product_id, 'action' => $action, 'sku' => $sku];
}
/**
 *
 * @param WC_Product   $woo_product
 * @param array    $wps_product
 */
function product_needs_update($woo_product, $wps_product)
{
    global $WPS_SETTINGS;
    $needs_update = false;
    $import_version = $woo_product->get_meta('_ci_import_version');
    // update if import version changes
    if ($import_version != $WPS_SETTINGS['import_version']) {
        $needs_update = true;
    }
    $imported = $woo_product->get_meta('_ci_import_timestamp');
    $date_imported = new DateTime($imported ? $imported : '2000-01-01 12:00:00');
    $updated = $wps_product['data']['updated_at'];
    $date_updated = new DateTime($updated);
    // update if imported before last remote update
    if ($date_imported < $date_updated) {
        $needs_update = true;
    }
    return $needs_update;
}
/**
 *
 * @param array    $wps_product
 * @param Report   $report
 */
function insert_western_product($wps_product, $report = new Report())
{
    global $WPS_SETTINGS;
    $product = new WC_Product_Variable();
    $item = $wps_product['data']['items']['data'][0];
    $sku = get_western_sku($wps_product);
    $product->set_sku($sku);
    $product->set_name($wps_product['data']['name']);
    $product->set_status('publish');
    $product->set_regular_price($item['list_price']);
    $product->update_meta_data('_stock_status', wc_clean('instock'));
    $product->update_meta_data('_ci_supplier_key', 'wps');
    $product->update_meta_data('_ci_product_id', $wps_product['data']['id']);
    $product->update_meta_data('_ci_supplier_key', 'wps');
    $product->update_meta_data('_ci_additional_images', get_additional_images($wps_product));
    $product->update_meta_data('_ci_import_version', $WPS_SETTINGS['import_version']);
    $product->update_meta_data('_ci_import_timestamp', gmdate("c"));
    $product_id = $product->save();
    update_product_attributes($product, $wps_product, $report);
    if ($report->getData('attribute_changes')) {
        $product->save();
    }
    update_product_variations($product, $wps_product, $report);
    // update_western_product($wps_product, $product_id, $report);
    $report->addLog('insert_western_product() sku:' . $sku . ' id: ' . $product_id);
    return $product_id;
}

function update_western_product($wps_product, $product_id, $report = new Report())
{
    $report->addLog('update_western_product()');
    $product = wc_get_product_object('product', $product_id);
    $has_variations = count($wps_product['data']['items']['data']) > 0;
    $is_variable = $product->is_type('variable');
    $report->addData('type', $product->get_type());

    // if ($has_variations && !$is_variable) {
    // $report->addLog('failed');
    // delete_product($product_id);
    // insert_western_product($wps_product, $report);
    // } else {
    update_product_attributes($product, $wps_product, $report);
    update_product_variations($product, $wps_product, $report);
    // }
    return $product_id;
}

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

    // $av = $product->get_available_variations();

    $lookup_item_by_sku = array_reduce($wps_product['data']['items']['data'], fn($c, $item) => [...$c, get_western_variation_sku($wps_product, $item) => $item], []);
    $current_skus = array_keys($lookup_variation_by_sku);
    $allow_skus = array_keys($lookup_item_by_sku);
    $report->addData('current_skus', $current_skus);
    $report->addData('allow_skus', $allow_skus);
    $report->addData('product_children', $product_children);
    // $report->addData('av', $av);

    $deletes = array_diff($current_skus, $allow_skus);
    $inserts = array_diff($allow_skus, $current_skus);
    $updates = array_intersect($allow_skus, $current_skus);

    foreach ($updates as $variation_sku) {
        $item = $lookup_item_by_sku[$variation_sku];
        $report->addLog($variation_sku);
        $variation = $lookup_variation_by_sku[$variation_sku];
        $report->addData($variation_sku, $variation);
        $_ci_import_version = $variation->get_meta('_ci_import_version');
        $report->addData($_ci_import_version, $_ci_import_version);
        $needs_update = variation_needs_update($variation, $item);
        $report->addLog($variation->get_sku() . ' needs update ' . $needs_update);
    }

    // delete invalid variations
    foreach ($deletes as $variation_sku) {
        $variation = $lookup_variation_by_sku[$variation_sku];
        $variation->delete(true);
    }

    // insert new variations
    foreach ($inserts as $variation_sku) {
        $item = $lookup_item_by_sku[$variation_sku];
        // maybe orphaned variation exists
        $variation_id = wc_get_product_id_by_sku($variation_sku);
        $variation = $variation_id ? wc_get_product($variation_id) : new WC_Product_Variation();
        $variation->set_parent_id($product_id);
        $variation->set_sku($variation_sku);
        $variation->set_name($item['name']);
        $variation->set_status('publish');
        $variation->set_regular_price($item['list_price']);
        $variation->update_meta_data('_stock_status', wc_clean('instock'));
        $variation->update_meta_data('_ci_supplier_key', 'wps');
        $variation->update_meta_data('_ci_product_id', $item['id']);
        $variation->update_meta_data('_ci_supplier_key', 'wps');
        $variation->update_meta_data('_ci_additional_images', get_item_images($item));
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
            $variation->update_meta_data('_stock_status', wc_clean('instock'));
            $variation->update_meta_data('_ci_supplier_key', 'wps');
            $variation->update_meta_data('_ci_product_id', $item['id']);
            $variation->update_meta_data('_ci_supplier_key', 'wps');
            $variation->update_meta_data('_ci_additional_images', get_item_images($item));
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
        } else {
            unset($updates[$key]);
        }
    }

    $report->addData('variation_inserts', $inserts);
    $report->addData('variation_updates', $updates);
    $report->addData('variation_deletes', $deletes);
}

function delete_product($product_id)
{
    $result = wp_delete_post($product_id, true);
    if ($result === false) {
        write_to_log_file("ERROR! delete_product() " . json_encode(["product_id" => $product_id]));
    }
}

function get_item_images($item)
{
    if (count($item['images']['data'])) {
        return array_map('build_western_image', $item['images']['data']);
    }
    return null;
}

function get_additional_images($wps_product)
{
    $images = array_map('process_images', $wps_product['data']['items']['data']);
    $images = array_filter($images, 'filter_images');
    return implode(',', $images);
}

function process_images($item)
{
    if (count($item['images']['data'])) {
        return build_western_image($item['images']['data'][0]);
    }
    return null;
}

function filter_images($image)
{
    return isset($image);
}
