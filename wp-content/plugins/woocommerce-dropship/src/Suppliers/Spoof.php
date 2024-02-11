<?php

namespace WooDropship\Suppliers;

class Spoof extends Supplier implements Contract
{
	private $request;
	
	public $slug = 'spoof';
	
	public function __construct()
	{
		
	}
	
	public function stockCheck(array $items)
	{
		return 42;
	}
	
	public function priceCheck(array $items)
	{
		return 3.14;
	}
	
	public function submitOrder(array $order, array $data) : string
	{
		return "SPOOF_12345";
	}
	
	public function getShipments(array $orders)
	{
		return [];
	}
}