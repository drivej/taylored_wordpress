<?php

namespace AjaxHandlers;

use Exception;

require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Tasket.php';

function patch_product_images($woo_product_id)
{
    $product = wc_get_product_object('variable', $woo_product_id);
    if ($product) {
        try {
            $supplier_key = $product->get_meta('_ci_supplier_key');
            $supplier_product_id = $product->get_meta('_ci_product_id');
            $supplier = \WooTools::get_supplier($supplier_key);
            $supplier_product = $supplier->get_product($supplier_product_id);
            \WooTools::removeProductAttribute($woo_product_id, '__required_attr');
            $supplier->update_product_images($product, $supplier_product);
            global $patch_task;
            $patch_task->log('patch_product_images:' . $woo_product_id);
        } catch (Exception $e) {
            $patch_task->log('err:' . $e);
        }
    }
}

function patch_product_stock($woo_product_id)
{
    $product = wc_get_product_object('variable', $woo_product_id);
    if ($product) {
        try {
            $supplier_key = $product->get_meta('_ci_supplier_key');
            $supplier_product_id = $product->get_meta('_ci_product_id');
            $supplier = \WooTools::get_supplier($supplier_key);
            $supplier_product = $supplier->get_product($supplier_product_id);
            $is_available = $supplier->is_available($supplier_product);
            $deleted = false;

            if (!$is_available) {
                $deleted = $supplier->delete_product($supplier_product_id);
            }
            global $patch_task;
            $patch_task->log('patch_product_stock:' . $woo_product_id . ' deleted=' . $deleted);
        } catch (Exception $e) {
            $patch_task->log('err:' . $e);
        }
    }
}

add_action('patch_product_images', 'AjaxHandlers\patch_product_images', 10, 1);

function test_loop($woo_product_id)
{
    global $patch_task;
    $patch_task->log('test_loop ' . $woo_product_id);

}

add_action('test_loop', 'AjaxHandlers\test_loop', 10, 1);

class PatchTask extends \Tasket

{
    public function __construct()
    {
        parent::__construct('patch_products');
    }

    public function process()
    {
        $report = $this->get_report();
        $args = [
            'post_type' => 'product',
            'posts_per_page' => $report['input']['posts_per_page'],
            'paged' => $report['input']['paged'],
            'fields' => 'ids',
        ];

        $query = new \WP_Query($args);
        $report = $this->ping();
        $output = $report['output'];
        $output['total'] = $query->found_posts;
        // $patch = 'images';

        if ($query->have_posts()) {

            foreach ($query->posts as $woo_product_id) {
                do_action('patch_product_images', $woo_product_id);
                $output['products']++;
                $output['progress'] = $output['products'] / $output['total'];
                $report = $this->update_report($output, true);

                if ($report['is_cancelled']) {
                    break;
                }
                // $this->log('patch images ' . $woo_product_id);
            }

            // while ($query->have_posts()) {
            // $query->the_post();
            /*
            global $product;
            $woo_product_id = $product->get_id();
            $supplier_key = $product->get_meta('_ci_supplier_key');
            $supplier_product_id = $product->get_meta('_ci_product_id');
            $supplier = \CI\Admin\get_su pplier($supplier_key);
            $supplier_product = $supplier->get_product($supplier_product_id);

            // $this->log('patch images ' . $woo_product_id . '::' . $supplier_product['data']['id']);
            if ($patch === 'images') {
            $this->log('patch images ' . $woo_product_id);
            \WooTools::removeProductAttribute($woo_product_id, '__required_attr');
            $supplier->update_product_images($product, $supplier_product);
            }

            $output['products']++;
            $report = $this->update_report(['output' => $output, 'progress' => $output['products'] / $output['total']], true);

            if ($report['is_cancelled']) {
            break;
            }
             */
            // }
            // wp_reset_postdata();
        } else {
            $report['is_complete'] = true;
        }

        $is_last_page = max(1, $query->get('paged')) >= $query->max_num_pages;

        if ($is_last_page) {
            $report['is_complete'] = true;
        } else {
            $report['input']['paged']++;
        }
        $this->update_report($report);

        // return $report;
    }
}

// TODO: this is spamming the PATCH_PRODUCTS_LOG.log

// $patch_task = new PatchTask();

// $patch_task = new \Tasket('patch_products');

function get_task($params)
{
    global $patch_task;
    return $patch_task->get_report();
}

function start_task($params)
{
    global $patch_task;
    $result = $patch_task->start(['posts_per_page' => 50, 'paged' => 1, 'patch' => 'images'], ['products' => 0, 'result' => []]);
    return ['result' => $result];
}

function resume_task($params)
{
    global $patch_task;
    $result = $patch_task->resume();
    return ['result' => $result];
}

function cancel_task($params)
{
    global $patch_task;
    $result = $patch_task->cancel();
    return ['result' => $result];
}

function get_task_log($params)
{
    global $patch_task;
    return $patch_task->get_log();
}

function clear_task_log($params)
{
    global $patch_task;
    $patch_task->clear_log();
}
