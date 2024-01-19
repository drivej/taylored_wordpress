<?php

include_once __DIR__ . '/utils/product_exists.php';
include_once __DIR__ . '/utils/Report.php';
include_once __DIR__ . '/actions/import_western.php';
include_once __DIR__ . '/western/get_western_products_page.php';
include_once __DIR__ . '/western/get_western_attributes_from_product.php';
include_once __DIR__ . '/western/western_utils.php';

include_once __DIR__ . '/utils/print_utils.php';
include_once __DIR__ . '/test/wps_page_action.php';
include_once __DIR__ . '/test/wps_post_action.php';
include_once __DIR__ . '/test/woo_repair_action.php';
include_once __DIR__ . '/test/woo_product_action.php';
include_once __DIR__ . '/test/wps_import_action.php';
include_once __DIR__ . '/test/wps_product_action.php';
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

// function listProducts(){
//     $args = array(
//         'post_type' => 'product',
//         'posts_per_page' => -1,
//         // 'meta_key' => '_sku',
//         // 'meta_value' => $_POST['post']['meta_input']['_sku'],
//     );
//     $query = new WP_Query($args);

//     while ($query->have_posts()) {
//         $query->the_post();
//         $post_id = get_the_ID();
//         $post_meta = get_post_meta($post_id);
//         // $post_data[] = get_post($post_id);//

//         $post_data_with_meta = array(
//             'post_data' => get_post($post_id),
//             'meta_data' => $post_meta,
//         );

//         $posts_data[] = $post_data_with_meta;
//         // $post_data['meta'] = $post_meta;
//     }
//     wp_reset_postdata();
//     return $posts_data;
// }

// function fixProduct($id){
//     update_post_meta($id, '_ci_supplier_key', 'WPS');
//     update_post_meta($id, '_ci_sku', '9523');
// }

// function processProduct()
// {
//     global $default_job, $option_key;
//     $cronjob = get_option($option_key, $default_job);
//     $product_info = array_pop($products);
//     $cronjob['products'] = $products;
//     $cronjob['test'] = 'mikey';

//     if (isValidProduct($product_info)) {
//         // update/insert
//         $product = get_western_product($product_info['id']);
//         $cronjob['current_product'] = $product;
//         $cronjob['current_action'] = 'update/insert';
//     } else {
//         // delete
//         $cronjob['current_product'] = $product_info;
//         $cronjob['current_action'] = 'delete';
//     }
//     update_option($option_key, $cronjob);
// }

// if ( ! function_exists( 'woocommerce' ) ) {
//     include_once( ABSPATH . 'wp-content/plugins/woocommerce/woocommerce.php' );
//     include_once( ABSPATH . 'wp-content/plugins/woocommerce/includes/wc-template-functions.php' );
// }

// function printLine($msg){
//     echo "<p>&middot; ".$msg."</p>";
// }

// function printData($data){
//     echo "<pre>".json_encode($data, JSON_PRETTY_PRINT)."</pre>";
// }

$action_handlers = [
    "wc_api",
    "wp_post",
    "woo_product",
    "wps_product" ,
    "woo_repair",
    "wps_import",
    "wps_page",
];

function render_ci_store_plugin_test()
{
    global $action_handlers;
    $cmd = isset($_GET['cmd']) ? $_GET['cmd'] : '';
    $item_id = isset($_GET['item_id']) ? $_GET['item_id'] : '';

    ?>
    <div class="p-3">
        <form id="ci_store_plugin_test_form">
            <select name="cmd" value="<?=$cmd?>">
                <?
                foreach($action_handlers as $action){
                    if(is_callable($action.'_action')){
                        echo '<option value="'.$action.'" '.($cmd===$action ? 'selected' : '').'>'.$action.'</option>';
                    }
                }
                ?>
            </select>
            <input type="hidden" name="page" value="ci-store-plugin-page-test" />
            <label for="item_id">item id</label>
            <input name="item_id" value="<?=$item_id?>" />
            <button>go</button>
        </form>
    </div>
    <script>
        const $form = document.getElementById('ci_store_plugin_test_form');
        const $select = $form.querySelector('[name="cmd"]');
        const $label = $form.querySelector('label[for="item_id"]');
        const $input = $form.querySelector('input[name="item_id"]');

        function handleChangeSelect(e){
            $label.classList.remove('d-none');
            $input.classList.remove('d-none');

            switch(e.currentTarget.value){
                case 'wc_api' :
                    $label.classList.add('d-none');
                    $input.classList.add('d-none');
                    break;
                case 'woo_product' :
                    $label.innerText = 'Woo SKU';
                    break;
                case 'wps_product' :
                case 'wps_import' :
                case 'woo_repair' :
                    $label.innerText = 'WPS ID';
                    break;
                case 'wp_post' :
                    $label.innerText = 'Post ID';
                    break;
                case 'wps_page' :
                    $label.innerText = 'Cursor';
                    break;
            }
        }
        $select.addEventListener('change', handleChangeSelect);
        handleChangeSelect({currentTarget: $select});
    </script>
    <?

    if(is_callable($cmd.'_action')){
        call_user_func($cmd.'_action', $item_id);
    } else {
        print('fail');
    }
}

// add submenu item to side nav
function admin_menu_cistore_test()
{
    add_submenu_page('ci-store-plugin-page', 'Test', 'Test', 'manage_options', 'ci-store-plugin-page-test', 'render_ci_store_plugin_test');
}

// need a lower priority so it executes after the main nav item is added
add_action('admin_menu', 'admin_menu_cistore_test', 15);