<?php
namespace CIStore\Hooks;

// TODO: why doesn't the Attribute Admin allow us to organize these? Is there a flag?

// This enforces the order that the attributes appear in the attribute manager page
// to change the order, do it in Woo admin!

function custom_woocommerce_dropdown_variation_attribute_options_args($args)
{
    if ($args['attribute'] === "Size") {
        $attribute_name = 'pa_size';

        // Check if the attribute is a taxonomy (global attribute)
        if (taxonomy_exists($attribute_name)) {
            $terms = get_terms([
                'taxonomy'   => $attribute_name,
                'orderby'    => 'menu_order', // Ensure menu order is respected
                'hide_empty' => false,        // Include all terms, even if not used
            ]);

            $custom_order = array_map(fn($t) => $t->name, $terms);

            usort($args['options'], function ($a, $b) use ($custom_order) {
                return array_search($a, $custom_order) - array_search($b, $custom_order);
            });
        }
    }

    return $args;
}
