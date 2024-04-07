<?php

namespace AjaxHandlers;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';
// include_once WP_PLUGIN_DIR . '/ci-store-plugin/western/get_western_products_page.php';
// include_once WP_PLUGIN_DIR . '/ci-store-plugin/western/western_utils.php';

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
    $supplier = \CI\Admin\get_supplier($supplier_key);
    $supplier_product = $supplier->get_product($supplier_product_id);
    $woo_product = $supplier->get_woo_product($supplier_product_id);

    $size_name = 'full';
    $size = wc_get_image_size( $size_name );

    return $size;

    // wp_delete_post(289363, true);
    // wp_delete_post(289364, true);
    // wp_delete_post(289365, true);
    // wp_delete_post(289366, true);
    // wp_delete_post(289367, true);
    // wp_delete_post(289368, true);
    // wp_delete_post(289369, true);
    // wp_delete_post(289370, true);
    // wp_delete_post(289371, true);
    // wp_delete_post(289372, true);
    // wp_delete_post(289373, true);
    // wp_delete_post(289374, true);
    // wp_delete_post(289375, true);
    // wp_delete_post(289376, true);
    // wp_delete_post(289377, true);
    // wp_delete_post(289378, true);
    // wp_delete_post(289379, true);

    // return;


    // $attachment_id = 119;
    // $meta = wp_get_attachment_metadata($attachment_id, true);
    // $meta = get_post_meta(119);
    // $meta = (bool) get_post_meta(289354, '_ci_remote_image', true);
    // return $meta;

    // return $supplier_product;

    $result = \WooTools::sync_images($woo_product, $supplier_product, $supplier);

    return ['rows' => $result];

    $supplier_variations = $supplier->extract_variations($supplier_product);
    return $supplier_variations;
    //
    //
    //

    $items = isset($supplier_product['data']['items']['data']) && is_array($supplier_product['data']['items']['data']) ? $supplier_product['data']['items']['data'] : [];

    $attr_keys = isset($supplier_product['data']['attributekeys']['data']) ? $supplier_product['data']['attributekeys']['data'] : [];
    $lookup_slug_by_id = [];

    foreach ($attr_keys as $attr_id => $attr) {
        $lookup_slug_by_id[$attr_id] = $attr['slug'];
    }

    // return $items;
    // $valid_items = array_filter($items, [$supplier, 'isValidItem']);
    // $valid_skus = array_map(fn($v) => $v['sku'], $valid_items);
    $rows = [];
    $rows[] = ['id', 'sku', 'name', 'status', 'valid', 'woo_id', 'test'];
    foreach ($items as $item) {
        $valid = $supplier->isValidItem($item);
        $variation_sku = $supplier->get_variation_sku($supplier_product_id, $item['id']);
        $variation_id = wc_get_product_id_by_sku($variation_sku);
        $test = $supplier->get_item_images_data($item);
        $rows[] = [$item['id'], $item['sku'], $item['name'], $item['status_id'], $valid ? 'valid' : 'invalid', $variation_id, json_encode($test)];
    }

    // $rows = [];
    // $rows[] = ['woo_product_id', 'woo_variation_id', 'supplier_id', 'image', 'attachment_id', 'img'];
    return ['rows' => $rows];
    /*

    $url = 'https://cdn.wpsstatic.com/images/500_max/3e0d-65f8764c1ab7e.png';

    $rows = [];
    $rows[] = ['woo', 'variationId', 'image', 'attachmentId'];
    $gallery_image_ids = [];
    foreach ($supplier_variations as $variation) {

    $variation_id = wc_get_product_id_by_sku($variation['sku']);
    if ($variation_id) {
    $woo_variation = new \WC_Product_Variation($variation_id);
    }

    foreach ($variation['images'] as $image) {
    $attachment_id = getAttachmentImageIdByUrl($image);
    if (!$attachment_id) {
    $attachment_id = createRemoteAttachment($image);
    }
    $gallery_image_ids[] = $attachment_id;
    $rows[] = [$variation_id, $variation['id'], $image, $attachment_id];
    }

    $main_attachment_id = getAttachmentImageIdByUrl($variation['images'][0]);
    set_post_thumbnail($variation_id, $main_attachment_id);
    }

    $master_attachment_id = getAttachmentImageIdByUrl($supplier_variations[0]['images'][0]);
    set_post_thumbnail($woo_product_id, $master_attachment_id);

    $product = wc_get_product($woo_product_id);
    $product->set_gallery_image_ids($gallery_image_ids);
    $product->save();

    return ['rows' => $rows];
     */
    /*

    1. create attachment

    $attachment_id = wp_insert_post(['post_parent' => 0, 'post_type'=>'attachment', 'post_mime_type' => 'image/jpeg'], false, false);

    2. add meta that points to remote file

    update_post_meta($attachment_id, '_wp_attached_file', $image_url);

    3. link image to product

    $success = set_post_thumbnail($woo_product_id, $attachment_id);

     */
    /*

    // attch: 289343

    // Hammer Street Metal Intake System
    // woo pid: 223846

    $attachment_id = 289343;

    // $result['img'] = get_post($id);
    $file = get_post_meta($attachment_id, '_wp_attached_file');
    return $file;

    $query = new \WP_Query(array(
    'posts_per_page' => 100,
    'post_status' => 'inherit',
    'post_type' => 'attachment',
    // 'is_attachment' => true,
    'meta_query' => array(
    array('key' => 'url', 'value' => $url, 'compare' => '='),
    ),
    ));
    $result = [];

    // this links the attachment post to the product post
    // update_post_meta(223846, '_thumbnail_id', 289343);

    update_post_meta(289343, '_wp_attached_file', $url);
    // update_post_meta(289343, '_wp_mime_type', 'image/');
    wp_update_post(['ID' => 289343, 'post_mime_type' => 'image/jpeg']);

    // delete_post_meta(289343, 'post_mime_type');
    // delete_post_meta(289343, '_wp_mime_type');
    // delete_post_meta(289343, 'url');

    $result['setid'] = set_post_thumbnail(223846, 289343); // fails if attachments isn't properly spoofed

    $result['image_url'] = get_the_post_thumbnail_url(223846);
    $result['wp_get_attachment_image_url'] = wp_get_attachment_image_url(289343, 'thumbnail');

    $result['found'] = [];
    if ($query->have_posts()) {
    while ($query->have_posts()) {
    $query->the_post();
    global $post;

    $type = 'image';

    $result['found'][] = [
    'id' => get_the_ID(),
    'is_image' => wp_attachment_is('image', $post),
    'file' => get_attached_file($post->ID),
    'mimetype' => $post->post_mime_type,
    'test' => str_starts_with($post->post_mime_type, $type . '/'),
    ];
    // $result = array(
    //     'id' => get_the_ID(),
    //     'title' => get_the_title(),
    //     'content' => get_the_content(),
    //     'excerpt' => get_the_excerpt(),
    //     'permalink' => get_permalink(),
    //     'meta_data' => get_post_meta(get_the_ID()),
    // );
    }
    wp_reset_postdata();
    } else {
    $result['query'] = $query;
    // $data = [];
    // $data['post_parent'] = 0;
    // $data['post_type'] = 'attachment';
    // $data['meta_input'] = ['url' => $url];
    // $result = wp_insert_post($data, false, false);
    }
     */
