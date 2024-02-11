<?php

namespace WooDropship\Models;

use ArrayAccess;

class Shipments implements ArrayAccess
{
	private $container = [];
	
	public function offsetSet($offset, $value)
	{
		if (!$value instanceof Shipment) {
			throw new \Exception('value must be an instance of Item');
		}
	
		if (is_null($offset)) {
			$this->container[] = $value;
		} else {
			$this->container[$offset] = $value;
		}
	}
	
	public function offsetExists($offset)
	{
		return isset($this->container[$offset]);
	}
	
	public function offsetUnset($offset)
	{
		unset($this->container[$offset]);
	}
	
	public function offsetGet($offset)
	{
		return isset($this->container[$offset]) ? $this->container[$offset] : null;
	}
}