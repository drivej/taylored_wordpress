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
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Timer.php';

class Supplier_WPS extends CIStore\Suppliers\Supplier
{
    use Supplier_WPS_API;
    use Supplier_WPS_Brands;
    use Supplier_WPS_Data;
    use Supplier_WPS_Taxonomy;
    use Supplier_WPS_ImportManager;
    /**
     * The single instance of the class.
     *
     * @var Supplier_WPS
     * @since 2.1
     */
    protected static $_instance = null;

    public function __construct()
    {
        parent::__construct([
            'key' => 'wps',
            'name' => 'Western Power Sports',
            'supplierClass' => 'WooDropship\\Suppliers\\Western',
            'import_version' => '0.4',
        ]);
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
        $supplier_product = $this->get_product($supplier_product_id);
        if ($supplier_product['error']) {
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

    private function process_items_native($items)
    {
        $timer = new Timer();

        // tag valid products
        // foreach ($items['data'] as &$product) {
        //     $product['is_valid'] = $this->isValidProduct($product);
        // }

        // ------------------------------------------------------------>
        // START: Bulk Images
        // ------------------------------------------------------------>
        $attachments = [];

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
                }
            }
        }
        $lookup_attachment = WooTools::attachment_data_to_postids($attachments);
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
            if (is_string($term_name) && strlen($term_name) > 1 && !$lookup_terms[$term_name] && !$lookup_terms[esc_html($term_name)]) {
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
                // simple product
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
                    $woo_product->set_sku($sku);
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
                $woo_product->set_image_id($lookup_attachment[$product['attachments'][0]['file']]);
                // get simple product data from item
                $variation = $valid_items[0];
                $gallery_attachments = (is_countable($variation['attachments']) && count($variation['attachments']) > 1) ? array_slice($variation['attachments'], 1) : [];
                $gallery_ids = array_map(fn($a) => $lookup_attachment[$a['file']], $gallery_attachments);
                $woo_product->set_gallery_image_ids($gallery_ids);
                $woo_product->set_regular_price($variation['list_price']);
                $woo_product->set_weight($variation['weight']);
                $woo_product->set_length($variation['length']);
                $woo_product->set_width($variation['width']);
                $woo_product->set_height($variation['height']);
                $woo_product->update_meta_data('_ci_product_sku', $variation['sku']);

                $category_ids = [];
                $category_ids[] = $lookup_terms[$variation['product_type']] ?? 0;
                foreach ($variation['taxonomyterms']['data'] as $taxonomy_term) {
                    $category_ids[] = $lookup_terms[$taxonomy_term['name']] ?? 0;
                }
                $product['category_ids'] = $category_ids;
                $woo_product->set_category_ids($category_ids);

                $product['woo_id'] = $woo_product->save();
            } else {
                $woo_product = new WC_Product_Variable($woo_id);

                if (!$woo_id) {
                    $woo_product->set_sku($sku);
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
                $woo_product->set_image_id($lookup_attachment[$product['attachments'][0]['file']]);

                if (!$woo_id) {
                    $woo_id = $woo_product->save();
                }

                $children = [];
                $attributes = ['sku' => ['name' => 'SKU', 'position' => 10, 'values' => []]];
                $lookup_attribute_slug = [];

                $lookup_attribute_slug = $this->get_attributes_from_product(['data' => $product]);

                foreach ($lookup_attribute_slug as $attr) {
                    $attributes[$attr['slug']] = ['name' => $attr['name'], 'position' => 1, 'values' => []];
                }

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
                        $woo_variation->set_image_id($lookup_attachment[$variation['attachments'][0]['file']]);
                        $woo_variation->set_regular_price($variation['list_price']);
                        $woo_variation->set_parent_id($woo_id);
                        $woo_variation->set_stock_status('instock');
                        $woo_variation->set_weight($variation['weight']);
                        $woo_variation->set_length($variation['length']);
                        $woo_variation->set_width($variation['width']);
                        $woo_variation->set_height($variation['height']);

                        // taxonomy
                        $category_ids = [];
                        $category_ids[] = $lookup_terms[$variation['product_type']] ?? 0;
                        foreach ($variation['taxonomyterms']['data'] as $taxonomy_term) {
                            $category_ids[] = $lookup_terms[$taxonomy_term['name']] ?? 0;
                        }
                        $variation['category_ids'] = $category_ids;
                        $woo_variation->set_category_ids($category_ids);

                        $gallery_attachments = array_slice($variation['attachments'], 1);
                        $gallery_ids = array_map(fn($a) => $lookup_attachment[$a['file']], $gallery_attachments);
                        $woo_variation->set_gallery_image_ids($gallery_ids);
                        // $woo_variation->set_description($product['description']);
                        $woo_variation->set_price($variation['list_price']);

                        // attributes
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

                        // manually add SKU attribute
                        $woo_variation->update_meta_data('attribute_sku', $variation['sku'], true);
                        $attributes['sku']['values'][] = $variation['sku'];

                        $variation_woo_id = $woo_variation->save();

                        $variation['woo_id'] = $variation_woo_id;
                        $variation['woo_sku'] = $variation_sku;
                        $children[] = $variation_woo_id;
                    }
                }

