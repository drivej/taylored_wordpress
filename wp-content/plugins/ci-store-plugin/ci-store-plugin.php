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

// include_once __DIR__ . '/ci-store-cron.php';
// include_once __DIR__ . '/ci-store-utils.php';
// include_once __DIR__ . '/ci-store-settings.php';
include_once __DIR__ . '/cronjob/index.php';
include_once __DIR__ . '/log/index.php';
include_once __DIR__ . '/test.php';
include_once __DIR__ . '/western/wps_ajax_handler.php';
include_once __DIR__ . '/hooks/index.php';

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

// function forward_data()
// {
//     // 'http://tayloredlocal.local/wp-admin/admin-ajax.php?action=forward_data&key=WPS&path=/products&include=features,tags,items,items.images,attributekeys,attributevalues,items.inventory,items.attributevalues,items.taxonomyterms,taxonomyterms&page[size]=100'
//     global $SUPPLIER;
//     // Get the POST parameters
//     $key = isset($_GET['key']) ? $_GET['key'] : '';
//     $path = isset($_GET['path']) ? $_GET['path'] : '';
//     // $payload = isset($_POST['payload']) ? $_POST['payload'] : '';

//     // Check if the key, path, and payload are provided

//     if (!$SUPPLIER[$key]) {
//         wp_send_json(['error' => 'Missing supplier']);
//     }

//     if (empty($key)) {
//         wp_send_json(['error' => 'Missing key']);
//     }

//     if (empty($path)) {
//         wp_send_json(['error' => 'Missing path']);
//     }

//     // filter approved query params for supplier
//     $filteredProperties = [];
//     $allowParams = $SUPPLIER[$key]['allowParams'];

//     foreach ($_GET as $propertyName => $propertyValue) {
//         foreach ($allowParams as $testName) {
//             if (strpos($propertyName, $testName) !== false) {
//                 $filteredProperties[$propertyName] = $propertyValue;
//                 break;
//             }
//         }
//     }

//     $query_string = http_build_query($filteredProperties);
//     $remote_url = implode("/", [$SUPPLIER[$key]['api'], trim($path, '/')]) . '?' . $query_string;
//     $response = wp_safe_remote_request($remote_url, ['headers' => $SUPPLIER[$key]['headers']]);

//     if (is_wp_error($response)) {
//         wp_send_json(['error' => 'Request failed']);
//     }

//     $response_body = wp_remote_retrieve_body($response);
//     $response_json = json_decode($response_body); // cast as array to add props
//     wp_send_json($response_json, 200, JSON_PRETTY_PRINT);
// }

// add_action('wp_ajax_forward_data', 'forward_data');

// require_once('../woocommerce/woocommerce.php');
// require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-content/plugins/woocommerce/woocommerce.php'; // TODO: Do I need this?

// function ci_woo_action()
// {
//     // wp_send_json(['test' => 'test', 'post' => $_POST]);

//     if (isset($_POST['action'])) {
//         if (is_plugin_active('woocommerce/woocommerce.php')) {
//             $args = array(
//                 'post_type' => 'product',
//                 'meta_key' => '_sku',
//                 'meta_value' => $_POST['post']['meta_input']['_sku'],
//             );
//             $query = new WP_Query($args);
//             $found = $query->have_posts();

//             if ($found) {
//                 $query->the_post();
//                 global $post;
//                 $post_id = $post->ID;
//                 $post_id = wp_update_post($_POST['post']);
//                 // update product
//                 // wp_update_post(array(
//                 //     'ID' => $post_id,
//                 //     'post_title' => $product_title,
//                 //     'post_content' => $product_description,
//                 // ));
//                 if ($post_id) {
//                     wp_send_json(['success' => 'updated', 'post' => $_POST]);
//                 } else {
//                     wp_send_json(['error' => 'update failed', 'post' => $_POST, 'new_id' => $post_id]);
//                 }
//             } else {
//                 // insert product
//                 // $post = array(
//                 //     'post_title' => $product_title,
//                 //     'post_content' => $product_description,
//                 //     'post_type' => 'product',
//                 //     'post_status' => 'publish',
//                 // );
//                 $post_id = wp_insert_post($_POST['post']);
//                 if ($post_id) {
//                     wp_send_json(['success' => 'created', 'post' => $_POST, 'new_id' => $post_id]);
//                 } else {
//                     wp_send_json(['error' => 'insert failed', 'post' => $_POST, 'new_id' => $post_id]);
//                 }
//                 // update_post_meta($post_id, '_price', $product_price);
//                 // update_post_meta($post_id, '_sku', $product_sku);
//             }

