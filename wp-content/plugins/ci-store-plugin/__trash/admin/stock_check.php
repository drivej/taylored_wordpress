<?php

// include_once WP_PLUGIN_DIR . '/ci-store-plugin/western/wps_stock_check.php';
// include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/JobData.php';

// function render_ci_store_plugin_page_stock_check()
// {
//     ?>
//     <div id="ci-stock-check-container"></div>
//     <?php
// }

// // add submenu item to side nav
// function admin_menu_ci_store_stock_check()
// {
//     add_submenu_page('ci-store-plugin-page', 'Stock Check', 'Stock Check', 'manage_options', 'ci-store-plugin-page-stock-check', 'render_ci_store_plugin_page_stock_check');
// }

// // need a lower priority so it executes after the main nav item is added
// add_action('admin_menu', 'admin_menu_ci_store_stock_check', 15);

// function enqueue_script_for_stock_check()
// {
//     $current_screen = get_current_screen();

//     // Check if the current screen is your desired subpage
//     if ($current_screen && $current_screen->id === 'ci-store_page_ci-store-plugin-page-stock-check') {
//         // Enqueue your script here
//         wp_enqueue_script('ci-ui-script-stock-check', plugin_dir_url(__FILE__) . '../dist/ci-stock-check.js', array(), '1.0', true);
//     }
// }

// // Hook the enqueue function to admin_enqueue_scripts
// add_action('admin_enqueue_scripts', 'enqueue_script_for_stock_check');

// $DEFAULT_IMPORT_PRODUCTS = [
//     'is_running' => false,
//     'is_complete' => false,
//     'started' => null,
//     'stopped' => null,
//     'is_stopping' => false,
//     'is_stalled' => false,
// ];

// // create ajax service
// function handle_stock_check_api()
// {
//     global $DEFAULT_IMPORT_PRODUCTS;
//     $cmd = $_GET['cmd'];

//     switch ($cmd) {
//         case 'status':
//             wp_send_json(get_stock_check_info());
//             break;

//         case 'start_stock_check':
//             run_wps_stock_check();
//             wp_send_json(get_stock_check_info());
//             break;

//         case 'stop_stock_check':
//             request_stop_stock_check();
//             wp_send_json(get_stock_check_info());
//             break;

//         case 'resume_stock_check':
//             wps_stock_check_resume();
//             wp_send_json(get_stock_check_info());
//             break;

//         case 'hack_stock_check':
//             wp_send_json(get_stock_check_info());
//             break;

//         case '/job/import/status':
//             $job = new JobData('import_products', $DEFAULT_IMPORT_PRODUCTS);
//             wp_send_json($job->data);
//             break;

//         case '/job/import/start':
//             $job = new JobData('import_products', $DEFAULT_IMPORT_PRODUCTS);
//             $job->save([
//                 'is_running' => true,
//                 'is_complete' => false,
//                 'is_stopping' => false,
//                 'is_stalled' => false,
//                 'started' => gmdate("c"),
//                 'stopped' => null,
//             ]);
//             wp_send_json($job->data);
//             break;

//         case '/job/import/stop':
//             $job = new JobData('import_products', $DEFAULT_IMPORT_PRODUCTS);
//             $job->save([
//                 'is_running' => false,
//                 'is_stopping' => true,
//                 'stopped' => gmdate("c"),
//             ]);
//             wp_send_json($job->data);
//             break;

//         default:
//             return wp_send_json(get_stock_check_info());
//     }
//     wp_die();
// }

// add_action('wp_ajax_stock_check_api', 'handle_stock_check_api');