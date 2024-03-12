<?php

// TODO: delete 

// require_once __DIR__ . './../log/write_to_log_file.php';
// include_once WP_PLUGIN_DIR . '/ci-store-plugin/config.php';
// include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/print_utils.php';

// // Callback function to render the custom meta box content
// function custom_product_meta_box()
// {
//     add_meta_box(
//         'custom_product_meta_box', // Unique ID
//         'Custom Product Form', // Box title
//         'render_custom_product_form', // Callback function to render content
//         'product', // Post type (product for WooCommerce products)
//         'side', // Context (normal, advanced, side)
//         'high', // Priority (high, core, default, low)
//         array('disable_autosave' => true) // Additional parameters
//     );
// }

// add_action('add_meta_boxes', 'custom_product_meta_box');

// function delete_completed_scheduled_tasks()
// {
//     $hook = 'woocommerce_run_product_attribute_lookup_update_callback';

//     // Get all scheduled events for the specified hook
//     $scheduled_events = _get_cron_array();

//     // Loop through each scheduled event and clear completed ones
//     if ($scheduled_events && isset($scheduled_events[$hook])) {
//         foreach ($scheduled_events[$hook] as $timestamp => $event) {
//             // Check if the scheduled event is completed (in the past)
//             if ($timestamp < time()) {
//                 // Clear the completed scheduled event
//                 wp_unschedule_event($timestamp, $hook);
//             }
//         }
//         echo "Completed scheduled tasks for '$hook' have been deleted.";
//     } else {
//         echo "No completed scheduled tasks found for '$hook'.";
//     }
// }

// // Callback function to render the custom form content
// function render_custom_product_form($post)
// {
//     global $CI_CONFIG;

//     $woo_product = wc_get_product($post);
//     $supplier_key = $woo_product->get_meta('_ci_supplier_key', true);
//     $wps_product_id = $woo_product->get_meta('_ci_product_id', true);
//     $wps_product = get_western_product($wps_product_id);
//     $supplier = $CI_CONFIG['suppliers'][$supplier_key];

//     echo '<p class="fw-bold mb-1">Supplier:</p>';
//     echo '<p class="mb-0">' . $supplier['name'] . '</p>';
//     echo '<br />';

//     $needs_update_reasons = product_needs_update_reasons($woo_product, $wps_product);
//     $needs_update = (bool) count($needs_update_reasons);

//     echo '<div class="d-flex gap-2"><p class="fw-bold mb-1">Status:</p>' . ($needs_update ? '<div><div class="badge text-bg-danger">NEEDS UPDATE!</div></div>' : '') . '</div>';

//     if (count($needs_update_reasons)) {
//         foreach ($needs_update_reasons as $reason) {
//             echo '<p class="mb-1">' . $reason . '</p>';
//         }
//     }

//     ? >
//     <form id="custom_form" method="post" action="<?php echo admin_url('admin-post.php'); ? >">
//         < ?php wp_nonce_field('run_custom_process_nonce', 'run_custom_process_nonce');? >
//         <input type="hidden" name="action" value="run_custom_process">
//         <input type="hidden" name="product_id" value="< ?php echo esc_attr($post->ID); ? >">
//         <button type="submit" class="button button-primary button-large w-100" id="custom_process_button">Import Product</button>
//     </form>
//     < ? php
// }

// // Callback function to run the custom process
// function run_custom_process()
// {
//     error_log('run_custom_process called');
//     if (isset($_POST['product_id']) && wp_verify_nonce($_POST['run_custom_process_nonce'], 'run_custom_process_nonce')) {
//         error_log('passed run_custom_process called');
//         write_to_log_file('import product from admin');

//         $product_id = absint($_POST['product_id']);

//         // Return a response (e.g., success message)
//         // print_r(['product_id' => $product_id]);
//         // echo 'Custom process completed successfully!';

//         wp_redirect(admin_url('post.php?post=' . $product_id . '&action=edit'));
//         exit;
//     }

//     // Always exit to prevent extra output
//     wp_redirect(home_url());
//     exit;
//     // wp_die();
// }

// add_action('admin_post_run_custom_process', 'run_custom_process');