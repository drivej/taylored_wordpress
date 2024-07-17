<?php

namespace AjaxHandlers;

require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';

// function getAttachmentImageIdByUrl($url)
// {
//     $query = new \WP_Query(array(
//         'posts_per_page' => 1,
//         'post_status' => 'inherit',
//         'post_type' => 'attachment',
//         'meta_query' => array(
//             array('key' => '_wp_attached_file', 'value' => $url, 'compare' => '='),
//         ),
//         'fields' => 'ids',
//     ));

//     $post_id = $query->post_count > 0 ? $query->posts[0] : false;
//     wp_reset_postdata();
//     return $post_id;
// }

// function createRemoteAttachment($url, $supplier_key)
// {
//     $attachment_id = wp_insert_post(['post_parent' => 0, 'post_type' => 'attachment', 'post_mime_type' => 'image/jpeg', 'post_status' => 'inherit'], false, false);
//     update_post_meta($attachment_id, '_wp_attached_file', $url);
//     update_post_meta($attachment_id, '_ci_remote_image', true);
//     update_post_meta($attachment_id, '_ci_supplier_key', $supplier_key);
//     return $attachment_id;
// }

// function syncImages($supplier_product, $supplier)
// {
//     $supplier_product_id = $supplier_product['data']['id'];
//     $woo_product_id = $supplier->get_woo_id($supplier_product_id);
//     $supplier_variations = $supplier->extract_variations($supplier_product);
//     $master_image_ids = [];
//     $result = [];
//     $result[] = ['woo_id', 'variation_id', 'attachment_id', 'image', 'type'];

//     foreach ($supplier_variations as $variation) {
//         $variation_id = wc_get_product_id_by_sku($variation['sku']);

//         if ($variation_id) {
//             $variation_image_ids = [];

//             foreach ($variation['images'] as $i => $image) {
//                 $attachment_id = getAttachmentImageIdByUrl($image);
//                 if (!$attachment_id) {
//                     $attachment_id = createRemoteAttachment($image, $supplier->key);
//                 } else {
//                     update_post_meta($attachment_id, '_ci_supplier_key', $supplier->key);
//                 }
//                 $variation_image_ids[] = $attachment_id;
//                 $master_image_ids[] = $attachment_id;
//                 $result[] = [$woo_product_id, $variation_id, $attachment_id, $image, $i == 0 ? 'primary' : 'secondary'];
//             }
//             // set variation primary image
//             set_post_thumbnail($variation_id, $variation_image_ids[0]);
//             // set variation secondary images
//             if (count($variation_image_ids) > 1) {
//                 $woo_variation = wc_get_product($variation_id);
//                 // $woo_variation = new \WC_Product_Variation($variation_id);
//                 $woo_variation->set_gallery_image_ids(array_slice($variation_image_ids, 1));
//                 $woo_variation->save();
//             }
//         }
//     }

//     // set master primary image
//     set_post_thumbnail($woo_product_id, $master_image_ids[0]);
//     $result[] = [$woo_product_id, $variation_id, $master_image_ids[0], '', 'master'];
//     // set master secondary image
//     if (count($master_image_ids) > 1) {
//         $product = wc_get_product($woo_product_id);
//         $product->set_gallery_image_ids(array_slice($master_image_ids, 1));
//         $product->save();
//     }
//     return $result;
// }

function view_variations($params)
{

    $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);
    $supplier_product_id = \AjaxManager::get_param('product_id');
    $supplier = \WooTools::get_supplier($supplier_key);
    $supplier_product = $supplier->get_product($supplier_product_id);
    // $woo_product = $supplier->get_woo_product($supplier_product_id);

    if (!$supplier_product_id) {
        return 'error';
    }

    $items = isset($supplier_product['data']['items']['data']) && is_array($supplier_product['data']['items']['data']) ? $supplier_product['data']['items']['data'] : [];

    $attr_keys = isset($supplier_product['data']['attributekeys']['data']) ? $supplier_product['data']['attributekeys']['data'] : [];
    $lookup_slug_by_id = [];

    foreach ($attr_keys as $attr_id => $attr) {
        $lookup_slug_by_id[$attr_id] = $attr['slug'];
    }

    $rows = [];
    $rows[] = ['id', 'sku', 'name', 'status', 'valid', 'woo_id', 'test'];
    foreach ($items as $item) {
        $valid = $supplier->isValidItem($item);
        $variation_sku = $supplier->get_variation_sku($supplier_product_id, $item['id']);
        $variation_id = wc_get_product_id_by_sku($variation_sku);
        $test = $supplier->get_item_images_data($item);
        $rows[] = [$item['id'], $item['sku'], $item['name'], $item['status_id'], $valid ? 'valid' : 'invalid', $variation_id, json_encode($test)];
    }
    return ['rows' => $rows];
}
