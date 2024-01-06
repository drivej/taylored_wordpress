<?php

require_once __DIR__ . './../log/write_to_log_file.php';
require_once __DIR__ . './../western/get_western_products_page.php';
require_once __DIR__ . './../western/get_western_product.php';
require_once __DIR__ . './../western/western_utils.php';
require_once __DIR__ . './../western/wps_settings.php';

function import_western_product($wps_product_id, $force_update = false)
{
    write_to_log_file('START import_western_product()' . json_encode(['wps_product_id' => $wps_product_id]));
    $action = '';
    $product_id = '';
    $sku = '';

    try {
        $wps_product = get_western_product($wps_product_id);

        if (isset($wps_product['error'])) {
            $action = 'error';
        } else {
            $sku = get_western_sku($wps_product);
            $product_id = wc_get_product_id_by_sku($sku);
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
                $product_id = insert_western_product($wps_product);
                break;
            case 'update':
                update_western_product($wps_product, $product_id);
                break;
            case 'delete':
                delete_product($product_id);
                break;
            case 'ignore':
            case 'error':
            default:
        }

    } catch (Exception $e) {
        write_to_log_file("ERROR! import_western_product() " . json_encode(["wps_product_id" => $wps_product_id]));
    }
    write_to_log_file('END import_western_product()' . json_encode(['wps_product_id' => $wps_product_id, 'action' => $action]));
    return ['wps_product_id' => $wps_product_id, 'product_id' => $product_id, 'action' => $action, 'sku' => $sku];
}

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

function insert_western_product($wps_product)
{
    global $WPS_SETTINGS;
    write_to_log_file('START insert_western_product()' . json_encode(['wps_product' => $wps_product['data']['id']]));
    $product = new WC_Product_Variable();
    $sku = get_western_sku($wps_product);
    $product->set_sku($sku);
    $product->set_name($wps_product['data']['name']);
    $product->set_status('publish');
    $product->set_regular_price($wps_product['data']['items']['data'][0]['list_price']);
    $product->update_meta_data('_stock_status', wc_clean('instock'));
    $product->update_meta_data('_ci_supplier_key', 'wps');
    $product->update_meta_data('_ci_product_id', $wps_product['data']['id']);
    $product->update_meta_data('_ci_supplier_key', 'wps');
    $product->update_meta_data('_ci_additional_images', get_additional_images($wps_product));
    $product->update_meta_data('_ci_import_version', $WPS_SETTINGS['import_version']);
    $product->update_meta_data('_ci_import_timestamp', gmdate("c"));
    $product_id = $product->save();
    update_western_product($wps_product, $product_id);
    write_to_log_file('END insert_western_product()' . json_encode(['wps_product' => $wps_product['data']['id'], 'product_id' => $product_id]));
    return $product_id;
}