                // create attributes object for parent
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
                $woo_product->set_children($children);
                $woo_product->save();
                $product['woo_id'] = $woo_id;
                $product['attributes'] = $attributes;
            }
        }

        $exe_time = $timer->lap();
        // error_log('process_items_native ' . $exe_time);
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

    public function get_cached_attributekeys()
    {
        wp_cache_flush();
        return get_option('wps_attributekeys', []);
    }

    public function get_attributes_from_product($supplier_product) // wps_product
    {
        $wps_attributekeys = $this->get_cached_attributekeys();
        $wps_attributekeys_updated = false;

        // cleanup
        foreach ($wps_attributekeys as $id => $attr) {
            if (count(array_keys($wps_attributekeys[$id])) > 2) {
                $wps_attributekeys[$id] = ['name' => $attr['name'], 'slug' => $attr['slug']];
                $wps_attributekeys_updated = true;
            }
            if (!isset($wps_attributekeys[$id]['name']) || !isset($wps_attributekeys[$id]['slug'])) {
                unset($wps_attributekeys[$id]);
                $wps_attributekeys_updated = true;
            }
        }

        // this is a utility because the attribute data is not entirely in the product request
        $attribute_ids = [];

        if (isset($supplier_product['data']['items']['data'])) {
            foreach ($supplier_product['data']['items']['data'] as $item) {
                foreach ($item['attributevalues']['data'] as $attr) {
                    if (!array_key_exists($attr['attributekey_id'], $attribute_ids)) {
                        $attribute_ids[$attr['attributekey_id']] = 0;
                    }
                    $attribute_ids[$attr['attributekey_id']]++;
                }
            }
        }

        $all_ids = array_keys($attribute_ids);

        // find attributevalues not in out nice cached object
        $ids = array_values(array_filter($all_ids, fn($id) => !array_key_exists($id, $wps_attributekeys)));

        $cursor = '';
        $data = [];

        if (count($ids) === 1) {
            // handle request for single item
            $res = $this->get_api('attributekeys/' . implode(',', $ids));
            try {
                // this explodes if another product exists with the same sku
                $res['data']['slug'] = sanitize_title($res['data']['name']);
                // $wps_attributekeys[$ids[0]] = $res['data'];
                if (isset($res['data']['slug']) && isset($res['data']['name'])) {
                    $wps_attributekeys[$ids[0]] = ['name' => $res['data']['name'], 'slug' => $res['data']['slug']];
                }
                $wps_attributekeys_updated = true;
            } catch (\Exception $e) {
                $this->log('CAUGHT!!! wps:get_attributes_from_product()', $res);
            }
            // $attributes[] = $res['data'];
        } else if (count($ids)) {
            // handle request for multiple items
            // gather data with pagination
            while (isset($cursor)) {
                $res = $this->get_api('attributekeys/' . implode(',', $ids), ['page[size]' => 20, 'page[cursor]' => $cursor]);
                if (isset($res['data'])) {
                    foreach ($res['data'] as $attr) {
                        $attr['slug'] = sanitize_title($attr['name']);
                        if (isset($attr['slug']) && isset($attr['name'])) {
                            $wps_attributekeys[$attr['id']] = ['name' => $attr['name'], 'slug' => $attr['slug']];
                            $wps_attributekeys_updated = true;
                        }
                    }
                } else {
                    $this->log('wps:get_attributes_from_product() Warning ' . json_encode($res, JSON_PRETTY_PRINT));
                }
                if (is_array($res['data'])) {
                    array_push($data, ...$res['data']);
                }
                if (isset($res['meta']['cursor']['next'])) {
                    $cursor = $res['meta']['cursor']['next'];
                } else {
                    unset($cursor);
                }
            }
        }

        $valid_ids = array_filter($all_ids, fn($id) => array_key_exists($id, $wps_attributekeys));

        $av = [];
        foreach ($valid_ids as $valid_id) {
            $av[$valid_id] = $wps_attributekeys[$valid_id];
        }

        if ($wps_attributekeys_updated) {
            update_option('wps_attributekeys', $wps_attributekeys);
        }

        return $av;
    }

    // public function get_item_images($item, $size = 200)
    // {
    //     if (isset($item['images']['data'])) {
    //         if (count($item['images']['data'])) {
    //             return array_map(fn($img) => $this->build_western_image_url($img, $size), $item['images']['data']);
    //         }
    //     }
    //     return null;
    // }

    // public function get_item_images_data($item)
    // {
    //     $images = [];
    //     if (isset($item['images']['data']) && is_countable($item['images']['data']) && count($item['images']['data'])) {
    //         foreach ($item['images']['data'] as $image) {
    //             $file = $this->build_western_image_url($image);
    //             $width = isset($image['width']) ? $image['width'] : 200;
    //             $height = isset($image['height']) ? $image['height'] : 200;
    //             $filesize = isset($image['size']) ? $image['size'] : 0;
    //             $images[] = ['file' => $file, 'width' => $width, 'height' => $height, 'filesize' => $filesize];
    //         }
    //     }
    //     return $images;
    // }

    // public function extract_attributes($supplier_product)
    // {
    //     // if ($this->deep_debug) {
    //         $this->log('extract_attributes()');
    //     // }

    //     if (!$supplier_product) {
    //         return [];
    //     }
    //     // extract an array of valid attributes
    //     $attr_keys = $supplier_product['data']['attributekeys']['data'];
    //     $attributes = [];
    //     $lookup_slug_by_id = [];

    //     if (is_countable($attr_keys)) {
    //         foreach ($attr_keys as $attr_id => $attr) {
    //             if (!isset($attr['name']) || !isset($attr['slug'])) {
    //                 $this->log(__FILE__, __LINE__, 'Error', $attr_keys);
    //             }
    //             $attributes[$attr['slug']] = [
    //                 'name' => $attr['name'],
    //                 'options' => [],
    //                 'slug' => $attr['slug'],
    //             ];
    //             $lookup_slug_by_id[$attr_id] = $attr['slug'];
    //         }
    //     }

    //     $items = isset($supplier_product['data']['items']['data']) ? $supplier_product['data']['items']['data'] : [];

    //     $valid_items = array_filter($items, [$this, 'isValidItem']);

    //     foreach ($valid_items as $item) {
    //         foreach ($item['attributevalues']['data'] as $item_attr) {
    //             $attr_id = $item_attr['attributekey_id'];
    //             $attr_value = $item_attr['name'];
    //             $attr_slug = $lookup_slug_by_id[$attr_id];

    //             if (!isset($attributes[$attr_slug]['options'][$attr_value])) {
    //                 $attributes[$attr_slug]['options'][$attr_value] = 0;
    //             }
    //             $attributes[$attr_slug]['options'][$attr_value]++;
    //         }
    //     }

    //     $changes = [];
    //     $valid_items_count = count($valid_items);
    //     foreach ($attributes as $attr_slug => $attribute) {
    //         foreach ($attribute['options'] as $attr_value => $option_count) {
    //             if ($option_count === 0 || $option_count === $valid_items_count) {
    //                 unset($attribute['options'][$attr_value]);
    //                 $changes[] = "remove {$attr_slug} -> {$attr_value}";
    //             }
    //         }

    //         if (count($attribute['options'])) {
    //             $attributes[$attr_slug]['options'] = array_keys($attributes[$attr_slug]['options']);
    //         } else {
    //             unset($attributes[$attr_slug]);
    //             $changes[] = "delete {$attr_slug}";
    //         }
    //     }

    //     // if (!count($attributes)) {
    //     //     // with no other attributes, a variable product requires something to validate it for adding to cart
    //     //     $attributes['__required_attr'] = [
    //     //         'name' => '__required_attr',
    //     //         'options' => ['1'],
    //     //         'slug' => '__required_attr',
    //     //         'visible' => 0,
    //     //         'variation' => 0,
    //     //     ];
    //     // }

    //     $valid_skus = array_map(fn($v) => $v['sku'], $valid_items);

    //     // if (count($valid_skus)) {
    //     // if there's only 1 sku, we don't need a sku selector
    //     $attributes['supplier_sku'] = [
    //         'name' => 'supplier_sku',
    //         'options' => array_map(fn($v) => $v['sku'], $valid_items),
    //         'slug' => 'supplier_sku',
    //     ];
    //     // }

    //     return array_values($attributes);
    // }

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