//             // $product = wc_get_product(110);// new WC_Product(110);
//             // $i = new WC_Product_Importer();

//             // $product_data = array(
//             //     'name' => 'Sample Product',
//             //     'type' => 'simple',
//             //     'regular_price' => '19.99',
//             //     'description' => 'Product description goes here',
//             //     'short_description' => 'Short description goes here',
//             //     'sku' => 'sample-sku',
//             // );

//             // Use the WooCommerce function to add the product
//             // $product_id = wc_create_product($product_data);
//             // $product_data = array(
//             //     'post_title' => 'Your Product Title',
//             //     'post_content' => 'Product description goes here',
//             //     'post_status' => 'publish',
//             //     'post_type' => 'product',
//             //     'regular_price' => 19.99, // Set the price
//             //     'sku' => 'product-sku', // Set a SKU
//             // );

//             // // Add the product to the database
//             // $product_id = wc_insert_product($product_data);
//             // $product_id = wc_create_product([
//             //     'name' => $product_title,
//             //     'type' => 'simple',
//             //     'regular_price' => $product_price,
//             //     // Add more product data as needed
//             // ]);
//             // wp_send_json(['error' => 'WooCommerce found', 'test' => '']);
//         } else {
//             wp_send_json(['error' => 'WooCommerce inactive']);
//         }
//         // wp_send_json(['error' => 'No submit_product', 'post' => $_POST, 'get' => $_GET]);

//         // if ($post_id) {
//         //     // Product inserted successfully
//         //     // echo 'Product added successfully. Product ID: ' . $product_id;
//         //     wp_send_json(['success' => 'ok']);
//         // } else {
//         //     // Product insertion failed
//         //     // echo 'Failed to add product.';
//         //     wp_send_json(['error' => 'failed']);
//         // }
//     } else {
//         wp_send_json(['error' => 'No submit_product', 'post' => $_POST, 'get' => $_GET]);
//     }
// }

// add_action('wp_ajax_ci_woo_action', 'ci_woo_action');

// function ci_wp_action()
// {
//     if (isset($_POST['action'])) {
//         if (isset($_POST['sku'])) {
//             $args = array(
//                 'post_type' => 'product',
//                 'meta_key' => '_sku',
//                 'meta_value' => $_POST['sku'],
//             );
//             $query = new WP_Query($args);
//             $found = $query->have_posts();

//             if ($found) {
//                 $query->the_post();
//                 global $post;
//                 $meta = get_post_meta($post->ID);

//                 // transform meta array value to single item
//                 foreach ($meta as $key => $value) {
//                     if (is_array($value) && count($value) === 1) {
//                         $meta[$key] = reset($value);
//                     }
//                 }

//                 $data = array_merge((array) $post, array('meta_input' => $meta));
//                 wp_send_json($data);
//             } else {
//                 wp_send_json(['error' => 'Not found', 'post' => $_POST]);
//             }
//         } else {
//             wp_send_json(['error' => 'No sku', 'post' => $_POST]);
//         }
//     }
//     wp_send_json(['error' => 'No action', 'post' => $_POST]);
// }

// add_action('wp_ajax_ci_wp_action', 'ci_wp_action');

// function get_var($array, $props, $default = null)
// {
//     if (is_string($props)) {
//         $props = array($props);
//     }
//     $data = $array;
//     foreach ($props as $prop) {
//         if (isset($data[$prop])) {
//             $data = $data[$prop];
//         } else {
//             return $default;
//         }
//     }
//     return $data;
// }

// function ci_action()
// {
//     $_METHOD = isset($_GET['ci_action']) ? $_GET : $_POST;
//     if (isset($_METHOD['ci_action'])) {

//         switch ($_METHOD['ci_action']) {
//             case 'select':
//                 if (isset($_METHOD['post']['ID'])) {
//                     $post = get_post($_METHOD['post']['ID']);
//                     if ($post) {
//                         wp_send_json(['success' => 'created', 'data' => $post]);
//                     } else {
//                         wp_send_json(['error' => 'not found', 'payload' => $_METHOD]);
//                     }
//                 } else {
//                     $args = array(
//                         'post_type' => get_var($_METHOD, array('post', 'post_type')), // isset($_METHOD['post_type']) ? $_METHOD['post_type'] ? '',
//                         'posts_per_page' => get_var($_METHOD, 'posts_per_page', -1),
//                         'paged' => isset($_METHOD['posts_per_page']) ? 1 : 0,
//                         // 'fields' => get_var($_METHOD, 'fields', 'ids'),
//                     );
//                     $query = new WP_Query($args);
//                     $result = array();

