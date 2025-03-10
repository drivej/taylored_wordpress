<?php
namespace CIStore;

include_once CI_STORE_PLUGIN . 'vehicles/register_vehicle_taxonomy.php';
include_once CI_STORE_PLUGIN . 'hooks/wp_enqueue_scripts.php';

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
        add_action('init', [$this, $init_func]);
    }

    function init_store()
    {
        include_once CI_STORE_PLUGIN . 'hooks/index.php';
        include_once CI_STORE_PLUGIN . 'Admin.php';
        include_once CI_STORE_PLUGIN . 'suppliers/Suppliers.php';
        include_once CI_STORE_PLUGIN . 'suppliers/wps/Supplier_WPS_ImportManager.php';
        include_once CI_STORE_PLUGIN . 'suppliers/t14/Supplier_T14_ImportManager.php';

        add_filter('image_downsize', 'CIStore\Hooks\custom_image_downsize', 10, 3);
        // add_action('woocommerce_before_shop_loop_item', 'CIStore\Hooks\custom_before_shop_loop_item');
        add_action('woocommerce_before_single_product', 'CIStore\Hooks\custom_before_single_product', 20);
        add_action('woocommerce_cart_item_thumbnail', 'CIStore\Hooks\custom_modify_cart_item_thumbnail', 10, 3);
        add_filter('woocommerce_variation_option_name', 'CIStore\Hooks\custom_woocommerce_variation_option_name', 10, 4);
        add_filter('woocommerce_dropdown_variation_attribute_options_args', 'CIStore\Hooks\custom_woocommerce_dropdown_variation_attribute_options_args', 10, 1);
        add_filter('woocommerce_after_single_product', 'CIStore\Hooks\custom_woocommerce_after_single_product', 10, 1);
        add_action('wp_enqueue_scripts', 'CIStore\hooks\enqueue_disable_variations_script');
        add_filter('woocommerce_attribute_label', 'CIStore\Hooks\custom_attribute_label', 10, 3);
        // add_action('wp_ajax_vehicles_handler', 'vehicles_handler');

        add_action('pre_get_posts', 'CIStore\Hooks\custom_pre_get_posts', 10, 1);
        wp_enqueue_style('custom-store-styles', plugins_url('css/ci-styles.css', CI_STORE_PLUGIN_FILE), null, CI_VERSION);

        // import managers need to be initialized so their hooks are added
        \WPSImportManager::instance();
        \T14ImportManager::instance();
    }

    function init_admin()
    {
        include_once CI_STORE_PLUGIN . 'utils/user_has_access.php';
        include_once CI_STORE_PLUGIN . 'hooks/index.php';
        require_once CI_STORE_PLUGIN . 'utils/ReactSubpage.php';
        include_once CI_STORE_PLUGIN . 'Admin.php';
        include_once CI_STORE_PLUGIN . 'Ajax.php';
        include_once CI_STORE_PLUGIN . 'suppliers/Suppliers.php';

        register_activation_hook(__FILE__, [$this, 'activation']);

        add_action('show_user_profile', 'CIStore\Hooks\add_custom_access_checkbox');
        add_action('edit_user_profile', 'CIStore\Hooks\add_custom_access_checkbox');
        add_action('personal_options_update', 'CIStore\Hooks\save_custom_access_checkbox');
        add_action('edit_user_profile_update', 'CIStore\Hooks\save_custom_access_checkbox');
        add_filter('wp_get_attachment_url', 'CIStore\Hooks\custom_wp_get_attachment_url', 10, 2);

        $allow = \CIStore\Utils\user_has_access();

        if ($allow) {
            add_action('wp_ajax_ci_api_handler', 'CIStore\Ajax\api_handler');
            add_action('admin_menu', 'CIStore\Admin\create_admin_menu');
            // add_filter('manage_edit-product_columns', 'CIStore\Admin\custom_manage_product_posts_columns');
            add_action('manage_product_posts_custom_column', 'CIStore\Admin\custom_manage_product_posts_custom_column', 10, 2);
            wp_enqueue_style('custom-admin-styles', plugins_url('css/ci-admin.css', CI_STORE_PLUGIN_FILE));

            $expert_access = \CIStore\Utils\user_has_expert_access();
            if ($expert_access) {
                new \CIStore\Utils\ReactSubpage('utilities', 'Utilities', 'ci-store-plugin-page', 'ci-store_page_');
            }
            new \CIStore\Utils\ReactSubpage('suppliers', 'Suppliers', 'ci-store-plugin-page', 'ci-store_page_');
        }
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
        // error_log('activation()');
        include_once CI_STORE_PLUGIN . 'Activation.php';
        \CIStore\Activation\create_t14_table();
    }
}
