<?php

namespace WooDropship\Suppliers;

use WooDropship\Models\Shipments;

interface Contract
{	
	public function stockCheck(array $items);
	public function priceCheck(array $items);
	public function submitOrder(array $items, array $data) : string;
	public function getShipments(array $orders) : Shipments;
	public function stockThreshold();
}