//                     if ($query->have_posts()) {
//                         while ($query->have_posts()) {
//                             $query->the_post();
//                             $post_id = get_the_ID();
//                             $custom_fields = get_post_custom($post_id);
//                             $standard_fields = array(
//                                 'ID' => $post_id,
//                                 'post_title' => get_the_title(),
//                                 'post_content' => get_the_content(),
//                                 'post_type' => get_post_type(),
//                                 'meta' => get_post_meta($post_id),
//                             );
//                             $all_fields = array_merge($custom_fields, $standard_fields);
//                             $result[] = $all_fields;
//                         }
//                     }
//                     wp_send_json(array('data' => $result));

//                     // // Get the posts
//                     // $posts = get_posts($args);

//                     // // Check if posts were found
//                     // if (!empty($posts)) {
//                     //     $all_results = array();

//                     //     foreach ($posts as $post) {
//                     //         $post_id = $post->ID;

//                     //         // Get custom fields for the post
//                     //         $custom_fields = get_post_custom($post_id);

//                     //         // Access standard fields directly from the post object
//                     //         $standard_fields = array(
//                     //             'post_title' => $post->post_title,
//                     //             'post_content' => $post->post_content,
//                     //             // Add other standard fields as needed
//                     //         );

//                     //         // Combine custom and standard fields
//                     //         $all_fields = array_merge($custom_fields, $standard_fields);

//                     //         // Output or manipulate fields as needed for each post
//                     //         $result = array(
//                     //             'post_id' => $post_id,
//                     //             'fields' => $all_fields,
//                     //         );

//                     //         $all_results[] = $result;
//                     //     }

//                     //     // Send the results as JSON
//                     //     wp_send_json(array('data' => $all_results));
//                     // } else {
//                     //     // No posts found
//                     //     wp_send_json(array('message' => 'No posts found', 'args' => $args));
//                     // }

//                     /*

//                 if ($query->have_posts()) {
//                 while ($query->have_posts()) {
//                 $query->the_post();

//                 // Access post properties
//                 $post_title = get_the_title();
//                 $post_content = get_the_content();

//                 // Output or manipulate post data as needed
//                 echo "Post Title: $post_title";
//                 echo "Post Content: $post_content";
//                 }

//                 // Restore original post data
//                 wp_reset_postdata();
//                 } else {
//                 echo "No cronjobs found";
//                 }

//                 // $posts = $query->get_posts();
//                 wp_send_json(array('data' => $posts, 'meta' => array('queryParams' => $queryParams, 'payload' => $_METHOD)), 200, JSON_PRETTY_PRINT);
//                  */
//                 }
//                 break;

//             case 'update':
//                 if (isset($_METHOD['post'])) {
//                     // $args = array(
//                     //     'post_type' => 'product',
//                     //     'meta_key' => '_sku',
//                     //     'meta_value' => $_POST['post']['meta_input']['_sku'],
//                     // );
//                     // $query = new WP_Query($args);
//                     // $found = $query->have_posts();

//                     // if ($found) {
//                     // $query->the_post();
//                     // global $post;
//                     // $post_id = $post->ID;
//                     $post_id = wp_update_post($_POST['post']);
//                     // update product
//                     // wp_update_post(array(
//                     //     'ID' => $post_id,
//                     //     'post_title' => $product_title,
//                     //     'post_content' => $product_description,
//                     // ));
//                     if ($post_id) {
//                         wp_send_json(['success' => 'updated', 'post' => $_POST]);
//                     } else {
//                         wp_send_json(['error' => 'update failed', 'post' => $_POST, 'id' => $post_id]);
//                     }
//                     // } else {
//                     //     wp_send_json(['error' => 'not found', 'payload' => $_METHOD]);
//                     // }
//                 } else {
//                     wp_send_json(['error' => 'empty payload', 'payload' => $_METHOD]);
//                 }
//                 break;

//             case 'create':
//                 if (isset($_METHOD['post'])) {
//                     $post_id = wp_insert_post($_METHOD['post']);
//                     if ($post_id) {
//                         wp_send_json(['success' => 'created', 'payload' => $_METHOD, 'new_id' => $post_id]);
//                     } else {
//                         wp_send_json(['error' => 'insert failed', 'payload' => $_METHOD, 'new_id' => $post_id]);
//                     }
//                 } else {
//                     wp_send_json(['error' => 'empty payload', 'payload' => $_METHOD]);
//                 }
//                 break;

//             case 'delete':
//                 $post_id = wp_delete_post($_METHOD['post']);
//                 break;

//             default:
//                 wp_send_json(['error' => 'No cron action', 'payload' => $_METHOD]);
//         }
//     }
// }

// add_action('wp_ajax_ci_action', 'ci_action');