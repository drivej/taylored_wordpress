<?php

namespace AjaxHandlers;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/western/get_western_products_page.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/western/western_utils.php';

function view_attributes($params)
{

    $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);
    $supplier_product_id = \AjaxManager::get_param('product_id');
    $supplier = \CI\Admin\get_supplier($supplier_key);
    $supplier_product = $supplier->get_product($supplier_product_id);

    $supplier_variations = $supplier->extract_variations($supplier_product);
    // $woo_product_id = $supplier->get_woo_id($supplier_product_id);
    $master_attributes = $supplier->extract_attributes($supplier_product);

    $attr_keys = $supplier_product['data']['attributekeys']['data'];
    $lookup_slug_by_id = [];

    foreach ($attr_keys as $attr_id => $attr) {
        $lookup_slug_by_id[$attr_id] = $attr['slug'];
    }

    // $master_attr = array_column($master_attributes, 'slug');

    $supplier_variations_id = array_column($supplier_variations, 'id');

    $master_attr = array_values($supplier_product['data']['attributekeys']['data']);
    $valid_items = array_filter($supplier_product['data']['items']['data'], 'isValidItem');
    $variations = [];

    $rows = [];
    // header
    $row = [];
    $row[] = 'id';
    foreach ($master_attr as $attr) {
        $row[] = $attr['name'];
    }
    $row[] = 'valid';
    $rows[] = $row;

    foreach ($valid_items as $i => $item) {
        $attributes = [];
        foreach ($item['attributevalues']['data'] as $attr) {
            $attributes[$attr['attributekey_id']] = $attr['name'];
        }
        $variations[] = ['id' => $item['id'], 'attributes' => $attributes];

        $row = [];
        $row[] = $item['id'];
        foreach ($master_attr as $attr) {
            $row[] = isset($attributes[$attr['id']]) ? $attributes[$attr['id']] : '';
        }
        $rows[] = $row;
    }
    // $woo_product = $supplier->get_woo_product($supplier_product_id);
    // $products = array_map(fn($p) => ['id' => $p['id']], $products);

    return ['rows' => $rows, 'supplier_variations' => $supplier_variations,
        // 'variations' => $variations,
        // 'valid_items' => $valid_items
    ];

    // if ($supplier) {
    //     $is_importing = $supplier->is_importing();
    //     return ['supplier_key' => $supplier_key, 'is_importing' => $is_importing];
    // }
    // return ['error' => 'missing supplier'];

}
