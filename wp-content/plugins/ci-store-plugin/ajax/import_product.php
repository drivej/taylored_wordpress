<?php

namespace AjaxHandlers;

require_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Report.php';

function import_product($params)
{
    $supplier_key = \AjaxManager::get_param('supplier_key', '', $params);
    $supplier_product_id = \AjaxManager::get_param('product_id', '', $params);
    $supplier = \CI\Admin\get_supplier($supplier_key);
    $supplier->import_product($supplier_product_id);
    return ['import_product' => $supplier_product_id];
}

function update_product($params)
{
    $supplier_key = \AjaxManager::get_param('supplier_key', '', $params);
    $supplier_product_id = \AjaxManager::get_param('product_id', '', $params);
    $supplier = \CI\Admin\get_supplier($supplier_key);
    if ($supplier) {
        return $supplier->update_product($supplier_product_id);
    } else {
        return ['update_product' => $supplier_product_id, 'error' => 'no supplier'];
    }
    return ['update_product' => $supplier_product_id];
}

function get_tag_ids($tags)
{

}

function extract_product_tags($params)
{
    $supplier_key = \AjaxManager::get_param('supplier_key', '', $params);
    $supplier_product_id = \AjaxManager::get_param('product_id', '', $params);
    $supplier = \CI\Admin\get_supplier($supplier_key);
    $supplier_product = $supplier->get_product($supplier_product_id);
    $tags = $supplier->extract_product_tags($supplier_product);
    $tag_ids = $supplier->get_tag_ids($tags);
    return ['tags' => $tags, 'tag_ids' => $tag_ids, 'product' => $supplier_product];
}
