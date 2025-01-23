<?php

namespace CIStore\Hooks;

// add_filter('woocommerce_attribute', 'sort_boot_sizes', 10, 3);

// function custom_woocommerce_display_product_attributes($a, $b){
//     error_log(json_encode([$a, $b], JSON_PRETTY_PRINT));
// }

// function custom_woocommerce_attribute($attribute, $instance, $product) {
//     error_log(json_encode($attribute, JSON_PRETTY_PRINT));

//     // if ($attribute['name'] === 'pa_boot_size') { // Replace with your attribute slug
//     //     $attribute['options'] = array_map('intval', $attribute['options']); // Convert to integers
//     //     sort($attribute['options']); // Sort numerically
//     // }
//     return $attribute;
// }