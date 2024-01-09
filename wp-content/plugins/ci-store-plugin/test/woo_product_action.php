<?php

include_once __DIR__ . './../utils/print_utils.php';
// include_once __DIR__ . './../western/get_western_product.php';

function woo_product_action($item_id)
{
    $product_id = wc_get_product_id_by_sku($item_id);
    printData(['product_id'=>$product_id]);
}
