<?php

namespace WooDropship\Suppliers\Settings;

class TuckerSettings extends SupplierSettings
{
    protected $options;
    protected $name = 'Tucker';
    public $slug = 'tucker';
    protected $api_fields = "tucker_api_fields";
    protected $settings_page = "tucker_api";

    public function registerSettings()
    {
        register_setting($this->api_fields, $this->api_fields);
        add_settings_section($this->settings_page, "{$this->name} API Settings", function () {
            return "<p>{$this->name} api settings will be managed here.</p>";
        }, $this->settings_page);

        add_settings_field('tucker_api_key', 'API Key', [$this, 'settingsField'], 'tucker_api', 'tucker_api', 'key');
        add_settings_field('tucker_customer_id', 'Customer ID', [$this, 'settingsField'], 'tucker_api', 'tucker_api', 'customer_id');
        add_settings_field('tucker_stock_thresh', 'Low Stock Threshold', [$this, 'settingsField'], 'tucker_api', 'tucker_api', 'stock_thresh');
    }
}
