<?php
/*

lines
.split("\n")
.map(ln => ({t: Date.parse(ln.slice(0, 26).replace(/[\[\]]/g, '')), d: ln.slice(26)}))
.filter(ln => ln.d.indexOf('[') > -1)
.map(ln => ({ ...ln, d: ln.d.slice(ln.d.indexOf('[')) }))
.filter(ln => !isNaN(parseInt(ln.d.slice(1, 2))))
.map(ln => ({ ...ln, d: JSON.parse(ln.d).length }))
.map(ln => ln.t + ', ' + ln.d)
.join(`
`)

d.reduce((s,e) => [...s, ...e], []);
let a = d.reduce((s,e) => [...s, ...e], []);

https://www.wps-inc.com/data-depot/v4/api/introduction

// TODO: incliude WPS tags as Woo tags - currently they're in early development

 */

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/Supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/wps/Supplier_WPS_API.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/wps/Supplier_WPS_Brands.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/wps/Supplier_WPS_Data.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/wps/Supplier_WPS_Taxonomy.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/wps/Supplier_WPS_ImportManager.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/wps/Supplier_WPS_Attributes.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Timer.php';

class Supplier_WPS extends CIStore\Suppliers\Supplier
{
    use Supplier_WPS_API;
    use Supplier_WPS_Brands;
    use Supplier_WPS_Data;
    use Supplier_WPS_Taxonomy;
    use Supplier_WPS_ImportManager;
    use Supplier_WPS_Attributes;
    /**
     * The single instance of the class.
     *
     * @var Supplier_WPS
     * @since 2.1
     */
    protected static $_instance = null;
    public WPSImportManager $importer;

    public function __construct()
    {
        parent::__construct([
            'key' => 'wps',
            'name' => 'Western Power Sports',
            'supplierClass' => 'WooDropship\\Suppliers\\Western',
            'import_version' => '0.5',
        ]);
        $this->importer = $this->get_importer();
    }

