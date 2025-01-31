Notes:

Hooks:
    - woocommerce_before_single_product
        - Check if product needs an update
        - WooTools::should_update_product() => Supplier::update_pdp_product()

Updates:

2025-01-22
- Products with same facet across each variation skip adding that facet. This avoid unnecessary selection of a facet.
- If a product variations are not uniquely identified by the facet combos, the sku is used as a facet. 
- Fixed an issue where attributes were not saving to the product
- Fixed issue where importer was not being triggered
- added description to variation which shows on PDP
2025-01-23
- Fix issue where product attributes are not consistent across variations and require a dummy N/A facet for woo to work
- added hook to show variation name in SKU dropdown
- added custom size sort (custom_woocommerce_dropdown_variation_attribute_options_args)
- caption/title data added to images in case we need to show which product is related
2025-01-29
- For variable products with 1 item, they save as simple products - so add the attribute values to short description because size/color is missing from description