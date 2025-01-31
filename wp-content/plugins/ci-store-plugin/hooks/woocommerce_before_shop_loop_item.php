<?php
namespace CIStore\Hooks;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';

function custom_before_shop_loop_item()
{
    global $product;
    // TODO: add list update
    return;

    if ($product instanceof \WC_Product) {
        if (\WooTools::should_update_product($product, 'plp')) {
            $supplier = \WooTools::get_product_supplier($product);
            if ($supplier) {
                $supplier->update_plp_product($product);
            } else {
                error_log(__FUNCTION__ . ' supplier unknown');
            }
        }
    }
}
