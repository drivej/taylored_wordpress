<?php

namespace WooDropship;

class Plugin
{
    public $wooCommerce;
    public $settingsClass;

    private $supplierSettings = [
        'WooDropship\\Suppliers\\Settings\\TuckerSettings',
        'WooDropship\\Suppliers\\Settings\\WesternSettings',
    ];

    public function __construct()
    {
        $this->wooCommerce = new WooCommerce();

        $this->addActions();
        $this->addFilters();

        // $wps = $this->wooCommerce->getSupplier('wps');
        // $test = $wps->stockCheck([]);
        // print_r(json_encode($test, JSON_PRETTY_PRINT));

        if (!wp_next_scheduled('wcds_cron_hook')) {
            wp_schedule_event(time(), 'five_minutes', 'wcds_cron_hook');
        }
    }

    // public function custom_woocommerce_before_checkout_process()
    // {
    //     error_log('custom_woocommerce_before_checkout_process()');
    // }

    // public function custom_woocommerce_thankyou($order_id)
    // {
	// 	// fires every time thankyou page is reloaded
    //     error_log('custom_woocommerce_thankyou() ' . $order_id);
    //     $order = wc_get_order($order_id);
    //     $cart_items = $order->get_items();
    //     error_log(json_encode(['cart_items' => $cart_items]));
    // }

    // public function custom_woocommerce_checkout_order_processed($order_id, $posted_data, $order)
    // {
    //     $cart_items = $order->get_items();
    //     error_log('custom_woocommerce_checkout_order_processed() ' . $order_id);
    //     error_log(json_encode(['cart_items' => $cart_items]));
    // }

    public function addActions()
    {
        // add_action('woocommerce_before_checkout_process', [$this, 'custom_woocommerce_before_checkout_process'], 10, 0);
        // add_action('woocommerce_thankyou', [$this, 'custom_woocommerce_thankyou'], 10, 1);
        // add_action('woocommerce_checkout_order_processed', [$this, 'custom_woocommerce_checkout_order_processed'], 10, 3);

        add_action('woocommerce_checkout_create_order', [$this->wooCommerce, 'orderCreateSupplierOrder'], 10, 2);
        add_action('init', [$this->wooCommerce, 'registerShippedStatus']);

        // Register settings pages defined above
        foreach (apply_filters('wc_dropship_supplier_settings', $this->supplierSettings) as $settingsClass) {
            $instance = new $settingsClass;
            add_action('admin_menu', [$instance, 'addSettingsPage'], 10, 2);
            add_action('admin_init', [$instance, 'registerSettings']);
        }

        add_action('wcds_cron_hook', [$this->wooCommerce, 'updateShippedOrders']);
    }

    public function addFilters()
    {

        // Order Filters
        add_filter('wc_order_statuses', [$this->wooCommerce, 'addShippedStatus']);

        // Product Filters
        add_filter('woocommerce_product_is_in_stock', [$this->wooCommerce, 'productIsInStock'], 10, 2);
        //add_filter('woocommerce_product_get_stock_quantity', [$this->wooCommerce, 'productQuantity'], 10, 2);
        // add_filter('woocommerce_product_get_sku', [$this->wooCommerce, 'productSku'], 10, 2);
        add_filter('woocommerce_product_get_manage_stock', [$this->wooCommerce, 'manageStock'], 10, 2);

        // Variation Filters
        add_filter('woocommerce_product_variation_get_manage_stock', [$this->wooCommerce, 'manageStock'], 10, 2);
        // add_filter('woocommerce_product_variation_get_sku', [$this->wooCommerce, 'productSku'], 10, 2);
        //add_filter('woocommerce_product_variation_get_stock_quantity', [$this->wooCommerce, 'productQuantity'], 10, 2);

    }

}
