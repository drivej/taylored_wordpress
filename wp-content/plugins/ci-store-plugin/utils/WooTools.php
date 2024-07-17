<?php

require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools/WooTools_insert_unique_posts.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools/WooTools_insert_unique_metas.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools/WooTools_attachment_urls_to_postids.php';

class WooTools
{
    use WooTools_insert_unique_posts;
    use WooTools_insert_unique_metas;
    use WooTools_attachment_urls_to_postids;

    /**
     *
     * @param WC_Product    $product
     * @param string    $units
     */
    public static function get_product_age($product, $units = 'hours')
    {
        $last_updated = $product->get_meta('_last_updated', true);
        return $last_updated ? WooTools::get_age($last_updated, $units) : 99999;
    }
    /**
     *
     * @param WC_Product    $woo_product
     */
    // fires woocommerce_before_single_product
    public static function update_single_product($woo_product)
    {
        $supplier = WooTools::get_product_supplier($woo_product);
        if ($supplier) {
            return $supplier->update_single_product($woo_product);
        }
        return ['updated' => false, 'reason' => 'no supplier'];
    }
    /**
     *
     * @param WC_Product    $woo_product
     */
    // fires woocommerce_before_shop_loop_item
    public static function update_loop_product($woo_product)
    {
        $supplier = WooTools::get_product_supplier($woo_product);
        if ($supplier) {
            return $supplier->update_loop_product($woo_product);
        }
        return false;
    }
    /**
     *
     * @param WC_Product    $woo_product
     */
    public static function get_product_supplier_key($woo_product)
    {
        return $woo_product->get_meta('_ci_supplier_key', true);
    }
    /**
     *
     * @param WC_Product    $woo_product
     */
    public static function has_images($woo_product)
    {
        $image = $woo_product->get_image_id();
        if ($image) {
            return true;
        }

        $gallery = $woo_product->get_gallery_image_ids();
        if (count($gallery)) {
            return true;
        }

        return false;
    }

    // NOTE: need to update these when suppliers are added
    // I didn't want to instantiate each supplier class just to get this info
    public static function get_suppliers()
    {
        return [
            ['key' => 'wps', 'name' => 'Western Power Sports'],
            ['key' => 't14', 'name' => 'Turn14'],
        ];
    }

