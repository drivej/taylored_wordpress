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

function create_admin_menu()
{
    add_menu_page('CI Store Plugin', 'CI Store', 'manage_options', 'ci-store-plugin-page', 'render_ci_store_plugin_ui');
}

function render_ci_store_plugin_ui()
{
    ?>
    <div class="wrap">
        <h2>Admin UI Page</h2>
        <p>This is where your injected UI will appear.</p>
        <div id='ci-store-container'></div>
    </div>
    <script>
        document.addEventListener("DOMContentLoaded", () => CIStore.render('ci-store-container'));
    </script>
    <?php
}

add_action('admin_menu', 'create_admin_menu');

// function add_custom_rewrite_rules()
// {
//     add_rewrite_rule('^ws', 'http://localhost:8080/ws', 'top');
// }
// add_action('init', 'add_custom_rewrite_rules');

function enqueue_ci_plugin_script()
{
    wp_register_script('admin-ui-script', plugin_dir_url(__FILE__) . 'dist/ci-store-plugin.js', array(), '1.0', true);
    // wp_register_script('admin-ui-script', 'http://localhost:8080/ci-store-plugin.js', array(), '1.0', true);
    wp_enqueue_script('admin-ui-script');
    // wp_localize_script('admin-ui-script', 'ajax_object', [
    //     'ajax_url' => admin_url('admin-ajax.php'),
    //     'security' => wp_create_nonce('ajax-security-nonce'),
    // ]);
}

add_action('admin_enqueue_scripts', 'enqueue_ci_plugin_script');

$SUPPLIER = array(
    "WPS" => array(
        "name" => "Western Power Sports",
        "key" => "WPS",
        "supplierClass" => "WooDropship\\Suppliers\\Western",
        "auth" => "Bearer aybfeye63PtdiOsxMbd5f7ZAtmjx67DWFAQMYn6R",
        "api" => "http://api.wps-inc.com",
        "allowParams" => ['page', 'include'],
        'headers' => [
            'Authorization' => "Bearer aybfeye63PtdiOsxMbd5f7ZAtmjx67DWFAQMYn6R",
            'Content-Type' => 'application/json',
        ],
    ),
);

function forward_data()
{
    // 'http://tayloredlocal.local/wp-admin/admin-ajax.php?action=forward_data&key=WPS&path=/products&include=features,tags,items,items.images,attributekeys,attributevalues,items.inventory,items.attributevalues,items.taxonomyterms,taxonomyterms&page[size]=100'
    global $SUPPLIER;
    // Get the POST parameters
    // $key = isset($_POST['key']) ? $_POST['key'] : '';
    // $path = isset($_POST['path']) ? $_POST['path'] : '';
    $key = isset($_GET['key']) ? $_GET['key'] : '';
    $path = isset($_GET['path']) ? $_GET['path'] : '';
    // $payload = isset($_POST['payload']) ? $_POST['payload'] : '';

    // Check if the key, path, and payload are provided

    if (!$SUPPLIER[$key]) {
        wp_send_json(['error' => 'Missing supplier']);
    }

    if (empty($key)) {
        wp_send_json(['error' => 'Missing key']);
    }

    if (empty($path)) {
        wp_send_json(['error' => 'Missing path']);
    }

    // get approved params for WPS
    $filteredProperties = [];
    $allowParams = $SUPPLIER[$key]['allowParams'];

    foreach ($_GET as $propertyName => $propertyValue) {
        foreach ($allowParams as $testName) {
            if (strpos($propertyName, $testName) !== false) {
                $filteredProperties[$propertyName] = $propertyValue;
                break;
            }
        }
    }

    $query_string = http_build_query($filteredProperties);
    $remote_url = implode("/", [$SUPPLIER[$key]['api'], trim($path, '/')]) . '?' . $query_string;
    $response = wp_safe_remote_request($remote_url, ['headers' => $SUPPLIER[$key]['headers']]);

    if (is_wp_error($response)) {
        wp_send_json(['error' => 'Request failed']);
    }

    $response_body = wp_remote_retrieve_body($response);
    $response_json = json_decode($response_body);
    $response_json->meta->test = $remote_url;
    $response_json->meta->get = $_GET;
    wp_send_json($response_json, 200, JSON_PRETTY_PRINT);
}

