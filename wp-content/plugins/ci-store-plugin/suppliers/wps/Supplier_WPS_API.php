<?php

trait Supplier_WPS_API
{
    public function get_api($path, $params = [])
    {
        if (!isset($path)) {
            $this->log('WPS.get_api() ERROR path not set path=' . $path . '' . 'params=' . json_encode($params));
            return ['error' => 'path not set'];
        }
        $query_string = http_build_query($params);
        $remote_url = implode("/", ["https://api.wps-inc.com", trim($path, '/')]) . '?' . $query_string;
        if ($this->deep_debug) {
            $this->log('get_api() ' . $path . '?' . urldecode($query_string));
        }
        $response = wp_safe_remote_request($remote_url, ['headers' => [
            'Authorization' => "Bearer aybfeye63PtdiOsxMbd5f7ZAtmjx67DWFAQMYn6R",
            'Content-Type' => 'application/json',
        ]]);
        if (is_wp_error($response)) {
            return ['error' => 'Request failed'];
        }
        $response_body = wp_remote_retrieve_body($response);
        $data = json_decode($response_body, true);
        if (isset($data['message'])) {
            $data['error'] = $data['message'];
        }
        return $data;
    }
}
