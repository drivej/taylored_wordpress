<?php

namespace CIStore\Hooks;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';

function custom_before_single_product()
{
    $is_product = is_product();

    if ($is_product) {
        global $product;
        if (\WooTools::should_update_product($product, 'pdp')) {
            $supplier = \WooTools::get_product_supplier($product);
            $supplier->update_pdp_product($product);
        }
    }
}

// add_action('woocommerce_before_single_product', 'custom_before_single_product', 20);

