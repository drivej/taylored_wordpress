<?php

function isValidProduct($product)
{
    return count($product['items']['data']) > 0;
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
