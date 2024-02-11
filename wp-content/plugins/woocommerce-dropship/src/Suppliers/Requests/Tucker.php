<?php

namespace WooDropship\Suppliers\Requests;

class Tucker
{
	
	private $productionUrl = "https://api.tucker.com";
	private $testUrl       = "https://api.tucker.com";
	
	private $endpoint      = "/bin/trws";
	private $outputType    = "JSON";
	
	private $callTypeMapping = [
		'stockCheck' 		 => 'INV',
		'priceCheck' 		 => 'PRC',
		'stockAndPriceCheck' => 'INP',	
		'propositionWarning' => 'P65',
		'submitOrder'		 => 'ORD',
		'getShipments'		 => 'SHP',
	];
	
	private $apiKey;
	public $testing;
	private $customerId;
	public $stockThreshold;
	
	public function __construct($options, $testing = false)
	{
		extract($options);
		$this->apiKey = $key;
		$this->testing = $testing;
		$this->customerId = $customer_id;
		$this->stockThreshold = $stock_thresh ?? 9;
	}
	
	public function __call($method, $args)
	{
		if ($apiType = $this->callTypeMapping[$method] ?? null) {
			$payload = $args[0] ?? [];
			$payload['type'] = $apiType;
			$payload['apikey'] = $this->apiKey;
			$payload['output'] = $this->outputType;
			$payload['cust'] = $this->customerId;
			
			try {
				if ($res = $this->request($payload)) {
					return $this->parseResult($res->$apiType, $apiType);
				} else {
					return false;
				}
				
			} catch (\Exception $e) {
				throw($e);
			}
		} else {
			$this->$method(...$args);
		}
	}
	
	private function request($payload = [])
	{
		if ($this->testing) {
			$url = $this->testUrl . $this->endpoint;
		} else {
			$url = $this->productionUrl . $this->endpoint;
		}
		
		$arrayString = "";
		
		foreach ($payload as $key => $value) {
			if (is_array($value)) {
				unset($payload[$key]);
				foreach ($value as $item) {
					$arrayString .= "&{$key}={$item}";
				}
			}
		}
		
		$response = wp_remote_get($url . '?' . http_build_query($payload) . $arrayString);
				
		return json_decode(wp_remote_retrieve_body( $response ));
	}
	
	public function my_error_notice() {
		?>
		<div class="error notice">
			<p><?php _e( 'Tucker API Failure notice.', 'woocommerce' ); ?></p>
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