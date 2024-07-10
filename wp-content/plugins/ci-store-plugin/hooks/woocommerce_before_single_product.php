<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/debug_hook.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';

function custom_before_single_product()
{
    debug_hook('woocommerce_before_single_product');

    $is_product = is_product();

    if ($is_product) {
        global $product;

        // expose product data
        wp_enqueue_script('product-details-script', plugin_dir_url(dirname(__FILE__)) . '/js/product-details.js', array('jquery'), CI_VERSION, true);

        // Pass product data and variations to the script using wp_localize_script()
        $product_data = array(
            'id' => $product->get_id(),
            'name' => $product->get_name(),
            'attributes' => array_map(fn($a) => $a->get_data(), $product->get_attributes()),
            // 'variations' => $product->get_available_variations(),
            'variations' => WooTools::get_variations($product),
            'version' => CI_VERSION,
        );

        wp_add_inline_script('product-details-script', 'const woo_product_details = ' . json_encode($product_data), 'before');
        // wp_localize_script('product-details-script', 'woo_product_details', $product_data);

        wp_enqueue_script('custom_before_single_product_script', plugin_dir_url(dirname(__FILE__)) . 'js/custom_before_single_product_script.js', array('jquery'), CI_VERSION, true);
        wp_enqueue_style('custom_before_single_product_style', plugin_dir_url(dirname(__FILE__)) . 'css/custom_before_single_product_style.css', null, CI_VERSION);

        $result = WooTools::update_single_product($product);
        debug_data(['update_single_product' => $result]);
        // print(json_encode(['result' => $result], JSON_PRETTY_PRINT));

        // $last_updated = $product->get_meta('_last_updated', true);
        // $age = $last_updated ? WooTools::get_age($last_updated, 'hours') : 99999;
        // // print_r(['last_updated' => $last_updated, 'age' => $age]);
        // // return;

        // if ($age > 48) {
        //     print_r(['updated' => true]);
        //     $supplier_product_id = $product->get_meta('_ci_product_id', true);
        //     $supplier_key = $product->get_meta('_ci_supplier_key', true);
        //     $supplier = WooTools::get_supplier($supplier_key);
        //     $supplier->attach_images(['data' => ['id' => $supplier_product_id]]);
        //     $product_id = $product->get_id();
        //     update_post_meta($product_id, '_last_updated', gmdate("c"));
        // }

        // $time_ago = strtotime('-2 weeks');
        // // $time_ago = strtotime('-1 minute'); //  for testing
        // $now = time();

        // // if the product has been stagnant for over 2 week, check the stock level
        // $updated = strtotime($product->get_date_modified('edit'));
        // $updated_date = time();
        // if ($updated) {
        //     $updated_date = strtotime($updated);
        // }
        // $should_update = ($now - $updated_date) > ($now - $time_ago);

        // // $updated = $product->get_date_modified();
        // // $updated_date = $updated ? strtotime($updated) : null;
        // // $should_update = $updated_date ? ($now - $updated_date) > ($now - $time_ago) : false;

        // // check if import needed
        // $imported = $product->get_meta('_ci_import_timestamp');
        // $imported_date = time();
        // if ($imported) {
        //     $imported_date = strtotime($imported);
        // }
        // // TODO: add reasons for import
        // $stale = ($now - $imported_date) > ($now - $time_ago);
        // $needs_images = true;//count($product->get_gallery_image_ids()) === 0;

        // $should_import = $stale || $needs_images;

        // if ($should_import || $should_update) {
        //     $supplier = WooTools::get_product_supplier($product);
        //     if ($supplier) {
        //         $supplier_product_id = $product->get_meta('_ci_product_id');
        //         $supplier->attach_images(['data' => ['id' => $supplier_product_id]]);

        //         if ($should_import) {
        //             // TODO: should we have a full import here?
        //             $scheduled_import = (bool) $supplier->schedule_import_product($supplier_product_id);
        //         }

        //         if ($should_update) {
        //             $supplier_stock_status = $supplier->get_stock_status($supplier_product_id);
        //             $product->set_stock_status($supplier_stock_status);
        //             $saved = $product->save();

        //             debug_data([
        //                 'should_import' => $should_import,
        //                 'should_update' => $should_update,
        //                 'scheduled_import' => $scheduled_import,
        //                 'product_age' => $now - $updated_date,
        //                 'saved' => $saved,
        //                 'stock_status' => $supplier_stock_status,
        //                 'imported' => $imported,
        //                 'updated' => $updated,
        //             ]);
        //         }
        //     }
        // } else {
        //     debug_data([
        //         'should_import' => $should_import,
        //         'should_update' => $should_update,
        //         'product_age' => $now - $updated_date,
        //         'imported' => $imported,
        //         'updated' => $updated,
        //     ]);
        // }

        return;
    }
}

add_action('woocommerce_before_single_product', 'custom_before_single_product', 20);