    public static function get_supplier($supplier_key)
    {
        switch ($supplier_key) {
            case 'wps':
                include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/wps/Supplier_WPS.php';
                return new \Supplier_WPS();
                break;
            case 't14':
                include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/t14/Supplier_T14.php';
                return new \Supplier_T14();
                break;
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

    public static function fix_variations($supplier_variations, $parent_id)
    {
        foreach ($supplier_variations as $supplier_variation) {
            WooTools::fix_variation($supplier_variation, $parent_id);
        }
    }

    public static function fix_variation($supplier_variation, $parent_id)
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
        $variation->set_description($supplier_variation['name']); // TODO: this shows below the attributes when selected

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
        $variation->set_description($supplier_variation['name']); // TODO: this shows below the attributes when selected

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

    public static function sync_variations($woo_product, $supplier_variations)
    {
        // $report->addLog('do_sync_variations()');
        $parent_id = $woo_product->get_id();

        // necessary evil
        WooTools::fix_variations($supplier_variations, $parent_id);

        $supplier_skus = array_column($supplier_variations, 'sku');
        $woo_variations = WooTools::get_variations_objects($woo_product);
        $woo_skus = array_map(fn($v) => $v->get_sku('edit'), $woo_variations);

        $deletes = array_values(array_diff($woo_skus, $supplier_skus));
        $inserts = array_values(array_diff($supplier_skus, $woo_skus));
        $updates = array_values(array_diff($woo_skus, $deletes, $inserts));

        // delete variations
        if (count($deletes)) {
            foreach ($woo_variations as $woo_variation) {
                $sku = $woo_variation->get_sku('edit');
                if (in_array($sku, $deletes)) {
                    $deleted = $woo_variation->delete(true);
                }
            }
        }

        // insert variations
        if (count($inserts)) {
            foreach ($supplier_variations as $supplier_variation) {
                if (in_array($supplier_variation['sku'], $inserts)) {
                    $woo_variation = WooTools::supplier_variation_to_object($supplier_variation, $parent_id);
                    if ($woo_variation) {
                        $saved = $woo_variation->save();
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
                        WooTools::update_variation_props($woo_variation, $supplier_variation);
                        $saved = $woo_variation->save();
                    }
                }
            }
        }
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
    public static function sync_attributes($woo_product, $supplier_attributes)
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
    }

    public static function getAllAttachmentImagesIdByUrl($urls)
    {
        global $wpdb;

        if (!count($urls)) {
            return [];
        }
        $placeholders = implode(',', array_fill(0, count($urls), '%s'));

        // SQL query to get post IDs and their _wp_attached_file meta values
        $sql = "
            SELECT post_id, meta_value as file
            FROM {$wpdb->postmeta}
            WHERE meta_key = '_wp_attached_file'
            AND meta_value IN ($placeholders)
        ";

        // Execute the query with the URLs as parameters
        $results = $wpdb->get_results($wpdb->prepare($sql, $urls));

        // Initialize result array with false for each URL
        $result = array_fill_keys($urls, false);

        // Fill the result array with post IDs
        foreach ($results as $row) {
            if (in_array($row->file, $urls)) {
                $result[$row->file] = $row->post_id;
            }
        }

        return $result;
    }

    public static function get_age($dateString, $units = 'hours')
    {
        // $dateString = "2024-06-22T19:30:04+00:00";
        $date = new DateTime($dateString);
        $now = new DateTime();
        $interval = $now->diff($date);

        switch ($units) {
            case 'seconds':
                $seconds = ($interval->days * 24 * 60 * 60) + ($interval->h * 60 * 60) + ($interval->i * 60) + $interval->s;
                return $seconds;

            case 'minutes':
                $minutes = ($interval->days * 24 * 60) + ($interval->h * 60) + $interval->i + ($interval->s / 60);
                return round($minutes);

            case 'hours':
            default:
                $hours = ($interval->days * 24) + $interval->h + ($interval->i / 60) + ($interval->s / 3600);
                return round($hours);
        }
    }

    public static function unpublish($post_ids)
    {
        if (!is_array($post_ids) || count($post_ids) === 0) {
            return true;
        }
        global $wpdb;
        $post_ids_placeholder = implode(',', array_fill(0, count($post_ids), '%d'));
        $sql = $wpdb->prepare("UPDATE {$wpdb->posts} SET post_status = 'draft' WHERE ID IN ($post_ids_placeholder)", $post_ids);
        $wpdb->query($sql);
        error_log('WooTools::unpublish() ' . count($post_ids));
    }

    public static function get_metas($post_ids, $meta_keys)
    {
        if (!is_array($post_ids) || count($post_ids) === 0) {
            return [];
        }
        global $wpdb;
        // $post_ids = [1, 2, 3, 4]; // replace with your array of post IDs
        // $meta_keys = ['_meta_key1', '_meta_key2', '_meta_key3']; // replace with your meta keys

        $placeholders = implode(',', array_fill(0, count($post_ids), '%d'));
        $meta_placeholders = implode(',', array_fill(0, count($meta_keys), '%s'));

        $sql = "
            SELECT
                post_id,
                meta_key,
                meta_value
            FROM
                {$wpdb->postmeta}
            WHERE
                post_id IN ($placeholders)
                AND meta_key IN ($meta_placeholders)
        ";

        $query = $wpdb->prepare($sql, array_merge($post_ids, $meta_keys));
        $results = $wpdb->get_results($query);

        $lookup = [];
        foreach ($results as $row) {
            if (!isset($lookup[$row->post_id])) {
                $lookup[$row->post_id] = [];
            }
            $lookup[$row->post_id][$row->meta_key] = $row->meta_value;
        }
        return $lookup;
    }

    public static function get_meta_lookup_by_ids($ids, $meta_key)
    {
        if (!is_array($ids) || count($ids) === 0) {
            return [];
        }
        global $wpdb;
        $meta_key = esc_sql($meta_key);
        $placeholders = implode(',', array_fill(0, count($ids), '%d'));
        $sql = "
            SELECT post_id, meta_value
            FROM {$wpdb->postmeta}
            WHERE meta_key = '{$meta_key}'
            AND post_id IN ($placeholders)
        ";
        $results = $wpdb->get_results($wpdb->prepare($sql, $ids));
        // Convert the results to an associative array with post_id as keys
        $lookup = array_column($results, 'meta_value', 'post_id');
        return $lookup;
    }

    public static function get_import_timestamps_by_ids($ids)
    {
        return WooTools::get_meta_lookup_by_ids($ids, '_ci_import_timestamp');
        // global $wpdb;
        // $placeholders = implode(',', array_fill(0, count($ids), '%d'));
        // $sql = "
        //     SELECT post_id, meta_value AS import_timestamp
        //     FROM {$wpdb->postmeta}
        //     WHERE meta_key = '_ci_import_timestamp'
        //     AND post_id IN ($placeholders)
        // ";
        // $results = $wpdb->get_results($wpdb->prepare($sql, $ids));
        // $lookup = array_column($results, 'import_timestamp', 'post_id');
        // return $lookup;
    }

    public static function get_import_version_by_ids($ids)
    {
        return WooTools::get_meta_lookup_by_ids($ids, '_ci_import_version');
        // global $wpdb;
        // $placeholders = implode(',', array_fill(0, count($ids), '%d'));
        // $sql = "
        //     SELECT post_id, meta_value
        //     FROM {$wpdb->postmeta}
        //     WHERE meta_key = '_ci_import_version'
        //     AND post_id IN ($placeholders)
        // ";
        // $results = $wpdb->get_results($wpdb->prepare($sql, $ids));
        // $lookup = array_column($results, 'meta_value', 'post_id');
        // return $lookup;
    }

    public static function lookup_woo_ids_by_skus($skus)
    {
        global $wpdb;
        $placeholders = implode(',', array_fill(0, count($skus), '%s'));
        $sql = "
                SELECT p.ID, pm.meta_value AS sku
                FROM {$wpdb->posts} p
                INNER JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id
                WHERE p.post_type = 'product'
                AND pm.meta_key = '_sku'
                AND pm.meta_value IN ($placeholders)
            ";
        $results = $wpdb->get_results($wpdb->prepare($sql, $skus));
        $lookup_woo_id = array_column($results, 'ID', 'sku');
        return $lookup_woo_id;
    }

    public static function lookup_woo_ids_by_name($post_names)
    {
        global $wpdb;
        // $placeholders = implode(',', array_fill(0, count($post_names), '%s'));
        $sql = "SELECT * FROM {$wpdb->posts} WHERE ";
        $conditions = [];
        foreach ($post_names as $name) {
            $conditions[] = $wpdb->prepare("post_name LIKE %s", $wpdb->esc_like($name));
        }
        $sql .= implode(' OR ', $conditions);
        // $sql = "SELECT * FROM {$wpdb->posts} WHERE " . implode(' OR ', $conditions);
        $results = $wpdb->get_results($sql);

        // $sql = "
        //     SELECT ID, post_name
        //     FROM {$wpdb->posts}
        //     WHERE post_name IN ($placeholders)
        // ";
        // $results = $wpdb->get_results($wpdb->prepare($sql, $post_names));
        $lookup = array_column($results, 'ID', 'post_name');
        // return $sql;
        return $lookup;
    }

    public static function get_product_ids_by_skus($skus)
    {
        global $wpdb;
        $placeholders = implode(',', array_fill(0, count($skus), '%s'));
        $sql = $wpdb->prepare("SELECT meta_value AS sku, post_id AS variation_id FROM {$wpdb->prefix}postmeta WHERE meta_key = '_sku' AND meta_value IN ($placeholders)", ...$skus);
        $results = $wpdb->get_results($wpdb->prepare($sql, $skus), ARRAY_A);
        $sku_to_variation_id = array_column($results, 'variation_id', 'sku');
        return $sku_to_variation_id;
    }

    public static function delete_transients()
    {
        global $wpdb;
        return $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE ('%_transient_%')");
    }

    public static function createRemoteAttachment($image, $supplier_key)
    {
        if (!is_array($image) || !isset($image['file']) || !isset($image['width']) || !isset($image['height'])) {
            return false;
        }
        $filesize = isset($image['filesize']) ? $image['filesize'] : 1;

        $attachment_id = wp_insert_post([
            'post_parent' => 0,
            'post_type' => 'attachment',
            'post_mime_type' => 'image/jpeg',
            'post_status' => 'inherit',
            'meta_input' => [
                '_wp_attached_file' => $image['file'],
                '_wp_attachment_metadata' => [
                    "width" => $image['width'],
                    "height" => $image['height'],
                    "file" => '',
                    "filesize" => $filesize,
                    "sizes" => [],
                    "image_meta" => [
                        "aperture" => "0",
                        "credit" => "",
                        "camera" => "",
                        "caption" => "",
                        "created_timestamp" => "0",
                        "copyright" => "",
                        "focal_length" => "0",
                        "iso" => "0",
                        "shutter_speed" => "0",
                        "title" => "",
                        "orientation" => "0",
                        "keywords" => [],
                    ],
                ],
                'width' => $image['width'],
                'height' => $image['height'],
                'filesize' => isset($image['filesize']) ? $image['filesize'] : 1,
                '_ci_remote_image' => true,
                '_ci_supplier_key' => $supplier_key,
                'sizes' => [],
            ],
        ], false, false);

        // update_post_meta($attachment_id, '_wp_attached_file', $image['file']);
        // update_post_meta($attachment_id, 'width', $image['width']);
        // update_post_meta($attachment_id, 'height', $image['height']);
        // update_post_meta($attachment_id, 'filesize', $image['filesize']);
        // update_post_meta($attachment_id, '_ci_remote_image', true);
        // update_post_meta($attachment_id, '_ci_supplier_key', $supplier_key);
        // update_post_meta($attachment_id, 'sizes', []); // TODO: I think we need sizes
        return $attachment_id;
    }

    // TODO:  not working
    public static function bulkCreateRemoteAttachments($images, $supplier_key)
    {
        global $wpdb;

        if (empty($images)) {
            return [
                'success' => [],
                'failure' => [],
                'message' => 'No images to insert',
            ];
        }

        $attachments = [];
        foreach ($images as $image) {
            $attachments[] = [
                'post_data' => [
                    'post_parent' => 0,
                    'post_type' => 'attachment',
                    'post_mime_type' => 'image/jpeg',
                    'post_status' => 'inherit',
                ],
                'meta_data' => [
                    '_wp_attached_file' => $image['file'],
                    'width' => $image['width'],
                    'height' => $image['height'],
                    'filesize' => isset($image['filesize']) ? $image['filesize'] : 1,
                    '_ci_remote_image' => true,
                    '_ci_supplier_key' => $supplier_key,
                    'sizes' => [$image['size']],
                ],
            ];
        }

        $post_values = [];
        $meta_values = [];
        $post_data_map = []; // To keep track of which post data maps to which meta data

        foreach ($attachments as $index => $attachment) {
            $post_data = $attachment['post_data'];
            $post_values[] = $wpdb->prepare("(%d, %s, %s, %s)", $post_data['post_parent'], $post_data['post_type'], $post_data['post_mime_type'], $post_data['post_status']);
            $post_data_map[$index] = $attachment['meta_data'];
        }

        $post_values = implode(',', $post_values);
        $result = $wpdb->query("INSERT INTO {$wpdb->posts} (post_parent, post_type, post_mime_type, post_status) VALUES $post_values");

        if ($result === false) {
            return [
                'success' => [],
                'failure' => $attachments,
                'message' => 'Failed to insert posts',
            ];
        }

        $last_post_id = $wpdb->insert_id;
        $success = [];
        $failure = [];

        foreach ($post_data_map as $index => $meta_data) {
            $current_post_id = $last_post_id + $index;
            $meta_inserts = [];

            foreach ($meta_data as $meta_key => $meta_value) {
                $meta_inserts[] = $wpdb->prepare("(%d, %s, %s)", $current_post_id, $meta_key, $meta_value);
            }

            $meta_values = implode(',', $meta_inserts);
            $meta_result = $wpdb->query("INSERT INTO {$wpdb->postmeta} (post_id, meta_key, meta_value) VALUES $meta_values");

            if ($meta_result === false) {
                $failure[] = [
                    'post_id' => $current_post_id,
                    'meta_data' => $meta_data,
                ];
            } else {
                $success[] = $current_post_id;
            }
        }

        return [
            'success' => $success,
            'failure' => $failure,
            'message' => 'Bulk insert completed',
        ];
    }

    public static function delete_orphaned_attachments()
    {
        global $wpdb;
        $meta_key = '_wp_attached_file';

        // Select IDs of unattached attachments with the specific meta key
        $sql = $wpdb->prepare("
            SELECT p.ID
            FROM {$wpdb->posts} p
            INNER JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id
            WHERE p.post_type = 'attachment'
            AND p.post_parent = 0
            AND pm.meta_key = '_wp_attached_file'
        ");

        // Get the IDs of attachments to delete
        $attachment_ids = $wpdb->get_col($sql);
        // return $attachment_ids;

        if (!empty($attachment_ids)) {
            $placeholders = implode(',', array_fill(0, count($attachment_ids), '%d'));

            // Delete from postmeta
            $wpdb->query(
                $wpdb->prepare("
                        DELETE FROM {$wpdb->postmeta}
                        WHERE post_id IN ($placeholders)
                    ", $attachment_ids)
            );

            // Delete from posts
            $wpdb->query(
                $wpdb->prepare("
                        DELETE FROM {$wpdb->posts}
                        WHERE ID IN ($placeholders)
                    ", $attachment_ids)
            );
        }

        return ['deleted' => count($attachment_ids)];

    }

    public static function clean_up_orphaned_term_relationships()
    {
        global $wpdb;

        // SQL query to delete orphaned term relationships
        $sql = "
        DELETE tr
        FROM {$wpdb->term_relationships} tr
        LEFT JOIN {$wpdb->posts} p ON tr.object_id = p.ID
        WHERE p.ID IS NULL;
        ";

        // Execute the query
        $result = $wpdb->query($sql);

        if ($result === false) {
            // Handle error
            return ('Error deleting orphaned term relationships: ' . $wpdb->last_error);
        } else {
            // Success
            return ("Successfully deleted $result orphaned term relationships.");
        }
    }

    public static function is_valid_array($arr)
    {
        return isset($arr) && is_array($arr) && count($arr);
    }

    public static function sync_images($woo_product, $supplier_product, $supplier)
    {
        $supplier->log('sync_images()');
        $woo_product_id = $woo_product->get_id();
        $supplier_variations = $supplier->extract_variations($supplier_product);
        $master_image_ids = [];
        $result = [];
        $result[] = ['woo_id', 'variation_id', 'attachment_id', 'image', 'width', 'height', 'filesize', 'type', 'action'];
        $image_urls = [];
        $valid_variations = [];
        $variation_skus = [];

        // build lookup table for variation sku=>id
        $variation_skus = array_map(fn($variation) => $variation['sku'], $supplier_variations);

        // Get WooCommerce product IDs by SKUs
        $lookup_variation_id = \WooTools::get_product_ids_by_skus($variation_skus);

        // build lookup table for variation image url=>attachment_id
        foreach ($supplier_variations as $variation) {
            $variation_id = $lookup_variation_id[$variation['sku']] ?? null;
            $variation['woo_variation_id'] = $variation_id;

            if ($variation_id) {
                $valid_variations[] = $variation;
                if (isset($variation['images_data']) && is_countable($variation['images_data'])) {
                    $new_image_urls = array_map(fn($image) => $image['file'], $variation['images_data']);
                    $image_urls = array_merge($image_urls, $new_image_urls);
                }
            }
        }

        if (!count($image_urls)) {
            return false;
        }

        $lookup_attachment_id = \WooTools::getAllAttachmentImagesIdByUrl($image_urls);

        foreach ($valid_variations as $variation) {
            $variation_id = $variation['woo_variation_id'];

            if ($variation_id) {
                $variation_image_ids = [];

                if (isset($variation['images_data']) && is_countable($variation['images_data'])) {
                    foreach ($variation['images_data'] as $i => $image) {
                        $action = 'found';
                        // $attachment_id = WooTools::getAttachmentImageIdByUrl($image['file']);
                        $attachment_id = $lookup_attachment_id[$image['file']];
                        if (!$attachment_id) {
                            $action = 'create';
                            $attachment_id = WooTools::createRemoteAttachment($image, $supplier->key);
                        }
                        if ($attachment_id) {
                            $variation_image_ids[] = $attachment_id;
                            $master_image_ids[] = $attachment_id;
                            $result[] = [$woo_product_id, $variation_id, $attachment_id, $image['file'], $image['width'], $image['height'], $image['filesize'], $i == 0 ? 'primary' : 'secondary', $action];
                        }
                    }
                    // set variation primary image
                    if (count($variation_image_ids) > 0) {
                        // NOTE: this does not wokr for some reason
                        // set_post_thumbnail($variation_id, $variation_image_ids[0]);
                        update_post_meta($variation_id, '_thumbnail_id', $variation_image_ids[0]);
                        // set variation secondary images
                        if (count($variation_image_ids) > 1) {
                            $woo_variation = wc_get_product($variation_id);
                            // $woo_variation = new WC_Product_Variation($variation_id);
                            // $woo_variation->set_gallery_image_ids(array_slice($variation_image_ids, 1));
                            $woo_variation->save();
                        } else {
                        }
                    }
                }
            }
        }

        // set master primary image
        if (count($master_image_ids) > 0) {
            // set_post_thumbnail($woo_product_id, $master_image_ids[0]);
            update_post_meta($woo_product_id, '_thumbnail_id', $master_image_ids[0]);
            $result[] = [$woo_product_id, $variation_id, $master_image_ids[0], '', 'master', 'found'];
            // set master secondary image
            if (count($master_image_ids) > 1) {
                $product = wc_get_product($woo_product_id);
                $product->set_gallery_image_ids(array_slice($master_image_ids, 1));
                $product->save();
            }
        }
        return $result;
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

    public static function set_product_visibility($woo_id, $visible = true)
    {
        if ($visible) {
            wp_set_object_terms($woo_id, [], 'product_visibility');
        } else {
            wp_set_post_terms($woo_id, ['exclude-from-search', 'exclude-from-catalog'], 'product_visibility');
        }
    }

    public static function removeProductAttribute($product_id, $attribute_name)
    {
        // delete attribute from product and it's variations
        $saved = false;
        $woo_product = wc_get_product($product_id);
        $attributes = $woo_product->get_attributes('edit');

        $update = [];
        foreach ($attributes as $attribute) {
            if ($attribute->get_name() !== $attribute_name) {
                $update[] = $attribute;
            }
        }

        if (count($update) !== count($attributes)) {
            // need to save
            $woo_product->set_attributes($update);
            $saved = $woo_product->save();
        }

        $woo_variation_ids = $woo_product->get_children();

        foreach ($woo_variation_ids as $woo_variation_id) {
            $woo_product = wc_get_product($woo_variation_id);
            $variation = new WC_Product_Variation($woo_variation_id);
            $attributes = $variation->get_attributes('edit');

            $has_attr = isset($attributes[$attribute_name]);
            if ($has_attr) {
                // need to save
                unset($attributes[$attribute_name]);
                $variation->set_attributes($attributes);
                $variation->save();
                $saved = true;
            }
        }

        return $saved;

        // 223856

        // Get the existing attributes of the product
        // $product_attributes = get_post_meta($product_id, '_product_attributes', true);

        // Check if the attribute exists in the product attributes
        // if (isset($product_attributes[$attribute_name])) {
        // Remove the attribute from the product attributes
        // unset($product_attributes[$attribute_name]);

        // Step 2: Update the product to reflect the changes
        // update_post_meta($product_id, '_product_attributes', $product_attributes);

        // Step 3: Update the child variations to remove the attribute
        // Get the child variation IDs of the product

        // $woo_product = wc_get_product($product_id);
        // $attributes = $woo_product->get_attributes();
        // $woo_variation_ids = $woo_product->get_children();

        // foreach ($woo_variation_ids as $woo_variation_id) {
        //     $woo_product = wc_get_product($woo_variation_id);
        //     $variation = new WC_Product_Variation($woo_variation_id);
        //     delete_post_meta($woo_variation_id, 'attribute_' . $attribute_name);
        // }

        // $variation_ids = wc_get_product_variation_ids($product_id);

        // foreach ($variation_ids as $variation_id) {
        // Remove the attribute from the variation
        // delete_post_meta($variation_id, 'attribute_' . $attribute_name);
        // }
        // }
    }
}
