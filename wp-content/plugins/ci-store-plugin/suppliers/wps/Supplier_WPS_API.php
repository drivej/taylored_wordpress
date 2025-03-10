<?php

trait Supplier_WPS_API
{
    private $bearer_token = 'aybfeye63PtdiOsxMbd5f7ZAtmjx67DWFAQMYn6R';
    private $api_url      = "https://api.wps-inc.com";
    // private $api_url      = "https://apitest.wps-inc.com"; // doesn't work?

    public function get_api($path, $params = [], $use_cache = true, $timeout = 30)
    {
        if (! isset($path)) {
            return ['error' => 'path not set'];
        }

        $query_string   = http_build_query($params);
        $pathKey        = trim($path, '/') . '?' . $query_string;
        $pathHash       = md5($pathKey);
        $transient_name = "{$this->key}_get_api_{$pathHash}_{$this->import_version}";
        $response       = $use_cache ? get_transient($transient_name) : false;

        if (false === $response) {
            $timer        = new Timer();
            $should_cache = true;
            $remote_url   = untrailingslashit($this->api_url) . '/' . ltrim($path, '/') . '?' . $query_string;
            $data         = [];
            // $this->log(__FUNCTION__, $path, $params);

            $response = wp_safe_remote_request($remote_url, [
                'headers'   => [
                    'Authorization' => "Bearer {$this->bearer_token}",
                    'Content-Type'  => 'application/json',
                ],
                'timeout'   => $timeout,
                'sslverify' => false,
            ]);

            // request failed
            if (is_wp_error($response)) {
                // $this->log(__FUNCTION__, 'err1');
                $should_cache  = false;
                $error_code    = $response->get_error_code();
                $error_message = $response->get_error_message();

                if ($error_code === 'http_request_failed' && str_contains($error_message, 'cURL error 28')) {
                    $data['status_code'] = 408;
                } else {
                    $data['status_code'] = 520;
                }
                $data['status_message'] = $this->error_codes[$data['status_code']] ?? '';
                $data['error']          = $error_message;
                $data['url']            = $remote_url;

                return $data;
            }

            if (is_null($response) || $response === false) {
                // $this->log(__FUNCTION__, 'response is null/false');
                $data['error'] = 'response is null/false';
                $data['url']   = $remote_url;
                return $data;
            }

            try {
                $response_body = wp_remote_retrieve_body($response);
            } catch (Exception $e) {
                // $this->log('failed wp_remote_retrieve_body');
                $response_body = '';
            }

            // bad status
            $status_code = wp_remote_retrieve_response_code($response);

            if ($status_code !== 200) {
                // $this->log(__FUNCTION__, 'err2');
                $data['error']         = 'HTTP error occurred';
                $data['url']           = $remote_url;
                $data['response_body'] = $response_body;
                $data['status_code']   = $status_code;
                return $data;
            }

            $data = json_decode($response_body, true);

            // json parse failed
            if (json_last_error() !== JSON_ERROR_NONE) {
                // $this->log(__FUNCTION__, 'err3');
                $data['error']         = 'Failed to parse JSON response: ' . json_last_error_msg();
                $data['url']           = $remote_url;
                $data['response_body'] = $response_body;
                return $data;
            }

            // message indicates error
            if (isset($data['message'])) {
                // $this->log(__FUNCTION__, 'err4');
                $should_cache  = false;
                $data['error'] = $data['message'];
                $data['url']   = $remote_url;
                return $data;
            }

            if ($data == '') {
                // $this->log(__FUNCTION__, 'err5');
                $should_cache  = false;
                $data['error'] = 'empty response';
                $data['url']   = $remote_url;
                return $data;
            }

            $data['meta']['transient_name'] = $transient_name;
            $data['meta']['fetched']        = gmdate("c");
            $data['meta']['remote_url']     = $remote_url;
            $data['meta']['time']           = $timer->total();

            $response = $data;

            if ($should_cache) {
                set_transient($transient_name, $response, WEEK_IN_SECONDS);
            }
        } else {
            // $this->log(__FUNCTION__, 'CACHE', $pathKey);
        }
        return $response;
    }
}
