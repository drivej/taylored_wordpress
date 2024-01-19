<?php

require_once __DIR__ . '/get_western.php';

function get_western_products_page($cursor = '', $updated = '2020-01-01', $size = 10)
{
    $params = [];
    $params['include'] = implode(',', [
        'items:filter(status_id|NLA|ne)', // we don't want to consider products that are no longer available
    ]);
    $params['filter[updated_at][gt]'] = $updated;
    if (isset($cursor)) {
        $params['page[cursor]'] = $cursor;
    }
    $params['page[size]'] = $size;
    $params['fields[items]'] = 'id,updated_at,status_id';
    $params['fields[products]'] = 'id,name,updated_at';

    return get_western('products', $params);
}
