<?php

namespace WooDropship\Suppliers\Settings;

class SupplierSettings
{
    protected $options;
    protected $name = 'Supplier Name';
    public $slug = 'supplier';
    protected $api_fields = 'supplier';
    protected $settings_page = "supplier_api";

    public function __construct()
    {
        $this->options = get_option($this->api_fields);
    }

    public function addSettingsPage()
    {
        add_options_page("{$this->name} API Settings", "{$this->name} API", 'manage_options', $this->api_fields, [$this, 'settingsPageContent']);
    }

    public function settingsPageContent()
    {
        ?>
		<form action="options.php" method="post">
			<?php
            settings_fields($this->api_fields);
            do_settings_sections($this->settings_page);
            ?>
			<input name="submit" class="button button-primary" type="submit" value="<?php esc_attr_e('Save');?>" />
		</form>
		<?php
    }

    public function settingsField($name, $default_value = '')
    {
        $value = isset($this->options[$name]) ? $this->options[$name] : $default_value;
        echo "<input style='width:100%;' id='{$this->slug}_{$name}' name='{$this->slug}_api_fields[{$name}]' type='text' value='" . esc_attr($value) . "' />";
    }
}
