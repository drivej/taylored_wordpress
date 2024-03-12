<?php

include_once __DIR__ . './../utils/print_utils.php';
include_once __DIR__ . '/get_western_product.php';
include_once __DIR__ . './../utils/Report.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/index.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';

function get_attribute_key_by_name($attributes, $attr_name)
{
    foreach ($attributes as $key => $attr) {
        if ($attr->get_name() === $attr_name) {
            return $key;
        }
    }
    return null;
}

function delete_attribute($attributes, $attr_name, $report)
{
    $attr_key = get_attribute_key_by_name($attributes, $attr_name);
    if (isset($attr_key)) {
        $report->addLog('delete attribute ' . $attr_name);
        $report->tick('attribute_changes');
        unset($attributes[$attr_key]);
    }
    return $attributes;
}

function delete_attributes($attributes, $attr_names, $report)
{
    foreach ($attr_names as $attr_name) {
        $attributes = delete_attribute($attributes, $attr_name, $report);
    }
    return $attributes;
}

function insert_attribute($attributes, $attr, $report)
{
    $new_attribute = new WC_Product_Attribute();
    $new_attribute->set_name($attr['name']);
    $new_attribute->set_options($attr['options']);
    $new_attribute->set_id(0);
    $new_attribute->set_visible(1);
    $new_attribute->set_variation(1);
    $attr_slug = sanitize_title($attr['name']);
    $attributes[$attr_slug] = $new_attribute;
    $report->addLog('insert attribute ' . $attr['name']);
    $report->tick('attribute_changes');
    return $attributes;
}

function upsert_attribute($attributes, $attr, $report)
{
    $attr_key = get_attribute_key_by_name($attributes, $attr['name']);
    if (isset($attr_key)) {
        $needs_update = attribute_options_needs_update($attributes, $attr);
        $report->addLog('update attribute ' . $attr['name'] . ' needs_update=' . ($needs_update ? 'true' : 'false'));
        if ($needs_update) {
            $report->tick('attribute_changes');
            $attributes[$attr_key]->set_options($attr['options']);
        }
    } else {
        $attributes = insert_attribute($attributes, $attr, $report);
    }
    return $attributes;
}

function attribute_options_needs_update($attributes, $attr)
{
    $attr_key = get_attribute_key_by_name($attributes, $attr['name']);
    $old_options = $attributes[$attr_key]->get_options();
    $new_options = $attr['options'];
    $deletes = array_diff($old_options, $new_options);
    $inserts = array_diff($new_options, $old_options);
    return count($deletes) || count($inserts);
}

// function get_wps_attributes($supplier_product)
// {
//     /*
//     extract an array of valid attributes
//     [
//     {
//     "id": 15,
//     "name": "Color",
//     "slug": "color",
//     "options": [
//     "Black/Blue",
//     "Black/Grey",...
//     ]
//     },
//     {
//     ...
//     }
//     ]
//      */
//     $attr_keys = $supplier_product['data']['attributekeys']['data'];
//     $items = array_filter($supplier_product['data']['items']['data'], 'isDeadItem');
//     $items_count = count($items);

//     foreach ($items as $item) {
//         foreach ($item['attributevalues']['data'] as $item_attr) {
//             $attr_id = $item_attr['attributekey_id'];
//             $attr_keys[$attr_id]['options'][$item_attr['name']]++;
//         }
//     }

//     foreach ($attr_keys as $i => $attr_key) {
//         unset($attr_keys[$i]['created_at']);
//         unset($attr_keys[$i]['updated_at']);
//         $options = [];
//         foreach ($attr_key['options'] as $option_name => $option_count) {
//             if ($option_count < $items_count) {
//                 $options[] = $option_name;
//             }
//         }
//         $attr_keys[$i]['options'] = $options;
//     }

//     foreach ($attr_keys as $i => $attr_key) {
//         if (!count($attr_key['options'])) {
//             unset($attr_keys[$i]);
//         }
//     }

//     return array_values($attr_keys);
// }

// function get_wps_attributes($wps_product)
// {
//     $wps_attributes = $wps_product['data']['attributekeys']['data'];

//     foreach ($wps_product['data']['items']['data'] as $item) {
//         foreach ($item['attributevalues']['data'] as $attr) {
//             $attr_id = $attr['attributekey_id'];
//             // $attr_name = $wps_attributes[$attr_id];
//             if (!isset($wps_attributes[$attr_id]['options'])) {
//                 $wps_attributes[$attr_id]['options'] = [];
//             }
//             if (!in_array($attr['name'], $wps_attributes[$attr_id]['options'])) {
//                 $wps_attributes[$attr_id]['options'][] = $attr['name'];
//             }
//         }
//     }

//     $allow_attributes = array_reduce($wps_attributes, function ($sum, $attr) {
//         $sum[] = $attr;
//         return $sum;
//     }, []);

//     return $allow_attributes;
// }

/**
 *
 * @param WC_Product    $product
 * @param array    $wps_product
 * @param Report   $report
 */
function update_product_attributes($woo_product, $wps_product, $report)
{
    $supplier_key = 'wps';
    $supplier = WooTools::get_supplier($supplier_key);
    $supplier_product = $wps_product; //$supplier->get_product($product_id);
    $supplier_attributes = $supplier->extract_attributes($supplier_product);
    $supplier_variations = $supplier->extract_variations($supplier_product);

    // this is a dummy attribute so that variable products with a single variation can be selected
    $supplier_attributes['__required_attr'] = [
        'name' => '__required_attr',
        'options' => ['1'],
        'slug' => '__required_attr',
    ];

    $supplier_attributes['supplier_sku'] = [
        'name' => 'SKU',
        'options' => array_map(fn($v) => $v['supplier_sku'], $supplier_variations),
        'slug' => 'supplier_sku',
    ];

    error_log(json_encode($supplier_attributes, JSON_PRETTY_PRINT));
    // $woo_product = $this->get_woo_product_from_supplier_product($supplier_key, $product_id);
    WooTools::sync_attributes($woo_product, $supplier_attributes, $report);

    // global $SUPPLIERS;
    // $supplier = $SUPPLIERS['wps'];
    // $report->addLog('update_product_attributes()');

    // $attributes = $woo_product->get_attributes();
    // $new_attributes = $supplier->extract_attributes($wps_product); // get_wps_attributes($wps_product);
    // $new_attributes_names = array_map(fn($a) => $a['name'], $new_attributes);
    // $current_attribute_names = array_map(fn($a) => $a->get_name(), array_values($attributes));
    // $deletes = array_values(array_diff($current_attribute_names, $new_attributes_names));
    // $attributes = delete_attributes($attributes, $deletes, $report);
    // $woo_product->update_meta_data('_ci_additional_images', serialize(get_additional_images($wps_product)));
    // $woo_product->update_meta_data('_supplier_class', $supplier->supplierClass);

    // foreach ($new_attributes as $new_attr) {
    //     $attributes = upsert_attribute($attributes, $new_attr, $report);
    // }

    // if ($report->getData('attribute_changes', false)) {
    //     $woo_product->set_attributes($attributes);
    // }
}
