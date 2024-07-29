<?php

trait Supplier_WPS_API
{
    private $bearer_token = 'aybfeye63PtdiOsxMbd5f7ZAtmjx67DWFAQMYn6R';
    private $api_url = "https://api.wps-inc.com";

    public function get_api($path, $params = [])
    {
        if (!isset($path)) {
            $this->log('WPS.get_api() ERROR path not set path=' . $path . '' . 'params=' . json_encode($params));
            return ['error' => 'path not set'];
        }

        $query_string = http_build_query($params);
        $pathKey = trim($path, '/') . '?' . $query_string;
        $pathHash = md5($pathKey);
        $transient_name = "{$this->key}_get_api_{$pathHash}_{$this->import_version}";
        $response = get_transient($transient_name);

        if (false === $response) {
            $should_cache = true;
            $remote_url = implode("/", [$this->api_url, trim($path, '/')]) . '?' . $query_string;

            if ($this->deep_debug) {
                $this->log('get_api() ' . $path . '?' . urldecode($query_string));
            }
            $response = wp_safe_remote_request($remote_url, ['headers' => [
                'Authorization' => "Bearer {$this->bearer_token}",
                'Content-Type' => 'application/json',
            ]]);
            if (is_wp_error($response)) {
                $should_cache = false;
                $data = [];
                $data['error'] = $response;
                $data['url'] = $remote_url;
                return $data;
            }
            $response_body = wp_remote_retrieve_body($response);
            $data = json_decode($response_body, true);
            if (isset($data['message'])) {
                $should_cache = false;
                $data['error'] = $data['message'];
                $data['url'] = $remote_url;
            }
            $data['meta']['transient_name'] = $transient_name;
            $data['meta']['fetched'] = gmdate("c");
            $data['meta']['remote_url'] = $remote_url;

            $response = $data;

            if ($should_cache) {
                set_transient($transient_name, $response, WEEK_IN_SECONDS);
            }
        }
        return $response;
    }
}
