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
define('CI_STORE_PLUGIN', plugin_dir_path(__FILE__));
define('CI_ERROR_LOG_FILEPATH', CI_STORE_PLUGIN . 'logs/CI_ERROR_LOG.log');
define('CI_ERROR_LOG', CI_ERROR_LOG_FILEPATH);
define('CI_VERSION', '0.0.10'); // enqueued scripts get this version - update to bust the cache

include_once CI_STORE_PLUGIN . 'western/wps_ajax_handler.php';
include_once CI_STORE_PLUGIN . 'hooks/index.php';
include_once CI_STORE_PLUGIN . 'utils/AjaxManager.php';
include_once CI_STORE_PLUGIN . 'ajax/index.php';
include_once CI_STORE_PLUGIN . 'suppliers/index.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/ReactSubpage.php';

// if importing, file a stall check
$SUPPLIERS['wps']->schedule_stall_check();

// this creates all the ajax endpoints for the react pages to use
$API_Manager = new AjaxManager();

new ReactSubpage('overview', 'Overview', 'ci-store-plugin-page', 'ci-store_page_');
new ReactSubpage('utilities', 'Utilities', 'ci-store-plugin-page', 'ci-store_page_');

function create_admin_menu()
{
    add_menu_page('CI Store Plugin', 'CI Store', 'manage_options', 'ci-store-plugin-page', 'render_ci_store_plugin_ui');
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

function enqueue_custom_styles()
{
    if (is_user_logged_in()) {
        wp_enqueue_style('custom-admin-styles', plugins_url('css/ci-admin.css', __FILE__));
    }
    wp_enqueue_style('custom-store-styles', plugins_url('css/ci-styles.css', __FILE__), null, CI_VERSION);
}

add_action('wp_enqueue_scripts', 'enqueue_custom_styles');

function custom_enqueue_admin_styles()
{
    wp_enqueue_style('admin_styles', plugins_url('css/ci-admin.css', __FILE__), null, CI_VERSION);
}