<?php

require_once __DIR__ . '../../ci-store-settings.php';
// require_once __DIR__ . '../ci-store-utils.php';

function getWestern($path, $params)
{
    global $SUPPLIER;
    $key = 'WPS';
    $query_string = http_build_query($params);
    $remote_url = implode("/", [$SUPPLIER[$key]['api'], trim($path, '/')]) . '?' . $query_string;
    $response = wp_safe_remote_request($remote_url, ['headers' => $SUPPLIER[$key]['headers']]);
    if (is_wp_error($response)) {
        return ['error' => 'Request failed'];
    }
    $response_body = wp_remote_retrieve_body($response);
    return json_decode($response_body, true);
}
