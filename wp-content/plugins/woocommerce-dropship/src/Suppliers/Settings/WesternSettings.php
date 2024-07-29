<?php

namespace WooDropship\Suppliers\Settings;

class WesternSettings extends SupplierSettings
{
    protected $name = 'Western Power Sports';
    public $slug = 'wps';
    protected $api_fields = "wps_api_fields";
    protected $settings_page = "wps_api";

    public function registerSettings()
    {
        register_setting($this->api_fields, $this->api_fields);
        add_settings_section($this->settings_page, "{$this->name} API Settings", function () {
            return "<p>{$this->name} api settings will be managed here.</p>"; // this seemingly does nothing
        }, $this->settings_page);

        add_settings_field('wps_token', 'Bearer Token', [$this, 'settingsField'], $this->settings_page, $this->settings_page, 'token');
        add_settings_field('wps_customer_id', 'Customer ID', [$this, 'settingsField'], $this->settings_page, $this->settings_page, 'customer_id');
        add_settings_field('wps_stock_thresh', 'Low Stock Threshold', [$this, 'settingsField'], $this->settings_page, $this->settings_page, 'stock_thresh');
    }
}