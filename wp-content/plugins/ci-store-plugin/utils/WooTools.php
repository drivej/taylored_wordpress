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

    public static function fix_variations($supplier_variations, $parent_id, $report = new Report())
    {
        foreach ($supplier_variations as $supplier_variation) {
            WooTools::fix_variation($supplier_variation, $parent_id, $report);
        }
    }

    public static function fix_variation($supplier_variation, $parent_id, $report = new Report())
    {
        // TODO: should we delete these rogue variations or try to recover them?
        $variation_id = wc_get_product_id_by_sku($supplier_variation['sku']);
        if ($variation_id) {
            // $report->addLog('This sku is being used by post ' . $variation_id);
            $obj = wc_get_product($variation_id);
            if ($obj) {
                $this_parent_id = $obj->get_parent_id();
                if (!$this_parent_id) {
                    // $report->addLog('fix_variation() ERROR This sku is being used by post ' . $variation_id);
                    $obj->set_parent_id($parent_id);
                    // $report->addLog('fix_variation() ERROR Corrected variation id=' . $variation_id . ', sku=' . $supplier_variation['sku'] . ' with parent_id=0 to parent_id= ' . $parent_id);
                    $saved = $obj->save();
                    // if ($report) {
                        // $report->addLog('fix_variation() ERROR No parent. Repaired. Save ' . $variation_id . ' with parent ' . $parent_id . ' result: '($saved ? 'Yes' : 'Failed'));
                    // } else {
                        // ci_error_log('fix_variation() report is not set??');
                    // }
                } else if ($this_parent_id !== $parent_id) {
                    // if ($report) {
                        // $report->addLog('fix_variation() ERROR This sku is owned by a different parent id=' . $this_parent_id);
                    // } else {
                        // ci_error_log('fix_variation() report is not set?? (2)');
                    // }
                    // ci_error_log('fix_variation() ERROR sku ' . $supplier_variation['sku'] . 'belongs to the wrong parent. Woo id ' . $parent_id . ' is claiming it but it has parent id ' . $this_parent_id);
                } else {
                    // $report->addLog('fix_variation() OK Variation ' . $supplier_variation['sku'] . ' belongs to the correct parent ' . $parent_id);
                }
            } else {
                // ci_error_log('fix_variation() ERROR No woo product found');
            }
        }
    }

    public static function cleanup_variations($woo_product_id)
    {
        // sometimes a variation get's saved/attached to a post but it has no sku - delete it and try again
        $cleaned = false;
        // these is a huge difference between these 2 functions
        // $woo_product = wc_get_product_object('product', $woo_product_id);
        $woo_product = wc_get_product($woo_product_id);

        if ($woo_product) {
            $woo_variations = WooTools::get_variations($woo_product, 'edit');
            foreach ($woo_variations as $variation) {
                if (empty($variation['sku']) || $variation['sku'] === '') {
                    $variation = wc_get_product($variation['id']);
                    if ($variation) {
                        $deleted = $variation->delete(true);
                        if ($deleted) {
                            $cleaned = true;
                        }
                    }
                }
            }
        }
        if ($cleaned) {
            wc_delete_product_transients($woo_product_id);
        }
        return $cleaned;
    }

    public static function delete_variations($woo_product_id)
    {
        $woo_product = wc_get_product($woo_product_id);
        $woo_variations = $woo_product->get_children(); // removed get_children with false
        $count = 0;
        if (count($woo_variations)) {
            foreach ($woo_variations as $woo_variation_id) {
                $woo_variation = new WC_Product_Variation($woo_variation_id);
                if ($woo_variation) {
                    $deleted = $woo_variation->delete(true);
                    if ($deleted) {
                        wc_delete_product_transients($woo_variation_id);
                        $count++;
                    }
                }
            }
            return 'Deleted ' . $count . ' variations';
        } else {
            return 'Nothing to delete';
        }
    }

    public static function update_variation_props($variation, $supplier_variation, $report = new Report())
    {
        // we assume that the sku, parent_id are set - this is for fast updates
        $variation->set_status('publish');
        $variation->set_stock_status('instock');
        $variation->set_regular_price($supplier_variation['list_price']);
        foreach ($supplier_variation['meta_data'] as $meta) {
            $variation->update_meta_data($meta['key'], $meta['value']);
        }
        $variation->set_attributes($supplier_variation['attributes']);
    }

    public static function populate_variation($variation, $supplier_variation, $parent_id, $report = new Report())
    {
        try {
            // this explodes if another product exists with the same sku
            $variation->set_sku($supplier_variation['sku']);
        } catch (Exception $e) {
            // $report->addLog('set_sku failed sku=' . $supplier_variation['sku']);
            return false;
        }

        $variation->set_parent_id($parent_id);
        $variation->set_status('publish');
        $variation->set_stock_status('instock');
        $variation->set_regular_price($supplier_variation['list_price']);
        foreach ($supplier_variation['meta_data'] as $meta) {
            $variation->update_meta_data($meta['key'], $meta['value']);
        }
        $variation->set_attributes($supplier_variation['attributes']);

        return true;
    }

    public static function supplier_variation_to_object($supplier_variation, $parent_id, $report = new Report())
    {
        $variation = new WC_Product_Variation();
        $success = WooTools::populate_variation($variation, $supplier_variation, $parent_id, $report);
        // $report->addLog('Create variation for parent ' . $parent_id . ' ' . ($success ? 'Success' : 'Failed'));
        return $success ? $variation : null;
    }

    public static function sync_variations($woo_product, $supplier_variations, $report = new Report(), $commit = true)
    {
        // $report->addLog('do_sync_variations()');
        $parent_id = $woo_product->get_id();

        // necessary evil
        WooTools::fix_variations($supplier_variations, $parent_id, $report);

        $supplier_skus = array_column($supplier_variations, 'sku');
        $woo_variations = WooTools::get_variations_objects($woo_product);
        $woo_skus = array_map(fn($v) => $v->get_sku('edit'), $woo_variations);

        $deletes = array_values(array_diff($woo_skus, $supplier_skus));
        $inserts = array_values(array_diff($supplier_skus, $woo_skus));
        $updates = array_values(array_diff($woo_skus, $deletes, $inserts));

        // $report->addData('supplier_skus', $supplier_skus);
        // $report->addData('woo_skus', $woo_skus);
        // $report->addData('deletes', $deletes);
        // $report->addData('inserts', $inserts);
        // $report->addData('updates', $updates);

        // delete variations
        if (count($deletes)) {
            foreach ($woo_variations as $woo_variation) {
                $sku = $woo_variation->get_sku('edit');
                if (in_array($sku, $deletes)) {
                    $deleted = $commit ? $woo_variation->delete(true) : false;
                    // $report->addLog('Delete variation ' . $sku . ' ' . ($commit ? ($deleted ? 'Success' : 'Failed') : 'Skip Commit'));
                }
            }
        }

        // insert variations
        if (count($inserts)) {
            foreach ($supplier_variations as $supplier_variation) {
                if (in_array($supplier_variation['sku'], $inserts)) {
                    $woo_variation = WooTools::supplier_variation_to_object($supplier_variation, $parent_id, $report);
                    if ($woo_variation) {
                        // $variation_sku = $woo_variation->get_sku('edit');
                        $saved = $commit ? $woo_variation->save() : false;
                        // $report->addLog('Insert variation ' . $variation_sku . ' ' . ($commit ? ($saved ? 'Success' : 'Failed') : 'Skip Commit'));
                    } else {
                        // $report->addLog('Insert variation ' . $supplier_variation['sku'] . ' Failed to create WC_Product_Variation()');
                    }
                }
            }
        }

        // update variations
        if (count($updates)) {
            foreach ($supplier_variations as $supplier_variation) {
                if (in_array($supplier_variation['sku'], $updates)) {
                    $variation_id = wc_get_product_id_by_sku($supplier_variation['sku']);
                    if ($variation_id) {
                        $woo_variation = new WC_Product_Variation($variation_id);
                        WooTools::update_variation_props($woo_variation, $supplier_variation, $report);
                        $saved = $commit ? $woo_variation->save() : false;
                    }
                    // $report->addLog('Update variation ' . $variation_id . ' ' . ($commit ? ($saved ? 'Success' : 'Failed') : 'Skip Commit'));
                }
            }
        }
    }

    // public static function XXsync_variations($woo_product, $supplier_variations, $report = new Report())
    // {
    //     ci_error_log(__FILE__, __LINE__, 'sync_variations()');
    //     $result = [];
    //     $changed = false;
    //     $woo_product_id = $woo_product->get_id();
    //     $woo_variations = WooTools::get_variations($woo_product, 'edit');

    //     // START: clean up variations if they don't have a sku
    //     $cleaned = WooTools::cleanup_variations($woo_product_id);
    //     if ($cleaned) {
    //         $woo_variations = WooTools::get_variations($woo_product, 'edit');
    //     }
    //     // END: clean up variations if they don't have a sku

    //     $woo_skus = array_column($woo_variations, 'sku');
    //     $supplier_skus = array_column($supplier_variations, 'sku');
    //     $supplier_variation_lookup = WooTools::array_lookup($supplier_variations, 'sku');

    //     $deletes = array_values(array_diff($woo_skus, $supplier_skus));
    //     $inserts = array_values(array_diff($supplier_skus, $woo_skus));
    //     $updates = array_values(array_diff($woo_skus, $deletes, $inserts));

    //     $result['test'] = 2;
    //     $result['woo_skus'] = $woo_skus;
    //     $result['supplier_skus'] = $supplier_skus;
    //     $result['deletes'] = $deletes;
    //     $result['inserts'] = $inserts;
    //     $result['updates'] = $updates;

    //     foreach ($inserts as $variation_sku) {
    //         $variation_id = wc_get_product_id_by_sku($variation_sku);
    //         if ($variation_id) {
    //             $variation = new WC_Product_Variation($variation_id);
    //         } else {
    //             $variation = new WC_Product_Variation();
    //         }
    //         ci_error_log(['variation_sku' => $variation_sku, 'variation_id' => $variation_id]);
    //     }

    //     // return;
    //     ci_error_log(__FILE__, __LINE__, ['deletes' => $deletes, 'inserts' => $inserts, 'updates' => $updates]);

    //     // $result['woo_product_id'] = $woo_product_id;
    //     // $result['deletes'] = $deletes;
    //     // $result['inserts'] = $inserts;
    //     // $result['updates'] = $updates;
    //     // $result['actions'] = [];

    //     foreach ($inserts as $variation_sku) {
    //         $supplier_variation = $supplier_variation_lookup[$variation_sku];

    //         if (!isset($supplier_variation['id'])) {
    //             error_log('variation issue where $supplier_variation[id] is not set. ' . json_encode(['supplier_variation' => $supplier_variation, 'inserts' => $inserts]));
    //         }
    //         // maybe orphaned variation exists
    //         $variation_id = wc_get_product_id_by_sku($variation_sku);

    //         ci_error_log(__FILE__, __LINE__, [$variation_sku => $variation_id]);

    //         if ($variation_id) {
    //             $variation = new WC_Product_Variation($variation_id);
    //             // $variation = wc_get_product($variation_id);
    //             ci_error_log(__FILE__, __LINE__, '$variation_id ' . $variation_id);
    //         } else {
    //             ci_error_log(__FILE__, __LINE__, 'create new variation');
    //             $variation = new WC_Product_Variation();
    //             $variation->set_parent_id($woo_product_id);
    //             $variation->set_sku($variation_sku);
    //         }
    //         if (!$variation) {
    //             ci_error_log(__FILE__, __LINE__, 'variation not defined');
    //         }
    //         $variation->set_name($supplier_variation['name']);
    //         $variation->set_status('publish');
    //         $variation->set_regular_price($supplier_variation['list_price']);
    //         $variation->set_stock_status('instock');
    //         $variation->update_meta_data('_ci_import_version', $supplier_variation['import_version']);
    //         $variation->update_meta_data('_ci_supplier_key', 'wps');
    //         $variation->update_meta_data('_ci_product_id', $supplier_variation['id']);
    //         $variation->update_meta_data('_ci_supplier_sku', isset($supplier_variation['supplier_sku']) ? $supplier_variation['supplier_sku'] : '');
    //         $variation->update_meta_data('_ci_additional_images', serialize($supplier_variation['images']));
    //         $variation->update_meta_data('_ci_import_timestamp', gmdate("c"));

    //         $variation->set_attributes($supplier_variation['attributes']);

    //         ci_error_log(__FILE__, __LINE__, ['size' => $supplier_variation['attributes']['size']]);
    //         $size = new WC_Product_Attribute();
    //         $size->set_name('size');
    //         $size->set_variation('22 mm'); //WooTools::build_attribute('size', $supplier_variation['attributes']['size']['options']);
    //         // $variation->set_attributes(['size'=>'22 mm']);

    //         ci_error_log(__FILE__, __LINE__, ['insert:variation_attributes' => $supplier_variation['attributes']]);
    //         $saved = $variation->save();
    //         if (!$saved) {
    //             ci_error_log(__FILE__, __LINE__, 'variation did not save');
    //         } else {
    //             ci_error_log(__FILE__, __LINE__, 'variation SAVED!!');
    //         }
    //         $result['actions'][] = 'insert ' . $variation_sku;
    //         $changed = true;
    //     }

    //     // if ($report) {
    //     //     $report->addData('sync_variations', $result);
    //     // }
    //     // return $result;

    //     $children = $woo_product->get_children();
    //     // there is a possibility that a sku will be shared by multiple posts
    //     // so we have to loop the children to find matching skus
    //     foreach ($deletes as $delete_variation_sku) {
    //         foreach ($children as $variation_id) {
    //             $variation = wc_get_product($variation_id);
    //             if ($variation) {
    //                 $woo_variation_sku = $variation->get_sku();
    //                 if ($delete_variation_sku === $woo_variation_sku) {
    //                     $deleted = $variation->delete(true);
    //                     $result['actions'][] = 'delete variation: sku=' . $delete_variation_sku . ' id=' . $variation_id . ' deleted=' . $deleted;
    //                 }
    //             }
    //         }
    //     }

    //     foreach ($updates as $variation_sku) {
    //         $supplier_variation = $supplier_variation_lookup[$variation_sku];
    //         // error_log(json_encode($supplier_variation, JSON_PRETTY_PRINT));
    //         $variation_id = wc_get_product_id_by_sku($variation_sku);
    //         if ($variation_id) {
    //             $variation = wc_get_product($variation_id);
    //             if ($variation) {
    //                 $variation->set_name($supplier_variation['name']);
    //                 $variation->set_status('publish');
    //                 $variation->set_regular_price($supplier_variation['list_price']);
    //                 $variation->set_stock_status('instock');
    //                 $variation->update_meta_data('_ci_import_version', $supplier_variation['import_version']);
    //                 $variation->update_meta_data('_ci_additional_images', serialize($supplier_variation['images']));
    //                 $variation->update_meta_data('_ci_import_timestamp', gmdate("c"));
    //                 $variation->update_meta_data('_ci_supplier_sku', $supplier_variation['supplier_sku']);
    //                 $variation->set_width($supplier_variation['width']);
    //                 $variation->set_height($supplier_variation['height']);
    //                 $variation->set_length($supplier_variation['length']);
    //                 $variation->set_weight($supplier_variation['weight']);

    //                 ci_error_log(__FILE__, __LINE__, ['update:variation_attributes' => $supplier_variation['attributes']]);
    //                 // $variation->set_attributes($supplier_variation['attributes']);

    //                 $saved = $variation->save();
    //                 if (!$saved) {
    //                     ci_error_log(__FILE__, __LINE__, 'update variation did not save');
    //                 }
    //                 $result['actions'][] = 'update variation: sku=' . $variation_sku . ' id=' . $variation_id . ' saved=' . $saved;
    //             }
    //         }
    //     }

    //     $result['changed'] = $changed;
    //     if ($changed) {
    //         $woo_product->save();
    //         // wc_delete_product_transients($woo_product_id);
    //     }

    //     if ($report) {
    //         $report->addData('sync_variations', $result);
    //     }
    //     return $result;
    // }
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
        $result['supplier_attributes'] = $supplier_attributes;
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
            // $report->addData('attributes_result', $result);
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
    /**
     * @param WC_Product_Variable $woo_product
     */
    public static function get_variations($woo_product, $context = 'view')
    {
        $woo_variations = $woo_product->get_children(); // removed get_children with false
        $variations = [];
        foreach ($woo_variations as $woo_variation_id) {
            $woo_variation = wc_get_product_object('variation', $woo_variation_id);
            $variation = [];
            $variation['id'] = $woo_variation_id;
            $variation['sku'] = $woo_variation->get_sku($context);
            $variation['name'] = $woo_variation->get_name($context);
            $variation['list_price'] = $woo_variation->get_regular_price($context);
            $variation['images'] = [];

            $images = $woo_variation->get_meta('_ci_additional_images', true, $context);
            if (is_array($images)) {
                $variation['images'] = $images;
            } else {
                if (is_serialized($images)) {
                    $variation['images'] = unserialize($images);
                }
                // ci_error_log('IMAGES' . json_encode($woo_variation->get_meta('_ci_additional_images', true, $context)));
                // $variation['images'] = unserialize($woo_variation->get_meta('_ci_additional_images', true, $context));
            }

            $variation['attributes'] = $woo_variation->get_attributes($context);
            $variation['supplier_sku'] = $woo_variation->get_meta('_ci_supplier_sku', true);
            $variations[] = $variation;
            // ci_error_log(__FILE__, __LINE__, ['variation' => $variation]);
        }
        return $variations;
    }

    // this seems inefficiant
    public static function get_variations_objects($woo_product)
    {
        $woo_variations = $woo_product->get_children(); // removed get_children with false
        $variations = [];
        foreach ($woo_variations as $woo_variation_id) {
            $variations[] = new WC_Product_Variation($woo_variation_id);
        }
        return $variations;
    }
}
