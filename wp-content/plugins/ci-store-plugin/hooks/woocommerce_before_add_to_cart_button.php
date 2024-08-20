<?php

function custom_add_sku_selector()
{
    global $product;

    // Check if the product is variable and has variations
    if ($product->is_type('variable') && $product->has_child()) {
        $variations = $product->get_children();

        if (!empty($variations)) {
            echo '<select class="form-select" name="variation_id" id="variation_id">';
            echo '<option value="">' . __('Select SKU', 'textdomain') . '</option>';

            foreach ($variations as $variation_id) {
                $variation = wc_get_product($variation_id);
                $variation_supplier_sku = $variation->get_meta('_ci_product_sku', true);
                echo '<option value="' . esc_attr($variation_id) . '">' . $variation_supplier_sku . '</option>';
            }

            echo '</select>';
        }
    }
}

// add_action('woocommerce_before_add_to_cart_button', 'custom_add_sku_selector');
// add_action('woocommerce_before_single_variation', 'custom_add_sku_selector');
