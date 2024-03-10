<?php

require_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/index.php';

class WooTools
{
    /**
     *
     * @param WC_Product    $woo_product
     */
    public static function get_product_supplier_key($woo_product)
    {
        return $woo_product->get_meta('_ci_supplier_key', true);
    }

    public static function get_supplier($supplier_key)
    {
        global $SUPPLIERS;
        if (isset($SUPPLIERS[$supplier_key])) {
            return $SUPPLIERS[$supplier_key];
        }
        return null;
    }
    /**
     *
     * @param WC_Product    $woo_product
     */
    public static function get_product_supplier($woo_product)
    {
        $supplier_key = WooTools::get_product_supplier_key($woo_product);
        return WooTools::get_supplier($supplier_key);
    }

    public static function array_lookup($objects, $key = 'id')
    {
        $lookup = [];
        foreach ($objects as $object) {
            $lookup[$object[$key]] = $object;
        }
        return $lookup;
    }
    /**
     *
     * @param WC_Product    $woo_product
     */
    public static function get_attributes_data($woo_product)
    {
        $attributes = $woo_product->get_attributes('edit');
        return WooTools::attributes_to_data($attributes);
    }

    public static function attributes_to_data($attributes)
    {
        $result = [];
        if (isset($attributes)) {
            foreach ($attributes as $slug => $attribute) {
                $data = $attribute->get_data();
                $data['slug'] = $slug;
                $result[] = $data;
            }
        }
        return $result;
    }

    public static function build_attribute($name, $options)
    {
        $new_attribute = new WC_Product_Attribute();
        $new_attribute->set_name($name);
        $new_attribute->set_options($options);
        $new_attribute->set_id(0);
        $new_attribute->set_visible(1);
        $new_attribute->set_variation(1);
        return $new_attribute;
    }

