<?php

namespace WooDropship\Suppliers\Settings;

class TuckerSettings
{
	private $options;
	
	public function __construct()
	{
		$this->options = get_option( 'tucker_api_fields' );
	}
	
	public function addSettingsPage() 
	{
		add_options_page( 'Tucker API Settings', 'Tucker API', 'manage_options', 'tucker_api_fields', [$this, 'settingsPageContent'] );
	}
	
	public function settingsPageContent()
	{
		?>
		<form action="options.php" method="post">
			<?php 
			settings_fields( 'tucker_api_fields' );
			do_settings_sections( 'tucker_api' ); ?>
			<input name="submit" class="button button-primary" type="submit" value="<?php esc_attr_e( 'Save' ); ?>" />
		</form>
		<?php
	}
	
	public function registerSettings()
	{
		register_setting( 'tucker_api_fields', 'tucker_api_fields' );
		add_settings_section( 'tucker_api', 'Tucker API Settings', function() {
			return '<p>Tucker api settings will be managed here.</p>';
		}, 'tucker_api' );
	
		add_settings_field( 'tucker_api_key', 'API Key', [$this, 'apiKeyField'], 'tucker_api', 'tucker_api' );
		add_settings_field( 'tucker_customer_id', 'Customer ID', [$this, 'customerIdField'], 'tucker_api', 'tucker_api');
		add_settings_field( 'tucker_stock_thresh', 'Low Stock Threshold', [$this, 'stockThreshold'], 'tucker_api', 'tucker_api');
	}
	
	public function apiKeyField()
	{
		echo "<input id='tucker_api_key' name='tucker_api_fields[key]' type='text' value='" . esc_attr( $this->options['key'] ) . "' />";
	}
	
	public function customerIdField()
	{
		echo "<input id='tucker_customer_id' name='tucker_api_fields[customer_id]' type='text' value='" . esc_attr( $this->options['customer_id'] ) . "' />";
	}
	
	public function stockThreshold()
	{
		echo "<input id='tucker_stock_thresh' name='tucker_api_fields[stock_thresh]' type='text' value='" . esc_attr( $this->options['stock_thresh'] ?? 0 ) . "' />";
	}
	

}