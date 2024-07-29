<?php

namespace AjaxHandlers;

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
    return \WooTools::helpMe($woo_id);
}

function import_wps_products_page($params)
{
    $cursor = \AjaxManager::get_param('cursor', '', $params);
    $supplier = \WooTools::get_supplier('wps');
    $size = 25;
    $updated_at = '2023-01-01';

    $params = [
        'include' => implode(',', [
            'features', 
            // 'attributekeys',
            // 'items',
            'items.images',
            'items.attributevalues',
            'items.taxonomyterms',
            'items:filter(status_id|NLA|ne)',
        ]),
        'filter' => ['updated_at' => ['gt' => $updated_at]],
        'page' => ['cursor' => $cursor, 'size' => $size],
    ];
    $items = $supplier->get_api('/products', $params);
    return $items;

    return $supplier->import_products_page($cursor);
}

function test_action($params)
{

    // return unserialize('a:6:{s:5:"width";i:5688;s:6:"height";i:2307;s:4:"file";s:63:"https://cdn.wpsstatic.com/images/500_max/c454-5b02f12f27584.jpg";s:8:"filesize";i:1000;s:5:"sizes";a:0:{}s:10:"image_meta";a:12:{s:8:"aperture";i:0;s:6:"credit";s:0:"";s:6:"camera";s:0:"";s:7:"caption";s:0:"";s:17:"created_timestamp";i:0;s:9:"copyright";s:0:"";s:12:"focal_length";i:0;s:3:"iso";s:1:"0";s:13:"shutter_speed";i:0;s:5:"title";s:0:"";s:11:"orientation";i:0;s:8:"keywords";a:0:{}}}');
    // return \WooTools::delete_orphaned_meta_lookup();
    // return [
    //     unserialize('a:1:{s:3:"sku";a:6:{s:4:"name";s:3:"sku";s:5:"value";s:81:"015-01021 | 015-01022 | 015-01023 | 015-01024 | 015-01025 | 015-01026 | 015-01027";s:8:"position";i:0;s:10:"is_visible";i:1;s:12:"is_variation";i:1;s:11:"is_taxonomy";i:0;}}'),
    //     unserialize('a:1:{i:0;a:6:{s:4:"name";s:3:"sku";s:5:"value";s:69:"015-01001 | 015-01002 | 015-01003 | 015-01004 | 015-01005 | 015-01006";s:8:"position";i:0;s:10:"is_visible";i:1;s:12:"is_variation";i:1;s:11:"is_taxonomy";i:0;}}'),
    // ];
    // $example_request = new WP_Example_Request();
    // $example_request->data( array( 'value1' => 1, 'value2' => 2 ) );
    // $example_request->dispatch();
    // return $example_request;

    // $test = new \WP_Background_Process();
    // $args = ['action' => 'TESTTEST', 'page_index' => 1];
    // $test->push_to_queue($args);
    // $test->save()->dispatch();
    // return $test;
    // return find_duped_posts();
    // return \WooTools::delete_orphaned_attachments();

    // return \WooTools::clean_up_orphaned_term_relationships();

    // $id = 15;
    // $metadata = wp_get_attachment_metadata($id);
    // // $metadata['width'] = $newwidth;
    // // wp_update_attachment_metadata($id,$metadata);
    // return $metadata;

    // return get_post_meta(41633, '_product_attributes', true);

    // return \WooTools::attachment_urls_to_postids(['https://localhost:3000/assets/prompt-form-header.jpg', 'https://localhost:3000/assets/default-station-bg.png']);

    // $supplier_key = 't14';
    $supplier_key = 'wps';
    $supplier = \WooTools::get_supplier($supplier_key);

    // return $supplier->import_product(686);
    // return $supplier->get_products_count();

    // return $supplier->import_products_page('VbjlYAnDewNO', 25); // before problem cursor
    // return $supplier->import_products_page('61poYDBDMaDk', 25); // problem cursor

    return $supplier->import_products_page();
    // return $supplier->repair_products_page(1);
    // return $supplier->insert_unique_metas([
    //     ['post_id' => 999999, 'meta_key' => 'test_meta_name1', 'meta_value' => 'testval1'],
    //     ['post_id' => 999999, 'meta_key' => 'test_meta_name2', 'meta_value' => 'testval2'],
    // ]);

    // return $supplier->update_prices_table(1);
    // $page_index = 1;
    // $items = $supplier->get_items_page($page_index);
    // return $items;

    $supplier_product_id = '10241';

    // return $supplier->extract_images(['data' => ['id' => '10241']]);
    // $supplier_product = $supplier->get_product_light($supplier_product_id);
    $supplier_product = $supplier->get_product($supplier_product_id);
    $woo_id = $supplier_product['meta']['woo_id'];
    $woo_product = wc_get_product($woo_id);

    $supplier_product['meta']['item_updated'] = get_post_meta($woo_id, '_ci_t14_item_updated', true);
    // $woo_product = wc_get_product_object($supplier_product['meta']['product_type'], $woo_id);
    $woo_product = $supplier->update_base_product($supplier_product, $woo_product);
    $woo_product->save();

    return $supplier_product;
    // return $supplier->attach_images(['data' => ['id' => '10875']]);
    // return $supplier->get_items_page(1);
    $result = [];

    return $result;

    // $supplier->cronjob->stop();
    // return ['is_active' => $supplier->cronjob->is_active()];

    // $supplier->cronjob->start(['page_index' => 1]);
    // return 'start cron';

    // $result = $supplier->get_products_page(1);
    // $result = $supplier->insert_product_page(3);
    return $result;

    $products = $supplier->get_products_page(1);
    $result = [];

    foreach ($products['data'] as $product) {
        $supplier_product_id = $product['id'];
        $supplier_product = $supplier->get_product($supplier_product_id);
        $result[] = ['id' => $supplier_product_id, 'name' => $supplier->get_name($supplier_product)];
        //$supplier->import_product($supplier_product_id);
        // $result[] = $product['attributes']['product_name'];
    }
    // return $names;
    return $result;

    // $product = \wc_get_product_object('variable', 13182);
    // $children = $product->get_children();
    $post = get_post(280764);
    $meta = get_post_meta(280764);
    $imgs = get_post_meta(280764, '_ci_additional_images', true);
    $variation = \wc_get_product_object('variation', 280764);
    // return ['post'=>$post, 'meta'=>$meta, 'imgs'=>$imgs, 'product'=>$product, 'var'=>$variation];
    return ['imgs' => $imgs];

    $supplier_product_id = \AjaxManager::get_param('supplier_product_id', null, $params);

    // $woo_product_id = \AjaxManager::get_param('woo_product_id', null, $params);

    // $woo_product_id =
    // $woo_product = wc_get_product_object('variable', $woo_product_id);

    $supplier_key = 'wps';
    $supplier = \WooTools::get_supplier($supplier_key);
    $supplier_product = $supplier->get_product($supplier_product_id);
    // $product_sku = $supplier->get_product_sku($supplier_product_id);
    // return ['supplier_product_id' => $supplier_product_id, 'product_sku' => $product_sku, 'supplier_product' => $supplier_product];

    // $woo_product_id = $supplier->get_woo_id($supplier_product_id);
    // return $woo_product_id;
    // $woo_product = $supplier->get_woo_product($supplier_product_id);

    // return $supplier;

    // $time_start = microtime(true);
    // try {
    // \WooTools::sync_images($woo_product, $supplier_product, $supplier);
    // } catch(Exception $e){
    //     return 'failed';
    // }

    $supplier_variations = $supplier->extract_variations($supplier_product);
    $skus = array_column($supplier_variations, 'sku');
    $time_start = microtime(true);
    $product_lookup = \WooTools::get_product_ids_by_skus($skus);
    $time_end = microtime(true);
    $execution_time = $time_end - $time_start;

    $time_start = microtime(true);
    foreach ($supplier_variations as $variation) {
        $variation_id = wc_get_product_id_by_sku($variation['sku']);
    }
    $time_end = microtime(true);
    $execution_time2 = $time_end - $time_start;

    return ['product_lookup' => $product_lookup, 'execution_time' => $execution_time, 'execution_time2' => $execution_time2];
    /*
// $supplier->log('sync_images()');
$woo_product_id = $woo_product->get_id();
$master_image_ids = [];
$result = [];
$result[] = ['woo_id', 'variation_id', 'attachment_id', 'image', 'width', 'height', 'filesize', 'type', 'action'];
$imgs = [];
$image_urls = [];

foreach ($supplier_variations as $variation) {
$variation_id = wc_get_product_id_by_sku($variation['sku']);

if ($variation_id) {
$variation_image_ids = [];

if (isset($variation['images_data']) && is_countable($variation['images_data'])) {

$new_image_urls = array_map(fn($image) => $image['file'], $variation['images_data']);
array_push($image_urls, ...$new_image_urls);
// $imgs = \WooTools::getAllAttachmentImagesIdByUrl($image_urls);
// break;
// $supplier->log($imgs);

}
}
}

$imgs = \WooTools::getAllAttachmentImagesIdByUrl($image_urls);

return ['imgs'=>$imgs];

// $result = \WooTools::getAllAttachmentImagesIdByUrl();
 */

}
