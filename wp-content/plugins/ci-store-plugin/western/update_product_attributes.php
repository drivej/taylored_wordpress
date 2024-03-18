<?php

include_once __DIR__ . './../utils/print_utils.php';
include_once __DIR__ . '/get_western_product.php';
include_once __DIR__ . './../utils/Report.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/index.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';

// function get_attribute_key_by_name($attributes, $attr_name)
// {
//     foreach ($attributes as $key => $attr) {
//         if ($attr->get_name() === $attr_name) {
//             return $key;
//         }
//     }
//     return null;
// }

// function delete_attribute($attributes, $attr_name, $report)
// {
//     $attr_key = get_attribute_key_by_name($attributes, $attr_name);
//     if (isset($attr_key)) {
//         $report->addLog('delete attribute ' . $attr_name);
//         $report->tick('attribute_changes');
//         unset($attributes[$attr_key]);
//     }
//     return $attributes;
// }

// function delete_attributes($attributes, $attr_names, $report)
// {
//     foreach ($attr_names as $attr_name) {
//         $attributes = delete_attribute($attributes, $attr_name, $report);
//     }
//     return $attributes;
// }

// function insert_attribute($attributes, $attr, $report)
// {
//     $new_attribute = new WC_Product_Attribute();
//     $new_attribute->set_name($attr['name']);
//     $new_attribute->set_options($attr['options']);
//     $new_attribute->set_id(0);
//     $new_attribute->set_visible(1);
//     $new_attribute->set_variation(1);
//     $attr_slug = sanitize_title($attr['name']);
//     $attributes[$attr_slug] = $new_attribute;
//     $report->addLog('insert attribute ' . $attr['name']);
//     $report->tick('attribute_changes');
//     return $attributes;
// }

// function upsert_attribute($attributes, $attr, $report)
// {
//     $attr_key = get_attribute_key_by_name($attributes, $attr['name']);
//     if (isset($attr_key)) {
//         $needs_update = attribute_options_needs_update($attributes, $attr);
//         $report->addLog('update attribute ' . $attr['name'] . ' needs_update=' . ($needs_update ? 'true' : 'false'));
//         if ($needs_update) {
//             $report->tick('attribute_changes');
//             $attributes[$attr_key]->set_options($attr['options']);
//         }
//     } else {
//         $attributes = insert_attribute($attributes, $attr, $report);
//     }
//     return $attributes;
// }

// function attribute_options_needs_update($attributes, $attr)
// {
//     $attr_key = get_attribute_key_by_name($attributes, $attr['name']);
//     $old_options = $attributes[$attr_key]->get_options();
//     $new_options = $attr['options'];
//     $deletes = array_diff($old_options, $new_options);
//     $inserts = array_diff($new_options, $old_options);
//     return count($deletes) || count($inserts);
// }
/**
 *
 * @param WC_Product    $product
 * @param array    $supplier_product
 * @param Report   $report
 */
function update_product_attributes($woo_product, $supplier_product, $report)
{
    $supplier = WooTools::get_product_supplier($woo_product);
    $supplier_attributes = $supplier->extract_attributes($supplier_product);
    WooTools::sync_attributes($woo_product, $supplier_attributes, $report);
}
