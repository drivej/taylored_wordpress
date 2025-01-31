<?php

trait Supplier_T14_API
{
    private string $clientId     = 'df98c919f33c6144f06bcfc287b984f809e33322';
    private string $clientSecret = '021320311e77c7f7e661d697227f80ae45b548a9';
    private string $api_url      = "https://apitest.turn14.com/v1";
    // private string $api_url = "https://api.turn14.com/v1";

    public function getAccessToken()
    {
        $current_token = get_option($this->access_token_flag);
        if (isset($current_token['created']) && isset($current_token['expires']) && time() > ($current_token['expires'] * 0.9)) {
            return $current_token;
        }
        $remote_url = $this->api_url . '/token';
        $data       = ['access_token' => '', 'meta' => ['url' => $remote_url]];

        $response = wp_safe_remote_request($remote_url, [
            'method' => 'POST',
            'body'   => [
                'client_id'     => $this->clientId,
                'client_secret' => $this->clientSecret,
                'grant_type'    => 'client_credentials',
            ],
        ]);

        if (is_wp_error($response)) {
            $data['error'] = $response->get_error_message();
            return $data;
        }

        $response_body       = wp_remote_retrieve_body($response);
        $json_data           = json_decode($response_body, true);
        $status_code         = wp_remote_retrieve_response_code($response);
        $data['status_code'] = $status_code;

        // json parse failed
        if (json_last_error() !== JSON_ERROR_NONE) {
            $data['error']         = 'Failed to parse JSON response: ' . json_last_error_msg();
            $data['response_body'] = $response_body;
            return $data;
        }

        $data['access_token'] = $json_data['access_token'];
        $data['expires_in']   = $json_data['expires_in'];
        $data['created']      = time();
        $data['expires']      = strtotime('+' . $data['expires_in'] . ' seconds');
        update_option($this->access_token_flag, $data);

        return $data;
    }

    public function flushAccessToken()
    {
        delete_option($this->access_token_flag);
    }

    // This API has a 5000 request/hr limit so we cache in transients
    public function get_api($path, $params = [], $use_cache = true, $expiration = WEEK_IN_SECONDS, $retry = 0)
    {
        if (strpos($path, '/v1') === 0) {
            $path = substr($path, 3);
        }
        // check for searchParams in the path
        if (strpos($path, '?') !== false) {
            $parts       = explode('?', $path);
            $path        = $parts[0];
            $queryString = isset($parts[1]) ? $parts[1] : '';
            $queryArray  = [];

            if (! empty($queryString)) {
                parse_str($queryString, $queryArray);
            }

            $params = [ ...$queryArray, ...$params];
        }

        // $this->log(__FUNCTION__, $path, $params);
        $query_string   = http_build_query($params);
        $remote_url     = implode('/', [$this->api_url, trim($path, '/')]) . ($query_string ? '?' . $query_string : '');
        $pathHash       = md5($remote_url);
        $transient_name = "{$this->key}_api_{$this->import_version}_{$pathHash}";
        $response       = $use_cache ? get_transient($transient_name) : false;

        if (false === $response) {
            error_log('api: ' . $remote_url);
            $data         = ['meta' => ['url' => $remote_url]];
            $should_cache = true;

            // get access token
            $token_request = $this->getAccessToken();

            if (isset($token_request['error']) || ! isset($token_request['access_token'])) {
                return $token_request;
            }
            $access_token = $token_request['access_token'];

            $response = wp_safe_remote_request($remote_url, ['headers' => [
                'Authorization' => "Bearer " . $access_token,
                'Content-Type'  => 'application/json',
            ]]);

            if (is_wp_error($response)) {
                $data['error']   = 'Request failed';
                $data['message'] = $response->get_error_message();
                return $data;
            }

            $response_body       = wp_remote_retrieve_body($response);
            $status_code         = wp_remote_retrieve_response_code($response);
            $data['status_code'] = $status_code;

            // retry on expired token
            if ($status_code === 401) {
                if ($retry === 0) {
                    $this->flushAccessToken();
                    return $this->get_api($path, $params, $use_cache, $expiration, $retry + 1);
                } else {
                    $data['error']   = $this->error_codes[$status_code];
                    $data['message'] = $response_body;
                    return $data;
                }
            }

            if ($status_code !== 200) {
                if (array_key_exists($status_code, $this->error_codes)) {
                    $data['error'] = $this->error_codes[$status_code];
                }
                return $data;
            }

            $data = json_decode($response_body, true);

            // json parse failed
            if (json_last_error() !== JSON_ERROR_NONE) {
                $data['error']         = 'Failed to parse JSON response: ' . json_last_error_msg();
                $data['response_body'] = $response_body;
                return $data;
            }

            if (! isset($data['meta'])) {
                $data['meta'] = [];
            }

            $data['meta']['transient_name'] = $transient_name;
            $data['meta']['fetched']        = gmdate("c");
            $data['meta']['remote_url']     = $remote_url;
            $data['meta']['retry']          = $retry;

            $response = $data;

            if ($should_cache) {
                set_transient($transient_name, $response, $expiration);
            }
        }
        return $response;
    }
}
