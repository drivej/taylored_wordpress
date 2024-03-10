<?php

require_once WP_PLUGIN_DIR . '/ci-store-plugin/admin/ci_import_product.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Report.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/index.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/western/update_product_attributes.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/western/update_product_variations.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/western/western_utils.php';

class AdminAPI
{
    public function __construct()
    {
        add_action('wp_ajax_admin_api', array($this, 'handle_ajax'));
    }

    private function getParam($key, $defaultValue = '')
    {
        return isset($_GET[$key]) ? $_GET[$key] : $defaultValue;
    }

    private function get_supplier($supplier_key)
    {
        global $SUPPLIERS;
        if (isset($SUPPLIERS[$supplier_key])) {
            return $SUPPLIERS[$supplier_key];
        }
        return null;
    }

    private function get_woo_product_from_supplier_product($supplier_key, $product_id)
    {
        global $SUPPLIERS;
        $supplier_key = $this->getParam('supplier_key', null);
        $product_id = $this->getParam('product_id', null);
        $supplier = $SUPPLIERS[$supplier_key];
        if ($supplier) {
            $sku = $supplier->get_product_sku($product_id);
            $woo_product_id = wc_get_product_id_by_sku($sku);
            if ($woo_product_id) {
                $woo_product = wc_get_product($woo_product_id);
                return $woo_product;
            }
        }
        return null;
    }

    private function get_supplier_product($supplier_key, $product_id)
    {
        $supplier = $this->get_supplier($supplier_key);
        if ($supplier) {
            return $supplier->get_product($product_id);
        }
        return null;
    }

    private function get_product_status($supplier_key, $product_id)
    {
        // $supplier_key = $this->getParam('supplier_key', null);
        //         $product_id = $this->getParam('product_id', null);
        $data = [];
        $supplier = $this->get_supplier($supplier_key);
        // $data = [
        //     'woo_product_exists' => false,
        //     'supplier_product_exists' => false,
        // ];
        if ($supplier) {
            $data['supplier_key'] = $supplier_key;
            $data['product_id'] = $product_id;
            $data['supplier'] = $supplier->name;
            $data['check_is_available'] = $supplier->check_is_available($product_id);
            
            $supplier_product = $supplier->get_product($product_id);
            if ($supplier_product) {
                $data['name'] = $supplier->extract_product_name($supplier_product);
                $data['is_available'] = (bool) $supplier->is_available($supplier_product);
                $data['supplier_variations'] = count($supplier->extract_variations($supplier_product));
                // return $data;
                $data['supplier_product_exists'] = true;
                // $data['extract_attributes'] = $supplier->extract_attributes($supplier_product);

                $sku = $supplier->get_product_sku($product_id);
                $data['sku'] = $sku;
                $woo_id = $supplier->get_woo_id($product_id);
                $data['woo_product_exists'] = (bool) $woo_id;
                if ($woo_id) {
                    $data['woo_id'] = $woo_id;
                    $woo_product = $supplier->get_woo_product($product_id);
                    // $woo_product = wc_get_product_object('variable', $woo_id);
                    if ($woo_product) {
                        // $data['product_type1'] = $woo_product1->get_type();
                        $data['product_type'] = $woo_product->get_type();
                        // $data['woo_product_exists'] = (bool) $woo_product;
                        $data['woo_variations'] = count($woo_product->get_children());
                        // new WC_Product()
                        // $data['has_variations'] = $woo_product;
                    }
                }
            } else {
                $data['error'] = 'product not found';
            }
        } else {
            $data['error'] = 'supplier not found';
        }
        return $data;
    }

    private function get_supplier_product_attributes($supplier_key, $product_id)
    {
        $response = [];
        $supplier = $this->get_supplier($supplier_key);
        if ($supplier) {
            $supplier_product = $supplier->get_product($product_id);
            if ($supplier_product) {
                $response['extract_attributes'] = $supplier->extract_attributes($supplier_product);
                return $response;
            } else {
                $response['error'] = 'Product not found';
            }
        } else {
            $response['error'] = 'Supplier not found';
        }
        return $response;
    }

    public function get_product_variations($supplier_key, $product_id)
    {
        $response = [];
        $supplier = $this->get_supplier($supplier_key);
        $supplier_product = $supplier->get_product($product_id);
        $response['variations'] = $supplier->extract_variations($supplier_product);
        return $response;
    }

    // public function delete_product_variations($woo_product)
    // {
    //     $deleted = [];
    //     if ($woo_product) {
    //         $woo_variations = $woo_product->get_children();
    //         foreach ($woo_variations as $woo_variation_id) {
    //             $woo_variation = wc_get_product($woo_variation_id);
    //             $deleted[$woo_variation_id] = $woo_variation->delete(true);
    //         }
    //     }
    //     return $deleted;
    // }

