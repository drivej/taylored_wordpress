<?php

namespace CIStore\Hooks;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';

function custom_before_shop_loop_item()
{
    global $product;

    if (\WooTools::should_update_product($product, 'plp')) {
        $supplier = \WooTools::get_product_supplier($product);
        $supplier->update_plp_product($product);
    }
}

// add_action('woocommerce_before_shop_loop_item', 'custom_before_shop_loop_item');
