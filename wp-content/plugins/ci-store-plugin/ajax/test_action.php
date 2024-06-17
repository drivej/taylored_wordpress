<?php

namespace AjaxHandlers;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';

use Exception;

function test_action()
{

    // $woo_product_id =
    // $woo_product = wc_get_product_object('variable', $woo_product_id);

    $supplier_product_id = 37055;//168002;
    $supplier_key = 'wps';
    $supplier = \CI\Admin\get_supplier($supplier_key);
    $supplier_product = $supplier->get_product($supplier_product_id);

    $woo_product = $supplier->get_woo_product($supplier_product_id);

    return $woo_product;

    $time_start = microtime(true);
    try {
    \WooTools::sync_images($woo_product, $supplier_product, $supplier);
    } catch(Exception $e){ 
        return 'failed';
    }
    $time_end = microtime(true);
    $execution_time = $time_end - $time_start;

    return ['execution_time'=>$execution_time];

    // $supplier->log('sync_images()');
    $woo_product_id = $woo_product->get_id();
    $supplier_variations = $supplier->extract_variations($supplier_product);
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

}