add_action('wp_ajax_forward_data', 'forward_data');

// require_once('../woocommerce/woocommerce.php');
require_once $_SERVER['DOCUMENT_ROOT'] . '/wp-content/plugins/woocommerce/woocommerce.php';

function ci_woo_action()
{
    // global $woocommerce;

    // wp_send_json(['post' => $_POST]);

    if (isset($_POST['action'])) {
        // $product_title = sanitize_text_field($_POST['product_title']);
        // $product_description = isset($_POST['product_description']) ? sanitize_text_field($_POST['product_description']) : '';
        // $product_price = floatval($_POST['product_price']);
        // $product_sku = $_POST['product_sku'];
        // $product_id = 110;

        if (is_plugin_active('woocommerce/woocommerce.php')) {
            $args = array(
                'post_type' => 'product',
                'meta_key' => '_sku',
                'meta_value' => $_POST['post']['meta_input']['_sku'],
            );
            $query = new WP_Query($args);
            $found = $query->have_posts();

            if ($found) {
                $query->the_post();
                global $post;
                $post_id = $post->ID;
                $post_id = wp_update_post($_POST['post']);
                // update product
                // wp_update_post(array(
                //     'ID' => $post_id,
                //     'post_title' => $product_title,
                //     'post_content' => $product_description,
                // ));
                if ($post_id) {
                    wp_send_json(['success' => 'updated', 'post' => $_POST]);
                } else {
                    wp_send_json(['error' => 'update failed', 'post' => $_POST, 'new_id' => $post_id]);
                }
            } else {
                // insert product
                // $post = array(
                //     'post_title' => $product_title,
                //     'post_content' => $product_description,
                //     'post_type' => 'product',
                //     'post_status' => 'publish',
                // );
                $post_id = wp_insert_post($_POST['post']);
                if ($post_id) {
                    wp_send_json(['success' => 'created', 'post' => $_POST, 'new_id' => $post_id]);
                } else {
                    wp_send_json(['error' => 'insert failed', 'post' => $_POST, 'new_id' => $post_id]);
                }
                // update_post_meta($post_id, '_price', $product_price);
                // update_post_meta($post_id, '_sku', $product_sku);
            }

            // $product = wc_get_product(110);// new WC_Product(110);
            // $i = new WC_Product_Importer();

            // $product_data = array(
            //     'name' => 'Sample Product',
            //     'type' => 'simple',
            //     'regular_price' => '19.99',
            //     'description' => 'Product description goes here',
            //     'short_description' => 'Short description goes here',
            //     'sku' => 'sample-sku',
            // );

            // Use the WooCommerce function to add the product
            // $product_id = wc_create_product($product_data);
            // $product_data = array(
            //     'post_title' => 'Your Product Title',
            //     'post_content' => 'Product description goes here',
            //     'post_status' => 'publish',
            //     'post_type' => 'product',
            //     'regular_price' => 19.99, // Set the price
            //     'sku' => 'product-sku', // Set a SKU
            // );

            // // Add the product to the database
            // $product_id = wc_insert_product($product_data);
            // $product_id = wc_create_product([
            //     'name' => $product_title,
            //     'type' => 'simple',
            //     'regular_price' => $product_price,
            //     // Add more product data as needed
            // ]);
            // wp_send_json(['error' => 'WooCommerce found', 'test' => '']);
        } else {
            wp_send_json(['error' => 'WooCommerce inactive']);
        }
        // wp_send_json(['error' => 'No submit_product', 'post' => $_POST, 'get' => $_GET]);

        // if ($post_id) {
        //     // Product inserted successfully
        //     // echo 'Product added successfully. Product ID: ' . $product_id;
        //     wp_send_json(['success' => 'ok']);
        // } else {
        //     // Product insertion failed
        //     // echo 'Failed to add product.';
        //     wp_send_json(['error' => 'failed']);
        // }
    } else {
        wp_send_json(['error' => 'No submit_product', 'post' => $_POST, 'get' => $_GET]);
    }
}

add_action('wp_ajax_ci_woo_action', 'ci_woo_action');