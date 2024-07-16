<?php

namespace WooDropship;

class Plugin
{
	private $wooCommerce;
	private $settingsClass;
	
	private $supplierSettings = [
		'WooDropship\\Suppliers\\Settings\\TuckerSettings',
		'WooDropship\\Suppliers\\Settings\\WPSSettings'	
	];
	
	public function __construct()
	{	
		$this->wooCommerce = new WooCommerce();
		
		$this->addActions();
		$this->addFilters();
		
		if ( ! wp_next_scheduled( 'wcds_cron_hook' ) ) {
			wp_schedule_event( time(), 'five_minutes', 'wcds_cron_hook' );
		}
	}
	
	public function addActions()
	{
		add_action('woocommerce_checkout_create_order', [$this->wooCommerce, 'orderCreateSupplierOrder'], 10, 2);
		add_action('init', [$this->wooCommerce, 'registerShippedStatus'] );
		
		// Register settings pages defined above
		foreach (apply_filters('wc_dropship_supplier_settings', $this->supplierSettings) as $settingsClass) {
			$instance = new $settingsClass;
			add_action('admin_menu', [$instance, 'addSettingsPage'], 10, 2);
			add_action('admin_init', [$instance, 'registerSettings'] );
		}
		
		add_action( 'wcds_cron_hook', [$this->wooCommerce, 'updateShippedOrders'] );
	}
	
	public function addFilters()
	{
		
		// Order Filters
		add_filter('wc_order_statuses', [$this->wooCommerce, 'addShippedStatus'] );
		
		// Product Filters
		add_filter('woocommerce_product_is_in_stock', [$this->wooCommerce, 'productIsInStock'], 10, 2);
		add_filter('woocommerce_product_get_stock_quantity', [$this->wooCommerce, 'productQuantity'], 10, 2);
		add_filter('woocommerce_product_get_sku', [$this->wooCommerce, 'productSku'], 10, 2);
		add_filter('woocommerce_product_get_manage_stock', [$this->wooCommerce, 'manageStock'], 10, 2);
		
		// Variation Filters
		add_filter('woocommerce_product_variation_get_manage_stock', [$this->wooCommerce, 'manageStock'], 10, 2);
		add_filter('woocommerce_product_variation_get_sku', [$this->wooCommerce, 'productSku'], 10, 2);
		add_filter('woocommerce_product_variation_get_stock_quantity', [$this->wooCommerce, 'productQuantity'], 10, 2);

	}

		
}