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

// include_once __DIR__ . '/cronjob/index.php';
// include_once __DIR__ . '/log/index.php';
// include_once __DIR__ . '/admin/stock_check.php';
// include_once __DIR__ . '/admin/import_products.php';

define('CI_STORE_PLUGIN', plugin_dir_path(__FILE__));
define('CI_ERROR_LOG', CI_STORE_PLUGIN . 'logs/CI_ERROR_LOG.log');

function ci_error_log($message)
{
    $t = current_time('mysql');
    error_log($t . "\t" . $message . "\n", 3, CI_ERROR_LOG);
}

set_error_handler('ci_error_log');

include_once CI_STORE_PLUGIN . 'test/index.php';
include_once CI_STORE_PLUGIN . 'western/wps_ajax_handler.php';
include_once CI_STORE_PLUGIN . 'hooks/index.php';
include_once CI_STORE_PLUGIN . 'admin/index.php';
include_once CI_STORE_PLUGIN . 'utils/DebugLogAPI.php';
include_once CI_STORE_PLUGIN . 'utils/admin_ajax.php';
include_once CI_STORE_PLUGIN . 'utils/AjaxManager.php';
include_once CI_STORE_PLUGIN . 'ajax/index.php';

$API_Manager = new AjaxManager();

// build debug API for wp-content/plugins/ci-store-plugin/ci-store-plugin-working/src/common/debug_log/DebugLog.tsx
new DebugLogAPI();
// build admin API
new AdminAPI();

function create_admin_menu()
{
    add_menu_page('CI Store Plugin', 'CI Store', 'manage_options', 'ci-store-plugin-page', 'render_ci_store_plugin_ui');
    // add_submenu_page('ci-store-plugin-page', 'Jobs', 'Jobs', 'manage_options', 'ci-store-plugin-page-jobs', 'render_ci_store_plugin_jobs');
}

function render_ci_store_plugin_ui()
{
    ?>
    <div id='ci-store-plugin-container'></div>
    <h1>Welcome to the CI Store Manager</h1>
    <p>This plugin import products from 3rd parties into WooCommerce.</p>
    <script>
        document.addEventListener("DOMContentLoaded", () => CIStore.render('ci-store-plugin-container'));
    </script>
    <?php
}

add_action('admin_menu', 'create_admin_menu');

// function enqueue_ci_plugin_script()
// {
//     wp_register_script('admin-ui-script', plugin_dir_url(__FILE__) . 'dist/ci-store-plugin.js', array(), '1.0', true);
//     wp_enqueue_script('admin-ui-script');
// }

// add_action('admin_enqueue_scripts', 'enqueue_ci_plugin_script');

function enqueue_custom_styles()
{
    if (is_user_logged_in()) {
        wp_enqueue_style('custom-admin-styles', plugins_url('css/ci-admin.css', __FILE__));
        wp_enqueue_script('custom-logged-in-script', plugins_url('js/ci-plugin.js', __FILE__));
    }
    wp_enqueue_style('custom-store-styles', plugins_url('css/ci-styles.css', __FILE__));
}

add_action('wp_enqueue_scripts', 'enqueue_custom_styles');

function custom_enqueue_admin_styles()
{
    wp_enqueue_style('admin_styles', plugins_url('css/ci-admin.css', __FILE__));
}

// add_action('admin_head', 'custom_enqueue_admin_styles');
