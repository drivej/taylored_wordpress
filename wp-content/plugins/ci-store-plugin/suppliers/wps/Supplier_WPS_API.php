<?php

trait Supplier_WPS_API {
    private $bearer_token = 'aybfeye63PtdiOsxMbd5f7ZAtmjx67DWFAQMYn6R';
    private $api_url      = "https://api.wps-inc.com";

    public function get_api($path, $params = [], $use_cache = true) {
        if (! isset($path)) {
            return ['error' => 'path not set'];
        }

        $query_string   = http_build_query($params);
        $pathKey        = trim($path, '/') . '?' . $query_string;
        $pathHash       = md5($pathKey);
        $transient_name = "{$this->key}_get_api_{$pathHash}_{$this->import_version}";
        $response       = $use_cache ? get_transient($transient_name) : false;

        if (false === $response) {
            $should_cache = true;
            $remote_url   = untrailingslashit($this->api_url) . '/' . ltrim($path, '/') . '?' . $query_string;
            $data         = [];

            $response = wp_safe_remote_request($remote_url, ['headers' => [
                'Authorization' => "Bearer {$this->bearer_token}",
                'Content-Type'  => 'application/json',
            ]]);

            // request failed
            if (is_wp_error($response)) {
                $should_cache  = false;
                $data['error'] = $response;
                $data['url']   = $remote_url;
                return $data;
            }

            $response_body = wp_remote_retrieve_body($response);

            // bad status
            $status_code = wp_remote_retrieve_response_code($response);
            if ($status_code < 200 || $status_code >= 300) {
                $this->log('ERROR status_code: response_body=' . substr($response_body, 0, 250));
                $data['error']         = 'HTTP error occurred';
                $data['url']           = $remote_url;
                $data['response_body'] = $response_body;
                return $data;
            }

            $data = json_decode($response_body, true);

            // json parse failed
            if (json_last_error() !== JSON_ERROR_NONE) {
                $this->log('ERROR json_decode: response_body=' . substr($response_body, 0, 250));
                $data['error']         = 'Failed to parse JSON response: ' . json_last_error_msg();
                $data['url']           = $remote_url;
                $data['response_body'] = $response_body;
                return $data;
            }

            // message indicates error
            if (isset($data['message'])) {
                $should_cache  = false;
                $data['error'] = $data['message'];
                $data['url']   = $remote_url;
            }

            $data['meta']['transient_name'] = $transient_name;
            $data['meta']['fetched']        = gmdate("c");
            $data['meta']['remote_url']     = $remote_url;

            $response = $data;

            if ($should_cache) {
                set_transient($transient_name, $response, WEEK_IN_SECONDS);
            }
        }
        return $response;
    }
}
