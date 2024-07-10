<?php

namespace AjaxHandlers;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';

// woo 459337 - 47s
// woo 459682 - 32s
// wps 310360 Piston kit - attributes seem off

function delete_all_supplier_products($params)
{
    $supplier_key = \AjaxManager::get_param('supplier_key');
    $supplier = \CI\Admin\get_supplier($supplier_key);
    return $supplier->delete_all();
}

function update_t14_pricing($params)
{
    $supplier_key = 't14';
    $supplier = \CI\Admin\get_supplier($supplier_key);
    return $supplier->background_process->start(['action' => 'price_table', 'page_index' => 1]);
}

function test_action($params)
{
    // return \WooTools::delete_transients();

    // $id = 646965;
    // $metadata = wp_get_attachment_metadata($id);
    // // $metadata['width'] = $newwidth;
    // // wp_update_attachment_metadata($id,$metadata);
    // return $metadata;


    $supplier_key = 't14';
    $supplier = \CI\Admin\get_supplier($supplier_key);

    // return $supplier->insert_unique_metas([
    //     ['post_id' => 999999, 'meta_key' => 'test_meta_name1', 'meta_value' => 'testval1'],
    //     ['post_id' => 999999, 'meta_key' => 'test_meta_name2', 'meta_value' => 'testval2'],
    // ]);

    // return $supplier->update_prices_table(1);

    return $supplier->import_products_page(1);
    // $page_index = 1;
    // $items = $supplier->get_items_page($page_index);
    // return $items;

    $supplier_product_id = '10241';

    // return $supplier->extract_images(['data' => ['id' => '10241']]);
    // $supplier_product = $supplier->get_product_light($supplier_product_id);
    $supplier_product = $supplier->get_product($supplier_product_id);
    $woo_id = $supplier_product['meta']['woo_id'];
    $woo_product = wc_get_product($woo_id);

    $supplier_product['meta']['item_updated'] = get_post_meta($woo_id, '_ci_t14_item_updated', true);
    // $woo_product = wc_get_product_object($supplier_product['meta']['product_type'], $woo_id);
    $woo_product = $supplier->update_base_product($supplier_product, $woo_product);
    $woo_product->save();

    return $supplier_product;
    // return $supplier->attach_images(['data' => ['id' => '10875']]);
    // return $supplier->get_items_page(1);
    $result = [];

    return $result;

    $supplier->cronjob->stop();
    return ['is_active' => $supplier->cronjob->is_active()];

    $supplier->cronjob->start(['page_index' => 1]);
    return 'start cron';

    // $result = $supplier->get_products_page(1);
    $result = $supplier->insert_product_page(3);
    return $result;

    $products = $supplier->get_products_page(1);
    $result = [];

    foreach ($products['data'] as $product) {
        $supplier_product_id = $product['id'];
        $supplier_product = $supplier->get_product($supplier_product_id);
        $result[] = ['id' => $supplier_product_id, 'name' => $supplier->get_name($supplier_product)];
        //$supplier->import_product($supplier_product_id);
        // $result[] = $product['attributes']['product_name'];
    }
    // return $names;
    return $result;

    // $product = \wc_get_product_object('variable', 13182);
    // $children = $product->get_children();
    $post = get_post(280764);
    $meta = get_post_meta(280764);
    $imgs = get_post_meta(280764, '_ci_additional_images', true);
    $variation = \wc_get_product_object('variation', 280764);
    // return ['post'=>$post, 'meta'=>$meta, 'imgs'=>$imgs, 'product'=>$product, 'var'=>$variation];
    return ['imgs' => $imgs];

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
