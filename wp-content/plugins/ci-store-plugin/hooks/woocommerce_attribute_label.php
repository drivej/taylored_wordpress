<?php

namespace CIStore\Hooks;

function custom_attribute_label($label, $name, $product)
{
    // Check if the attribute name matches the one you want to customize
    if ($name === 'sku') {
        // Modify the label for the 'color' attribute
        $label = 'SKU'; //__('Custom Color Label', 'your-text-domain');
    }

    // Return the modified label
    return $label;
}