function update_western_product($wps_product, $product_id)
{
    global $WPS_SETTINGS;

    write_to_log_file('START update_western_product()' . json_encode(['wps_product' => $wps_product['data']['id'], 'product_id' => $product_id]));
    $product = wc_get_product_object('product', $product_id);

    $variations = new WC_Product_Variable($product);
    $product_variations = $variations->get_available_variations();
    $lookup = array_reduce($product_variations, fn($c, $v) => [$v['sku'] => $v, ...$c], []);
    write_to_log_file(json_encode(['product_variations' => $product_variations]));

    $wps_attributes = get_western_attributes_from_product($wps_product);
    write_to_log_file(json_encode(['wps_attributes' => $wps_attributes]));

    foreach ($wps_product['data']['items']['data'] as $item) {
        foreach ($item['attributevalues']['data'] as $attr) {
            $attr_id = $attr['attributekey_id'];
            if (!isset($wps_attributes[$attr_id]['options'])) {
                $wps_attributes[$attr_id]['options'] = [];
            }
            if (!in_array($attr['name'], $wps_attributes[$attr_id]['options'])) {
                $wps_attributes[$attr_id]['options'][] = $attr['name'];
            }
        }
    }

    $attributes = $product->get_attributes();
    write_to_log_file(json_encode(['attributes' => $attributes]));

    foreach ($wps_attributes as $attr) {
        // $attr_slug = sanitize_title($attr['name'] . " " . $attr['id']);
        // $has_attr = $product->get_attribute($attr_slug);
        write_to_log_file(json_encode(['attr'=> $attr]));
        write_to_log_file(json_encode(['attributes'=> $attributes]));
        $exists = array_key_exists($attr['slug'], $attributes);// isset($attributes[$attr['slug']]);
        write_to_log_file(json_encode(['exists'=> $exists]));

        if (!$exists && count($attr['options'])) {
            write_to_log_file('create new attribute ' . json_encode($attr));
            $attribute = new WC_Product_Attribute();
            $attribute->set_id(0);
            $attribute->set_name($attr['name']);
            $attribute->set_options($attr['options']);
            $attribute->set_position(0);
            $attribute->set_visible(1);
            $attribute->set_variation(1);
            $attributes[$attr['slug']] = $attribute;
        } else {
            $attributes[$attr['slug']]->set_options($attr['options']);
            write_to_log_file('attribute exists - update options only');
        }
        // $attribute = $product->get_attribute($attr_slug);
        // $attribute->get_id();
        // write_to_log_file(json_encode(['slug' => $attr_slug]));
    }
    $product->set_attributes($attributes);
    $product->save();

    write_to_log_file(json_encode($wps_attributes));

    // return;

    foreach ($wps_product['data']['items']['data'] as $item) {
        $variation_sku = get_western_variation_sku($wps_product, $item);
        $exists = array_key_exists($variation_sku, $lookup);
        write_to_log_file($product_id . ": " . $variation_sku . ' exists: ' . ($exists ? 'true' : 'false'));

        if ($exists) {
        } else {
            $variation = new WC_Product_Variation();
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
            $variation_attributes = array_reduce($item['attributevalues']['data'], fn($s, $av) => [...$s, $wps_attributes[$av['attributekey_id']]['slug'] => $av['name']], []);
            $variation->set_attributes($variation_attributes);
            $variation->save();
        }

        //     $product->set_name('Variable Product Example'); // Replace with the product name
        //     $product->set_status('publish');
        //     $product->set_regular_price(0); // Setting initial price to zero

        // // Set product type to 'variable'
        //     $product->set_type('variable');

        // // Save the product
        //     $product_id = $product->save();
        //     $variation_id = wc_get_product_id_by_sku($variation_sku);
        //     printLine('variation_sku: ' . $variation_sku);

        //     // create variation
        //     if (!$variation_id) {
        //         printLine('variation not found');
        //         $variation = new WC_Product_Variation();
        //         $variation->set_parent_id($product_id);
        //         $attrs = get_western_attributes_from_product($wps_product);
        //         $variation->set_attributes(array('attribute_color' => 'Red'));
        //         $variation->set_regular_price(50);
        //         $variation->set_props([
        //             'name' => $item['name'],
        //             'regular_price' => floatval($item['list_price']),
        //         ]);
        //         $variation->save();
        //         $variation_id = $variation->get_id();
        //     } else {
        //         printLine('variation exists');
        //         $variation = wc_get_product($variation_id);
        //         $variation_id = $variation->get_id();
        //     }
        //     printData(['variation_id' => $variation_id]);
    }

    write_to_log_file('END update_western_product()' . json_encode(['wps_product' => $wps_product['data']['id'], 'product_id' => $product_id]));

    return $product_id;
}

// function merge_western_product($wps_product, $product)
// {
//     global $WPS_SETTINGS;
//     // product changes common to insert and update
//     $product->set_name($wps_product['data']['name']);
//     $product->set_status('publish');
//     $product->set_regular_price($wps_product['data']['items']['data'][0]['list_price']);
//     $product->update_meta_data('_stock_status', wc_clean('instock'));
//     $product->update_meta_data('_ci_supplier_key', 'wps');
//     $product->update_meta_data('_ci_product_id', $wps_product['data']['id']);
//     $product->update_meta_data('_ci_supplier_key', 'wps');
//     $product->update_meta_data('_ci_additional_images', get_additional_images($wps_product));
//     $product->update_meta_data('_ci_import_version', $WPS_SETTINGS['import_version']);
//     $product->update_meta_data('_ci_import_timestamp', gmdate("c"));
//     $props = [];
//     $attrs = get_western_attributes_from_product($wps_product);
//     $product->set_props($props);
// }

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
