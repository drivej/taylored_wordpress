<?php

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
            return false;
        }

        $supplier_product_id = $woo_product->get_meta('_ci_product_id', true);

        if (! $supplier_product_id) {
            $this->log(__FUNCTION__ . ' NO ID!! ' . $supplier_product_id);
            return false;
        }

        $this->import_product($supplier_product_id);
        $this->import_product_vehicles($supplier_product_id);
    }
}