    private function get_woo_attributes($woo_product)
    {
        $attributes = $woo_product->get_attributes(); //$variation_attributes);
        $a = [];
        foreach ($attributes as $attrName => $attr) {
            $a[] = (array) $attr;
            // $a[] = $attr->data;
        }
        return $a;
    }

    private function createTestProduct($supplier_key, $product_id)
    {

    }

    public function handle_ajax()
    {
        global $SUPPLIERS;
        $cmd = isset($_GET['cmd']) ? $_GET['cmd'] : '';
        $supplier_key = $this->getParam('supplier_key', null);
        $product_id = $this->getParam('product_id', null);

        switch ($cmd) {
            case 'get_product_status':
                wp_send_json(['data' => $this->get_product_status($supplier_key, $product_id)]);
                break;

            case 'clear_cache':
                $woo_product = $this->get_woo_product_from_supplier_product($supplier_key, $product_id);
                $product_id = $woo_product->get_id();
                wc_delete_product_transients($product_id);
                wp_send_json(['cmd' => $cmd, 'product_id' => $product_id]);
                break;

            case 'test':
                $result = [];
                $supplier = $this->get_supplier($supplier_key);
                $sku = $supplier->get_product_sku($product_id);
                $woo_id = $supplier->get_woo_id($product_id);
                $result['woo_id'] = $woo_id;
                $woo_product = $supplier->get_woo_product($product_id);

                $attributes = $woo_product->get_attributes('edit');
                $attribute = $attributes['color'];
                $result['test_name'] = $attribute->get_name();
                // $attribute->set_options(array("Black/Blue",
                //     "Black/Grey",
                //     "Black/Red",
                // ));
                // $attributes['color'] = $attribute;

                // $attr = WooTools::build_attribute('Color', ["Black/Blue", "Black/Grey", "Black/Red"]);
                // $attributes['color'] = $attr;
                // $new_attribute = new WC_Product_Attribute();
                // $new_attribute->set_name('Color');
                // $new_attribute->set_options(["Black/Blue",
                //     "Black/Grey",
                //     "Black/Red",
                //     "Hi-Vis Yellow/Teal",
                //     "Pink/Black",
                //     "Purple/Black",
                //     "Red/Navy",
                //     "Camouflage",
                // ]);
                // $new_attribute->set_id(0);
                // $new_attribute->set_visible(1);
                // $new_attribute->set_variation(1);
                // $slug = sanitize_title('Color');

                // $attributes[$slug] = $new_attribute;
                // $woo_product->set_attributes($attributes);
                // $woo_product->save();

                // $v = wc_get_product_object('variation',153927);
                // $a = $v->get_attributes();
                // $a['Color'] = "Black/Blue";
                // $v->set_attributes($a);
                // $result['v'] = $v->get_sku();
                // $result['attribute'] = $attribute->get_data();
                // $result['attributes'] = $attributes;

                // $attributes = null;
                // if ($woo_product) {
                //     $attributes = $woo_product->get_attributes(); //$variation_attributes);
                //     $a = [];
                //     foreach ($attributes as $attrName => $attr) {
                //         $a[] = (array) $attr;
                //     }
                // }
                wp_send_json($result);
                break;

            case 'test_product':
                $supplier = $this->get_supplier($supplier_key);
                $supplier_product = $supplier->get_product($product_id);
                $woo_product = $this->get_woo_product_from_supplier_product($supplier_key, $product_id);
                if ($woo_product) {
                    $product_type = $woo_product->get_type();
                }
                if ($supplier_product) {
                    $has_variations = count($supplier_product['data']['items']['data']) > 0;
                }
                // wp_set_object_terms($product_id, 'variable', 'product_type');

                $post = get_post($product_id);

                $args = array(
                    // 'ID' => $product_id
                    'post_type' => 'product',
                    'posts_per_page' => 1,
                    // 'meta_query' => array(
                    //     array(
                    //         'key' => '_sku', // WooCommerce stores SKU as _sku meta key
                    //         'value' => $sku,
                    //     ),
                    // ),
                );

                // Create new WP_Query instance
                $query = new WP_Query($args);

                // Check if any posts were found
                if ($query->have_posts()) {
                    $post_data = [];
                    // Loop through the posts
                    while ($query->have_posts()) {
                        $query->the_post();
                        // Output post data or perform desired operations
                        $post_data = array(
                            'id' => get_the_ID(),
                            'title' => get_the_title(),
                            'content' => get_the_content(),
                            'excerpt' => get_the_excerpt(),
                            'permalink' => get_permalink(),
                            'meta_data' => get_post_meta(get_the_ID()),
                        );
                    }
                    // Restore global post data
                    wp_reset_postdata();
                    wp_send_json(['data' => $post_data]);
                } else {
                    wp_send_json(['error' => 'not found']);
                }

                // $meta = $post->get_metadata( $meta_type:string, $object_id:integer, $meta_key:string, $single:boolean )();
                // wp_send_json(['post' => (array)$post]);

                // update_post_meta($product_id, '_product_type', 'variable');
                // wc_delete_product_transients( $product_id );
                // wp_send_json(['product_type' => $product_type, 'has_variations' => $has_variations]);
                // product-type

                // $report = new Report();
                // update_product_variations($woo_product, $supplier_product, $report);
                // $woo_product->save();
                // wp_send_json(['report' => $report]);

                // if ($supplier) {
                //     $supplier_product = $supplier->get_product($product_id);
                //     $attr = get_wps_attributes($supplier_product);
                //     wp_send_json(['attr' => $attr]);
                // } else {
                //     wp_send_json(['error' => 'Supplier not found', 'meta' => ['supplier_key' => $supplier_key]]);
                // }
                // $product_id = $woo_product->get_id();
                // $product_attributes = $woo_product->get_attributes('edit');
                // // $product_attributes
                // $product_attribute_lookup = array_reduce(array_keys($product_attributes), fn($c, $v) => [$product_attributes[$v]->get_name() => [...$product_attributes[$v]->get_data(), 'key' => $v], ...$c], []);
                // wp_send_json(['product_attribute_lookup' => $product_attribute_lookup]);
                break;

            case 'sync_attributes':
                $supplier = $this->get_supplier($supplier_key);
                $supplier_product = $supplier->get_product($product_id);
                $supplier_attributes = $supplier->extract_attributes($supplier_product);
                $woo_product = $this->get_woo_product_from_supplier_product($supplier_key, $product_id);
                $report = new Report();
                WooTools::sync_attributes($woo_product, $supplier_attributes, $report);
                wp_send_json(['report' => $report, '$supplier_attributes' => $supplier_attributes]);
                break;

            case 'sync_product_variations':
                $result = [];
                $supplier = $this->get_supplier($supplier_key);
                $supplier_product = $supplier->get_product($product_id);
                $woo_product = $this->get_woo_product_from_supplier_product($supplier_key, $product_id);
                $supplier_variations = $supplier->extract_variations($supplier_product);
                $result['sync'] = WooTools::sync_variations($woo_product, $supplier_variations);
                wp_send_json($result);
                break;

            case 'sync_stock':
                $result = [];
                $supplier = $this->get_supplier($supplier_key);
                $supplier_product = $supplier->get_product($product_id);
                $result['product_id'] = $product_id;
                $is_available = $supplier->is_available($supplier_product);
                $result['is_available'] = $is_available;
                if (!$is_available) {
                    $woo_product = $this->get_woo_product_from_supplier_product($supplier_key, $product_id);
                    $deleted = $woo_product->delete(true);
                    $result['deleted'] = $deleted;
                }

                // $supplier_variations = $supplier->extract_variations($supplier_product);
                // $result['sync'] = WooTools::sync_variations($woo_product, $supplier_variations);
                wp_send_json($result);
                break;

            case 'update_variations':
                $supplier = $this->get_supplier($supplier_key);
                $woo_product = $this->get_woo_product_from_supplier_product($supplier_key, $product_id);
                $supplier_product = $supplier->get_product($product_id);
                $report = new Report();
                update_product_variations($woo_product, $supplier_product, $report);
                // $woo_product->save();
                wp_send_json(['report' => $report]);
                break;

            case 'get_product_attributes':$supplier = $this->get_supplier($supplier_key);
                $supplier_product = $supplier->get_product($product_id);
                $supplier_attributes = $supplier->extract_attributes($supplier_product);
                $woo_product = $this->get_woo_product_from_supplier_product($supplier_key, $product_id);
                $woo_attributes = WooTools::get_attributes_data($woo_product);
                $supplier_attributes = $this->get_supplier_product_attributes($supplier_key, $product_id);
                wp_send_json(['woo_attributes' => $woo_attributes, 'supplier_attributes' => $supplier_attributes]);
                break;

            case 'get_product_variations':
                $result = [];
                $supplier = $this->get_supplier($supplier_key);
                $supplier_product = $supplier->get_product($product_id);
                $woo_product = $this->get_woo_product_from_supplier_product($supplier_key, $product_id);
                $children = $woo_product->get_children();
                $ch = [];
                foreach ($children as $child_id) {
                    $child = wc_get_product($child_id);
                    $ch[$child_id] = $child->get_sku('edit');
                }
                $result['woo_variations'] = $ch;
                $result['woo_variations'] = WooTools::get_variations($woo_product);
                $result['supplier_variations'] = $supplier->extract_variations($supplier_product);
                wp_send_json($result);
                break;

            case 'delete_product_variations':
                $result = [];
                $woo_product = $this->get_woo_product_from_supplier_product($supplier_key, $product_id);
                if ($woo_product) {
                    $deleted = WooTools::delete_product_variations($woo_product); // $this->delete_product_variations($woo_product);
                }
                wp_send_json(['deleted' => $deleted]);
                break;

            case 'stats':
                $result = wp_count_posts('product');
                wp_send_json(['data' => $result, 'meta' => []]);
                break;

            case 'suppliers':
                global $SUPPLIERS;
                $data = array_values(array_map(fn($supplier) => ['name' => $supplier->name, 'key' => $supplier->key], $SUPPLIERS));
                wp_send_json(['data' => $data]);
                break;

            case 'products':
                $page = (int) $this->getParam('page', 1);
                $limit = (int) $this->getParam('limit', 10);
                $args = array(
                    'paginate' => true,
                    'page' => $page,
                    'limit' => $limit,
                    'status' => $this->getParam('status', 'publish'), // could use mets_query for complex queries
                );
                $result = wc_get_products($args);
                $total = $result->total;
                $products = [];

                foreach ($result->products as $product) {
                    $products[] = [
                        'id' => $product->get_id(),
                        'name' => $product->get_name(),
                    ];
                }

                wp_send_json([
                    'data' => $products,
                    'meta' => [
                        'args' => $args, //
                        'total' => $total,
                        'pages' => $result->max_num_pages,
                        'page' => $page,
                        'limit' => $limit,
                    ],
                ]);
                break;

            case 'get_supplier_product':
                $supplier_product = $this->get_supplier_product($supplier_key, $product_id);
                if ($supplier_product) {
                    wp_send_json(['data' => $supplier_product]);
                } else {
                    wp_send_json(['error' => 'Supplier not found', 'meta' => ['supplier_key' => $supplier_key]]);
                }
                break;

            case 'analyze':
                break;

            case 'get_woo_product':
                $woo_product = $this->get_woo_product_from_supplier_product($supplier_key, $product_id);
                if (isset($woo_product)) {
                    $data = $woo_product->get_data();
                    if ($woo_product && $woo_product->is_type('variable')) {
                        $variation_ids = $woo_product->get_children();
                        foreach ($variation_ids as $variation_id) {
                            $variation = wc_get_product($variation_id);
                            $variations[] = $variation->get_data();
                        }
                    }
                    wp_send_json([
                        'variations' => $variations,
                        'data' => $data,
                    ]);
                } else {
                    wp_send_json(['error' => 'not found', 'supplier_key' => $supplier_key, 'product_id' => $product_id]);
                }

                // $supplier = $SUPPLIERS[$supplier_key];
                // if ($supplier) {
                //     $sku = $supplier->get_product_sku($product_id);
                //     $woo_product_id = wc_get_product_id_by_sku($sku);
                //     if ($woo_product_id) {
                //         $woo_product = wc_get_product($woo_product_id);
                //         if (isset($woo_product)) {
                //             $data = $woo_product->get_data();

                //             if ($woo_product && $woo_product->is_type('variable')) {
                //                 $variation_ids = $woo_product->get_children();
                //                 foreach ($variation_ids as $variation_id) {
                //                     $variation = wc_get_product($variation_id);
                //                     $variations[] = $variation->get_data();
                //                 }
                //             }
                //             wp_send_json([
                //                 'variations' => $variations,
                //                 'data' => $data,
                //             ]);
                //         }
                //     } else {
                //         wp_send_json(['error' => 'not found', 'sku' => $sku]);
                //     }
                // } else {
                //     wp_send_json(['error' => 'Supplier not found', 'meta' => ['supplier_key' => $supplier_key]]);
                // }
                break;
            case 'product_report':
                $sku = $this->getParam('sku', null);
                if ($sku) {
                    $woo_product_id = wc_get_product_id_by_sku($sku);
                    if ($woo_product_id) {
                        $woo_product = wc_get_product($woo_product_id);
                        if (isset($woo_product)) {
                            // $meta = $woo_product->get_meta_data();
                            $data = $woo_product->get_data();

                            if ($woo_product && $woo_product->is_type('variable')) {
                                $variation_ids = $woo_product->get_children();
                                foreach ($variation_ids as $variation_id) {
                                    $variation = wc_get_product($variation_id);
                                    $variations[] = $variation->get_data();
                                }
                            }
                            wp_send_json([
                                // 'meta' => $meta,
                                'variations' => $variations,
                                'data' => $data,
                                // 'woo_product' => $woo_product
                            ]);
                        }
                    } else {
                        wp_send_json(['error' => 'not found', 'sku' => $sku]);
                    }
                } else {
                    wp_send_json(['error' => 'no sku', 'sku' => $sku]);
                }
                break;

            case 'import_product':
                $report = new Report();
                ci_import_product($supplier_key, $product_id, $report);
                wp_send_json(['data' => $report]);
                break;

            case 'get_product':
                $sku = (int) $this->getParam('sku', null);
                $args = array(
                    'post_type' => 'product',
                    'posts_per_page' => 1,
                    'meta_query' => array(
                        array(
                            'key' => '_sku', // WooCommerce stores SKU as _sku meta key
                            'value' => $sku,
                        ),
                    ),
                );

                // Create new WP_Query instance
                $query = new WP_Query($args);

                // Check if any posts were found
                if ($query->have_posts()) {
                    $post_data = [];
                    // Loop through the posts
                    while ($query->have_posts()) {
                        $query->the_post();
                        // Output post data or perform desired operations
                        $post_data = array(
                            'id' => get_the_ID(),
                            'title' => get_the_title(),
                            'content' => get_the_content(),
                            'excerpt' => get_the_excerpt(),
                            'permalink' => get_permalink(),
                            'meta_data' => get_post_meta(get_the_ID()),
                        );
                    }
                    // Restore global post data
                    wp_reset_postdata();
                    wp_send_json(['data' => $post_data]);
                } else {
                    wp_send_json(['error' => 'not found', 'meta' => ['sku' => $sku]]);
                }
                break;

            case 'delete_product':
                $product_id = $this->getParam('product_id', 0);
                if ($product_id) {
                    $product = wc_get_product($product_id);
                    $deleted = false;
                    if ($product) {
                        $deleted = $product->delete(true);
                        wc_delete_product_transients($product_id);
                    }
                    wp_send_json(['data' => ['id' => $product_id, 'deleted' => $deleted], 'meta' => ['product_id' => $product_id]]);
                } else {
                    wp_send_json(['error' => 'no product id', 'meta' => ['product_id' => $product_id]]);
                }
                break;

            case 'delete_supplier_product':
                $supplier_key = $this->getParam('supplier_key', null);
                $product_id = $this->getParam('product_id', null);
                $supplier = $this->get_supplier($supplier_key);

                if ($product_id) {
                    $woo_product = $this->get_woo_product_from_supplier_product($supplier_key, $product_id);
                    $deleted = false;
                    if ($woo_product) {
                        $deleted = $woo_product->delete(true);
                        wc_delete_product_transients($product_id);
                    }
                    wp_send_json(['data' => ['id' => $product_id, 'deleted' => $deleted], 'meta' => ['product_id' => $product_id]]);
                } else {
                    wp_send_json(['error' => 'no product id', 'meta' => ['product_id' => $product_id]]);
                }
                break;

            case 'create_product':
                $supplier_product = $this->get_supplier_product($supplier_key, $product_id);
                $supplier = $this->get_supplier($supplier_key);
                $sku = $supplier->get_product_sku($product_id);
                $woo_id = $supplier->get_woo_id($product_id);
                $created = false;

                if (!$woo_id) {
                    $product = new WC_Product_Variable();
                    $product->set_sku($sku);
                    $product->set_name($supplier_product['data']['name']);
                    $product->set_status('publish');
                    $product->set_regular_price('9.99');
                    $product->set_stock_status('instock');
                    $product->update_meta_data('_ci_supplier_key', $supplier->key);
                    $product->update_meta_data('_ci_product_id', $product_id);
                    $product->update_meta_data('_supplier_class', $supplier->supplierClass);
                    $product->set_attributes(['color' => ['name' => 'Color', 'options' => ['Red', 'White', 'Blue'], 'visible' => true, 'variation' => true]]);
                    $woo_id = $product->save();

                    $variation = new WC_Product_Variation();
                    $variation->set_parent_id($woo_id);
                    $variation->set_sku($supplier->get_variation_sku($product_id, 1234));

                    $created = true;
                }

                wp_send_json(['sku' => $sku, 'woo_id' => $woo_id, 'created' => $created, 'data' => $supplier_product]);
                break;

            default:
                wp_send_json(['error' => 'no cmd']);
        }
        wp_die();
    }

}
