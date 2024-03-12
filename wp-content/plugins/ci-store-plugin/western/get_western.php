<?php

// require_once __DIR__ . '../../ci-store-settings.php';
// require_once __DIR__ . '../ci-store-utils.php';

include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';

function get_western($path, $params = [])
{
    $supplier = \CI\Admin\get_supplier('wps');
    return $supplier->get_api($path, $params);
    // global $WxPS_SETTINGS;
    // $key = 'WPS';
    // $query_string = http_build_query($params);
    // $remote_url = implode("/", [$W PS_SETTINGS['api'], trim($path, '/')]) . '?' . $query_string;
    // $response = wp_safe_remote_request($remote_url, ['headers' => $W PS_SETTINGS['headers']]);
    // if (is_wp_error($response)) {
    //     return ['error' => 'Request failed'];
    // }
    // $response_body = wp_remote_retrieve_body($response);
    // $data = json_decode($response_body, true);
    // if (isset($data['message'])) {
    //     $data['error'] = $data['message'];
    // }
    // return $data;
}
