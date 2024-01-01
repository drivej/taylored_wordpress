<?php

require_once __DIR__ . '../../ci-store-settings.php';
require_once __DIR__ . '/getWestern.php';

function getWesternProduct($id)
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
    return getWestern('products/' . $id, $params);
}
