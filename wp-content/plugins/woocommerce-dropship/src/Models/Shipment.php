<?php

namespace WooDropship\Models;

class Shipment
{
	
	private $number;
	private $carrier;
	private $tracking;
	
	public function __construct($number, $carrier, $tracking) {
		$this->number = $number;
		$this->carrier = $carrier;
		$this->tracking = $tracking;
	}
	
	public function getNumber()
	{
		return $this->number;
	}
	
	public function getCarrier()
	{
		return $this->carrier;
	}
	
	public function getTracking()
	{
		return $this->tracking;
	}
}