<?php

require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/ReactSubpage.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/actions/ProductImporter.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/actions/StockCheck.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/LogFile.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/western/import_western_product.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/admin/ci_import_product.php';

new ReactSubpage('overview', 'Overview', 'ci-store-plugin-page', 'ci-store_page_');

new ProductImporter();
new ReactSubpage('import_products', 'Import Products', 'ci-store-plugin-page', 'ci-store_page_');

$stock_check = new StockCheck();
$stock_check->schedule('every_day');
new ReactSubpage('stock_check', 'Stock Check', 'ci-store-plugin-page', 'ci-store_page_');

new ReactSubpage('manage_events', 'Manage Events', 'ci-store-plugin-page', 'ci-store_page_');

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/get_crons.php';

function handle_ajax_scheduled_events_api()
{
    $cmd = isset($_GET['cmd']) ? $_GET['cmd'] : '';
    $filter = isset($_GET['filter']) ? $_GET['filter'] : '';

    switch ($cmd) {
        case 'info':
            $crons = get_crons($filter);
            wp_send_json(['data' => $crons]);
            break;

        case 'unschedule':
            $hook_name = isset($_GET['hook_name']) ? $_GET['hook_name'] : '';
            $hook_hash = isset($_GET['hook_hash']) ? $_GET['hook_hash'] : '';
            $hook_timestamp = isset($_GET['hook_timestamp']) ? $_GET['hook_timestamp'] : '';
            $hook_args = isset($_GET['hook_args']) ? json_decode($_GET['hook_args']) : [];

            if ($hook_name) {
                if ($hook_hash) {
                    // $unscheduled = wp_unschedule_event(wp_next_scheduled($hook_name, ['identifier' => $hook_hash]), $hook_name, ['identifier' => $hook_hash]);
                    $unscheduled = wp_unschedule_event($hook_timestamp, $hook_name, $hook_args);

                    if ($unscheduled) {
                        wp_send_json(['message' => 'Scheduled event unscheduled successfully.']);
                    } else {
                        wp_send_json(['error' => 'Error unscheduling the event ' . $hook_name . ' with timestamp ' . $hook_timestamp]);
                    }
                } else {
                    // Clear all scheduled events for the specified hook
                    $cleared = wp_clear_scheduled_hook($hook_name);

                    if ($cleared) {
                        wp_send_json(['message' => 'All scheduled events with the hook name ' . $hook_name . ' cleared successfully.']);
                    } else {
                        wp_send_json(['error' => 'No scheduled events found for the hook name ' . $hook_name . '.']);
                    }

                }
            } else {
                wp_send_json(['error' => 'Not enough info.']);
            }
            break;

        case 'schedule':
            $hook_name = isset($_GET['hook_name']) ? $_GET['hook_name'] : '';
            $hook_args = isset($_GET['hook_args']) ? json_decode($_GET['hook_args']) : [];

            if ($hook_name && $hook_args) {
                wp_schedule_single_event(time() + 1, $hook_name, $hook_args);
            }
            $crons = get_crons($filter);
            wp_send_json(['data' => $crons]);
            break;

        default:
            $crons = get_crons($filter);
            wp_send_json(['data' => $crons]);
    }
    wp_die();
}

add_action('wp_ajax_scheduled_events_api', 'handle_ajax_scheduled_events_api');
