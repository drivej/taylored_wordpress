<?php
namespace CIStore\Hooks;

function enqueue_disable_variations_script()
{
    if (is_product()) {
        wp_register_script( 'product-details', false, [], CI_VERSION, true );
        wp_enqueue_script('product-details');//, plugins_url('js/product-details.js', dirname(__FILE__)), [], CI_VERSION, true);
        // TODO: react component is a fun idea
        // wp_enqueue_script('ci_vehicles', plugins_url('dist/ci_vehicles.js', dirname(__FILE__)), [], CI_VERSION, true);

        $product = wc_get_product(get_the_ID());
        if (! $product) {
            return;
        }

        $product = new \WC_Product_Variable(get_the_ID());

        $variations = $product->get_available_variations();
        foreach ($variations as &$variation) {
            $variation['_ci_product_sku'] = get_post_meta($variation['variation_id'], '_ci_product_sku', true);
        }

        $product_data = [
            'id'         => $product->get_id(),
            'name'       => $product->get_name(),
            'attributes' => array_map(fn($a) => $a->get_data(), $product->get_attributes()),
            'variations' => $variations, //$product->get_available_variations(),
            'version'    => CI_VERSION,
        ];
        wp_localize_script('product-details', 'woo_product_details', $product_data);
    }
}
