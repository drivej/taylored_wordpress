<?php

namespace AjaxHandlers;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';

// woo 459337 - 47s
// woo 459682 - 32s
// wps 310360 Piston kit - attributes seem off

function test_action($params)
{
    $supplier_key = 't14';
    $supplier = \CI\Admin\get_supplier($supplier_key);
    return $supplier->get_products_page(1);

    // $product = \wc_get_product_object('variable', 13182);
    // $children = $product->get_children();
    $post = get_post(280764);
    $meta = get_post_meta(280764);
    $imgs = get_post_meta(280764, '_ci_additional_images', true);
    $variation = \wc_get_product_object('variation', 280764);
    // return ['post'=>$post, 'meta'=>$meta, 'imgs'=>$imgs, 'product'=>$product, 'var'=>$variation];
    return ['imgs'=>$imgs];

    $supplier_product_id = \AjaxManager::get_param('supplier_product_id', null, $params);

    // $woo_product_id = \AjaxManager::get_param('woo_product_id', null, $params);

    // $woo_product_id =
    // $woo_product = wc_get_product_object('variable', $woo_product_id);

    $supplier_key = 'wps';
    $supplier = \CI\Admin\get_supplier($supplier_key);
    $supplier_product = $supplier->get_product($supplier_product_id);
    // $product_sku = $supplier->get_product_sku($supplier_product_id);
    // return ['supplier_product_id' => $supplier_product_id, 'product_sku' => $product_sku, 'supplier_product' => $supplier_product];

    // $woo_product_id = $supplier->get_woo_id($supplier_product_id);
    // return $woo_product_id;
    // $woo_product = $supplier->get_woo_product($supplier_product_id);

    // return $supplier;

    // $time_start = microtime(true);
    // try {
    // \WooTools::sync_images($woo_product, $supplier_product, $supplier);
    // } catch(Exception $e){
    //     return 'failed';
    // }

    $supplier_variations = $supplier->extract_variations($supplier_product);
    $skus = array_column($supplier_variations, 'sku');
    $time_start = microtime(true);
    $product_lookup = \WooTools::get_product_ids_by_skus($skus);
    $time_end = microtime(true);
    $execution_time = $time_end - $time_start;

    $time_start = microtime(true);
    foreach ($supplier_variations as $variation) {
        $variation_id = wc_get_product_id_by_sku($variation['sku']);
    }
    $time_end = microtime(true);
    $execution_time2 = $time_end - $time_start;

    return ['product_lookup' => $product_lookup, 'execution_time' => $execution_time, 'execution_time2' => $execution_time2];
    /*
// $supplier->log('sync_images()');
$woo_product_id = $woo_product->get_id();
$master_image_ids = [];
$result = [];
$result[] = ['woo_id', 'variation_id', 'attachment_id', 'image', 'width', 'height', 'filesize', 'type', 'action'];
$imgs = [];
$image_urls = [];

foreach ($supplier_variations as $variation) {
$variation_id = wc_get_product_id_by_sku($variation['sku']);

if ($variation_id) {
$variation_image_ids = [];

if (isset($variation['images_data']) && is_countable($variation['images_data'])) {

$new_image_urls = array_map(fn($image) => $image['file'], $variation['images_data']);
array_push($image_urls, ...$new_image_urls);
// $imgs = \WooTools::getAllAttachmentImagesIdByUrl($image_urls);
// break;
// $supplier->log($imgs);

}
}
}

$imgs = \WooTools::getAllAttachmentImagesIdByUrl($image_urls);

return ['imgs'=>$imgs];

// $result = \WooTools::getAllAttachmentImagesIdByUrl();
 */

}
