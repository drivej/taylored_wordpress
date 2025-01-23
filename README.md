# Taylored Wordpress 2024

## Notes:

### Hooks:
    - woocommerce_before_single_product
        - Check if product needs an update
        - WooTools::should_update_product() => Supplier::update_pdp_product()

### Updates:

#### 2025-01-22
- Products with same facet across each variation skip adding that facet. This avoid unnecessary selection of a facet.
- If a product variations are not uniquely identified by the facet combos, the sku is used as a facet. 
- Fixed an issue where attributes were not saving to the product
- Fixed issue where importer was not being triggered
- added description to variation which shows on PDP
#### 2025-01-23
- Fix issue where product attributes are not consistent across variations and require a dummy N/A facet for woo to work
- added hook to show variation name in SKU dropdown
- added custom size sort (custom_woocommerce_dropdown_variation_attribute_options_args)


<!-- ## Quirks and Features

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

1. custom_before_single_product_script.js selects the attribute -->