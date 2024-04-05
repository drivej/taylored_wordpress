<?php
/*
namespace AjaxHandlers;

require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Report.php';
// include_once WP_PLUGIN_DIR . '/ci-store-plugin/western/western_utils.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/western/update_product_attributes.php';

function patch_page()
{
    $status = get_patch_status();

    // pause
    if ($status['pause_request']) {
        update_patch_status(['running' => false, 'reason' => 'paused', 'pause_request' => false]);
        return;
    }
    //
    //
    // patch deletes
    //
    //
    if ($status['action'] === 'deletes') {

        update_patch_status(['stage' => 'get woo products']);
        $supplier = \CI\Admin\get_supplier('wps');
        $supplier_key = 'wps';

        $args = array(
            'limit' => 11,
            'page' => $status['page'],
            'meta_query' => [['key' => '_ci_supplier_key', 'value' => $supplier_key]],
        );
        $woo_products = wc_get_products($args);
        $supplier_id_to_woo_id_lookup = [];
        $supplier_ids = [];

        if (empty($woo_products)) {
            update_patch_status(['running' => false, 'reason' => 'woo products empty', 'pause_request' => false]);
            return;
        }

        foreach ($woo_products as $product) {
            $supplier_id = $product->get_meta('_ci_product_id');
            if (!empty($supplier_id)) {
                $supplier_ids[] = $supplier_id;
                $supplier_id_to_woo_id_lookup[$supplier_id] = ['woo_id' => $product->get_id()];
            }
        }

        update_patch_status(['stage' => 'get supplier products']);

        $supplier_product_ids = [];
        $supplier_product_ids_NAL = [];
        $supplier_products = [];

        if (count($supplier_ids)) {
            $params = [];
            $params['include'] = implode(',', [
                'items:filter(status_id|NLA|ne)',
            ]);
            $supplier_products = $supplier->get_api('products/' . implode(',', $supplier_ids), $params);

            if (isset($supplier_products['error'])) {
                update_patch_status(['running' => false, 'data' => $supplier_products]);
                return;
            }
            $supplier_id_is_available_lookup = [];

            if (is_countable($supplier_products['data'])) {
                foreach ($supplier_products['data'] as $supplier_product) {
                    if ($supplier->is_available(['data' => $supplier_product])) {
                        $supplier_product_ids[] = $supplier_product['id'];
                    } else {
                        $supplier_product_ids_NAL[] = $supplier_product['id'];
                    }
                    $supplier_id_to_woo_id_lookup[$supplier_product['id']]['is_available'] = $supplier->is_available(['data' => $supplier_product]);
                    // $supplier_id_is_available_lookup[$supplier_product['id']] = $supplier->is_available(['data' => $supplier_product]);
                }
            }

            // foreach ($supplier_id_to_woo_id_lookup as $supplier_id => $info) {
            //     if (isset($supplier_id_is_available_lookup[$supplier_id]) && $supplier_id_is_available_lookup[$supplier_id] === true) {
            //         //
            //         $supplier_id_to_woo_id_lookup[$supplier_id]['is_available'] = true;
            //     } else {
            //         $supplier_id_to_woo_id_lookup[$supplier_id]['is_available'] = false;
            //     }
            // }
        }

        $dif = array_values(array_diff($supplier_ids, $supplier_product_ids));

        update_patch_status([
            'running' => false,
            'data' => [
                'dif' => $dif,
                'supplier_product_ids_NAL' => $supplier_product_ids_NAL,
                'woo_supplier_ids' => $supplier_ids,
                'supplier_product_ids' => $supplier_product_ids,
                'supplier_id_to_woo_id_lookup' => $supplier_id_to_woo_id_lookup,
                'supplier_products' => $supplier_products,
            ],
        ]);
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
                if (!$scheduled) {
                    update_patch_status(['running' => false, 'reason' => 'scheduled failed']);
                }
            } else {
                update_patch_status(['running' => false, 'reason' => 'empty next cursor']);
            }
        } else {
            update_patch_status(['running' => false, 'reason' => 'empty products']);
        }
        return;
    }
    //
    //
    // patch attributes
    //
    //
    if ($status['action'] === 'attributes') {
        update_patch_status(['running' => false, 'reason' => 'test']);
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
    $status['next_run'] = '';

    if ($next_run_timestamp) {
        $next_run_datetime = new \DateTime();
        $next_run_datetime->setTimestamp($next_run_timestamp);
        $next_run_datetime->setTimezone(new \DateTimeZone('UTC'));
        $next_run_time_formatted = $next_run_datetime->format('Y-m-d\TH:i:sP');
        $next_run_time_formatted;
        $status['next_run'] = $next_run_time_formatted;
    }

    if ($status['started']) {
        $date_in = new \DateTime($status['started']);
        $currentDateTime = new \DateTime();
        $minutes_ago = ($currentDateTime->getTimestamp() - $date_in->getTimestamp()) / 60;
        $status['started_ago'] = $minutes_ago . ' min ago';
    }

    return $status;
}

function pause_patch()
{
    $unscheduled = (bool) wp_clear_scheduled_hook('run_patch_page');
    $status = update_patch_status(['running' => false, 'pause_request' => true]);
    return ['status' => $status, 'unscheduled' => $unscheduled];
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

function clean_patch_status()
{
    $report = get_patch_status();
    if (isset($report['scheduled'])) {
        unset($report['scheduled']);
    }
    if (isset($report['woo_products'])) {
        unset($report['woo_products']);
    }
    update_option('patch_status', $report);
}

function run_patch($params)
{
    clean_patch_status();

    $patch_action = \AjaxManager::get_param('patch_action');
    $status = get_patch_status();
    $scheduled = false;
    $is_scheduled = (bool) wp_next_scheduled('run_patch_page');

    if ($status['running']) {
        return ['reason' => 'patch is running'];
    }

    if ($status['is_scheduled']) {
        return ['reason' => 'patch is is scheduled'];
    }

    if (!$status['running']) {
        if (!$is_scheduled) {
            update_patch_status([
                'started' => gmdate("c"),
                'running' => true,
                'cursor' => '',
                'processed' => 0,
                'products' => null,
                'reason' => '',
                'action' => $patch_action,
                'data' => [],
            ]);
            $scheduled = wp_schedule_single_event(time(), 'run_patch_page');
        }
    }
    return ['is_scheduled' => $is_scheduled, 'scheduled' => $scheduled, 'status' => $status];
}

*/