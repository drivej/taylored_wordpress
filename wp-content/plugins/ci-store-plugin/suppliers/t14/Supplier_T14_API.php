<?php

trait Supplier_T14_API
{
    private string $clientId = 'df98c919f33c6144f06bcfc287b984f809e33322';
    private string $clientSecret = '021320311e77c7f7e661d697227f80ae45b548a9';
    private string $api_domain = 'apitest.turn14.com';
    // private string $api_domain = 'api.turn14.com';
    private string $api_version = 'v1';

    public function getAccessToken()
    {
        $current_token = get_option($this->access_token_flag);
        if (isset($current_token['created']) && isset($current_token['expires']) && time() > ($current_token['expires'] * 0.9)) {
            return $current_token['access_token'];
        }
        $response = wp_safe_remote_request('https://' . $this->api_domain . '/' . $this->api_version . '/token', ['method' => 'POST', 'body' => ['client_id' => $this->clientId, 'client_secret' => $this->clientSecret, 'grant_type' => 'client_credentials']]);
        $result = ['access_token' => ''];

        if (is_wp_error($response)) {
            return ['error' => $response->get_error_message()];
        } else {
            $response_body = wp_remote_retrieve_body($response);
            $json_data = json_decode($response_body, true);

            if ($json_data === null) {
                return ['error' => 'Error decoding JSON response'];
            } else {
                $result['access_token'] = $json_data['access_token'];
                $result['expires_in'] = $json_data['expires_in'];
                $result['created'] = time();
                $result['expires'] = strtotime('+' . $result['expires_in'] . ' seconds');
                update_option($this->access_token_flag, $result);
            }
        }
        return $result['access_token'];
    }

    public function flushAccessToken()
    {
        delete_option($this->access_token_flag);
    }

    // This API has a 5000 request/hr limit so we cache in transients
    public function get_api($path, $params = [], $retry = 0, $use_cache = true)
    {
        $query_string = http_build_query($params);
        $pathKey = trim($path, '/') . '?' . $query_string;
        $pathHash = md5($pathKey);
        $transient_name = "{$this->key}_get_api_{$pathHash}_{$this->import_version}";
        $response = $use_cache ? get_transient($transient_name) : false;

        if (false === $response) {
            $should_cache = true;
            $access_token = $this->getAccessToken();
            $remote_url = implode('/', ['https://' . $this->api_domain, $this->api_version, trim($path, '/')]) . ($query_string ? '?' . $query_string : '');
            $response = wp_safe_remote_request($remote_url, ['headers' => [
                'Authorization' => "Bearer " . $access_token,
                'Content-Type' => 'application/json',
            ]]);
            if (is_wp_error($response)) {
                return ['error' => 'Request failed', 'message' => $response];
            }
            $response_body = wp_remote_retrieve_body($response);
            $data = json_decode($response_body, true);

            if (isset($data['error'])) {
                if ($data['error'] === 'invalid_token') {
                    if ($retry === 0) {
                        $this->flushAccessToken();
                        return $this->get_api($path, $params = [], $retry + 1);
                    }
                }
            }
            if (isset($data['errors'])) {
                if ($data['errors']['status'] === '404') {
                    // product not found - cache this response
                } else {
                    $should_cache = false;
                }
                $data['error'] = $data['errors']['title'];
            }
            if (isset($data['message'])) {
                $data['error'] = $data['message'];
            }
            if (!isset($data['meta'])) {
                $data['meta'] = [];
            }
            $data['meta']['transient_name'] = $transient_name;
            $data['meta']['fetched'] = gmdate("c");
            $data['meta']['remote_url'] = $remote_url;
            $data['meta']['retry'] = $retry;

            $response = $data;

            if ($should_cache) {
                set_transient($transient_name, $response, WEEK_IN_SECONDS);
            }
        }
        return $response;
    }
}
