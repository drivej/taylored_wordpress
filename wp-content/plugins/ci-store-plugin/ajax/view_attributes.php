<?php

namespace AjaxHandlers;

require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';

function view_attributes($params)
{

    $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);
    $supplier_product_id = \AjaxManager::get_param('product_id');
    $supplier = \WooTools::get_supplier($supplier_key);
    $supplier_product = $supplier->get_product($supplier_product_id);

    $supplier_variations = $supplier->extract_variations($supplier_product);

    $attr = $supplier->get_attributes_from_product($supplier_product);
    $cache = $supplier->get_cached_attributekeys(); // wps only
    // return ['attributes' => $attr, 'cache' => $cache];

    $items = $supplier_product['data']['items']['data'];
    $valid_items = array_filter($items, [$supplier, 'isValidItem']);

    // return ['valid_items' => $valid_items, 'valid_items_count' => count($valid_items), 'items_count' => count($items)];
    // $woo_product_id = $supplier->get_woo_id($supplier_product_id);
    $master_attributes = $supplier->extract_attributes($supplier_product);

    // simplified supplier product
    $lookupAttr = $supplier_product['data']['attributekeys']['data'];

    $p = [];
    $p['name'] = $supplier_product['data']['name'];
    $p['items'] = [];
    $uniqueAttributes = [];

    foreach ($supplier_product['data']['items']['data'] as $item) {
        $av = [];
        foreach ($item['attributevalues']['data'] as $a) {
            $av[$lookupAttr[$a['attributekey_id']]['name']] = $a['name'];
            $uniqueAttributes[$lookupAttr[$a['attributekey_id']]['name']] = true;
        }
        $p['items'][] = [
            'id' => $item['id'],
            'name' => $item['name'],
            'attributevalues' => $av,
        ];
    }

    // turn into CSV
    $atr = array_values(array_keys($uniqueAttributes));
    $csv = [];
    $csv[] = ['id', 'name', ...$atr];

    // return $csv;

    foreach ($p['items'] as $item) {
        $row = [];
        $row[0] = $item['id'];
        $row[1] = $item['name'];

        foreach ($atr as $i => $key) {
            $row[$i + 2] = isset($item['attributevalues'][$key]) ? $item['attributevalues'][$key] : '-';
        }
        $csv[] = $row;

    }
    return ['rows' => $csv, 'master_attributes' => $master_attributes];

    $attr_keys = $supplier_product['data']['attributekeys']['data'];
    $lookup_slug_by_id = [];

    foreach ($attr_keys as $attr_id => $attr) {
        $lookup_slug_by_id[$attr_id] = $attr['slug'];
    }

    // $master_attr = array_column($master_attributes, 'slug');

    $supplier_variations_id = array_column($supplier_variations, 'id');

    $master_attr = array_values($supplier_product['data']['attributekeys']['data']);
    $valid_items = array_filter($supplier_product['data']['items']['data'], [$supplier, 'isValidItem']);
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
        'valid_items' => $valid_items,
    ];

    // if ($supplier) {
    //     $is_importing = $supplier->is_importing();
    //     return ['supplier_key' => $supplier_key, 'is_importing' => $is_importing];
    // }
    // return ['error' => 'missing supplier'];

}
