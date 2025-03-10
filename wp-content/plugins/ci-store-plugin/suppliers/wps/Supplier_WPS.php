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

use function CIStore\Suppliers\get_supplier_import_version;
use function CIStore\Suppliers\WPS\wps_log;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/Supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/wps/Supplier_WPS_API.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/wps/Supplier_WPS_Brands.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/wps/Supplier_WPS_Data.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/wps/Supplier_WPS_Taxonomy.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/wps/Supplier_WPS_ImportManager.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/wps/Supplier_WPS_Attributes.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/wps/Supplier_WPS_Update.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/wps/Supplier_WPS_Terms.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/wps/Supplier_WPS_Normalize.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/wps/Supplier_WPS_Vehicles.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/wps/Supplier_WPS_Log.php';

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Timer.php';

class Supplier_WPS extends CIStore\Suppliers\Supplier
{
    use Supplier_WPS_API;
    use Supplier_WPS_Brands;
    use Supplier_WPS_Data;
    use Supplier_WPS_Taxonomy;
    use Supplier_WPS_ImportManager;
    use Supplier_WPS_Attributes;
    use Supplier_WPS_Update;
    use Supplier_WPS_Terms;
    use Supplier_WPS_Normalize;
    use Supplier_WPS_Vehicles;
    /**
     * The single instance of the class.
     *
     * @var Supplier_WPS
     */
    protected static $_instance = null;
    public WPSImportManager $importer;

    public function __construct()
    {
        parent::__construct([
            'key'            => 'wps',
            'name'           => 'Western Power Sports',
            'supplierClass'  => 'WooDropship\\Suppliers\\Western',
            'import_version' => get_supplier_import_version('wps'),
        ]);
        $this->importer = $this->get_importer($this->logger);
    }

    public function log(...$args)
    {
        wps_log(...$args);
    }

