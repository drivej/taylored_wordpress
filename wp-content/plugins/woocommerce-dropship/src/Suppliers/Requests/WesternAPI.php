<?php

namespace WooDropship\Suppliers\Requests;

class WesternAPI
{
    private $productionUrl = "https://api.wps-inc.com";
    private $testUrl = "https://api.wps-inc.com";

    // private $endpoint = "/bin/trws";
    private $outputType = "JSON";

    private $callTypeMapping = [
        /* 'stockCheck' => 'INV',
    'priceCheck' => 'PRC',
    'stockAndPriceCheck' => 'INP',
    'propositionWarning' => 'P65',
    'submitOrder' => 'ORD',
    'getShipments' => 'SHP', */
    ];

    private $token = 'aybfeye63PtdiOsxMbd5f7ZAtmjx67DWFAQMYn6R';
    public $testing;
    private $customerId;
    public $stockThreshold;

    public function __construct($options, $testing = false)
    {
        // extract($options);
        // print_r($options);
        if ($options['token']) {
            $this->token = $options['token'];
        }
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

    public function submitOrder($cartId)
    {
        error_log('WesternAPI->submitOrder() ' . $cartId);
        // return ['submit' => false, 'id' => $cartId];
        return $this->request('/orders', [
            'po_number' => $cartId,
        ], 'post');
    }

    public function createCart(array $data)
    {
        return $this->request('/carts', $data, 'post');
    }

    public function addToCart($cartId, $item, $qty = 1)
    {
        return $this->request('/carts/' . $cartId . '/items', [
            'item_sku' => $item,
            'quantity' => $qty,
        ], 'post');
    }

    public function request($endpoint, $payload = [], $method = 'get')
    {

        $host = $this->testing ? $this->testUrl : $this->productionUrl;

        if ($method == 'get') {
            $url = $host . $endpoint . '?' . http_build_query($payload);
        } else {
            $url = $host . $endpoint;
        }

        $response = wp_safe_remote_request($url, [
            'method' => strtoupper($method),
            'body' => json_encode($payload),
            'timeout' => 30,
            'headers' => [
                'Authorization' => "Bearer {$this->token}",
                'Content-Type' => 'application/json',
            ],
        ]);

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