<?php

namespace WooDropship\Suppliers\Requests;

class WesternAPI
{
    private $productionUrl = "https://api.wps-inc.com";
    private $testUrl = "https://api.wps-inc.com";

    // private $endpoint = "/bin/trws";
    private $outputType = "JSON";

    private $callTypeMapping = [
        'stockCheck' => 'INV',
        'priceCheck' => 'PRC',
        'stockAndPriceCheck' => 'INP',
        'propositionWarning' => 'P65',
        'submitOrder' => 'ORD',
        'getShipments' => 'SHP',
    ];

    private $token;
    public $testing;
    private $customerId;
    public $stockThreshold;

    public function __construct($options, $testing = false)
    {
        // extract($options);
        // print_r($options);
        $this->token = $options['token'];
        $this->testing = $testing;
        // $this->customerId = $customer_id;
        // $this->stockThreshold = $stock_thresh ?? 9;

        // $test = $this->request(['path' => '/items']);
        // error_log(json_encode($test));
    }

    public function __call($method, $args)
    {
        if ($apiType = $this->callTypeMapping[$method] ?? null) {
            $payload = $args[0] ?? [];
            $payload['type'] = $apiType;
            $payload['wps_token'] = $this->token;
            $payload['output'] = $this->outputType;
            $payload['cust'] = $this->customerId;

            try {
                if ($res = $this->request($payload)) {
                    return $this->parseResult($res->$apiType, $apiType);
                } else {
                    return false;
                }

            } catch (\Exception $e) {
                throw ($e);
            }
        } else {
            $this->$method(...$args);
        }
    }

    public function request($payload = [])
    {
        $path = '';
        if (isset($payload['path'])) {
            $path = $payload['path']; // requires a leading slash
            unset($payload['path']);
        }

        $host = $this->testing ? $this->testUrl : $this->productionUrl;
        $url = $host . $path . '?' . http_build_query($payload);

        $response = wp_safe_remote_request($url, ['headers' => [
            'Authorization' => "Bearer {$this->token}",
            'Content-Type' => 'application/json',
        ]]);

        if (is_wp_error($response)) {
            return ['error' => 'Request failed'];
        }

        return json_decode(wp_remote_retrieve_body($response));
    }

    public function my_error_notice()
    {
        ?>
		<div class="error notice">
			<p><?php _e('WPS API Failure notice.', 'woocommerce');?></p>
		</div>
		<?php
}

    private function parseResult($result, $type)
    {
        $status = $result->status;
        if ($status == 'SUCCESSFUL') {
            switch ($type) {
                case 'ORD':
                    return $result->orderoutput;
                    break;
                case 'INV':
                    return intval($result->item[0]->inventory);
                    break;
                case 'PRC':
                    return floatval($result->item[0]->price);
                    break;
                case 'INP':
                    return [
                        'inventory' => intval($result->item[0]->inventory),
                        'retailPrice' => floatval($result->item[0]->price),
                    ];
                    break;
                case 'SHP':
                    return $result->shipment;
                    break;
                default:
                    return $result;
                    break;
            }
        } else {
            return false;
        }

    }

}