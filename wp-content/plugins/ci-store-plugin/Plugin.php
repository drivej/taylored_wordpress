<?php

namespace CIStore;

class Plugin
{
    function __construct()
    {
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
        // error_log($init_func);
        add_action('init', [$this, $init_func]);
    }

    function init_store()
    {
        include_once CI_STORE_PLUGIN . 'hooks/index.php';
        include_once CI_STORE_PLUGIN . 'Admin.php';
        include_once CI_STORE_PLUGIN . 'suppliers/Suppliers.php';
        // include_once CI_STORE_PLUGIN . 'suppliers/WPS.php';
        include_once CI_STORE_PLUGIN . 'suppliers/wps/Supplier_WPS_ImportManager.php';

        add_filter('image_downsize', 'CIStore\Hooks\custom_image_downsize', 10, 3);
        add_action('woocommerce_before_shop_loop_item', 'CIStore\Hooks\custom_before_shop_loop_item');
        add_action('woocommerce_before_single_product', 'CIStore\Hooks\custom_before_single_product', 20);
        add_action('woocommerce_cart_item_thumbnail', 'CIStore\Hooks\custom_modify_cart_item_thumbnail', 10, 3);
        wp_enqueue_style('custom-store-styles', plugins_url('css/ci-styles.css', CI_STORE_PLUGIN_FILE), null, CI_VERSION);

        new \WPSImportManager();
        // \CIStore\Suppliers\WPS\$importer->init();
        // $this->test();
        // do_action('wps_init');
    }

    function init_admin()
    {
        include_once CI_STORE_PLUGIN . 'hooks/index.php';
        include_once CI_STORE_PLUGIN . 'utils/AjaxManager.php';
        include_once CI_STORE_PLUGIN . 'ajax/index.php';
        require_once CI_STORE_PLUGIN . 'utils/ReactSubpage.php';
        include_once CI_STORE_PLUGIN . 'Admin.php';
        include_once CI_STORE_PLUGIN . 'Ajax.php';
        include_once CI_STORE_PLUGIN . 'suppliers/Suppliers.php';
        // include_once CI_STORE_PLUGIN . 'suppliers/WPS.php';

        register_activation_hook(__FILE__, [$this, 'activation']);

        // add_action('wp_ajax_ci_api_handler', [$this, 'api_handler']);
        add_action('wp_ajax_ci_api_handler', 'CIStore\Ajax\api_handler');
        add_action('admin_menu', 'CIStore\Admin\create_admin_menu');
        add_filter('manage_edit-product_columns', 'CIStore\Admin\custom_manage_product_posts_columns');
        add_action('manage_product_posts_custom_column', 'CIStore\Admin\custom_manage_product_posts_custom_column', 10, 2);
        wp_enqueue_style('custom-admin-styles', plugins_url('css/ci-admin.css', CI_STORE_PLUGIN_FILE));

        // \CIStore\Suppliers\WPS\init();
        // do_action('wps_init');
        // $this->test();

        new \AjaxManager();
        new \CIStore\Utils\ReactSubpage('utilities', 'Utilities', 'ci-store-plugin-page', 'ci-store_page_');
        new \CIStore\Utils\ReactSubpage('suppliers', 'Suppliers', 'ci-store-plugin-page', 'ci-store_page_');
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

    public function test()
    {
        error_log('test()');
        if (!has_action('test_action', [$this, 'test2'])) {
            add_action('test_action', [$this, 'test2']);
        }
        $next = (bool) wp_next_scheduled('test_action');
        if (!$next) {
            $success = wp_schedule_single_event(time(), 'test_action');
            error_log(json_encode(['success' => $success]));
        }
    }

    public function test2()
    {
        wp_cache_delete('import_count_test', 'options');
        $info = get_option('import_count_test', 0);
        error_log('test2222() ' . $info);
        if ($info < 10) {
            update_option('import_count_test', $info + 1);
            $success = wp_schedule_single_event(time() + 1, 'test_action');
            error_log(json_encode(['success' => $success]));
        } else {
            error_log('test2222() - COMPLETE');
        }
    }
}
