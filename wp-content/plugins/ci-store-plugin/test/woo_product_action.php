<?php

include_once __DIR__ . './../utils/print_utils.php';
// include_once __DIR__ . './../western/get_western_product.php';

function woo_product_action($sku)
{
    $woo_product_id = wc_get_product_id_by_sku($sku);
    printData(['sku' => $sku, 'woo_product_id' => $woo_product_id]);

    if ($woo_product_id) {
        $meta = null;
        $variations = [];
        $woo_product = wc_get_product($woo_product_id);

        if (isset($woo_product)) {
            $meta = $woo_product->get_meta_data();

            if ($woo_product && $woo_product->is_type('variable')) {
                $variation_ids = $woo_product->get_children();
                foreach ($variation_ids as $variation_id) {
                    $variation = wc_get_product($variation_id);
                    $variations[] = $variation->get_data();
                }
            }
        }

        $image_id = $woo_product->get_image_id();
        $post_thumbnail_src = wp_get_attachment_image_src($image_id, 'single-post-thumbnail');
        $image_ids = $woo_product->get_gallery_image_ids();

        printData([
            'image_id' => $image_id,
            'post_thumbnail_src' => $post_thumbnail_src, 
            'image_ids' => $image_ids,
            'meta' => $meta, 
            'variations' => ['count' => count($variations), 
            'data' => $variations],
            'woo_product' => $woo_product
        ]);
    } else {
        printLine('Product does not exist in woocommerce');
    }
    // print_r(json_encode($woo_product, JSON_PRETTY_PRINT));
}
