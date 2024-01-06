<?php

require_once __DIR__ . '/get_western.php';

function get_western_products_count($updated = '2020-01-01')
{
    $params = [];
    $params['filter[updated_at][gt]'] = $updated;
    $params['countOnly'] = 'true';
    $result = get_western('products', $params);
    return $result['data']['count'] ?? -1;
}