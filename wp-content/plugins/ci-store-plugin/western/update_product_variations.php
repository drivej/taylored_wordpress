<?php

// require_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/index.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';

// function variation_needs_update($woo_variation, $wps_item)
// {
//     global $WPS_SxETTINGS;
//     $needs_update = false;
//     $import_version = $woo_variation->get_meta('_ci_import_version');
//     // update if import version changes
//     if ($import_version != $WPS_SETTIxNGS['import_version']) {
//         $needs_update = true;
//     }
//     $imported = $woo_variation->get_meta('_ci_import_timestamp');
//     $date_imported = new DateTime($imported ? $imported : '2000-01-01 12:00:00');
//     $updated = $wps_item['updated_at'];
//     $date_updated = new DateTime($updated);
//     // update if imported before last remote update
//     if ($date_imported < $date_updated) {
//         $needs_update = true;
//     }
//     return $needs_update;
// }
/**
 *
 * @param WC_Product    $product
 * @param array    $wps_product
 * @param Report   $report
 */
function update_product_variations($woo_product, $supplier_product, $report)
{
    $supplier = WooTools::get_product_supplier($woo_product);
    $supplier_variations = $supplier->extract_variations($supplier_product);
    $result['sync'] = WooTools::sync_variations($woo_product, $supplier_variations, $report);
}
