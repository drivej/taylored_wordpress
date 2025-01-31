<?php

use function CIStore\Suppliers\get_supplier_import_version;
use function CIStore\Utils\get_age;

trait Supplier_WPS_Update
{
    public function update_plp_product($woo_product)
    {
        /** @var Supplier_WPS $this */
        return;
    }

    public function update_pdp_product($woo_product)
    {
        /** @var Supplier_WPS $this */
        if (is_string($woo_product) || is_numeric($woo_product)) {
            $woo_product = wc_get_product($woo_product);
        }

        if (! ($woo_product instanceof \WC_Product)) {
            // $this->log(__FUNCTION__, 'Error: Not a product');
            return false;
        }

        $supplier_product_id = $woo_product->get_meta('_ci_product_id', true);
        $supplier_product    = $this->get_product($supplier_product_id);

        if (! $supplier_product || isset($supplier_product['error'])) {
            // $this->log(__FUNCTION__, 'Error: API Failed');
            return false;
        }

        $import_version          = $woo_product->get_meta('_ci_import_version', true);
        $supplier_key            = $woo_product->get_meta('_ci_supplier_key', true);
        $supplier_import_version = get_supplier_import_version($supplier_key);

        if ($import_version !== $supplier_import_version) {
            $this->log(__FUNCTION__, 'import version', ['import_version' => $import_version, 'supplier_import_version' => $supplier_import_version]);
            $this->import_product($supplier_product_id);
            return true;
        }

        $is_available = $this->is_available($supplier_product);

        if (! $is_available) {
            // $this->log(__FUNCTION__, 'delete product', ['key' => $this->key, 'id' => $supplier_product_id]);
            $woo_product->delete();
            return true;
        }

        $updated     = $woo_product->get_meta('_ci_update_pdp', true);
        $age_in_days = isset($updated) && strtotime($updated) ? get_age($updated, 'days') : 0;

        if ($age_in_days > 3) {
            // $this->log(__FUNCTION__, 'update product', ['key' => $this->key, 'id' => $supplier_product_id, 'age_in_days' => $age_in_days]);
            $this->import_product($supplier_product_id);
            return true;
        }
        return false;
    }
}
