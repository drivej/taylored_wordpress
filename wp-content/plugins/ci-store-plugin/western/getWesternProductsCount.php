<?php

require_once __DIR__ . '../../ci-store-settings.php';
require_once __DIR__ . '/getWestern.php';

function getWesternProductsCount($updated = '2020-01-01')
{
    $params = [];
    $params['filter[updated_at][gt]'] = $updated;
    $params['countOnly'] = 'true';
    $result = getWestern('products', $params);
    return $result['data']['count'] ?? -1;
}