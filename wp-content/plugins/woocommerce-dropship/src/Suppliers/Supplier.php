<?php

namespace WooDropship\Suppliers;

abstract class Supplier
{
	public function manageStock($default)
	{
		return $default;
	}	
	
	protected function hookTag($tag)
	{
		return "wc_dropship_{$this->slug}_{$tag}";
	}
	
	protected function action($tag, ...$args)
	{
		do_actions($this->hookTag($tag), ...$args);
	}
	
	protected function filter($tag, ...$args)
	{
		return apply_filters($this->hookTag($tag), ...$args);
	}
}