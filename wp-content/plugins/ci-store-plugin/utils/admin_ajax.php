<?php

require_once WP_PLUGIN_DIR . '/ci-store-plugin/admin/ci_import_product.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Report.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/index.php';

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

    private function get_supplier_product($supplier_key, $product_id)
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

    private function Xget_supplier_product($supplier_key, $product_id)
    {
        global $SUPPLIERS;
        $supplier_key = $this->getParam('supplier_key', null);
        $product_id = $this->getParam('product_id', null);
        $supplier = $SUPPLIERS[$supplier_key];
        if ($supplier) {
            $supplier_product = $supplier->get_product($product_id);
            wp_send_json(['data' => $supplier_product]);
        } else {
            wp_send_json(['error' => 'Supplier not found', 'meta' => ['supplier_key' => $supplier_key]]);
        }
    }

    public function handle_ajax()
    {
        $cmd = isset($_GET['cmd']) ? $_GET['cmd'] : '';

        switch ($cmd) {
            case 'test':
                wp_cache_flush();
                $query = new WC_Product_Query();
                // $query->set( 'sku', 'PRDCT' );
                $products = $query->get_products();

                // $result = wc_get_products(['return'=>'ids']);
                wp_send_json($products);
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
                global $SUPPLIERS;
                $supplier_key = $this->getParam('supplier_key', null);
                $product_id = $this->getParam('product_id', null);
                $supplier = $SUPPLIERS[$supplier_key];
                if ($supplier) {
                    $supplier_product = $supplier->get_product($product_id);
                    wp_send_json(['data' => $supplier_product]);
                } else {
                    wp_send_json(['error' => 'Supplier not found', 'meta' => ['supplier_key' => $supplier_key]]);
                }
                break;

            case 'analyze':
                break;

            case 'get_woo_product':
                global $SUPPLIERS;
                $supplier_key = $this->getParam('supplier_key', null);
                $product_id = $this->getParam('product_id', null);
                $woo_product = $this->get_supplier_product($supplier_key, $product_id);
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
                $supplier_key = $this->getParam('supplier_key', null);
                $product_id = $this->getParam('product_id', null);
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

            default:
                wp_send_json(['error' => 'no cmd']);
        }
        wp_die();
    }

}