    public static function instance()
    {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
            // self::$_instance->log('Supplier_WPS::instance()');
        }
        return self::$_instance;
    }

    public static function build_western_image_url($img, $size = 200)
    {
        if (! isset($img)) {
            return '';
        }
        return implode('', ['https://', $img['domain'], $img['path'], $size . '_max', '/', $img['filename']]);
    }

    public function isValidItem($item)
    {
        $status_ids = ['DIR', 'NEW', 'STK'];
        return isset($item['status_id']) && in_array($item['status_id'], $status_ids);
    }

    public function getItemStockStatus($item)
    {
        $status_ids = ['DIR', 'NEW', 'STK'];
        return in_array($item['status_id'], $status_ids) ? 'instock' : 'outofstock';
    }

    public function should_update_product()
    {
        return false;
    }

    public function isValidProduct($supplier_product)
    {
        if (! count($supplier_product['items']['data'] ?? [])) {
            return false;
        }
        $valid_items = array_filter($supplier_product['items']['data'], [$this, 'isValidItem']);
        if (! count($valid_items)) {
            return false;
        }
        return true;
    }

    public function import_product($supplier_product_id)
    {
        // $this->log(__FUNCTION__, $supplier_product_id);
        return $this->normalize_products($this->get_product($supplier_product_id));
    }

    public function import_products_page($cursor = '', $updated_at = null)
    {
        // $timer      = new Timer();
        $updated_at = $updated_at ?? $this->default_updated_at;
        $items      = $this->get_products_page($cursor, 'pdp', $updated_at, [1, 10, 30], 1000);

        if (isset($items['data']) && ! empty($items['data'])) {
            $is_valid = is_countable($items['data']) && count($items['data']);
            $count    = $is_valid ? count($items['data']) : 0;

            if ($is_valid) {
                $items = $this->normalize_products($items);
            }
            // $timer_api = $timer->lap();

            $this->log(__FUNCTION__, json_encode([
                'is_valid'   => $is_valid,
                'cursor'     => $cursor,
                'updated_at' => $updated_at,
                'count'      => $count,
                // 'time'       => number_format($timer_api, 2),
                // 'tpp'        => number_format($timer_api / $count, 2),
                // 'all'        => $timer_all,
                // 'api'        => $timer_api,
                // 'process'    => $timer_process,
                // 'item'       => $count ? floor($timer_all / $count) : -1,
            ]));

            if (is_array($items['data'])) {
                $items['data'] = array_map(fn($p) => $p['id'], $items['data']);
            }
        } else {
            $this->log('Error: ' . __FUNCTION__ . ' data empty ' . json_encode(['items' => $items]));
        }
        return $items;
    }

    public function import_taxonomy_page($cursor = '', $updated_at = null)
    {
        $timer      = new Timer();
        $updated_at = $updated_at ?? $this->default_updated_at;
        $items      = $this->get_products_page($cursor, 'pdp', $updated_at, [1, 10, 20], 500);
        $is_valid   = isset($items['data']) && is_countable($items['data']) && count($items['data']);
        $count      = $is_valid ? count($items['data']) : 0;
        $timer_api  = $timer->lap();

        if ($is_valid) {
            $items = $this->normalize_products($items);
            // $items         = $this->process_items_native($items);
            $timer_process = $timer->lap();
        }

        $timer_all = $timer_api + $timer_process;
        $this->log(__FUNCTION__, json_encode([
            'is_valid'   => $is_valid,
            'cursor'     => $cursor,
            'updated_at' => $updated_at,
            'count'      => $count,
            // 'all'        => $timer_all,
            // 'api'        => $timer_api,
            // 'process'    => $timer_process,
            // 'item'       => $count ? floor($timer_all / $count) : -1,
        ]));
        return $items;
    }

    public function patch_products_page($cursor = '', $updated_at = null, $patch = '')
    {
        $updated_at = $updated_at ?? $this->default_updated_at;
        $items      = $this->get_products_page($cursor, 'id', $updated_at, [1, 20, 50], 1000);
        foreach ($items['data'] as $product) {
            $sku    = $this->get_product_sku($product['id']);
            $woo_id = wc_get_product_id_by_sku($sku);
            if ($woo_id) {
                // error_log($woo_id. ' _ci_product_id '. $product['id']);
                update_post_meta($woo_id, '_ci_product_id', $product['id']);
            }
        }
        // $items      = $this->patch_products_metadata($items);
        // $items      = $this->patch_products_sku($items);
        return $items;
    }

    public function patch_products_metadata($items)
    {
        $metadata = [];

        foreach ($items['data'] as $product) {
            $is_variable = count($product['items']['data']) > 1;

            foreach ($product['items']['data'] as &$variation) {
                if ($is_variable) {
                    $sku    = $this->get_variation_sku($product['id'], $variation['id']);
                    $woo_id = wc_get_product_id_by_sku($sku);
                } else {
                    $sku    = $this->get_product_sku($product['id']);
                    $woo_id = wc_get_product_id_by_sku($sku);
                }
                if ($woo_id) {
                    $metadata[] = ['post_id' => $woo_id, 'meta_key' => '_ci_variation_id', 'meta_value' => $this->key . '_' . $variation['id'] . '_' . $variation['sku']];
                }
            }
        }

        WooTools::insert_unique_metas($metadata);

        return $items;
    }

    public function patch_products_sku($items)
    {
        foreach ($items['data'] as &$product) {
            // get product object
            $sku                = $this->get_product_sku($product['id']);
            $woo_id             = wc_get_product_id_by_sku($sku);
            $valid_items        = array_filter($product['items']['data'], [$this, 'isValidItem']);
            $product['_woo_id'] = $woo_id;

            // skip products that don't exist
            if (! $woo_id) {
                continue;
            }

            $supplier_sku_key = '_ci_product_sku';

            if (count($valid_items) === 1) {
                // simple product
                $woo_product      = wc_get_product($woo_id);
                $product['_type'] = $woo_product->get_type();
                // $woo_product = new WC_Product_Simple($woo_id);
                $variation = $valid_items[0];
                $woo_product->update_meta_data($supplier_sku_key, $variation['sku']);
                $woo_product->save();
                $product[$supplier_sku_key] = $woo_product->get_meta($supplier_sku_key);
            } else {
                $woo_product      = wc_get_product($woo_id);
                $product['_type'] = $woo_product->get_type();
                // $woo_product = new WC_Product_Variable($woo_id);

                foreach ($product['items']['data'] as &$variation) {
                    $variation_sku        = $this->get_variation_sku($product['id'], $variation['id']);
                    $variation['_sku']    = $variation_sku;
                    $variation_woo_id     = wc_get_product_id_by_sku($variation_sku);
                    $variation['_woo_id'] = $variation_woo_id;
                    $woo_variation        = wc_get_product($variation_woo_id);
                    if (! $variation_woo_id) {
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

    private function convert_image_to_attachment_data($image, $caption)
    {
        // convert WPS image object to attachment format
        $size = WooTools::clamp_image_size($image['width'], $image['height'], 500);

        // TODO: caption/title data added to images in case we need to show which product is related
        return [
            "width"      => $size['width'],
            "height"     => $size['height'],
            "file"       => $this->build_western_image_url($image, 500),
            "filesize"   => $image['size'],
            "image_meta" => [
                "caption" => $caption,
                "title"   => $caption,
            ],
        ];
    }

    public function getValidItems($product)
    {
        // checks for stock availability flags
        $valid_items = array_filter($product['items']['data'], [$this, 'isValidItem']);
        // Begin: WTF - Sometimes, we get multiple items with the same frickin' id and sku. Seriously.
        $map = [];
        foreach ($valid_items as $item) {
            $map[$item['id']] = $item;
        }
        $valid_items = array_values($map);
        return $valid_items;
    }

    // import page of products from API
    // native means it uses wp and wc function instead of direct database calls
    public function process_items_native($items)
    {
        // validate arguments
        $is_valid = isset($items['data']) && is_countable($items['data']) && count($items['data']);
        if (! $is_valid) {
            return $items;
        }

        // $this->log('process_items_native() '.count($items['data']));
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
                        $image_attachment           = $this->convert_image_to_attachment_data($image, $variation['name'] . ' (' . $variation['sku'] . ')');
                        $variation['attachments'][] = $image_attachment;
                        $product['attachments'][]   = $image_attachment;
                        $attachments[]              = $image_attachment;
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

        // $lookup_terms = $this->process_items_terms($items);
        $lookup_terms = $this->get_wps_term_slugs();

        // turn product_type into a category
        $product_types = [];

        foreach ($items['data'] as &$product) {
            foreach ($product['items']['data'] as &$variation) {
                $product_type = $this->sanitize_term($variation['product_type']);
                if (! in_array($product_type, $product_types)) {
                    $product_types[] = $product_type;
                }
            }
        }

        $product_type_tags   = get_tags(['name' => $product_types, 'taxonomy' => 'product_cat', 'hide_empty' => false]);
        $lookup_tag_by_name  = array_column($product_type_tags, null, 'name');
        $lookup_product_type = []; // this is our primary export from this chunk

        foreach ($product_types as $product_type) {
            if (isset($lookup_tag_by_name[$product_type])) {
                $lookup_product_type[$product_type] = $lookup_tag_by_name[$product_type]->term_id;
            } else {
                $term = wp_insert_term($product_type, 'product_cat');
                if (! is_wp_error($term)) {
                    $lookup_product_type[$product_type] = $term['term_id'];
                }
            }
        }
        unset($product_type_tags);
        unset($lookup_tag_by_name);
        unset($product_types);

        // $lookup_product_type = [];
        // $product_types = [];
        // foreach ($items['data'] as &$product) {
        //     foreach ($product['items']['data'] as &$variation) {
        //         $product_type = $this->sanitize_term($variation['product_type']);
        //         $term         = wp_insert_term($product_type, 'product_cat');

        //         if (is_wp_error($term)) {
        //             // the error conveniently returns the id if duplicate
        //             if (isset($term->error_data->term_exists)) {
        //                 $lookup_product_type[$product_type] = $term->error_data->term_exists;
        //             }
        //         } else {
        //             $lookup_product_type[$product_type] = $term->term_id;
        //         }
        //     }
        // }

        // $tags                    = get_tags(['name' => $tag_names, 'taxonomy' => 'product_cat', 'hide_empty' => false]);

        // return ['lookup_product_type' => $lookup_product_type];

        /*
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
        $terms        = get_terms(['name' => $term_names, 'taxonomy' => 'product_cat', 'hide_empty' => false]);
        $lookup_terms = array_column($terms, 'term_id', 'name');

        $term_names = array_unique($term_names);

        // create terms
        foreach ($term_names as $term_name) {
            if (is_string($term_name) && strlen($term_name) > 1 && ! isset($lookup_terms[$term_name]) && ! isset($lookup_terms[esc_html($term_name)])) {
                $term = wp_insert_term($term_name, 'product_cat');
                if (! is_wp_error($term)) {
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
        */
        // ------------------------------------------------------------>
        // END: Bulk Terms
        // ------------------------------------------------------------>

        foreach ($items['data'] as &$product) {
            // get product object
            $sku    = $this->get_product_sku($product['id']);
            $woo_id = wc_get_product_id_by_sku($sku);
            // $this->log('process_items_native()' . ' sid:' . $product['id'] . ' sku:' . $sku . ' woo_id:' . $woo_id);
            $product_exists           = (bool) $woo_id;
            $product['exists']        = $product_exists;
            $product['woo_sku']       = $sku;
            $product['items']['data'] = $this->getValidItems($product);

            // delete invalid product
            if (count($product['items']['data']) === 0) {
                if ($product_exists) {
                    $woo_product = wc_get_product($woo_id);
                    $woo_product->delete();
                }
                continue;
            }

            // top level categories
            $master_category_ids = [];

            if (isset($product['taxonomyterms']['data'])) {
                foreach ($product['taxonomyterms']['data'] as $term) {
                    if (isset($lookup_terms[$term['id']])) {
                        $master_category_ids[] = $lookup_terms[$term['id']];
                    }
                }
            }

            if (count($product['items']['data']) === 1) {
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
                    $woo_id         = 0;
                }
                $woo_product = new WC_Product_Simple($woo_id);

                if (! $woo_id) {
                    try {
                        $woo_product->set_sku($sku);
                    } catch (Exception $e) {
                        WooTools::log_exception($e, $this, ['msg' => 'simple product set_sku error', 'supplier_id' => $product['id']]);
                        continue;
                    }
                    $woo_product->update_meta_data('_supplier_class', $this->supplierClass);
                    $woo_product->update_meta_data('_ci_product_id', $product['id']);
                    $woo_product->update_meta_data('_ci_supplier_key', $this->key);
                }
                $woo_product->update_meta_data('_ci_import_version', $this->import_version);
                $woo_product->update_meta_data('_ci_import_timestamp', gmdate("c"));
                // $woo_product->update_meta_data('_ci_update_plp', gmdate("c"));
                $woo_product->update_meta_data('_ci_update_pdp', gmdate("c"));
                $woo_product->set_stock_status('instock');
                $woo_product->set_name($product['name']);
                $woo_product->set_short_description($this->get_short_description(['data' => $product]));
                $woo_product->set_description($this->get_description(['data' => $product]));

                // primary image
                $image_file = $product['attachments'][0]['file'] ?? '';
                $image_id   = $lookup_attachment[$image_file] ?? 0;
                if ($image_id) {
                    $woo_product->set_image_id($image_id);
                }
                // get simple product data from item
                $variation           = $product['items']['data'][0];
                $gallery_attachments = (is_array($variation['attachments']) && count($variation['attachments']) > 1) ? array_slice($variation['attachments'], 1) : [];
                $gallery_ids         = array_map(fn($a) => $lookup_attachment[$a['file']], $gallery_attachments);
                $woo_product->set_gallery_image_ids($gallery_ids);
                $woo_product->set_regular_price($variation['list_price']);
                $woo_product->set_weight($variation['weight']);
                $woo_product->set_length($variation['length']);
                $woo_product->set_width($variation['width']);
                $woo_product->set_height($variation['height']);
                $woo_product->update_meta_data('_ci_product_sku', $variation['sku']);

                // $term_name    = $variation['product_type'] ?? '';

                // add WPS categories
                foreach ($variation['taxonomyterms']['data'] as &$term) {
                    if (isset($lookup_terms[$term['id']])) {
                        $master_category_ids[] = $lookup_terms[$term['id']];
                    }
                }

                // add WPS product_type as a category
                if ($variation['product_type'] && isset($lookup_product_type[$variation['product_type']])) {
                    $master_category_ids[] = $lookup_product_type[$variation['product_type']];
                }

                /*
                $category_ids[] = $lookup_terms[$term_name] ?? 0;
                foreach ($variation['taxonomyterms']['data'] as $taxonomy_term) {
                    $term_name      = $taxonomy_term['name'] ?? '';
                    $category_ids[] = $lookup_terms[$term_name] ?? 0;
                }
                */
                $product['category_ids'] = $master_category_ids;
                // merge old category id
                $master_category_ids = array_merge($master_category_ids, $woo_product->get_category_ids());
                $woo_product->set_category_ids($master_category_ids);

                $product['woo_id'] = $woo_product->save();
            } else {
                //
                //
                // Variable Product Import
                //
                //
                $woo_product = new WC_Product_Variable($woo_id);

                if (! $woo_id) {
                    try {
                        $woo_product->set_sku($sku);
                    } catch (Exception $e) {
                        WooTools::log_exception($e, $this, ['msg' => 'variable product set_sku error', 'supplier_id' => $product['id']]);
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
                // $woo_product->update_meta_data('_ci_update_plp', gmdate("c"));
                $woo_product->update_meta_data('_ci_update_pdp', gmdate("c"));
                $woo_product->set_stock_status('instock');
                $woo_product->set_name($product['name']);
                $woo_product->set_short_description($this->get_short_description(['data' => $product]));
                $woo_product->set_description($this->get_description(['data' => $product]));

                $variation          = $product['items']['data'][0];
                $master_gallery_ids = [];

                $master_image_id = 0;

                if (! $woo_id) {
                    $woo_id = $woo_product->save();
                }

                $children                       = [];
                $product_attributes             = $this->process_product_attributes($product);
                $product_attributes_lookup      = $this->build_attributes_lookup($product_attributes);
                $product_attributes_lookup_slug = array_column($product_attributes, 'slug', 'key');
                $woo_attributes                 = $this->build_woo_product_attributes($product_attributes);

                foreach ($product['items']['data'] as &$variation) {
                    // get variation object
                    $variation_sku       = $this->get_variation_sku($product['id'], $variation['id']);
                    $variation_woo_id    = wc_get_product_id_by_sku($variation_sku);
                    $variation_exists    = (bool) $variation_woo_id;
                    $variation['exists'] = $variation_exists;
                    $woo_variation       = new WC_Product_Variation($variation_woo_id);

                    if (! $variation_woo_id) {
                        $woo_variation->set_sku($variation_sku);
                        $woo_variation->update_meta_data('_supplier_class', $this->supplierClass);
                        $woo_variation->update_meta_data('_ci_product_id', $variation['id']);
                        $woo_variation->update_meta_data('_ci_supplier_key', $this->key);
                    }
                    $woo_variation->update_meta_data('_ci_import_version', $this->import_version);
                    $woo_variation->update_meta_data('_ci_product_sku', $variation['sku']);

                    // add primary variation image
                    $image_file = $variation['attachments'][0]['file'] ?? '';
                    $image_id   = $lookup_attachment[$image_file] ?? 0;
                    // collect first image from each variation for the master gallery
                    if ($image_id) {
                        $master_gallery_ids[] = $image_id;
                    }

                    if ($image_id) {
                        $woo_variation->set_image_id($image_id);
                    }
                    if (! $master_image_id && $image_id) {
                        // add primary master image
                        $master_image_id = $image_id;
                        $woo_product->set_image_id($image_id);
                    }
                    $woo_variation->set_name($variation['name']);
                    $woo_variation->set_regular_price($variation['list_price']);
                    $woo_variation->set_parent_id($woo_id);
                    $woo_variation->set_stock_status('instock');
                    $woo_variation->set_weight($variation['weight']);
                    $woo_variation->set_length($variation['length']);
                    $woo_variation->set_width($variation['width']);
                    $woo_variation->set_height($variation['height']);
                    $woo_variation->set_description($variation['name']); //  this is what shows when variation is selected
                    $woo_variation->set_price($variation['list_price']);

                    // taxonomy - keep previous categories
                    $category_ids = $woo_variation->get_category_ids();

                    // add WPS categories
                    foreach ($variation['taxonomyterms']['data'] as &$term) {
                        if (isset($lookup_terms[$term['id']])) {
                            $category_ids[] = $lookup_terms[$term['id']];
                        }
                    }

                    // add WPS product_type as a category
                    if ($variation['product_type'] && isset($lookup_product_type[$variation['product_type']])) {
                        $cat_id                = $lookup_product_type[$variation['product_type']];
                        $category_ids[]        = $cat_id;
                        $master_category_ids[] = $cat_id;
                    }
                    // }

                    // $term_name      = $variation['product_type'];
                    // $category_ids[] = $lookup_terms[$term_name] ?? 0;
                    // foreach ($variation['taxonomyterms']['data'] as $taxonomy_term) {
                    //     $term_name = $taxonomy_term['name'];
                    //     $term_id   = $lookup_terms[$term_name] ?? 0;
                    //     if ($term_id) {
                    //         $category_ids[] = $term_id;
                    //     }
                    // }
                    $variation['category_ids'] = $category_ids;
                    $woo_variation->set_category_ids($category_ids);

                    // $tag_ids   = [];
                    // $woo_variation->set_tag_ids($tag_ids);

                    // images
                    $gallery_attachments = array_slice($variation['attachments'], 1);
                    $gallery_ids         = array_map(fn($a) => $lookup_attachment[$a['file']], $gallery_attachments);
                    $woo_variation->set_gallery_image_ids($gallery_ids);

                    // using WooCommerce Additional Variation Images
                    $woo_variation->update_meta_data('_wc_additional_variation_images', implode(',', $gallery_ids));

                    // START NEW Attributes
                    // optional for initial cleanup
                    $this->delete_product_attributes($variation_woo_id);
                    // $this->log('product_attributes_lookup' . json_encode($product_attributes_lookup, JSON_PRETTY_PRINT));
                    $variation_attributes = $this->process_varition_attributes($variation, $product_attributes_lookup);
                    // $this->log('variation_attributes' . json_encode($variation_attributes, JSON_PRETTY_PRINT));
                    foreach ($variation_attributes as $key => $term) {
                        $term_id    = $term['id'];
                        $term_value = $term['value'];
                        $slug       = $product_attributes_lookup_slug[$key];
                        wp_set_object_terms($variation_woo_id, $term_id, $key, true);
                        $woo_variation->update_meta_data("attribute_{$slug}", $term_value);
                    }
                    // END NEW Attributes

                    // manually add SKU attribute
                    $woo_variation->update_meta_data('attribute_sku', $variation['sku'], true);
                    $variation_woo_id     = $woo_variation->save();
                    $variation['woo_id']  = $variation_woo_id;
                    $variation['woo_sku'] = $variation_sku;
                    $children[]           = $variation_woo_id;

                }
                // allow previous categories to pass along as they may have been manually set
                $master_category_ids = array_merge($master_category_ids, $woo_product->get_category_ids());
                $woo_product->set_category_ids(array_unique($master_category_ids));
                $woo_product->set_gallery_image_ids($master_gallery_ids);
                $woo_product->set_attributes($woo_attributes);
                $woo_product->set_children($children);
                $woo_product->save();
                $product['woo_id'] = $woo_id;
            }
        }

        $exe_time          = $timer->lap();
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
                // some have a bullet already added - remove it
                $text  = trim(ltrim(trim($feature['name']), "•"));
                $htm[] = '<li>' . $text . '</li>';
            }
            $htm[] = '<ul>';
        }
        return implode('', $htm);
    }

    public function get_short_description($supplier_product)
    {
        $desc = '';
        if (isset($supplier_product['data']['description'])) {
            $desc = $supplier_product['data']['description'];
        }

        // Simple products can sometimes be variable products with 1 item available.
        // In this case, the size and color is missing from the description. So we need to add it.
        if (isset($supplier_product['data']['items']['data']) && count($supplier_product['data']['items']['data']) === 1) {
            // TODO: single product: add attributes to description
            $attrs  = $this->get_attributes_from_product($supplier_product['data']);
            $vals   = isset($supplier_product['data']['items']['data'][0]['attributevalues']['data']) ? $supplier_product['data']['items']['data'][0]['attributevalues']['data'] : [];
            $result = [];
            if ($desc) {
                $result[] = "<p>{$desc}</p>";
            }
            $approved_attribute_slugs = ['color', 'size'];
            foreach ($vals as $val) {
                if (isset($attrs[$val['attributekey_id']])) {
                    $attr = $attrs[$val['attributekey_id']];
                    if (in_array($attr['slug'], $approved_attribute_slugs)) {
                        $attr_name  = $attrs[$val['attributekey_id']]['name'];
                        $attr_value = $val['name'];
                        $result[]   = "<li>{$attr_name}: {$attr_value}</li>";
                    }
                }
            }
            return implode('', $result);
        }
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
        $items                 = $supplier_product_data['items'] ?? [];

        if (! count($items)) {
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
