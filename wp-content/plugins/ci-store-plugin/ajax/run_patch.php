<?php

namespace AjaxHandlers;

require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Report.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/western/western_utils.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/western/update_product_attributes.php';

function patch_page()
{
    $status = get_patch_status();

    // pause
    if ($status['pause_request']) {
        update_patch_status(['running' => false, 'reason' => 'paused', 'pause_request' => false]);
        return;
    }

    if ($status['action'] === 'deletes') {

        update_patch_status(['stage' => 'get woo products']);
        $supplier = \CI\Admin\get_supplier('wps');
        $supplier_key = 'wps';

        $args = array(
            'limit' => 0,
            'page' => 1,
            'meta_query' => [['key' => '_ci_supplier_key', 'value' => $supplier_key]],
        );
        $products = wc_get_products($args);

        if (!empty($products)) {
            $supplier_ids = array();
            foreach ($products as $product) {
                $supplier_id = $product->get_meta('_ci_product_id');
                if (!empty($supplier_id)) {
                    $supplier_ids[] = $supplier_id;
                }
            }
        }
        update_patch_status(['stage' => 'get supplier products']);
        $params = [];
        $params['include'] = implode(',', [
            'items:filter(status_id|NLA|ne)',
            'items.taxonomyterms',
        ]);
        update_patch_status(['running' => false, 'data' => $supplier_ids, 'result' => $products, 'test'=>'products/' . implode(',', $supplier_ids)]);
return;
        $products = $supplier->get_api('products/' . implode(',', $supplier_ids), $params);

        update_patch_status(['running' => false, 'data' => $supplier_ids, 'result' => $products]);
        return;
    }
    //
    //
    // patch tags
    //
    //
    if ($status['action'] === 'tags') {
        $supplier = \CI\Admin\get_supplier('wps');
        update_patch_status(['stage' => 'get products']);
        // get page of products
        $size = 100;
        $params = [];
        $params['include'] = implode(',', [
            'items:filter(status_id|NLA|ne)',
            'items.taxonomyterms',
        ]);
        if (!empty($status['cursor'])) {
            $params['page[cursor]'] = $status['cursor'];
        }
        $params['page[size]'] = $size;
        $params['fields[items]'] = 'product_type';
        $params['fields[products]'] = 'id,name,updated_at';
        $products = $supplier->get_api('products', $params);

        if (!is_countable($products['data'])) {
            sleep(10);
            $products = $supplier->get_api('products', $params);
        }

        // process products
        if (is_countable($products['data'])) {
            update_patch_status(['stage' => 'process products', 'data' => '']);
            update_patch_status(['products' => count($products['data'])]);

            foreach ($products['data'] as $i => $product) {
                $tags = $supplier->extract_product_tags($product);
                $products['data'][$i]['items'] = count($products['data'][$i]['items']);
                $products['data'][$i]['tags'] = $tags;

                $woo_id = $supplier->get_woo_id($product['id']);
                $result = wp_set_object_terms($woo_id, $tags, 'product_tag', true);
                $products['data'][$i]['result'] = $result;
            }

            if (isset($products['meta']['cursor']['next']) && !empty($products['meta']['cursor']['next'])) {
                update_patch_status([
                    'cursor' => $products['meta']['cursor']['next'],
                    'processed' => $status['processed'] + count($products['data']),
                ]);
                // update_patch_status(['running' => false]);
                $scheduled = wp_schedule_single_event(time(), 'run_patch_page');
                update_patch_status(['scheduled' => $scheduled]);
            } else {
                update_patch_status(['running' => false, 'reason' => 'empty next cursor']);
            }
        } else {
            update_patch_status(['running' => false, 'reason' => 'empty products']);
        }
        return;
    }
}

add_action('run_patch_page', __NAMESPACE__ . '\\patch_page');

function get_patch_status()
{
    wp_cache_flush();
    $status = get_option('patch_status', ['running' => false, 'cursor' => '', 'processed' => 0]);

    $next_run_timestamp = wp_next_scheduled('run_patch_page');
    $status['next_run_timestamp'] = $next_run_timestamp;
    $status['is_scheduled'] = (bool) $next_run_timestamp;
    if ($next_run_timestamp) {
        $next_run_datetime = new \DateTime();
        $next_run_datetime->setTimestamp($next_run_timestamp);
        $next_run_datetime->setTimezone(new \DateTimeZone('UTC'));
        $next_run_time_formatted = $next_run_datetime->format('Y-m-d\TH:i:sP');
        $next_run_time_formatted;
        $status['next_run'] = $next_run_time_formatted;
    }

    return $status;
}

