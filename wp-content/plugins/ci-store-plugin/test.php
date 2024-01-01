<?php

// include_once __DIR__ . '/utils/product_exists.php';
include_once __DIR__ . '/actions/import_western.php';
include_once __DIR__ . '/western/getWesternProductsPage.php';
include_once __DIR__ . '/western/western_utils.php';
// render html for page

// function product_exists_by_meta($meta)
// {
//     global $wpdb;

//     // $query = array(
//     //     'meta_key1' => 'meta_value1',
//     //     'meta_key2' => 'meta_value2',
//     //     // Add more key/value pairs as needed
//     // );

//     // Build the query with multiple JOINs
//     $query = "SELECT pm1.post_id FROM $wpdb->postmeta pm1 ";

//     $join_count = 1;

//     foreach ($meta as $key => $value) {
//         $query .= "JOIN $wpdb->postmeta pm$join_count ON pm1.post_id = pm$join_count.post_id ";
//         $query .= $wpdb->prepare("AND pm$join_count.meta_key = %s AND pm$join_count.meta_value = %s ", $key, $value);
//         $join_count++;
//     }

//     $product_ids = $wpdb->get_col($query);

//     // $product_id = $wpdb->get_var(
//     //     $wpdb->prepare(
//     //         "SELECT post_id FROM $wpdb->postmeta WHERE meta_key = %s AND meta_value = %s",
//     //         $meta_key,
//     //         $meta_value
//     //     )
//     // );

//     return ['result' => $product_ids, 'query' => $query]; //$product_ids;//!empty($product_ids) ? true : false;
// }

// function product_exists($supplier_key, $sku)
// {
//     global $wpdb;

//     $product_id = $wpdb->get_var(
//         $wpdb->prepare(
//             "SELECT DISTINCT p1.post_id FROM wp_postmeta p1
//             INNER JOIN wp_postmeta p2 ON p1.post_id = p2.post_id
//             WHERE (p1.meta_key = '_ci_supplier_key' AND p1.meta_value = %s)
//             AND (p2.meta_key = '_ci_sku' AND p2.meta_value = %s)",
//             $supplier_key,
//             $sku
//         )
//     );

//     return $product_id;

//     // return product_exists_by_meta(['_ci_supplier_key' => $supplier_key, '_ci_sku' => $sku]);
//     // return product_exists_by_meta(['_ci_sku' => $sku]);
// }

function listProducts(){
    $args = array(
        'post_type' => 'product',
        'posts_per_page' => -1,
        // 'meta_key' => '_sku',
        // 'meta_value' => $_POST['post']['meta_input']['_sku'],
    );
    $query = new WP_Query($args);

    while ($query->have_posts()) {
        $query->the_post();
        $post_id = get_the_ID();
        $post_meta = get_post_meta($post_id);
        // $post_data[] = get_post($post_id);//

        $post_data_with_meta = array(
            'post_data' => get_post($post_id),
            'meta_data' => $post_meta,
        );

        $posts_data[] = $post_data_with_meta;
        // $post_data['meta'] = $post_meta;
    }
    wp_reset_postdata();
    return $posts_data;
}

function fixProduct($id){
    update_post_meta($id, '_ci_supplier_key', 'WPS');
    update_post_meta($id, '_ci_sku', '9523');
}

function processProduct()
{
    global $default_job, $option_key;
    $cronjob = get_option($option_key, $default_job);
    $product_info = array_pop($products);
    $cronjob['products'] = $products;
    $cronjob['test'] = 'mikey';

    if (isValidProduct($product_info)) {
        // update/insert
        $product = getWesternProduct($product_info['id']);
        $cronjob['current_product'] = $product;
        $cronjob['current_action'] = 'update/insert';
    } else {
        // delete
        $cronjob['current_product'] = $product_info;
        $cronjob['current_action'] = 'delete';
    }
    update_option($option_key, $cronjob);
}

