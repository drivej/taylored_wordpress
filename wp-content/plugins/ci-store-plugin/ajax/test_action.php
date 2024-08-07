<?php

namespace AjaxHandlers;

use DateTime;
use WooTools;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';

// if ( ! defined( 'WC_PLUGIN_FILE' ) ) {
//     define( 'WC_PLUGIN_FILE', plugin_dir_path( WP_PLUGIN_DIR ) . '/woocommerce/woocommerce.php' );
// }
// require_once WP_PLUGIN_DIR . '/woocommerce/includes/abstracts/class-wc-background-process.php';

// woo 459337 - 47s
// woo 459682 - 32s
// wps 310360 Piston kit - attributes seem off

function delete_all_supplier_products($params)
{
    $supplier_key = \AjaxManager::get_param('supplier_key');
    $supplier = \WooTools::get_supplier($supplier_key);
    return $supplier->delete_all();
}

// function update_t14_pricing($params)
// {
//     $supplier_key = 't14';
//     $supplier = \WooTools::get_supplier($supplier_key);
//     return $supplier->background_process->start(['action' => 'price_table', 'page_index' => 1]);
// }

function find_duped_posts()
{
    global $wpdb;
    $sql = "
        SELECT post_name, COUNT(*) AS duplicate_count
        FROM {$wpdb->posts}
        WHERE post_type = 'product'
        GROUP BY post_name
        HAVING COUNT(*) > 1;
    ";
    $results = $wpdb->get_results($sql, ARRAY_A);
    $result = [];

    if ($results) {
        foreach ($results as $row) {
            $result[] = "Post Name: " . $row['post_name'] . " - Duplicates: " . $row['duplicate_count'] . "<br>";
        }
    } else {
        $result[] = "No duplicate post names found.";
    }
    return $result;
}

// class WP_Example_Request extends \WP_Async_Request {
//     /**
//      * @var string
//      */
//     protected $prefix = 'my_plugin';

//     /**
//      * @var string
//      */
//     protected $action = 'example_request';

//     /**
//      * Handle a dispatched request.
//      *
//      * Override this method to perform any actions required
//      * during the async request.
//      */
//     protected function handle() {
//         // Actions to perform.
//         error_log('test task '.json_encode($this->data));
//     }
// }

// class TestProcess extends \WP_Background_Process
// {
//     protected function task($item)
//     {
//         error_log('test task '.json_encode($item));
//     }
// }

function sql_product_query($params)
{
    $woo_id = \AjaxManager::get_param('woo_id', null, $params);
    return \WooTools::get_raw_woo_data($woo_id);
}

function get_total_hours(\DateInterval $interval)
{
    return ($interval->days * 24) + $interval->h + ($interval->i / 60) + ($interval->s / 3600);
}

function test_action($params)
{
    $supplier_key = 'wps';
    $supplier = \WooTools::get_supplier($supplier_key);

    return $supplier->invalidate_all();

    return $supplier->get_product('322516', 'price');

    return $supplier->import_taxonomy();

    // return $supplier->update_import_info(['started' => '2024-08-02T14:25:17+00:00']);
    
    return $supplier->get_products_page('7A5MLLyaM8q2', 'basic', '2024-08-03');
    return $supplier->get_products_page('5pO0yLrPMbqW', 'basic', '2024-08-03');

    // return $supplier->get_params_for_query('basic');
    $total = $supplier->get_total_remote_products('2024-08-03');
    $cursor = '';
    $count = 0;
    $cursors = [];

    while (is_string($cursor)) {
        $items = $supplier->get_products_page($cursor, 'basic', '2024-08-03');
        $count += count($items['data'] ?? []);
        if (is_null($items['meta']['cursor']['next'])) { // === null) {
            error_log('completed - null cursor');
        }
        $cursor = $items['meta']['cursor']['next'] ?? false;
        $cursors[] = $cursor;
    }
    return ['total' => $total, 'count' => $count, 'cursors' => $cursors, 'items' => $items];

    return $supplier->get_products_page('w4Ae7lApM1zE', 'basic');
    return $supplier->get_products_page('7A5MLLyaM8q2');
}
