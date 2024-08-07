<?php

namespace CIStore;

class Plugin
{
    function __construct()
    {
        error_log('CIStore\__construct()');
        add_action('plugins_loaded', [$this, 'plugins_check'], 10);
    }

    function plugins_check()
    {
        $init_func = 'init_store';

        if (class_exists('WooCommerce')) {
            if (is_admin()) {
                $init_func = 'init_admin';
            }
        } else {
            $init_func = 'init_error';
        }

        add_action('init', [$this, $init_func]);
    }

    function init_store()
    {
        error_log('CIStore\init_store()');
        include_once CI_STORE_PLUGIN . 'hooks/index.php';
        include_once CI_STORE_PLUGIN . 'Admin.php';

        add_filter('image_downsize', 'CIStore\Hooks\custom_image_downsize', 10, 3);
        add_action('woocommerce_before_shop_loop_item', 'CIStore\Hooks\custom_before_shop_loop_item');
        add_action('woocommerce_before_single_product', 'CIStore\Hooks\custom_before_single_product', 20);
        add_action('woocommerce_cart_item_thumbnail', 'CIStore\Hooks\custom_modify_cart_item_thumbnail', 10, 3);
        wp_enqueue_style('custom-store-styles', plugins_url('css/ci-styles.css', CI_STORE_PLUGIN_FILE), null, CI_VERSION);
    }

    function init_admin()
    {
        error_log('CIStore\init_admin()');
        include_once CI_STORE_PLUGIN . 'hooks/index.php';
        include_once CI_STORE_PLUGIN . 'utils/AjaxManager.php';
        include_once CI_STORE_PLUGIN . 'ajax/index.php';
        require_once CI_STORE_PLUGIN . 'utils/ReactSubpage.php';
        include_once CI_STORE_PLUGIN . 'Admin.php';

        register_activation_hook(__FILE__, [$this, 'activation']);

        add_action('admin_menu', 'CIStore\Admin\create_admin_menu');
        wp_enqueue_style('custom-admin-styles', plugins_url('css/ci-admin.css', CI_STORE_PLUGIN_FILE));

        new \AjaxManager();
        new \ReactSubpage('utilities', 'Utilities', 'ci-store-plugin-page', 'ci-store_page_');
        new \ReactSubpage('suppliers', 'Suppliers', 'ci-store-plugin-page', 'ci-store_page_');
    }

    function init_error()
    {
        include_once CI_STORE_PLUGIN . 'Admin.php';
        add_action('admin_notices', 'CIStore\Admin\woocommerce_not_installed_notice');
        add_action('admin_menu', 'CIStore\Admin\create_admin_menu_error');
    }

    function init_restricted()
    {
        include_once CI_STORE_PLUGIN . 'Admin.php';
        add_action('admin_menu', 'CIStore\Admin\create_admin_menu_restricted');
    }

    public function activation()
    {
        error_log('activation()');
        include_once CI_STORE_PLUGIN . 'Activation.php';
        \CIStore\Activation\create_t14_table();
    }
}
