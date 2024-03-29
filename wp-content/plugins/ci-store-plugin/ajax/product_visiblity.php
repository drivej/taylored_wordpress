<?php

namespace AjaxHandlers;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';

function product_visibility($params)
{
    $supplier_product_id = \AjaxManager::get_param('product_id', null, $params);
    $visible = (bool) \AjaxManager::get_param('visible', '1', $params);

    if (!$supplier_product_id) {
        return ['error' => 'missing woo id'];
    }

    \WooTools::set_product_visibility($supplier_product_id, $visible);

    return ['woo_id' => $supplier_product_id, 'visible' => $visible];
}
