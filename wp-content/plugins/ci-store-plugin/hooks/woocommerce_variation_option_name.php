<?php
namespace CIStore\Hooks;

// replace SKU with variation name
function custom_woocommerce_variation_option_name($name, $term, $attribute, $product)
{
    // error_log(json_encode(['name' => $name, 'term' => $term, 'attribute' => $attribute, 'product' => $product]));
    if ($attribute === 'SKU') {
        $variations = $product->get_children();
        foreach ($variations as $variation_id) {
            $variation_sku = get_post_meta($variation_id, 'attribute_sku', true);

            if ($name == $variation_sku) {
                // TODO: lock down _ci_product_sku for every variation
                $sku         = get_post_meta($variation_id, '_ci_product_sku', true);
                $product_id  = get_post_meta($variation_id, '_ci_product_id', true);
                $description = get_post_meta($variation_id, '_variation_description', true);
                return esc_html($description . ' (' . ($sku ? $sku : $product_id) . ')');
            }
        }
    }
    return $name;
}
