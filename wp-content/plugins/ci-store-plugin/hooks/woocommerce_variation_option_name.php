<?php
namespace CIStore\Hooks;

// replace SKU with variation name
function custom_woocommerce_variation_option_name($name, $term, $attribute, $product) {
    if ($attribute === 'SKU') {
        $variations = $product->get_children();
        foreach ($variations as $variation_id) {
            $variation_sku = get_post_meta($variation_id, 'attribute_sku', true);
            if ($name === $variation_sku) {
                $variation_name = get_post_meta($variation_id, '_variation_description', true);
                return esc_html($variation_name . ' (' . $variation_sku . ')');
            }
        }
    }
}