    public static function instance()
    {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    public static function build_western_image_url($img, $size = 200)
    {
        if (!isset($img)) {
            return '';
        }
        return implode('', ['https://', $img['domain'], $img['path'], $size . '_max', '/', $img['filename']]);
    }

    public function isValidItem($item)
    {
        $status_ids = ['DIR', 'NEW', 'STK'];
        return in_array($item['status_id'], $status_ids);
    }

    public function isValidProduct($supplier_product)
    {
        if (!count($supplier_product['items']['data'] ?? [])) {
            return false;
        }
        $valid_items = array_filter($supplier_product['items']['data'], [$this, 'isValidItem']);
        if (!count($valid_items)) {
            return false;
        }
        return true;
    }

    public function update_plp_product($woo_product)
    {
        // $this->log('wps->update_plp_product(' . $woo_product->get_id() . ')');
        // don't include check here!!
        /*
        $should_update = $this->should_update_pdp_product($woo_product);
        return ['should_update' => $should_update];

        $update_plp = $woo_product->get_meta('_ci_update_plp', true);
        $should_update = !(bool) $update_plp;

        if ($update_plp) {
        $age = $update_plp ? WooTools::get_age($update_plp, 'hours') : 99999;
        $max_age = 0;//24 * 7;
        $should_update = $age > $max_age;
        }
        $sku = $woo_product->get_sku();
         */

        // $needs_update = $this->product_needs_update($woo_product);
        // $has_images = WooTools::has_images($woo_product);

        // if ($should_update) {
        // TODO: check if product exists
        $timer = new Timer();
        // $product_id = $woo_product->get_id();
        $supplier_product_id = $woo_product->get_meta('_ci_product_id', true);
        $supplier_product = $this->get_product($supplier_product_id);
        $is_available = $this->is_available($supplier_product);

        if (!$is_available) {
            $woo_product->delete();
            // return true;
        } else {

            // $this->update_product_images($woo_product, $supplier_product);
            $items = ['data' => [$supplier_product['data']]];
            $this->process_items_native($items);
            $woo_product->update_meta_data('_ci_update_plp', gmdate("c"));
            // $this->import_product($supplier_product_id);
            // $woo_id = $woo_product->get_id();
            // $woo_product->update_meta_data('_last_updated', gmdate("c"));
            // update_post_meta($woo_id, '_last_updated', gmdate("c"));
            // update_post_meta($woo_id, '_ci_update_plp', gmdate("c"));
            // clean_post_cache($product_id);
            // return true;
        }
        // clean_post_cache($product_id);
        $exe_time = $timer->lap();
        // $this->log('update_plp_product(' . $woo_product->get_id() . ') ' . $exe_time);
        // }
        // return false;
    }

    public function update_pdp_product($woo_product)
    {
        if (is_string($woo_product) || is_numeric($woo_product)) {
            $woo_product = wc_get_product($woo_product);
            if (!$woo_product) {
                return ['error' => 'Invalid ID'];
            }
        }

        $timer = new Timer();
        $supplier_product_id = $woo_product->get_meta('_ci_product_id', true);
        $supplier_product = $this->get_product($supplier_product_id);
        $is_available = $this->is_available($supplier_product);
        $message = '';

        if (!$is_available) {
            $woo_product->delete();
            $message = 'Product Deleted';
        } else {
            $this->import_product($supplier_product_id);
            $woo_product->update_meta_data('_ci_update_pdp', gmdate("c"));
            $woo_product->get_meta_data('_ci_update_pdp', gmdate("c"));
            // $result = $this->import_product($supplier_product_id);
            // $product_id = $woo_product->get_id();
            // update_post_meta($product_id, '_last_updated', gmdate("c"));
            $message = 'Product Updated';
        }
        $exe_time = $timer->lap();
        return ['message' => $message, 'exe_time' => $exe_time];
        // clean_post_cache($product_id);
        // return $result;
        // }
        // $age = WooTools::get_product_age($woo_product);
        // return ['updated' => false, 'age' => $age, 'reason' => 'does not need update'];
    }

    public function import_product($supplier_product_id)
    {
        $this->log('import_product(' . $supplier_product_id . ')');
        $supplier_product = $this->get_product($supplier_product_id);
        if (array_key_exists('error', $supplier_product)) {
            return $supplier_product;
        }
        $items = ['data' => [$supplier_product['data']]];
        $items = $this->process_items_native($items);
        return $items;
    }

    public function import_products_page($cursor = '', $updated_at = null)
    {
        $updated_at = $updated_at ?? $this->default_updated_at;
        $items = $this->get_products_page($cursor, 'pdp', $updated_at);
        $ids = array_map(fn($item) => $item['id'], $items['data'] ?? []);
        $this->log("import_products_page('$cursor', '$updated_at')");
        // $this->log(json_encode($items));
        $items = $this->process_items_native($items);
        return $items;
    }

    public function patch_products_page($cursor = '', $updated_at = null, $patch = '')
    {
        $updated_at = $updated_at ?? $this->default_updated_at;
        $items = $this->get_products_page($cursor, 'price', $updated_at);
        $items = $this->patch_products_sku($items);
        return $items;
    }

    public function patch_products_sku($items)
    {
        foreach ($items['data'] as &$product) {
            // get product object
            $sku = $this->get_product_sku($product['id']);
            $woo_id = wc_get_product_id_by_sku($sku);
            $valid_items = array_filter($product['items']['data'], [$this, 'isValidItem']);
            $product['_woo_id'] = $woo_id;

            // skip products that don't exist
            if (!$woo_id) {
                continue;
            }

            $supplier_sku_key = '_ci_product_sku';

            if (count($valid_items) === 1) {
                // simple product
                $woo_product = wc_get_product($woo_id);
                $product['_type'] = $woo_product->get_type();
                // $woo_product = new WC_Product_Simple($woo_id);
                $variation = $valid_items[0];
                $woo_product->update_meta_data($supplier_sku_key, $variation['sku']);
                $woo_product->save();
                $product[$supplier_sku_key] = $woo_product->get_meta($supplier_sku_key);
            } else {
                $woo_product = wc_get_product($woo_id);
                $product['_type'] = $woo_product->get_type();
                // $woo_product = new WC_Product_Variable($woo_id);

                foreach ($product['items']['data'] as &$variation) {
                    $variation_sku = $this->get_variation_sku($product['id'], $variation['id']);
                    $variation['_sku'] = $variation_sku;
                    $variation_woo_id = wc_get_product_id_by_sku($variation_sku);
                    $variation['_woo_id'] = $variation_woo_id;
                    $woo_variation = wc_get_product($variation_woo_id);
                    if (!$variation_woo_id) {
                        continue;
                    }

                    // $woo_variation = new WC_Product_Variation($variation_woo_id);
                    $woo_variation->update_meta_data($supplier_sku_key, $variation['sku']);
                    $woo_variation->save();

                    $variation[$supplier_sku_key] = $woo_variation->get_meta($supplier_sku_key);
                }
            }
        }

        return $items;
    }

    private function convert_image_to_attachment_data($image)
    {
        // convert WPS image object to attachment format
        $size = WooTools::clamp_image_size($image['width'], $image['height'], 500);

        return [
            "width" => $size['width'],
            "height" => $size['height'],
            "file" => $this->build_western_image_url($image, 500),
            "filesize" => $image['size'],
        ];
    }

    // import page of products from API
    // native means it uses wp and wc function instead of direct database calls
    private function process_items_native($items)
    {
        $timer = new Timer();
        // ------------------------------------------------------------>
        // START: Bulk Images
        // ------------------------------------------------------------>
        $attachments = [];
        $valid_items = 0;

        // bulk images: skip the default image import/resize process
        foreach ($items['data'] as &$product) {
            $product['attachments'] = [];
            foreach ($product['items']['data'] as &$variation) {
                if ($this->isValidItem($variation)) {
                    $variation['attachments'] = [];
                    foreach ($variation['images']['data'] as $image) {
                        $image_attachment = $this->convert_image_to_attachment_data($image);
                        $variation['attachments'][] = $image_attachment;
                        $product['attachments'][] = $image_attachment;
                        $attachments[] = $image_attachment;
                    }
                    $variation['__valid'] = true;
                    $valid_items++;
                }
            }
        }

        if ($valid_items === 0) {
            //  nothing to see here...
            return $items;
        }

        $lookup_attachment = WooTools::attachment_data_to_postids($attachments);
        // $this->log(json_encode($lookup_attachment, JSON_PRETTY_PRINT));
        // ------------------------------------------------------------>
        // END: Bulk Images
        // ------------------------------------------------------------>

        // ------------------------------------------------------------>
        // START: Bulk Terms
        // ------------------------------------------------------------>
        $term_names = [];

        // find terms
        foreach ($items['data'] as &$product) {
            foreach ($product['items']['data'] as &$variation) {
                $term_names[] = $variation['product_type'];
                foreach ($variation['taxonomyterms']['data'] as $taxonomy_term) {
                    $term_names[] = $taxonomy_term['name'];
                }
            }
        }
        $terms = get_terms(['name' => $term_names, 'taxonomy' => 'product_cat', 'hide_empty' => false]);
        $lookup_terms = array_column($terms, 'term_id', 'name');

        $term_names = array_unique($term_names);

        // create terms
        foreach ($term_names as $term_name) {
            if (is_string($term_name) && strlen($term_name) > 1 && !isset($lookup_terms[$term_name]) && !isset($lookup_terms[esc_html($term_name)])) {
                $term = wp_insert_term($term_name, 'product_cat');
                if (!is_wp_error($term)) {
                    $lookup_terms[$term_name] = $term['term_id'];
                }
            }
        }
        // build mapping for escaped/unescaped version of term name
        // wp_insert_term() automatically escapes term names
        // get_terms() returns names as escaped
        foreach ($lookup_terms as $term_name => $term_id) {
            $sanitized_term_name = esc_html($term_name);
            if ($sanitized_term_name !== $term_name) {
                $lookup_terms[$sanitized_term_name] = $term_id;
            }
            $decoded_term_name = wp_specialchars_decode($term_name);
            if ($decoded_term_name !== $term_name) {
                $lookup_terms[$decoded_term_name] = $term_id;
            }
        }
        // ------------------------------------------------------------>
        // END: Bulk Terms
        // ------------------------------------------------------------>

        foreach ($items['data'] as &$product) {
            // get product object
            $sku = $this->get_product_sku($product['id']);
            $woo_id = wc_get_product_id_by_sku($sku);
            // $this->log('process_items_native()' . ' sid:' . $product['id'] . ' sku:' . $sku . ' woo_id:' . $woo_id);
            $product_exists = (bool) $woo_id;
            $product['exists'] = $product_exists;
            $product['woo_sku'] = $sku;
            $valid_items = array_filter($product['items']['data'], [$this, 'isValidItem']);

            // delete invalid product
            if (count($valid_items) === 0) {
                if ($product_exists) {
                    $woo_product = wc_get_product($woo_id);
                    $woo_product->delete();
                }
                continue;
            }

            if (count($valid_items) === 1) {
                //
                //
                // Simple Product Import
                //
                //
                $woo_product = wc_get_product($woo_id);
                if ($product_exists && $woo_product->get_type() === 'variable') {
                    // product is variable, rebuild as simple
                    $woo_product = new WC_Product_Variable($woo_id);
                    $woo_product->delete(true);
                    $product_exists = false;
                    $woo_id = 0;
                }
                $woo_product = new WC_Product_Simple($woo_id);
                if (!$woo_id) {
                    try {
                        $woo_product->set_sku($sku);
                    } catch (Exception $e) {
                        $this->log('!------ERROR------!');
                        $this->log('set_sku("' . $sku . '") supplier.id=' . $product['id']);
                        $this->log('Exception: ' . $e->getMessage());
                        $this->log('Code: ' . $e->getCode());
                        $this->log('File: ' . $e->getFile());
                        $this->log('Line: ' . $e->getLine());
                        $this->log('Stack trace: ' . $e->getTraceAsString());
                        continue;
                    }
                    $woo_product->update_meta_data('_supplier_class', $this->supplierClass);
                    $woo_product->update_meta_data('_ci_product_id', $product['id']);
                    $woo_product->update_meta_data('_ci_supplier_key', $this->key);
                    $woo_product->update_meta_data('_ci_import_version', $this->import_version);
                }
                $woo_product->update_meta_data('_ci_import_timestamp', gmdate("c"));
                $woo_product->update_meta_data('_ci_update_plp', gmdate("c"));
                $woo_product->update_meta_data('_ci_update_pdp', gmdate("c"));
                $woo_product->set_stock_status('instock');
                $woo_product->set_name($product['name']);
                $woo_product->set_short_description($this->get_short_description(['data' => $product]));
                $woo_product->set_description($this->get_description(['data' => $product]));

                $image_file = $product['attachments'][0]['file'] ?? '';
                $image_id = $lookup_attachment[$image_file] ?? 0;
                if ($image_id) {
                    $woo_product->set_image_id($image_id);
                }
                // get simple product data from item
                $variation = $valid_items[0];
                $gallery_attachments = (is_array($variation['attachments']) && count($variation['attachments']) > 1) ? array_slice($variation['attachments'], 1) : [];
                $gallery_ids = array_map(fn($a) => $lookup_attachment[$a['file']], $gallery_attachments);
                $woo_product->set_gallery_image_ids($gallery_ids);
                $woo_product->set_regular_price($variation['list_price']);
                $woo_product->set_weight($variation['weight']);
                $woo_product->set_length($variation['length']);
                $woo_product->set_width($variation['width']);
                $woo_product->set_height($variation['height']);
                $woo_product->update_meta_data('_ci_product_sku', $variation['sku']);

                $category_ids = [];
                $term_name = $variation['product_type'] ?? '';
                $category_ids[] = $lookup_terms[$term_name] ?? 0;
                foreach ($variation['taxonomyterms']['data'] as $taxonomy_term) {
                    $term_name = $taxonomy_term['name'] ?? '';
                    $category_ids[] = $lookup_terms[$term_name] ?? 0;
                }
                $product['category_ids'] = $category_ids;
                $woo_product->set_category_ids($category_ids);

                $product['woo_id'] = $woo_product->save();
            } else {
                //
                //
                // Variable Product Import
                //
                //
                $woo_product = new WC_Product_Variable($woo_id);

                if (!$woo_id) {
                    try {
                        $woo_product->set_sku($sku);
                    } catch (Exception $e) {
                        $this->log('!------ERROR------!');
                        $this->log('set_sku("' . $sku . '") supplier.id=' . $product['id']);
                        $this->log('Exception: ' . $e->getMessage());
                        $this->log('Code: ' . $e->getCode());
                        $this->log('File: ' . $e->getFile());
                        $this->log('Line: ' . $e->getLine());
                        $this->log('Stack trace: ' . $e->getTraceAsString());
                        continue;
                    }
                    $woo_product->update_meta_data('_supplier_class', $this->supplierClass);
                    $woo_product->update_meta_data('_ci_product_id', $product['id']);
                    $woo_product->update_meta_data('_ci_supplier_key', $this->key);
                } else {
                    // we need to manually unlink children to clean out the rogue variations if they exist
                    WooTools::unlink_children($woo_id);
                }

                $woo_product->update_meta_data('_ci_import_version', $this->import_version);
                $woo_product->update_meta_data('_ci_import_timestamp', gmdate("c"));
                $woo_product->update_meta_data('_ci_update_plp', gmdate("c"));
                $woo_product->update_meta_data('_ci_update_pdp', gmdate("c"));
                $woo_product->set_stock_status('instock');
                $woo_product->set_name($product['name']);
                $woo_product->set_short_description($this->get_short_description(['data' => $product]));
                $woo_product->set_description($this->get_description(['data' => $product]));

                $master_image_id = 0;
                // $woo_product->set_image_id($lookup_attachment[$product['attachments'][0]['file']]);

                if (!$woo_id) {
                    $woo_id = $woo_product->save();
                }

                $children = [];

                //
                // $attributes = ['sku' => ['name' => 'SKU', 'position' => 10, 'values' => []]];
                // $lookup_attribute_slug = [];

                // $lookup_attribute_slug = $this->get_attributes_from_product(['data' => $product]);

                // foreach ($lookup_attribute_slug as $attr) {
                //     $attributes[$attr['slug']] = ['name' => $attr['name'], 'position' => 1, 'values' => []];
                // }
                //
                $product_attributes = $this->process_product_attributes($product); // NEW
                $product_attributes_lookup = $this->build_attributes_lookup($product_attributes); // NEW
                $product_attributes_lookup_slug = array_column($product_attributes, 'slug', 'key'); // NEW
                $woo_attributes = $this->build_woo_product_attributes($product_attributes); // NEW
                // $woo_product->set_attributes($woo_attributes); // NEW

                foreach ($product['items']['data'] as &$variation) {
                    if ($this->isValidItem($variation)) {
                        // get variation object
                        $variation_sku = $this->get_variation_sku($product['id'], $variation['id']);
                        $variation_woo_id = wc_get_product_id_by_sku($variation_sku);
                        $variation_exists = (bool) $variation_woo_id;
                        $variation['exists'] = $variation_exists;
                        $woo_variation = new WC_Product_Variation($variation_woo_id);

                        if (!$variation_woo_id) {
                            $woo_variation->set_sku($variation_sku);
                            $woo_variation->update_meta_data('_supplier_class', $this->supplierClass);
                            $woo_variation->update_meta_data('_ci_product_id', $variation['id']);
                            $woo_variation->update_meta_data('_ci_supplier_key', $this->key);
                        }
                        $woo_variation->update_meta_data('_ci_import_version', $this->import_version);
                        $woo_variation->update_meta_data('_ci_product_sku', $variation['sku']);
                        $woo_variation->set_name($variation['name']);

                        // add primary variation image
                        $image_file = $variation['attachments'][0]['file'] ?? '';
                        $image_id = $lookup_attachment[$image_file] ?? 0;

                        if ($image_id) {
                            $woo_variation->set_image_id($image_id);
                        }
                        if (!$master_image_id && $image_id) {
                            // add primary master image
                            $master_image_id = $image_id;
                            $woo_product->set_image_id($image_id);
                        }
                        $woo_variation->set_regular_price($variation['list_price']);
                        $woo_variation->set_parent_id($woo_id);
                        $woo_variation->set_stock_status('instock');
                        $woo_variation->set_weight($variation['weight']);
                        $woo_variation->set_length($variation['length']);
                        $woo_variation->set_width($variation['width']);
                        $woo_variation->set_height($variation['height']);
                        // taxonomy
                        $category_ids = [];
                        $term_name = $variation['product_type'];
                        $category_ids[] = $lookup_terms[$term_name] ?? 0;
                        foreach ($variation['taxonomyterms']['data'] as $taxonomy_term) {
                            $term_name = $taxonomy_term['name'];
                            $term_id = $lookup_terms[$term_name] ?? 0;
                            if ($term_id) {
                                $category_ids[] = $term_id;
                            }
                        }
                        $variation['category_ids'] = $category_ids;
                        $woo_variation->set_category_ids($category_ids);

                        // $this->log($product['id'] . '::' . $variation['sku'] . ' attachments');
                        $gallery_attachments = array_slice($variation['attachments'], 1);
                        $gallery_ids = array_map(fn($a) => $lookup_attachment[$a['file']], $gallery_attachments);
                        $woo_variation->set_gallery_image_ids($gallery_ids);

                        // using WooCommerce Additional Variation Images
                        $woo_variation->update_meta_data('_wc_additional_variation_images', implode(',', $gallery_ids));
                        // array_push($all_image_ids, ...$gallery_ids);
                        // $this->log('gallery_ids=' . json_encode($gallery_ids));
                        // $woo_variation->set_description($product['description']);
                        $woo_variation->set_price($variation['list_price']);

                        //
                        // START NEW Attributes
                        //
                        $this->clean_product_attributes($variation_woo_id); // optional for initial cleanup

                        $variation_attributes = $this->process_varition_attributes($variation, $product_attributes_lookup);

                        foreach ($variation_attributes as $key => $term) {
                            $term_id = $term['id'];
                            $term_value = $term['value'];
                            $slug = $product_attributes_lookup_slug[$key];
                            wp_set_object_terms($variation_woo_id, $term_id, $key, true);
                            $woo_variation->update_meta_data("attribute_{$slug}", $term_value);
                        }
                        //
                        // END NEW Attributes
                        //

                        // attributes (OLD)
                        /*
                        $variation['variaton_attributes'] = [];

                        foreach ($variation['attributevalues']['data'] as $attributevalue) {
                        $attr_id = $attributevalue['attributekey_id'];
                        if (array_key_exists($attr_id, $lookup_attribute_slug)) {
                        $attr_slug = $lookup_attribute_slug[$attr_id]['slug'];
                        $attributes[$attr_slug]['values'][] = $attributevalue['name'];
                        $woo_variation->update_meta_data("attribute_{$attr_slug}", $attributevalue['name'], true);
                        $variation['variaton_attributes']["attribute_{$attr_slug}"] = $attributevalue['name'];
                        }
                        }
                         */

                        // TODO: make attributes global

                        // manually add SKU attribute
                        $woo_variation->update_meta_data('attribute_sku', $variation['sku'], true);
                        // $attributes['sku']['values'][] = $variation['sku'];

                        $variation_woo_id = $woo_variation->save();
                        // $this->log($product['id'] . '::' . $variation['sku'] . ' save');

                        $variation['woo_id'] = $variation_woo_id;
                        $variation['woo_sku'] = $variation_sku;
                        $children[] = $variation_woo_id;
                    }
                }
                // create attributes object for parent
                /*
                $attrs = [];
                foreach ($attributes as $attr_key => &$attribute) {
                $attribute['values'] = array_values(array_unique($attribute['values']));
                if (count($attribute['values']) === 1) {
                continue;
                }
                $attr = new WC_Product_Attribute();
                $attr->set_name($attribute['name']);
                $attr->set_options($attribute['values']);
                $attr->set_visible(1);
                $attr->set_variation(1);
                $attr->set_position($attribute['position']);
                $attrs[$attr_key] = $attr;
                }
                $woo_product->set_attributes($attrs);
                 */
                $woo_product->set_attributes($woo_attributes);
                $woo_product->set_children($children);
                $woo_product->save();
                $product['woo_id'] = $woo_id;
                // $product['attributes'] = $attributes;
            }
        }

        $exe_time = $timer->lap();
        $items['exe_time'] = $exe_time;
        return $items;
    }

    public function get_description($supplier_product)
    {
        $htm = [];
        if (isset($supplier_product['data']['description'])) {
            $htm[] = '<p>' . $supplier_product['data']['description'] . '</p>';
        }
        if (isset($supplier_product['data']['features']['data'])) {
            $htm[] = '<ul>';
            foreach ($supplier_product['data']['features']['data'] as $feature) {
                $htm[] = '<li>' . $feature['name'] . '</li>';
            }
            $htm[] = '<ul>';
        }
        return implode('', $htm);
    }

    public function get_short_description($supplier_product)
    {
        if (isset($supplier_product['data']['description'])) {
            return $supplier_product['data']['description'];
        }
        return '';
    }

    public function is_available($supplier_product)
    {
        if (isset($supplier_product['status_code']) && $supplier_product['status_code'] === 404) {
            return false;
        }
        // this function doesn't need all the product data so for efficiency, try to use the minimal required
        if (isset($supplier_product['data']['items']['data']) && is_countable($supplier_product['data']['items']['data'])) {
            $valid_items = array_filter($supplier_product['data']['items']['data'], [$this, 'isValidItem']);
            return (bool) count($valid_items);
        }
        return false;
    }

    public function get_stock_status($product_id)
    {
        // $status = 'instock';
        $supplier_product = self::get_product($product_id, 'stock');
        return self::extract_stock_status($supplier_product);
        // if ($supplier_product['status_code'] === '404' || isset($supplier_product['error'])) {
        //     $status = 'outofstock';
        // }
        // $items = $supplier_product['data']['items'] ?? [];

        // if (!count($items)) {
        //     $status = 'outofstock';
        // }
        // return $status;
    }

    public function extract_stock_status($supplier_product)
    {
        $status = 'instock';

        if ($supplier_product['status_code'] === '404' || isset($supplier_product['error'])) {
            $status = 'outofstock';
        }
        // handle un-normalized product structure
        $supplier_product_data = $supplier_product['data'] ?? $supplier_product;
        $items = $supplier_product_data['items'] ?? [];

        if (!count($items)) {
            $status = 'outofstock';
        }
        return $status;
    }

    public function resize_image($src, $width = 200)
    {
        // https://www.wps-inc.com/data-depot/v4/api/services/images
        // 200_max, 500_max, 1000_max, full
        $size_str = '200_max';

        if ($width <= 1000) {
            $size_str = '1000_max';
        }
        if ($width <= 500) {
            $size_str = '500_max';
        }
        if ($width <= 200) {
            $size_str = '200_max';
        }
        if ($width > 1000) {
            $size_str = 'full';
        }
        return str_replace('200_max', $size_str, $src);
    }
}
