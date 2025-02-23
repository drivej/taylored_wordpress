# Taylored Wordpress 2024

## Notes:

### Hooks:
- woocommerce_before_single_product
    - Check if product needs an update
    - WooTools::should_update_product() => Supplier::update_pdp_product()

## Updates:

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
- caption/title data added to images in case we need to show which product is related
#### 2025-01-24
- PDP default images are the first image of each variation. On selecting variation, all related images are shown
#### 2025-01-26
- added updated date to bottom of PDP
#### 2025-01-29
- For variable products with 1 item, they save as simple products - so add the attribute values to short description because size/color is missing from description
#### 2025-01-30
- Added wp_get_attachment_url hook so admin can see the images
#### 2025-02-03
- Added product taxonomy to import
- refined category import to use breadcrumb path as slug to differentiate "shoes" such as mean->shoes, womens->shoes
- categories that have the same parent (usually null) but same name will merge. WPS has duplicated categories and this fixes that
- added UI to WPS manager to trigger taxonomy import
- Note: product_type is an attribute that is imported as a category. "Spark Plug" is a product_type but their taxonomyterm is "Hard Drive". WTF.
- Added category merge for WPS products so manually added categories will persist
#### 2025-02-17
- Added vehicle UI
- Added vehicle import code
- updated global import logic to handle types in the main loader UI
- Fixed bug where WPS attributes do not load more then 10 at a time
- Added PDP UX to disable/auto select facets
- Patched "type" is reserved word for terms. This need to be considered for all imports
#### 2025-02-20
- vehicle data is too big to load normally - some items have 100s
- optimized vehicle load to load per product and step through items in import_product_vehicles()
- categories added with wc function because bulk system was erasing vehicle data
- clean up get_age function
- product improt time about 5 hours

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