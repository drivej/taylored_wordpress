<?php

require_once __DIR__ . '../../ci-store-settings.php';
require_once __DIR__ . '/getWestern.php';
// require_once __DIR__ . '../getWestern.php';
// require_once __DIR__ . '/ci-store-utils.php';

function getWesternProductsPage($cursor = '', $updated = '2020-01-01')
{
    // global $SUPPLIER;
    // $key = 'WPS';
    // $path = 'products';
    $params = [];
    $params['include'] = implode(',', [
        //     'features', //
        //     'tags',
        // 'items',
        //     'items.images',
        //     'attributekeys',
        //     'attributevalues',
        //     'items.inventory',
        //     'items.attributevalues',
        //     'items.taxonomyterms',
        //     'taxonomyterms',
        'items:filter(status_id|NLA|ne)', // we don't want to consider products that are no longer available
    ]);
    $params['filter[updated_at][gt]'] = $updated;
    if (isset($cursor)) {
        $params['page[cursor]'] = $cursor;
    }
    //
    $params['page[size]'] = 10;
    $params['fields[items]'] = 'id,updated_at';
    $params['fields[products]'] = 'id,updated_at';

    // foreach ($_GET as $propertyName => $propertyValue) {
    //     foreach ($allowParams as $testName) {
    //         if (strpos($propertyName, $testName) !== false) {
    //             $filteredProperties[$propertyName] = $propertyValue;
    //             break;
    //         }
    //     }
    // }
    return getWestern('products', $params);

    // $query_string = http_build_query($params);
    // $remote_url = implode("/", [$SUPPLIER[$key]['api'], trim($path, '/')]) . '?' . $query_string;
    // $response = wp_safe_remote_request($remote_url, ['headers' => $SUPPLIER[$key]['headers']]);

    // if (is_wp_error($response)) {
    //     wp_send_json(['error' => 'Request failed']);
    // }

    // $response_body = wp_remote_retrieve_body($response);
    // $response_json = json_decode($response_body); // cast as array to add props
    // wp_send_json($response_json, 200, JSON_PRETTY_PRINT);
}