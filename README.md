# Taylored Wordpress 2024

## Quirks and Features

### Where are the Hooks?

- If you put ?debug in the url, it will show on the rendered site where the woo/wp hooks are being activated

### Variable Products that display like Simple Products

This achieved by added a common attribute to the variations called "__required_attr". When the product detail page loads it: 

1. When product is imported, additional attribute added to variation and attributes
    - /ci-store-plugin/suppliers/supplier_wps.php -> extract_variations()
    - /ci-store-plugin/western/update_product_attributes.php -> update_product_attributes()

1. hook is triggered
    - /ci-store-plugin/hooks/woocommerce_before_single_product.php

1. injects the js/css related
    - /ci-store-plugin/js/custom_before_single_product_script.js
    - /ci-store-plugin/css/custom_before_single_product_script.css

1. custom_before_single_product_script.js selects the attribute