    public static function sync_variations($woo_product, $supplier_variations, $report = new Report())
    {
        $result = [];
        $changed = false;
        $woo_product_id = $woo_product->get_id();
        $woo_variations = WooTools::get_variations($woo_product);
        $woo_skus = array_column($woo_variations, 'sku');
        $supplier_skus = array_column($supplier_variations, 'sku');
        $supplier_variation_lookup = WooTools::array_lookup($supplier_variations, 'sku');

        $deletes = array_values(array_diff($woo_skus, $supplier_skus));
        $inserts = array_values(array_diff($supplier_skus, $woo_skus));
        $updates = array_values(array_diff($woo_skus, $deletes, $inserts));

        $result['test'] = 2;
        $result['woo_skus'] = $woo_skus;
        $result['supplier_skus'] = $supplier_skus;
        $result['deletes'] = $deletes;
        $result['inserts'] = $inserts;
        $result['updates'] = $updates;

        // $result['woo_product_id'] = $woo_product_id;
        // $result['deletes'] = $deletes;
        // $result['inserts'] = $inserts;
        // $result['updates'] = $updates;
        // $result['actions'] = [];

        foreach ($inserts as $variation_sku) {
            $supplier_variation = $supplier_variation_lookup[$variation_sku];
            // maybe orphaned variation exists
            $variation_id = wc_get_product_id_by_sku($variation_sku);

            if ($variation_id) {
                $variation = wc_get_product($variation_id);
            } else {
                $variation = new WC_Product_Variation();
                $variation->set_parent_id($woo_product_id);
                $variation->set_sku($variation_sku);
            }
            $variation->set_name($supplier_variation['name']);
            $variation->set_status('publish');
            $variation->set_regular_price($supplier_variation['list_price']);
            $variation->set_stock_status('instock');
            $variation->update_meta_data('_ci_supplier_key', 'wps');
            $variation->update_meta_data('_ci_product_id', $supplier_variation['id']);
            $variation->update_meta_data('_ci_additional_images', serialize($supplier_variation['images']));
            $variation->update_meta_data('_ci_import_timestamp', gmdate("c"));
            $variation->set_attributes($supplier_variation['attributes']);
            $variation->save();
            $result['actions'][] = 'insert ' . $variation_sku;
            $changed = true;
        }

        // if ($report) {
        //     $report->addData('sync_variations', $result);
        // }
        // return $result;

        $children = $woo_product->get_children();
        // there is a possibility that a sku will be shared by multiple posts
        // so we have to loop the children to find matching skus
        foreach ($deletes as $delete_variation_sku) {
            foreach ($children as $variation_id) {
                $variation = wc_get_product($variation_id);
                if ($variation) {
                    $woo_variation_sku = $variation->get_sku();
                    if ($delete_variation_sku === $woo_variation_sku) {
                        $deleted = $variation->delete(true);
                        $result['actions'][] = 'delete variation: sku=' . $delete_variation_sku . ' id=' . $variation_id . ' deleted=' . $deleted;
                    }
                }
            }
        }

        foreach ($updates as $variation_sku) {
            $supplier_variation = $supplier_variation_lookup[$variation_sku];
            $variation_id = wc_get_product_id_by_sku($variation_sku);
            if ($variation_id) {
                $variation = wc_get_product($variation_id);
                if ($variation) {
                    $variation->set_name($supplier_variation['name']);
                    $variation->set_status('publish');
                    $variation->set_regular_price($supplier_variation['list_price']);
                    $variation->set_stock_status('instock');
                    $variation->update_meta_data('_ci_additional_images', serialize($supplier_variation['images']));
                    $variation->update_meta_data('_ci_import_timestamp', gmdate("c"));
                    $variation->set_attributes($supplier_variation['attributes']);
                    $saved = $variation->save();
                    $result['actions'][] = 'update variation: sku=' . $variation_sku . ' id=' . $variation_id . ' saved=' . $saved;
                }
            }
        }

        $result['changed'] = $changed;
        if ($changed) {
            $woo_product->save();
            // wc_delete_product_transients($woo_product_id);
        }
        if ($report) {
            $report->addData('sync_variations', $result);
        }
        return $result;
    }
    /**
     *
     * @param WC_Product_Variable $woo_product
     * @param array $attribute_object {
     *     The attribute object.
     *
     *     @type int    $id       The ID.
     *     @type string $name     The name.
     *     @type string $slug     The slug.
     *     @type array  $options  The options.
     * @param Report   $report
     * }
     */
    public static function sync_attributes($woo_product, $supplier_attributes, $report = null)
    {
        $result = [];
        $changed = false;
        $woo_attributes_raw = $woo_product->get_attributes('edit');
        $woo_attributes = WooTools::get_attributes_data($woo_product);
        $woo_names = array_column($woo_attributes, 'slug');
        $supplier_names = array_column($supplier_attributes, 'slug');
        $deletes = array_values(array_diff($woo_names, $supplier_names));
        $inserts = array_values(array_diff($supplier_names, $woo_names));
        $updates = array_values(array_diff($woo_names, $deletes, $inserts));
        $woo_lookup = WooTools::array_lookup($woo_attributes, 'slug');
        $supplier_lookup = WooTools::array_lookup($supplier_attributes, 'slug');

        $result['actions'] = [];
        $result['deletes'] = $deletes;
        $result['inserts'] = $inserts;
        $result['updates'] = $updates;

        foreach ($inserts as $attr_slug) {
            $result['actions'][] = 'insert ' . $attr_slug;
            $attr = $supplier_lookup[$attr_slug];
            $attr_slug = sanitize_title($attr['name']);
            $woo_attributes_raw[$attr_slug] = WooTools::build_attribute($attr['name'], $attr['options']);
            $changed = true;
        }

        foreach ($deletes as $attr_slug) {
            $result['actions'][] = 'delete ' . $attr_slug;
            unset($woo_attributes_raw[$attr_slug]);
            $changed = true;
        }

        foreach ($updates as $attr_slug) {
            $local_options = $woo_lookup[$attr_slug]['options'];
            $remote_options = $supplier_lookup[$attr_slug]['options'];
            sort($local_options);
            sort($remote_options);
            if ($local_options != $remote_options) {
                $result['actions'][] = 'update ' . $attr_slug;
                $attr = $woo_attributes_raw[$attr_slug];
                $woo_attributes_raw[$attr_slug] = WooTools::build_attribute($attr->get_name(), $remote_options);
                $changed = true;
            }
        }

        if ($changed) {
            $woo_product->set_attributes($woo_attributes_raw);
            $product_id = $woo_product->save();
            $result['saved'] = $product_id;
        }

        $result['changed'] = $changed;

        if ($report) {
            $report->addData('attributes_result', $result);
        }
    }

    public static function delete_product_variations($woo_product)
    {
        $deleted = [];
        if ($woo_product) {
            $woo_variations = $woo_product->get_children();
            foreach ($woo_variations as $woo_variation_id) {
                $woo_variation = wc_get_product($woo_variation_id);
                $deleted[$woo_variation_id] = $woo_variation->delete(true);
            }
        }
        return $deleted;
    }

    // public static function get_attributes_array($woo_product){

    // }
    /**
     * @param WC_Product_Variable $woo_product
     */
    public static function get_variations($woo_product)
    {
        $woo_variations = $woo_product->get_children();
        $variations = [];
        foreach ($woo_variations as $woo_variation_id) {
            $woo_variation = wc_get_product_object('variation', $woo_variation_id);
            $variation = [];
            $variation['id'] = $woo_variation_id;
            $variation['sku'] = $woo_variation->get_sku('edit');
            $variation['name'] = $woo_variation->get_name('edit');
            $variation['list_price'] = $woo_variation->get_regular_price('edit');
            $variation['images'] = unserialize($woo_variation->get_meta('_ci_additional_images', true, 'edit'));
            $variation['attributes'] = $woo_variation->get_attributes('edit');
            $variations[] = $variation;
        }
        return $variations;
    }
}
