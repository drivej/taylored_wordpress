<?php

include_once __DIR__ . './../utils/print_utils.php';
// include_once __DIR__ . './../western/get_western_product.php';

function woo_product_action($sku)
{
    $woo_product_id = wc_get_product_id_by_sku($sku);
    printData(['sku' => $sku, 'woo_product_id' => $woo_product_id]);

    $woo_product = wc_get_product($woo_product_id);
    $meta = $woo_product->get_meta_data();
    $variations = [];

    if ($woo_product && $woo_product->is_type('variable')) {
        $variation_ids = $woo_product->get_children();
        foreach ($variation_ids as $variation_id) {
            $variation = wc_get_product($variation_id);
            $variations[] = $variation->get_data();
        }
    }

    printData(['meta' => $meta, 'variations' => ['count' => count($variations), 'data' => $variations], 'woo_product' => $woo_product]);
    // print_r(json_encode($woo_product, JSON_PRETTY_PRINT));
}
