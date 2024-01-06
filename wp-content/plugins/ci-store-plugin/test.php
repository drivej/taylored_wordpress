<?php

include_once __DIR__ . '/utils/product_exists.php';
include_once __DIR__ . '/actions/import_western.php';
include_once __DIR__ . '/western/get_western_products_page.php';
include_once __DIR__ . '/western/get_western_attributes_from_product.php';
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
        $product = get_western_product($product_info['id']);
        $cronjob['current_product'] = $product;
        $cronjob['current_action'] = 'update/insert';
    } else {
        // delete
        $cronjob['current_product'] = $product_info;
        $cronjob['current_action'] = 'delete';
    }
    update_option($option_key, $cronjob);
}

if ( ! function_exists( 'woocommerce' ) ) {
    include_once( ABSPATH . 'wp-content/plugins/woocommerce/woocommerce.php' );
    include_once( ABSPATH . 'wp-content/plugins/woocommerce/includes/wc-template-functions.php' );
}

function printLine($msg){
    echo "<p>&middot; ".$msg."</p>";
}

function printData($data){
    echo "<pre>".json_encode($data, JSON_PRETTY_PRINT)."</pre>";
}

function render_ci_store_plugin_test()
{
    $cmd = isset($_GET['cmd']) ? $_GET['cmd'] : '';
    $item_id = isset($_GET['item_id']) ? $_GET['item_id'] : '';

    ?>
    <div class="p-3">
        <form id="ci_store_plugin_test_form">
            <select name="cmd" value="<?=$cmd?>">
                <option value="wc_api" <?=$cmd==='wc_api' ? 'selected' : ''?>>wc_api</option>
                <option value="wp_post" <?=$cmd==='wp_post' ? 'selected' : ''?>>wp_post</option>
                <option value="woo_product" <?=$cmd==='woo_product' ? 'selected' : ''?>>woo_product</option>
                <option value="wps_product" <?=$cmd==='wps_product' ? 'selected' : ''?>>wps_product</option>
                <option value="wps_import" <?=$cmd==='wps_import' ? 'selected' : ''?>>wps_import</option>
                <option value="wps_page" <?=$cmd==='wps_page' ? 'selected' : ''?>>wps_page</option>
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
                    $label.innerText = 'SKU';
                    break;
                case 'wps_product' :
                case 'wps_import' :
                    $label.innerText = 'Product ID';
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

    switch($cmd){
        case 'wc_api' :
            $data_store = WC_Data_Store::load( 'product' );
            ?><pre><?=print_r($data_store)?></pre><?
            break;

        case 'woo_product' :
            ?><p>params: sku=<?=$item_id?></p><?
            // $data_store = WC_Data_Store::load( 'product' );
            // $prod = $data_store->get_product_id_by_sku( $item_id );
            $prod = wc_get_product_id_by_sku($item_id);
            ?><pre><?=json_encode($prod, JSON_PRETTY_PRINT)?></pre><?
            break;
        
        case 'wps_import' :
            // $sku = get_western_sku($wps_product);
            // $product_id = wc_get_product_id_by_sku($sku);
            // printData(['acton'=>'update', 'sku'=>$sku, 'product_id'=>$product_id]);

            $info = import_western_product($item_id, true);

            printData(['info'=>$info]);

            if($info['action']!=='error'){
                $product_id = $info['product_id'];
                $wps_product = get_western_product($item_id);
                $product = wc_get_product_object('product', $product_id);
                $attributes = $product->get_attributes();
                // print_r($attributes);
                // $attrs = array_map(fn($a) => ['name'=>$a->get_name(), 'label'=> $a->get_slug(), 'options'=>$a->get_options()],$attributes);
                // printData(['attributes'=>$attrs]);

                if(isset($item_id)){
                    $this_post = get_post($product_id);
                    $meta = get_post_meta($this_post->ID);
                    printData(['post'=>$this_post, 'meta'=>$meta]);
                }

                printData(['wps_product'=>$wps_product]);
            }

            // if($product_id){
            //     $res = update_western_product($wps_product, $product_id);
            //     printData(['res'=>$res]);
            //     return;

            //     printLine('product exists');
            //     // $woo_product = wc_get_product($product_id);

            //     $attrs = get_western_attributes_from_product($wps_product);



            //     // $product = wc_get_product_object( 'product', $product_id );
            //     // $props = [
            //     //     'name' => $wps_product['data']['name'],
            //     //     'regular_price' => floatval($wps_product['data']['items']['data'][0]['list_price']),
            //     //     'sale_price' => 500,
            //     //     ''
            //     // ];
            //     // printData(['props'=>$props]);
            //     // // $product->set_type('variable');
            //     // $product->set_props($props);
               

            //     $product_attributes = $product->get_attributes();
            //     printData(['product_attributes'=>$product_attributes]);

            //     // $product->set_attributes(['bird'=>['red', 'blue'],'deer'=>[1,2,3]]);

            //     // $variation_attributes = array(
            //     //     'size' => array('Small', 'Medium', 'Large'), // Example: Variation sizes
            //     //     'color' => array('Red', 'Blue', 'Green'),    // Example: Variation colors
            //     // );

            //     // $attr_name = 'color';
            //     // $attr_option = 'red';
            //     // $term = wp_insert_term($attr_option, 'pa_' . sanitize_title($attr_name));
            //     // printData(['term'=>$term]);

            //     // $product->set_attributes(array(
            //     //     'pa_' . sanitize_title('bird') => ['red', 'blue'],
            //     // ));
            
            //     // Set the attributes for variations
            //     // foreach ($variation_attributes as $attribute_name => $attribute_options) {
            //     //     $attribute_term_ids = array();
            
            //     //     foreach ($attribute_options as $option) {
            //     //         // Get or create the attribute term
            //     //         $term = get_term_by('name', $option, 'pa_' . sanitize_title($attribute_name));
                        
            //     //         if (!$term) {
            //     //             $term = wp_insert_term($option, 'pa_' . sanitize_title($attribute_name));
            //     //         }
            
            //     //         if (!is_wp_error($term) && isset($term['term_id'])) {
            //     //             $attribute_term_ids[] = $term['term_id'];
            //     //         }
            //     //     }
            
            //     //     // Set the attribute terms for variations
            //     //     $product->set_attributes(array(
            //     //         'pa_' . sanitize_title($attribute_name) => $attribute_term_ids,
            //     //     ));
            //     // }



            //     $product->save();
            //     return;


            //     // $variations = $product->get_variations();

              

            //     printData(['attrs'=>$attrs]);

            //     foreach($wps_product['data']['items']['data'] as $item){
            //         foreach($item['attributevalues']['data'] as $item_attr){
            //             $attr_id = $item_attr['attributekey_id'];
            //             $attr_val = $item_attr['name'];
            //             $attr_name = $attrs[$attr_id]['name'];
            //             $attribute_taxonomy = 'pa_' . sanitize_title($attr_name);
            //             printData(['attr_name'=>$attr_name, 'attr_val'=>$attr_val, 'attribute_taxonomy'=>$attribute_taxonomy]);     

            //             if (!term_exists($attr_val, $attribute_taxonomy)) {
            //                 printLine('insert attr');
            //                 wp_insert_term($attr_val, $attribute_taxonomy);
            //             } else {
            //                 printLine('attr exists');
            //             }
            //             $product->set_attributes($attr_name, $attr_val);
            //         }
            //     }
            //     $product->save();
            //     printData(['wps_product'=>$wps_product]);


            //     // foreach($attrs as $attr){
            //     //     if (!term_exists($value, $attribute)) {
            //     //         wp_insert_term($value, $attribute);
            //     //     }
            //     // }

            //     // wp_set_object_terms($product_id, 'red', 'color', true);
            //     // wp_set_object_terms($product_id, 'blue', 'color', true);
            //     return;


            //     foreach($wps_product['data']['items']['data'] as $item){
            //         $variation_sku = get_western_variation_sku($wps_product, $item);
            //         $variation_id = wc_get_product_id_by_sku($variation_sku);
            //         printLine('variation_sku: '.$variation_sku);

            //         // create variation
            //         if(!$variation_id){
            //             printLine('variation not found');
            //             $variation = new WC_Product_Variation();
            //             $variation->set_parent_id( $product_id );
            //             $attrs = get_western_attributes_from_product($wps_product);
            //             $variation->set_attributes( array( 'attribute_color' => 'Red' ) );
            //             $variation->set_regular_price( 50 );
            //             $variation->set_props([
            //                 'name'=> $item['name'],
            //                 'regular_price'=> floatval($item['list_price']),
            //             ]);
            //             $variation->save();
            //             $variation_id = $variation->get_id();
            //         } else {
            //             printLine('variation exists');
            //             $variation = wc_get_product($variation_id);
            //             $variation_id = $variation->get_id();
            //         }
            //         printData(['variation_id'=>$variation_id]);
            //     }

            //     // foreach($item['attributevalues']['data'] as $attr){
            //     //     $variation->set_attributes( array( 'attribute_color' => 'Red' ) );
            //     // }
            //     // $variation->set_attributes( array( 'attribute_color' => 'Red' ) );
            //     // $variation->set_regular_price( 50 );
            //     // $variation->save();
            //     // $variation_id = $variation->get_id();
           
            // } else {
            //     printLine('product no exists - create');
            //     $product_id = insert_western_product($wps_product);
            //     $product = wc_get_product_object('product', $product_id);
            //     $sku = $product->get_sku();
            //     // if(count($wps_product['data']['items']['data'])
            //     // $product = new WC_Product_Variable();
            //     // $product->set_name($wps_product['data']['name']); // Replace with the product name
            //     // $product->set_status('publish');
            //     // $product->set_regular_price($wps_product['list_price']); // Setting initial price to zero
                
            //     // // Set product type to 'variable'
            //     // // $product->set_type('variable');
                
            //     // // Save the product
            //     // $product_id = $product->save();
            //     printData(['acton'=>'insert', 'sku'=>$sku, 'product_id'=>$product_id]);
            // }


            // $product = new WC_Product();
            // // $variation->set_parent_id( $product_id );
            // $variation->set_attributes( array( 'attribute_color' => 'Red' ) );
            // $variation->set_regular_price( 50 );
            // $variation->save();
            // $variation_id = $variation->get_id();
            // $default_attributes = $woo_product->get_default_attributes();
            // $meta2 = $woo_product->meta_data;

            // $variation = new WC_Product_Variation();
            // $variation->set_parent_id( $product_id );
            // $variation->set_attributes( array( 'attribute_color' => 'Red' ) );
            // $variation->set_regular_price( 50 );
            // $variation->save();
            // $variation_id = $variation->get_id();

            // $attributes = array(
            //     'size' => 'Large',
            //     'color' => 'Blue',
            // );

            // foreach ($attributes as $attribute => $value) {
            //     $default_attributes['attribute_' . sanitize_title($attribute)] = $value;
            // }

            // $variation_data = array(
            //     'attributes' => $attributes,
            //     'regular_price' => '19.99',
            //     'manage_stock' => true,
            //     'stock_quantity' => 10,
            //     'default_attributes' => $default_attributes,
            // );

            // // Create the variation
            // $variation_id = $woo_product->add_variation($variation_data);
            // 'variation_id'=>$variation_id
            break;
        
        case 'wps_product' :
            $product = get_western_product($item_id);
            ?><pre><?=json_encode($product, JSON_PRETTY_PRINT)?></pre><?
            break;
    
        case 'wps_page' :
            $products = get_western_products_page($item_id);
            ?><pre><?=json_encode($products, JSON_PRETTY_PRINT)?></pre><?
            break;
        
        case 'wp_post' :
            $product = get_western_product($item_id);
            $post_id = product_exists('wps', $item_id);
            $meta = null;
            $this_post = null;
            if(isset($item_id)){
                $this_post = get_post($item_id);
                $meta = get_post_meta($this_post->ID);
            }
            ?><pre><?=json_encode(['post'=>$this_post, 'meta'=>$meta], JSON_PRETTY_PRINT)?></pre><?
            break;

        default :
            ?>need a cmd<?;
    }
}

// add submenu item to side nav
function admin_menu_cistore_test()
{
    add_submenu_page('ci-store-plugin-page', 'Test', 'Test', 'manage_options', 'ci-store-plugin-page-test', 'render_ci_store_plugin_test');
}

// need a lower priority so it executes after the main nav item is added
add_action('admin_menu', 'admin_menu_cistore_test', 15);