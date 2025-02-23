<?php
namespace CIStore\Hooks;

use function CIStore\Utils\get_age;

function custom_before_single_product()
{
    global $product;

    if ($product instanceof \WC_Product) {
        //
        // TEST
        //
        // $id               = $product->get_id();
        // $import_version   = $product->get_meta('_ci_import_version', true);
        // $import_timestamp = $product->get_meta('_ci_import_timestamp', true);
        // $age              = $import_timestamp ? get_age($import_timestamp, 'hours') : 99999;
        // $pid              = get_post_meta($id, '_ci_product_id', true);
        // error_log(json_encode(['import_version' => $import_version, 'CI_IMPORT_VERSION'=>CI_IMPORT_VERSION, 'age' => $age, 'pid' => $pid]));
        //
        //
        //
        $needs_update   = 0;
        $import_version = $product->get_meta('_ci_import_version', true);

        // test #1 check import version
        if ($import_version != CI_IMPORT_VERSION) {
            $needs_update = 1;
            // error_log(json_encode(['$import_version' => $import_version, 'CI_IMPORT_VERSION' => CI_IMPORT_VERSION]));
        }

        // test #1 check import date
        if (! $needs_update) {
            $import_timestamp = $product->get_meta('_ci_import_timestamp', true);
            $age              = $import_timestamp ? get_age($import_timestamp, 'hours') : 99999;

            if ($age > 72) {
                $needs_update = 2;
            }
        }

        // error_log('$needs_update=' . $needs_update);

        if ($needs_update) {
            $supplier = \WooTools::get_product_supplier($product);
            $id       = $product->get_id();

            if ($supplier) {
                $pid = get_post_meta($id, '_ci_product_id', true);
                error_log('PDP update ' . $id . ' $supplier=' . $supplier->key . ' $pid=' . $pid . ' reason=' . $needs_update);
                $updated = $supplier->update_pdp_product($product);

                if ($updated) {
                    wc_delete_product_transients($id);
                    clean_post_cache($id);
                }
            }
        }
    }
}
