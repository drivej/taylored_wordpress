<?php

require_once __DIR__ . '/get_western.php';
require_once __DIR__ . '/get_western_attributes_from_product.php';

function get_western_product($id)
{
    $params = [];
    $params['include'] = implode(',', [
        'features', //
        'tags',
        'attributekeys',
        'attributevalues',
        'items',
        'items.images',
        'items.inventory',
        'items.attributevalues',
        'items.taxonomyterms',
        'taxonomyterms',
        'items:filter(status_id|NLA|ne)',
    ]);
    $product = get_western('products/' . $id, $params);
    $product['data']['attributekeys']['data'] = get_western_attributes_from_product($product);
    return $product;
}
