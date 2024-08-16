<?php

namespace CIStore\Ajax;

include_once CI_STORE_PLUGIN . 'utils/WooTools.php';

function sql_product_query()
{
    $woo_id = $_GET['woo_id'] ?? '';
    return \WooTools::get_raw_woo_data($woo_id);
}
