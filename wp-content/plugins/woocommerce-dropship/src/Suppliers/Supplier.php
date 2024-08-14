<?php

namespace WooDropship\Suppliers;

abstract class Supplier
{
    public $slug = 'supplier';

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
		// This was do_actions() = type??
        do_action($this->hookTag($tag), ...$args);
    }

    protected function filter($tag, ...$args)
    {
        return apply_filters($this->hookTag($tag), ...$args);
    }
}