function render_ci_store_plugin_test()
{
    // global $post;
    // $exists = product_exists('WPS', '952322');
    // fixProduct(110);
    $data = getWesternProductsPage();

    $products = $data['data']; //array_map('filterValidProducts', $data['data']);
    $cronjob['products'] = $products;
    // update_option($option_key, $cronjob);

    $result = getValidProductIds($products);//array_map('getValidProductIds', $products);

    // while (count($products) && $cronjob['status'] === 'running') {
        // processProduct($products);
        //     $cronjob = get_option($option_key, $default_job);
        //     $product_info = array_pop($products);
        //     $cronjob['products'] = $products;
        //     $cronjob['test'] = 'mikey';

        //     if (isValidProduct($product_info)) {
        //         // update/insert
        //         $product = getWesternProduct($product_info['id']);
        //         $cronjob['current_product'] = $product;
        //         $cronjob['current_action'] = 'update/insert';
        //     } else {
        //         // delete
        //         $cronjob['current_product'] = $product_info;
        //         $cronjob['current_action'] = 'delete';
        //     }
        //     update_option($option_key, $cronjob);
    // }

    ?><pre><?=json_encode($data, JSON_PRETTY_PRINT)?></pre><?

    if(isset($_GET['wps_product_id'])){
        $wps_id = $_GET['wps_product_id'];
        $product = getWesternProduct($wps_id);
        $post_id = product_exists('wps', $wps_id);
        $meta = null;
        $this_post = null;
        if(isset($post_id)){
            $this_post = get_post($post_id);
            $meta = get_post_meta($this_post->ID);
        }
        // $result = import_western_product(['args' => ['product_id' => 9523]]);
        ?><pre><?=json_encode(['wps'=>$product, 'woo' => [$this_post, $meta]], JSON_PRETTY_PRINT)?></pre><?
    }

    if(isset($_GET['post_id'])){
        $post_id = $_GET['post_id'];
        $this_post = get_post($post_id);
        $meta = get_post_meta($this_post->ID);
        // $result = import_western_product(['args' => ['product_id' => 9523]]);
        ?><pre><?=json_encode([$this_post, $meta], JSON_PRETTY_PRINT)?></pre><?
    }
    // $test = listProducts();

    // update_post_meta(110, '_ci_supplier_key', 'WPS');
    // update_post_meta(110, '_ci_sku', '9523');

    return;
    // $args = array(
    //     'meta_query' => array(
    //         // array(
    //         //     'key' => 'your_meta_key',
    //         //     'value' => 'your_meta_value',
    //         //     'compare' => '=',
    //         // ),
    //     ),
    // );

    // $products = new WC_Product_Query($args);

    // update_post_meta($post_id, $meta_key, $new_meta_value);

    // $args = array(
    //     'post_type' => 'product',
    //     'posts_per_page' => -1,
    //     // 'meta_key' => '_sku',
    //     // 'meta_value' => $_POST['post']['meta_input']['_sku'],
    // );
    // $query = new WP_Query($args);
    // $posts_data = array();
    // // global $post;

    // while ($query->have_posts()) {
    //     $query->the_post();
    //     $post_id = get_the_ID();
    //     $post_meta = get_post_meta($post_id);
    //     // $post_data[] = get_post($post_id);//

    //     $post_data_with_meta = array(
    //         'post_data' => get_post($post_id),
    //         'meta_data' => $post_meta,
    //     );

    //     $posts_data[] = $post_data_with_meta;
    //     // $post_data['meta'] = $post_meta;
    // }
    // wp_reset_postdata();

    // $result = $posts_data;
    // $found = $query->have_posts();
    // $result = [];

    // if ($found) {
    // $posts_array = $query->get_posts();

    // global $post;
    // while($query->the_post()){
    //     $result[] = $post;
    // }

    // $posts_array = $query->get_posts(); // Retrieve posts as an array
    // foreach ($posts_array as $post) {
    // $post_id = $post['ID'];
    // $post_meta = get_post_meta($post_id);
    // $post['meta'] = get_post_meta($post_id);
    // $post_meta =

    // Access individual post data from the array
    // echo $post->post_title; // Example: Output post titles
    // Access other post fields as needed
    // }
    // $result = $posts_array;

    // $query->the_post();
    // global $post;
    // $result = $post;
    // $post_id = $post->ID;
    // $post_id = wp_update_post($_POST['post']);
    // // update product
    // // wp_update_post(array(
    // //     'ID' => $post_id,
    // //     'post_title' => $product_title,
    // //     'post_content' => $product_description,
    // // ));
    // if ($post_id) {
    //     wp_send_json(['success' => 'updated', 'post' => $_POST]);
    // } else {
    //     wp_send_json(['error' => 'update failed', 'post' => $_POST, 'new_id' => $post_id]);
    // }
    // }
}

// add submenu item to side nav
function admin_menu_cistore_test()
{
    add_submenu_page('ci-store-plugin-page', 'Test', 'Test', 'manage_options', 'ci-store-plugin-page-test', 'render_ci_store_plugin_test');
}

// need a lower priority so it executes after the main nav item is added
add_action('admin_menu', 'admin_menu_cistore_test', 15);