/*
$result['img'] = get_post(289343);
$result['meta'] = get_post_meta(289343);
// return ['post'=>$img, 'meta' => $meta];

return $result;

$variation_id = 223847;
$woo_variation = new \WC_Product_Variation($variation_id);
$woo_variation->set_gallery_image_ids(['test/test', 'test/test']);

$image_ids = $woo_variation->get_gallery_image_ids();

return ['rows' => $rows, 'image_ids' => $image_ids, 'valid_skus' => $valid_skus];
//
//
//

return $supplier_variations;

$attr = $supplier->get_attributes_from_product($supplier_product);
$cache = $supplier->get_cached_attributekeys(); // wps only
// return ['attributes' => $attr, 'cache' => $cache];

$items = $supplier_product['data']['items']['data'];
$valid_items = array_filter($items, [$supplier, 'isValidItem']);

// return ['valid_items' => $valid_items, 'valid_items_count' => count($valid_items), 'items_count' => count($items)];
// $woo_product_id = $supplier->get_woo_id($supplier_product_id);
$master_attributes = $supplier->extract_attributes($supplier_product);

// simplified supplier product
$lookupAttr = $supplier_product['data']['attributekeys']['data'];

$p = [];
$p['name'] = $supplier_product['data']['name'];
$p['items'] = [];
$uniqueAttributes = [];

foreach ($supplier_product['data']['items']['data'] as $item) {
$av = [];
foreach ($item['attributevalues']['data'] as $a) {
$av[$lookupAttr[$a['attributekey_id']]['name']] = $a['name'];
$uniqueAttributes[$lookupAttr[$a['attributekey_id']]['name']] = true;
}
$p['items'][] = [
'id' => $item['id'],
'name' => $item['name'],
'attributevalues' => $av,
];
}

// turn into CSV
$atr = array_values(array_keys($uniqueAttributes));
$csv = [];
$csv[] = ['id', 'name', ...$atr];

// return $csv;

foreach ($p['items'] as $item) {
$row = [];
$row[0] = $item['id'];
$row[1] = $item['name'];

foreach ($atr as $i => $key) {
$row[$i + 2] = isset($item['attributevalues'][$key]) ? $item['attributevalues'][$key] : '-';
}
$csv[] = $row;

}
return ['rows' => $csv, 'master_attributes' => $master_attributes];

$attr_keys = $supplier_product['data']['attributekeys']['data'];
$lookup_slug_by_id = [];

foreach ($attr_keys as $attr_id => $attr) {
$lookup_slug_by_id[$attr_id] = $attr['slug'];
}

// $master_attr = array_column($master_attributes, 'slug');

$supplier_variations_id = array_column($supplier_variations, 'id');

$master_attr = array_values($supplier_product['data']['attributekeys']['data']);
$valid_items = array_filter($supplier_product['data']['items']['data'], [$supplier, 'isValidItem']);
$variations = [];

$rows = [];
// header
$row = [];
$row[] = 'id';
foreach ($master_attr as $attr) {
$row[] = $attr['name'];
}
$row[] = 'valid';
$rows[] = $row;

foreach ($valid_items as $i => $item) {
$attributes = [];
foreach ($item['attributevalues']['data'] as $attr) {
$attributes[$attr['attributekey_id']] = $attr['name'];
}
$variations[] = ['id' => $item['id'], 'attributes' => $attributes];

$row = [];
$row[] = $item['id'];
foreach ($master_attr as $attr) {
$row[] = isset($attributes[$attr['id']]) ? $attributes[$attr['id']] : '';
}
$rows[] = $row;
}
// $woo_product = $supplier->get_woo_product($supplier_product_id);
// $products = array_map(fn($p) => ['id' => $p['id']], $products);

return ['rows' => $rows, 'supplier_variations' => $supplier_variations,
// 'variations' => $variations,
'valid_items' => $valid_items,
];
 */

    // if ($supplier) {
    //     $is_importing = $supplier->is_importing();
    //     return ['supplier_key' => $supplier_key, 'is_importing' => $is_importing];
    // }
    // return ['error' => 'missing supplier'];

}
