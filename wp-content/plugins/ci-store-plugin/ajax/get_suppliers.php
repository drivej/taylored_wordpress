<?php

namespace AjaxHandlers;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';

function get_suppliers($params)
{
    return \WooTools::get_suppliers();
}