function pause_patch()
{
    $status = update_patch_status(['running' => false, 'pause_request' => true]);
    return ['status' => $status];
}

function resume_patch()
{
    $status = get_patch_status();
    $scheduled = false;
    $is_scheduled = (bool) wp_next_scheduled('run_patch_page');

    if (!$status['running']) {
        if (!$is_scheduled) {
            if ($status['pause_request']) {
                $status = update_patch_status(['pause_request' => false]);
            }
            $scheduled = wp_schedule_single_event(time(), 'run_patch_page');
        }
    }
    return ['is_scheduled' => $is_scheduled, 'scheduled' => $scheduled, 'status' => $status];
}

function update_patch_status($delta)
{
    $report = get_patch_status();
    $update = array_merge($report, $delta);
    update_option('patch_status', $update);
    return $update;
}

function run_patch($params)
{

    $patch_action = \AjaxManager::get_param('patch_action');
    $status = get_patch_status();
    $scheduled = false;
    $is_scheduled = (bool) wp_next_scheduled('run_patch_page');

    if (!$status['running']) {
        if (!$is_scheduled) {
            update_patch_status(['running' => true, 'cursor' => '', 'processed' => 0, 'products' => null, 'reason' => '', 'action' => $patch_action]);
            $scheduled = wp_schedule_single_event(time(), 'run_patch_page');
        }
    }
    return ['is_scheduled' => $is_scheduled, 'scheduled' => $scheduled, 'status' => $status];
/*
if($supplier_product_id){
$supplier_product = $supplier->get_product($supplier_product_id);
$supplier_variations = $supplier->extract_variations($supplier_product);
$woo_product_id = $supplier->get_woo_id($supplier_product_id);
$master_attributes = $supplier->extract_attributes($supplier_product);
$woo_product = $supplier->get_woo_product($supplier_product_id);
}

// $woo_variations = \WooTools::get_variations($woo_product, 'edit');

// get variations manually to avoid loading all the data at once
$woo_children = $woo_product ? $woo_product->get_children() : []; // removed get_children with false
$woo_has_children = count($woo_children);
//
// test
//

if ($custom === 'wp_get_schedules') {
return wp_get_schedules();
}

if ($custom === 'turn14') {
$supplier = \CI\Admin\get_supplier('t14');
$response = $supplier->getAccessToken();
$brands = $supplier->get_api('/brands');
// $clientId = 'df98c919f33c6144f06bcfc287b984f809e33322';
// $clientSecret = '021320311e77c7f7e661d697227f80ae45b548a9';

// $query_string = http_build_query(['client_id' => $clientId, 'client_secret' => $clientSecret, 'grant_type' => 'client_credentials']);
// $remote_url = 'https://api.turn14.com/v1/token?' . $query_string;

// $response = wp_safe_remote_request($remote_url, ['method'=>'POST', 'body'=>['client_id' => $clientId, 'client_secret' => $clientSecret, 'grant_type' => 'client_credentials']]);

return ['token' => $response, 'brands' => $brands];
}

if ($custom === 'get_update_action') {
$update_action = $supplier->get_update_action($supplier_product);
// $woo_import_version = $woo_product ? $woo_product->get_meta('_ci_import_version') : '';
// $woo_updated_str = 'red'; //get_post_meta($woo_product_id, '_ci_import_version', true);
// $woo_updated = date('Y-m-d H:i:s', strtotime($woo_product->get_date_modified()));

// $date_imported_str = $woo_product->get_meta('_ci_import_timestamp');
// $woo_updated = ''; //new \DateTime($woo_updated_str || '2000-01-01 12:00:00');

return [
// 'params' => $params,
'update_action' => $update_action,
// 'woo_import_version' => $woo_import_version,
// 'woo_updated_str' => $woo_updated_str,
// 'woo_updated' => $woo_updated
];
}

if ($custom === 'update_product_attributes') {
$b = array_map(fn($a) => $a->get_data(), $woo_product->get_attributes('edit'));
update_product_attributes($woo_product, $supplier_product, $report);
$a = array_map(fn($a) => $a->get_data(), $woo_product->get_attributes('edit'));
return ['before' => $b, 'after' => $a, 'report' => $report];
}

if ($custom === 'fix_attributes') {

// $a = $woo_product->get_attributes();
// $r = [];
// foreach($a as $at){
//     $r[] = $at->get_data();
// }
// return ['a'=>$r];

$master_attributes = $supplier->extract_attributes($supplier_product);
$master_slugs = array_column($master_attributes, 'slug');
$notes = [];

foreach ($supplier_variations as $i => $variation) {
$variation_slugs = array_keys($variation['attributes']);

// check for missing attributes - this is cause my bad data from the 3rd party - nobody's perfect!
$missing = array_diff($master_slugs, $variation_slugs);
$supplier_variations[$i]['missing'] = $missing;

if (count($missing)) {
$notes[] = $variation['sku'] . 'is missing attributes ' . implode(',', $missing);
$supplier_variations[$i]['delete'] = true;
continue;
}
// chcek for attributes that don't need to be there
$deletes = array_diff($variation_slugs, $master_slugs);
$supplier_variations[$i]['deletes'] = $deletes;

foreach ($deletes as $attr_slug) {
$notes[] = $variation['sku'] . ' has extra attributes ' . implode(',', $deletes);
unset($supplier_variations[$i]['attributes'][$attr_slug]);
}
}

$supplier_variations = array_filter($supplier_variations, fn($v) => $v['delete'] !== true);

return ['notes' => $notes, 'master_slugs' => $master_slugs, 'supplier_variations' => $supplier_variations];

$variations = [];
$woo_variations = \WooTools::get_variations_objects($woo_product);
foreach ($woo_variations as $woo_variation) {
$sku = $woo_variation->get_sku();
$attributes = $woo_variation->get_attributes('edit');
$variations[$sku] = $attributes;
}
// foreach ($supplier_variations as $supplier_variation) {
//     $woo_variation = \WooTools::supplier_variation_to_object($supplier_variation, $woo_product_id, $report);
// }

return ['$master_attributes' => $master_attributes, 'variations' => $variations, 'supplier_variations' => $supplier_variations];
}
//
// clean variations - removes variations with empy SKU
//
if ($custom === 'clean') {
if ($woo_has_children) {
$cleaned = \WooTools::cleanup_variations($woo_product->get_id());
$woo_children_after = $woo_product->get_children();
return ['cleaned' => $cleaned, 'woo_children' => $woo_children, 'woo_children_after' => $woo_children_after];
} else {
return 'Nothing to clean';
}
}
//
// delete all variations
//
if ($custom === 'flush') {
if ($woo_has_children) {
$delete = \WooTools::delete_variations($woo_product->get_id());
$woo_children_after = $woo_product->get_children(false);
return ['delete' => $delete, 'woo_children' => $woo_children, 'woo_children_after' => $woo_children_after];
} else {
return 'Nothing to clean';
}
}
//
// explore the variations data
//
if ($custom === 'explore') {
if (isset($supplier_product['data']['items']['data'])) {
$action[] = 'Found ' . count($supplier_product['data']['items']['data']) . ' unfiltered supplier children';
}
$action[] = 'Found ' . count($supplier_variations) . ' valid supplier children';

if ($woo_has_children) {
$action[] = 'Found ' . $woo_has_children . ' woo children';
$woo_variations = [];

foreach ($woo_children as $i => $woo_variation_id) {
$variation = new \WC_Product_Variation($woo_variation_id);
$woo_variations[] = $variation->get_data();
$woo_variation_sku = $variation->get_sku('edit');

if ($woo_variation_sku) {
$action[] = 'Variation ' . $woo_variation_id . ' has sku sku=' . $woo_variation_sku;
} else {
$action[] = 'Variation ' . $woo_variation_id . ' has an empty sku sku=' . $woo_variation_sku;
}
}
} else {
$action[] = 'No woo children found';
}

return ['woo_product_id' => $woo_product_id, 'action' => $action];
}
//
// mock up what would happen if we updated
//
if ($custom === 'fix') {
\WooTools::fix_variations($supplier_variations, $woo_product_id, $report);
return ['report' => $report];
}

if ($custom === 'sync') {
// do_sync_variations($woo_product, $supplier_variations, $report = new \Report());
\WooTools::sync_variations($woo_product, $supplier_variations, $report = new \Report(), true);
return ['report' => $report];
}

if ($custom === 'mock') {
\WooTools::sync_variations($woo_product, $supplier_variations, $report = new \Report(), false);
// foreach ($supplier_variations as $supplier_variation) {
//     $variation = supplier_variation_to_object($supplier_variation, $woo_product_id, $report);
// }
return ['report' => $report];
}

return 'That wasn\'t so productive';
 */
}
