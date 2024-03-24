<?php
/*
DIR = 'DIR', //'DIRECT SHIP FROM VENDOR', // available
DSC = 'DSC', //'DISCONTINUED ITEM', // NOT available
CLO = 'CLO', //'CLOSEOUT ITEM', // available
NA = 'NA', //'NOT AVAILABLE AT THIS TIME', // NOT available
NEW = 'NEW', //'NEW ITEM', // available
NLA = 'NLA', //'NO LONGER AVAILABLE', // NOT available
PRE = 'PRE', //'PRE -RELEASE ITEM (CONTACT REP TO ORDER)', // NOT available
SPEC = 'SPEC', //'SPECIAL ORDER', // available
STK = 'STK' //'STANDARD STOCKING ITEM' // available
 */

// function isValidProduct($product)
// {
//     $reasons = isInvalidReasons($product);
//     return !count($reasons); //!isset($product['error']) && isset($product['data']['items']['data']) && count($product['data']['items']['data']) > 0 && count(array_filter($product['data']['items']['data'], 'isValidItem'));
// }

// function isInvalidReasons($product)
// {
//     $reasons = [];
//     if (isset($product['error'])) {
//         $reasons[] = 'Product error';
//     } else {
//         $items = $product['data']['items']['data'];
//         if (isset($items)) {
//             if (count($items)) {
//                 $validItems = array_filter($items, 'isValidItem');
//                 if (count($validItems)) {
//                     if (!wps_product_has_images($product)) {
//                         $reasons[] = 'No images found';
//                     }
//                 } else {
//                     $reasons[] = (bool) count($validItems) . ' of ' . count($items) . ' valid items';
//                 }
//             } else {
//                 $reasons[] = 'Empty items';
//             }
//         } else {
//             $reasons[] = 'No items data';
//         }
//     }
//     return $reasons;
// }

// function wps_product_has_items($product)
// {
//     $items = $product['data']['items']['data'];
//     return isset($items);
// }

// function wps_product_has_images($product)
// {
//     if (wps_product_has_items($product)) {
//         $items = $product['data']['items']['data'];
//         $itemsWithImages = array_filter($items, 'wps_item_has_images');
//         return (bool) count($itemsWithImages);
//     }
//     return false;
// }

// function wps_item_has_images($item)
// {
//     return count($item['images']['data']);
// }

function isValidItem($item)
{
    $status_ids = ['DIR', 'NEW', 'STK'];
    return in_array($item['status_id'], $status_ids);
}

function isDeadItem($item)
{
    $status_ids = ['NLA', 'CLO', 'DSC'];
    return in_array($item['status_id'], $status_ids);
}

// function getValidProductIds($products)
// {
//     $valid = array_filter($products, 'isValidProduct');
//     $ids = array_map('mapProductIds', $valid);
//     return $ids;
// }

// function mapProductIds($product)
// {
//     return ['id' => $product['id']];
// }

// function filterNonEmptyData($item)
// {
//     return count($item['items']['data']) > 0;
// }

// : 200 | 500 | 1000 | 'full';

function build_western_image($img, $size = 200)
{
    if (!isset($img)) {
        return '';
    }

    return implode('', ['https://', $img['domain'], $img['path'], $size . '_max', '/', $img['filename']]);
};

function resize_western_image($src, $size = 200)
{
    return str_replace('200_max', $size . '_max', $src);
}

// function get_western_sku($product_id)
// {
//     return implode('_', ['MASTER', 'WPS', $product_id]);
// }

// function get_western_variation_sku($product, $item)
// {
//     $product_id = $product['data']['id'];
//     $item_id = $item['id'];
//     return implode('_', ['MASTER', 'WPS', $product_id, 'VARIATION', $item_id]);
// }

// function get_western_stock($wps_product_id)
// {
//     $params = [];
//     $params['include'] = implode(',', [
//         'items',
//         'items.inventory',
//     ]);
//     $product = get_western('products/' . $wps_product_id, $params);
//     // print_r($product);
//     return isset($product['data']) && has_valid_items($product['data']);
//     // $items = $product['data']['items']['data'];
//     // if (isset($items)) {
//     //     $valid_items = array_filter($items, 'isValidItem');
//     //     if (count($valid_items)) {
//     //         return true;
//     //     }
//     // }
//     // return false;
// }

// function has_valid_items($wps_product_data)
// {
//     $items = isset($wps_product_data['items']['data']) ? $wps_product_data['items']['data'] : [];
//     if (count($items)) {
//         $valid_items = array_filter($items, 'isValidItem');
//         if (count($valid_items)) {
//             return true;
//         }
//     }
//     return false;
// }

// function wps_should_delete($wps_product_data)
// {
//     $items = $wps_product_data['items']['data'];
//     if (isset($items)) {
//         $valid_items = array_filter($items, 'isDeadItem');
//         if (count($valid_items) === count($items)) {
//             return true;
//         }
//     }
//     return false;
// }

// function get_western_stock_status($wps_product_id)
// {
//     $in_stock = get_western_stock($wps_product_id);
//     return $in_stock ? 'instock' : 'outofstock';
// }
