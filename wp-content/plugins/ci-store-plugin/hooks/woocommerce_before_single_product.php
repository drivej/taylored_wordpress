<?php
namespace CIStore\Hooks;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';

function custom_before_single_product()
{
    global $product;

    if ($product instanceof \WC_Product) {
        $supplier = \WooTools::get_product_supplier($product);
        if ($supplier) {
            $updated = $supplier->update_pdp_product($product);
            $id      = $product->get_id();
            // $supplier->log(__FUNCTION__, ['id' => $id, 'updated' => $updated]);
            if ($updated) {
                wc_delete_product_transients($id);
                clean_post_cache($id);
            }
        } else {
            error_log(__FUNCTION__ . ' $supplier unknown ' . $supplier);
        }
    }
}
