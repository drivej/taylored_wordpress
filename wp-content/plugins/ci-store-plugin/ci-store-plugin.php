<?php
/**
 * Plugin Name: CI Store Plugin
 * Plugin URI: http://www.contentointeractive.com
 * Description: Integrate store
 * Version: 1.0.0
 * Author: CI
 * Author URI: http://www.contentointeractive.com
 * License: GPL2
 */

include_once __DIR__ . '/cronjob/index.php';
include_once __DIR__ . '/log/index.php';
include_once __DIR__ . '/test.php';
// include_once __DIR__ . '/admin/stock_check.php';
// include_once __DIR__ . '/admin/import_products.php';
include_once __DIR__ . '/western/wps_ajax_handler.php';
include_once __DIR__ . '/hooks/index.php';
include_once __DIR__ . '/admin/index.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/DebugLogAPI.php';

// build debug API
new DebugLogAPI();

function create_admin_menu()
{
    add_menu_page('CI Store Plugin', 'CI Store', 'manage_options', 'ci-store-plugin-page', 'render_ci_store_plugin_ui');
    // add_submenu_page('ci-store-plugin-page', 'Jobs', 'Jobs', 'manage_options', 'ci-store-plugin-page-jobs', 'render_ci_store_plugin_jobs');
}

function render_ci_store_plugin_ui()
{
    ?>
    <div id='ci-store-plugin-container'></div>
    <script>
        document.addEventListener("DOMContentLoaded", () => CIStore.render('ci-store-plugin-container'));
    </script>
    <?php
}

add_action('admin_menu', 'create_admin_menu');

function enqueue_ci_plugin_script()
{
    wp_register_script('admin-ui-script', plugin_dir_url(__FILE__) . 'dist/ci-store-plugin.js', array(), '1.0', true);
    wp_enqueue_script('admin-ui-script');
}

add_action('admin_enqueue_scripts', 'enqueue_ci_plugin_script');

function enqueue_custom_styles()
{
    if (is_user_logged_in()) {
        wp_enqueue_style('custom-logged-in-styles', plugins_url('css/ci-plugin.css', __FILE__));
        wp_enqueue_script('custom-logged-in-script', plugins_url('js/ci-plugin.js', __FILE__));
    }
}

add_action('wp_enqueue_scripts', 'enqueue_custom_styles');

function custom_enqueue_admin_styles()
{
    wp_enqueue_style('admin_styles', plugins_url('css/ci-plugin.css', __FILE__));
}

add_action('admin_head', 'custom_enqueue_admin_styles');
