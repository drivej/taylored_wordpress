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
define('CI_VERSION', '0.0.49'); // enqueued scripts get this version - update to bust the cache

include_once CI_STORE_PLUGIN . 'hooks/index.php';
include_once CI_STORE_PLUGIN . 'utils/AjaxManager.php';
include_once CI_STORE_PLUGIN . 'ajax/index.php';
include_once CI_STORE_PLUGIN . 'suppliers/index.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/ReactSubpage.php';

// if importing, file a stall check
// $SUPPLIERS['wps']->schedule_stall_check();

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

register_activation_hook(__FILE__, 'create_t14_table');

function create_t14_table()
{
    error_log('create_t14_table()');
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();

    // Define table name
    $table_name = $wpdb->prefix . 't14_price_lookup';
    // Check if the table already exists
    if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
        // SQL to create the table
        $sql = "CREATE TABLE $table_name (
            item_id INT(11),
            price DECIMAL NOT NULL,
            PRIMARY KEY (item_id)
        ) $charset_collate;";

        dbDelta($sql);
        error_log("$table_name created");
    } else {
        error_log("$table_name already exists");
    }

    // Define table name
    $supplier_insert_ids = $wpdb->prefix . 'supplier_insert_ids';
    // Check if the table already exists
    if ($wpdb->get_var("SHOW TABLES LIKE '$supplier_insert_ids'") != $supplier_insert_ids) {
        // SQL to create the table
        $sql = "CREATE TABLE $supplier_insert_ids (
            id INT AUTO_INCREMENT PRIMARY KEY,
            generated_id INT NOT NULL
        ) $charset_collate;";

        dbDelta($sql);
        error_log("$supplier_insert_ids created");
    } else {
        error_log("$supplier_insert_ids already exists");
    }

    $trigger_name = 'after_insert_product_ids';

    $trigger_exists = $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(*)
         FROM information_schema.TRIGGERS
         WHERE TRIGGER_SCHEMA = DATABASE()
         AND TRIGGER_NAME = %s",
        $trigger_name
    ));

    if ($trigger_exists == 0) {
        // Define the SQL to create the trigger
        $trigger_sql = "
        CREATE TRIGGER $trigger_name
        AFTER INSERT ON {$wpdb->posts}
        FOR EACH ROW
        BEGIN
            INSERT INTO {$supplier_insert_ids} (generated_id) VALUES (NEW.ID);
        END;
        ";

        // Execute the SQL query to create the trigger
        $result = $wpdb->query($trigger_sql);

        // Check for errors
        if ($result === false) {
            error_log('Error creating trigger: ' . $wpdb->last_error);
        } else {
            error_log('Trigger created successfully.');
        }
    } else {
        error_log('Trigger already exists');
    }
}

// create_t14_table();
// function custom_enqueue_admin_styles()
// {
//     wp_enqueue_style('admin_styles', plugins_url('css/ci-admin.css', __FILE__), null, CI_VERSION);
// }