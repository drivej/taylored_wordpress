<?php

namespace AjaxHandlers;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';

function get_import_status($params)
{
    $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);
    $supplier = \WooTools::get_supplier($supplier_key);
    $status = $supplier->get_import_status();
    $status['last_started'] = $status['last_started']->format(\DateTime::ATOM);
    $status['last_completed'] = $status['last_completed']->format(\DateTime::ATOM);
    $status['last_stopped'] = $status['last_stopped']->format(\DateTime::ATOM);
    return $status;
}
