<?php

function isValidProduct($product)
{
    return !isset($product['error']) && count($product['items']['data']) > 0;
}

function getValidProductIds($products)
{
    $valid = array_filter($products, 'isValidProduct');
    $ids = array_map('mapProductIds', $valid);
    return $ids;
}

function mapProductIds($product)
{
    return ['id' => $product['id']];
}

function filterNonEmptyData($item)
{
    return count($item['items']['data']) > 0;
}

// : 200 | 500 | 1000 | 'full';

function build_western_image($img, $size = 200)
{
    if (!isset($img)) {
        return '';
    }

    return implode('', ['http://', $img['domain'], $img['path'], $size . '_max', '/', $img['filename']]);
};

function resize_western_image($src, $size = 200)
{
    return str_replace('200_max', $size . '_max', $src);
}

function get_western_sku($product)
{
    $product_id = $product['data']['id'];
    return implode('_', ['MASTER', 'WPS', $product_id]);
}

function get_western_variation_sku($product, $item)
{
    $product_id = $product['data']['id'];
    $item_id = $item['id'];
    return implode('_', ['MASTER', 'WPS', $product_id, 'VARIATION', $item_id]);
}
