<?php

namespace CIStore\Ajax;

use WooTools;

include_once CI_STORE_PLUGIN . 'utils/WooTools.php';
include_once CI_STORE_PLUGIN . 'suppliers/Suppliers.php';

function build_sku_attribute($product)
{

}

function test_action()
{
    $result = [];

    $supplier = WooTools::get_supplier('wps');

    // $supplier_product_id = '663';
    // $supplier_product_id = '381514';
    // $supplier_product_id = '369908';
    $supplier_product_id = '208187';// '169113';
    return $supplier->import_product($supplier_product_id);

    // 1NVMzzG6MRdg - broke
    $cursor = 'qZkejkbnMoLK';
    // return $supplier->get_products_page($cursor, 'pdp', '2023-01-01');
    // return $supplier->import_products_page($cursor);

    $product = $supplier->get_product($supplier_product_id, 'pdp');
    // return $product;
    // return $supplier->get_attributes_from_product($product['data']);
    // return $supplier->process_product_attributes($product['data']);
    // return $product;

    $sku = $supplier->get_product_sku($supplier_product_id);
    $woo_id = wc_get_product_id_by_sku($sku);

    if ($woo_id) {

        $woo_product = new \WC_Product_Variable($woo_id);

        $product_attributes = $supplier->process_product_attributes($product['data']); // NEW
        // return ['product_attributes' => $product_attributes, 'product' => $product];
        $product_attributes_lookup = $supplier->build_attributes_lookup($product_attributes); // NEW
        $product_attributes_lookup_slug = array_column($product_attributes, 'slug', 'key'); // NEW
        $woo_attributes = $supplier->build_woo_product_attributes($product_attributes); // NEW

        // $skus = [];
        // $attr = new \WC_Product_Attribute();
        // $attr->set_name('SKU');
        // $attr->set_options(implode(' | ',$skus));
        // $attr->set_visible(1);
        // $attr->set_variation(1);
        // $attr->set_position(10);
        // $attrs['sku'] = $attr;

        // $attrs = [];
        // foreach($woo_attributes as $key => $attr){
        //     $attrs[$key] = $attr->get_data();
        // }
        // return ['$woo_attributes' => $attrs];

        $woo_product->set_attributes($woo_attributes); // NEW

        $woo_product->save();

        foreach ($product['data']['items']['data'] as $i => $variation) {
            $variation_sku = $supplier->get_variation_sku($supplier_product_id, $variation['id']);
            $variation_woo_id = wc_get_product_id_by_sku($variation_sku);

            $result[$variation_sku] = [];

            if ($variation_woo_id) {
                $woo_variation = new \WC_Product_Variation($variation_woo_id);

                $supplier->clean_product_attributes($variation_woo_id); // optional for initial cleanup

                $variation_attributes = $supplier->process_varition_attributes($variation, $product_attributes_lookup);
                // $result[$variation_sku] = [
                //     'variation_attributes' => $variation_attributes,
                //     'current' => $woo_variation->get_attributes(),
                // ];

                foreach ($variation_attributes as $key => $term) {
                    $term_id = $term['id'];
                    $term_value = $term['value'];
                    $slug = $product_attributes_lookup_slug[$key];
                    wp_set_object_terms($variation_woo_id, $term_id, $key, true);
                    $woo_variation->update_meta_data("attribute_{$slug}", $term_value);
                    $result[$variation_sku]["attribute_{$slug}"] = $term_value;
                    // $result[$variation_sku][$slug] = "attribute_{$slug}";
                }

                // $woo_variation->set_attributes($variation_attributes);
                $woo_variation->update_meta_data('attribute_sku', $variation['sku'], true);
                $woo_variation->save();
                // $result[$variation_sku] = process_varition_attributes($variation, $product_attributes_lookup);
            } else {
                $result[$variation_sku] = $variation_woo_id;
            }
        }
        $result['product_attributes'] = $product_attributes;
        $result['product'] = $product;
    }

    return $result;

    $supplier_product_id = $product['data']['id'];
    $woo_product = $supplier->get_woo_product($supplier_product_id);

    return $woo_product->get_children();
    $result['woo_product'] = $woo_product->get_attributes();

    $attributes = $variation->get_attributes();

// Set the new attribute using the term ID
    $attributes[$taxonomy] = $term_ids[0]; // Attach the first term ID (single value)

// Update the variation with the new attributes
    $variation->set_attributes($attributes);

    return $taxonomy;
}
