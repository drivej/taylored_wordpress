<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/CronJob.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Supplier_Background_Process.php';

use Automattic\Jetpack\Constants;

class SupplierProductMeta
{
    public string $woo_id;
    public string $product_type;
    public array $images;
    public bool $is_available;
}

class SupplierProduct
{
    public array $data;
    public SupplierProductMeta $meta;
}

class Supplier
{
    protected bool $active = true;
    public string $key;
    public string $name;
    public string $supplierClass;
    public string $import_version = '0.0';
    public string $import_flag = '';
    public string $cancel_flag = '';
    public string $ping_flag = '';
    public string $import_report = '';
    public string $stall_check_action = '';
    public string $stall_flag = '';
    public string $access_token_flag = '';
    public string $access_token_expires_flag = '';
    public string $import_products_page_flag = '';
    // public string $log_flag = '';
    public string $log_path = '';
    public string $start_import_products_flag = '';
    public string $daily_import_flag = '';
    public string $start_daily_import_flag = '';
    // public CronJob $cronjob;
    public bool $deep_debug = false;
    public int $max_age = 24 * 7; // stale product age
    public Supplier_Background_Process $background_process;

    public function __construct($config)
    {
        $this->key = $config['key'];
        $this->name = $config['name'];
        $this->supplierClass = $config['supplierClass'];
        $this->import_version = $config['import_version'];
        $this->import_flag = 'ci_import_' . $this->key . '_products_running';
        $this->cancel_flag = 'ci_import_' . $this->key . '_products_cancel';
        $this->stall_flag = 'ci_import_' . $this->key . '_products_stall';
        $this->ping_flag = 'ci_import_' . $this->key . '_products_ping';
        $this->access_token_flag = $this->key . '_access_token';
        $this->access_token_expires_flag = $this->key . '_access_token_expires';
        $this->start_import_products_flag = $this->key . '_start_import_products';
        $this->import_products_page_flag = $this->key . '_import_products_page';
        $this->import_report = 'ci_import_' . $this->key . '_report';
        $this->stall_check_action = $this->key . '_stall_check';
        // $this->log_flag = $this->key . '_log';
        $this->log_path = CI_STORE_PLUGIN . 'logs/' . date('Y-m-d') . '_' . strtoupper($this->key) . '_LOG.log';
        $this->daily_import_flag = $this->key . '_daily_import';
        $this->start_daily_import_flag = $this->key . '_start_daily_import';
        // $this->cronjob = new CronJob("cronjob_import_{$this->key}", [$this, 'run_cronjob'], [$this, 'complete_cronjob']);

        add_action($this->stall_check_action, array($this, 'stall_check'));
        add_action($this->start_import_products_flag, array($this, 'start_import_products'), 10);
        add_action($this->import_products_page_flag, array($this, 'import_products_page'), 10);
        add_action('wp', array($this, 'schedule_daily_import'));
        add_action($this->start_daily_import_flag, array($this, 'start_daily_import'), 10);
        set_error_handler([$this, 'log']);
    }

    // TODO: convert to background process for WPS
    // public function run_cronjob($args)
    // {
    //     $args_str = json_encode(['args' => $args]);
    //     $start_time = microtime(true);
    //     $this->cronjob->log("run_cronjob() start args:{$args_str}");
    //     $result = ['continue' => false];
    //     $end_time = microtime(true);
    //     $exetime = round($end_time - $start_time);
    //     $this->cronjob->log("run_cronjob() end args:{$args_str} exe:{$exetime}");
    //     return $result;
    // }

    // public function complete_cronjob($result, $args)
    // {
    //     $page_index = $args['page_index'];
    //     $next_page = $page_index + 1;

    //     if ($result['continue'] === true) {
    //         $args['page_index'] = $next_page;
    //         $this->cronjob->log('continue() ' . json_encode(['result' => $result, 'args' => $args]));
    //         $this->cronjob->start($args);
    //     } else {
    //         $this->cronjob->log('complete_cronjob() ' . json_encode(['result' => $result, 'args' => $args]));
    //     }
    // }

    public function start_cronjob($args)
    {
        error_log('start_cronjob() ' . json_encode($args));
        if ($this->background_process) {
            return $this->background_process->start($args);
        }
        error_log('start_cronjob failed');
        return false;
    }

    public function stop_cronjob()
    {
        if ($this->background_process) {
            return $this->background_process->cancel();
        }
        return false;
    }

    public function continue_cronjob()
    {
        if ($this->background_process) {
            return $this->background_process->continue();
        }
        return false;
    }

    public function get_cronjob_status()
    {
        if ($this->background_process) {
            return $this->background_process->get_status();
        }
        return false;
    }

    // placeholder
    public function start_import_products()
    {
        return ['error' => 'start_import_products() undefined'];
    }

    public function resume_import()
    {
        $scheduled = false;
        $is_scheduled = (bool) wp_next_scheduled($this->import_products_page_flag);
        if (!$is_scheduled) {
            $scheduled = wp_schedule_single_event(time(), $this->import_products_page_flag);
        }
        return $scheduled;
    }

    // placeholder
    public function import_products_page()
    {
        return ['error' => 'import_products_page() undefined'];
    }

    public function repair_products_page(int $page_index = 1)
    {
        return ['error' => 'repair_products_page() undefined'];
    }

    // placeholder
    public function import_images_page()
    {
        return ['error' => 'import_images_page() undefined'];
    }

    // placeholder
    public function get_products_page($cursor = '', $size = 10, $updated = '2020-01-01')
    {
        return ['error' => 'get_products_page() undefined'];
    }

    public function get_next_products_page($previous_result)
    {
        return ['error' => 'get_next_products_page() undefined'];
    }

    public function log($file, $line = null, $message = null)
    {
        if ($this->allow_logging()) {
            $spacer = "\n"; //"\n---\n";
            $t = gmdate("c");
            if ($line && $message) {
                $parts = explode('/', $file);
                $filename = end($parts);
                $filename = substr($filename, -30);
                $filename = str_pad($filename, 30, " ");
                $ln = 'ln:' . str_pad($line, 3, " ", STR_PAD_LEFT);
                if (is_object($message) || is_array($message)) {
                    $message = json_encode($message, JSON_PRETTY_PRINT);
                }
                error_log($t . "\t" . $filename . ":" . $ln . "\t" . $message . $spacer, 3, $this->log_path);
            } else {
                if (is_object($file) || is_array($file)) {
                    $file = json_encode($file, JSON_PRETTY_PRINT);
                }
                error_log($t . "\t" . $file . $spacer, 3, $this->log_path);
            }
        }
    }

    public function get_log()
    {
        $logContents = file_get_contents($this->log_path);
        // return $logContents;
        $break = "\n";
        $logRows = explode($break, $logContents); //PHP_EOL
        $logRows = array_filter($logRows);
        return $logRows;
    }

    public function clear_log()
    {
        if ($fileHandle = fopen($this->log_path, 'w')) {
            ftruncate($fileHandle, 0);
            fclose($fileHandle);
            return true;
        }
        return false;
    }

    public function create_product($supplier_product_id)
    {
        $product = new WC_Product_Variable();
        $sku = $this->get_product_sku($supplier_product_id);
        $product->set_sku($sku);
        $product->update_meta_data('_ci_supplier_key', $this->key);
        $product->update_meta_data('_ci_product_id', $supplier_product_id);
        $product->update_meta_data('_supplier_class', $this->supplierClass);
        $product->update_meta_data('_ci_import_version', $this->import_version);
        $product->update_meta_data('_ci_import_timestamp', gmdate("c"));
        $woo_product_id = $product->save();
        if ($woo_product_id) {
            wp_set_object_terms($woo_product_id, 'variable', 'product_type');
        }
        return $woo_product_id;
    }

    // placeholder
    public function resize_image($src, $width = 200)
    {
        return $src;
    }

    // placeholder
    public function insert_product($supplier_product_id, $supplier_product = null)
    {
        $this->log('insert_product() not defined for ' . $this->key);
    }
    // placeholder
    public function update_product($supplier_product_id, $supplier_product = null)
    {
        $this->log('update_product() not defined for ' . $this->key);
    }
    // placeholder
    public function get_api($path, $params = [])
    {
        $this->log('get_api() not defined for ' . $this->key);
        return null;
    }
    // placeholder
    public function get_product($product_id)
    {
        $this->log('get_product() not defined for ' . $this->key);
        return [];
    }
    // placeholder
    public function get_product_light($product_id)
    {
        return $this->get_product($product_id);
    }
    // placeholder
    public function get_description($supplier_product)
    {
        $this->log('get_description() not defined for ' . $this->key);
        return '';
    }
    // placeholder
    public function extract_variations($supplier_product)
    {
        return [];
    }
    // placeholder
    public function import_next_products_page()
    {
        return [];
    }
    /**
     * Retrieves WooCommerce tag IDs based on provided tags array.
     *
     * @param array $tags An array containing tags data with 'name' and 'slug' keys.
     * @return array An array containing WooCommerce tag IDs.
     */
    // public function get_tag_ids($tags)
    // {
    //     foreach ($tags as $i => $tag) {
    //         $woo_tag = get_term_by('slug', $tag['slug'], 'product_tag');
    //         if ($woo_tag) {
    //             $tags[$i]['woo'] = $woo_tag; //
    //             $tags[$i]['woo_term_id'] = $woo_tag->term_id; //
    //             if ($woo_tag->name !== $tag['name']) {
    //                 $update = wp_update_term($woo_tag->term_id, 'product_tag', ['name' => $tag['name']]);
    //                 $tags[$i]['update'] = $update;
    //             }
    //         } else {
    //             $woo_tag = wp_insert_term($tag['name'], 'product_tag', ['slug' => $tag['slug']]);
    //             $tags[$i]['woo_term_id'] = $woo_tag->term_id; //
    //         }
    //     }

    //     return array_map(fn($tag) => $tag['woo_term_id'], $tags);
    // }

    public function get_tag_ids($terms)
    {
        $slugs = array_column($terms, 'slug');
        $found = get_terms(['slug' => $slugs, 'taxonomy' => 'product_tag', 'hide_empty' => false]);
        $lookup_term = array_column($found, null, 'slug');

        foreach ($terms as $i => $term) {
            if (isset($lookup_term[$term['slug']])) {
                $terms[$i]['id'] = $lookup_term[$term['slug']]->term_id;
            } else {
                $woo_tag = wp_insert_term($term['name'], 'product_tag', ['slug' => $term['slug']]);
                $terms[$i]['id'] = $woo_tag->term_id;
            }
        }
        $ids = array_column($terms, 'id');
        return $ids;
    }

    // TODO: Incomplete
    public function get_term_ids($terms, $taxonomy = 'product_tag')
    {
        $slugs = array_column($terms, 'slug');
        $found = get_terms(['slug' => $slugs, 'taxonomy' => $taxonomy, 'hide_empty' => false]);
        $lookup_term = array_column($found, null, 'slug');

        foreach ($terms as $i => $term) {
            if (isset($lookup_term[$term['slug']])) {
                $terms[$i]['id'] = $lookup_term[$term['slug']]->term_id;
            } else {
                $woo_tag = wp_insert_term($term['name'], $taxonomy, ['slug' => $term['slug'], 'parent' => $term['parent']]);
                $terms[$i]['id'] = $woo_tag->term_id;
            }
        }
        $ids = array_column($terms, 'id');
        return $ids;
    }

    // placeholder
    public function extract_product_tags($supplier_product)
    {
        return [];
    }
    // placeholder
    public function is_available($supplier_product)
    {
        return true;
    }
    // placeholder
    public function check_is_available($supplier_product_id)
    {
        $supplier_product = $this->get_product($supplier_product_id);
        return $this->is_available($supplier_product);
    }
    // placeholder
    public function extract_product_updated($supplier_product)
    {
        return new DateTime();
    }
    // placeholder
    public function get_stock_status($supplier_product_id)
    {
        // notfound, instock, outofstock
        return 'instock';
    }
    // placeholder
    public function update_prices_table($page_index = 1)
    {}

    /**
     *
     * @param SupplierProduct    $supplier_product
     * @param WC_Product    $woo_product
     */
    public function attach_images($supplier_product, $woo_product = null)
    {
        $result = [];
        return $result;
    }
    /**
     *
     * @param WC_Product    $woo_product
     */
    public function update_single_product($woo_product)
    {
        // fires woocommerce_before_single_product
        if ($this->should_update_single_product($woo_product)) {
            return true;
        }
        return false;
    }

    // when does a PDP stale in hours
    protected int $single_product_max_age = 24 * 7;
    /**
     *
     * @param WC_Product    $woo_product
     */
    public function should_update_single_product($woo_product)
    {
        $update = $woo_product->get_meta('_ci_update_pdp', true);
        $should_update = !(bool) $update;

        if ($update) {
            $age = $update ? WooTools::get_age($update, 'hours') : 99999;
            $should_update = $age > $this->single_product_max_age;
        }
        return $should_update;
    }

    // when does PLP stale in hours
    protected int $loop_product_max_age = 24 * 7;
    /**
     *
     * @param WC_Product    $woo_product
     */
    public function update_loop_product($woo_product)
    {
        // fires woocommerce_before_shop_loop_item
        if ($this->should_update_loop_product($woo_product)) {
            return true;
        }
        return false;
    }
    /**
     *
     * @param WC_Product    $woo_product
     */
    public function should_update_loop_product($woo_product)
    {
        $update = $woo_product->get_meta('_ci_update_plp', true);
        $should_update = !(bool) $update;

        if ($update) {
            $age = $update ? WooTools::get_age($update, 'hours') : 99999;
            $should_update = $age > $this->loop_product_max_age;
        }
        return $should_update;
    }
    /**
     *
     * @param WC_Product    $product
     */
    public function product_needs_update($product)
    {
        $last_updated = $product->get_meta('_last_updated', true);
        $age = $last_updated ? WooTools::get_age($last_updated, 'hours') : 99999;
        $max_age = 24 * 7;

        if ($age > $max_age) { // max age is a week
            return true;
        }
        $id = $product->get_id();
        $deprecated = $this->is_deprecated($id);

        if ($deprecated) {
            return true;
        }
        return false;
    }
    /**
     *
     * @param WC_Product    $product
     */
    public function product($product)
    {
        return false;
    }

    public function extract_product_id($supplier_product)
    {
        if (isset($supplier_product['data']['id'])) {
            return $supplier_product['data']['id'];
        }
        if (isset($supplier_product['id'])) {
            return $supplier_product['id'];
        }
        return null;
    }

    public function is_stale($supplier_product, $woo_product = null)
    {
        $supplier_updated = $this->extract_product_updated($supplier_product);
        $supplier_product_id = $this->extract_product_id($supplier_product);
        if (!$woo_product) {
            $woo_product = $this->get_woo_product($supplier_product_id);
        }
        if ($woo_product) {
            $imported = $woo_product->get_meta('_ci_import_timestamp');
            if ($imported) {
                $imported_time = strtotime($imported);
                return $imported_time < $supplier_updated;
            }
        }
        return true;
    }

    public function is_deprecated($woo_product_id)
    {
        $product_import_version = get_post_meta($woo_product_id, '_ci_import_version', true);
        return $product_import_version !== $this->import_version;
    }

    public function import_product($supplier_product_id)
    {
        $product = $this->get_product_light($supplier_product_id);

        if ($product['error']) {
            return ['action' => 'error', 'result' => $product];
        }
        $action = $this->get_update_action($product);
        if ($this->deep_debug) {
            $this->log('import_product() ' . $this->key . ':' . $supplier_product_id . ' ' . $action);
        }
        switch ($action) {
            case 'insert':
                $result = $this->insert_product($supplier_product_id);
                break;
            case 'update':
                $result = $this->update_product($supplier_product_id);
                break;
            case 'delete':
                $result = $this->delete_product($supplier_product_id);
                break;
            case 'ignore':
                $result = '';
                break;
        }
        return ['action' => $action, 'result' => $result];
    }

    public function delete_product($supplier_product_id, $force = true)
    {
        $sku = $this->get_product_sku($supplier_product_id);
        $woo_product_id = wc_get_product_id_by_sku($sku);
        return wp_delete_post($woo_product_id, $force);
    }

    // public function delete_orphaned_meta()
    // {
    //     global $wpdb;
    //     $sql = "DELETE pm
    //         FROM wp_postmeta pm
    //         LEFT JOIN wp_posts p ON pm.post_id = p.ID
    //         WHERE p.ID IS NULL;
    //     ";

    //     $result = $wpdb->query($sql);
    //     if ($result === false) {
    //         $this->log("Error deleting orphaned attachments: " . $wpdb->last_error);
    //     } else {
    //         $this->log("Deleted orphaned attachments.");
    //     }
    // }

    // public function delete_orphaned_attachments()
    // {
    //     global $wpdb;
    //     $sql = "DELETE a
    //         FROM {$wpdb->posts} a
    //         LEFT JOIN {$wpdb->posts} p ON a.post_parent = p.ID AND p.post_type = 'product'
    //         WHERE a.post_type = 'attachment'
    //         AND a.post_parent > 0
    //         AND p.ID IS NULL
    //     ";
    //     // $sql = "DELETE FROM {$wpdb->posts}
    //     // WHERE post_type = 'attachment'
    //     // AND post_parent > 0
    //     // AND post_parent
    //     // NOT IN (
    //     //     SELECT ID FROM {$wpdb->posts} WHERE post_type = 'product'
    //     // )";

    //     $result = $wpdb->query($sql);
    //     if ($result === false) {
    //         $this->log("Error deleting orphaned attachments: " . $wpdb->last_error);
    //     } else {
    //         $this->log("Deleted orphaned attachments.");
    //     }
    // }

    public function get_base_metadata()
    {
        $base_metadata = [
            'total_sales' => 0,
            '_tax_status' => 'taxable',
            '_manage_stock' => 'no',
            '_backorders' => 'no',
            '_sold_individually' => 'no',
            '_virtual' => 'no',
            '_downloadable' => 'no',
            '_download_limit' => '-1',
            '_download_expiry' => '-1',
            '_stock' => 'NULL',
            '_stock_status' => 'instock',
            '_wc_average_rating' => 0,
            '_wc_review_count' => 0,
            '_product_version' => Constants::get_constant('WC_VERSION'),
            '_supplier_class' => $this->supplierClass,
            '_ci_supplier_key' => $this->key,
            '_ci_import_version' => $this->import_version,
            '_ci_import_timestamp' => gmdate("c"),
            // '_ci_import_details' => gmdate("c"),
            // '_ci_import_price' => gmdate("c"),
            '_ci_update_plp' => 0, // TODO: update list view
            '_ci_update_pdp' => 0,
            '_last_updated' => gmdate("c"),
        ];
        // Required: _sku, _ci_product_id
        return $base_metadata;
    }

    public function delete_all()
    {
        $this->log("delete_all()");
        global $wpdb;

        $main_sql = "SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = '_ci_supplier_key' AND meta_value = %s";
        $main_prep = $wpdb->prepare($main_sql, $this->key);
        $meta_search = $wpdb->get_col($main_prep);

        $name_sql = "SELECT ID FROM {$wpdb->posts} WHERE post_name LIKE '%-{$this->key}-product'";
        $name_prep = $wpdb->prepare($name_sql); //, $post_name_pattern);
        $post_name_search = $wpdb->get_col($name_prep);

        $product_ids = array_unique([ ...$post_name_search, ...$meta_search]);
        $product_ids = array_filter($product_ids, fn($id) => (bool) $id);
        // return $product_ids;//$wpdb->prepare($post_name_sql, $post_name_pattern);

        // $product_ids = $wpdb->get_results($wpdb->prepare($main_sql, $this->key));
        // return $product_ids;
        /*
        $meta_key = '_ci_supplier_key';
        $meta_value = $this->key;
        $main_sql = "SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = %s AND meta_value = %s";
        $proper_search = $wpdb->get_col($wpdb->prepare($main_sql, $meta_key, $meta_value));

        // find by sku....
        $sku_sql = "SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = '_sku' AND meta_value LIKE %s";
        $sku_pattern = '%' . $wpdb->esc_like($this->get_product_sku('')) . '%';
        $sku_search = $wpdb->get_col($wpdb->prepare($sku_sql, $sku_pattern));

        $post_name_sql = "SELECT ID FROM {$wpdb->posts} WHERE post_name LIKE %s";
        $post_name_pattern = '%' . $wpdb->esc_like("-" . $this->key . "-product");
        $post_name_search = $wpdb->get_col($wpdb->prepare($post_name_sql, $post_name_pattern));

        $product_ids = array_unique(array_merge($proper_search, $sku_search, $post_name_search));
        // return ['test' => $monkey_search, 'product_ids' => $product_ids];

        return $product_ids;

        if (empty($product_ids)) {
        $this->log("No products found to delete for meta_key: {$meta_key}, meta_value: {$meta_value}");
        return ['meta' => [
        'supplier' => $this->key,
        'product_ids' => 0,
        ]];
        }

         */

        // Create a new WC_Product_Query with the specified arguments
        // $product_query = new WC_Product_Query($args);

        // $products = wc_get_products([
        //     'limit'      => -1, // Retrieve all products
        //     'status'     => 'publish', // Only get published products
        //     'meta_query' => [
        //         [
        //             'key'   => '_ci_supplier_key',
        //             'value' => $this->key,
        //             'compare' => '='
        //         ]
        //     ]
        // ]);
        // return $products;

        $chunks = array_chunk($product_ids, 10000);
        $results = [];

        foreach ($chunks as $chunk) {
            $results[] = WooTools::delete_products($chunk);
            /*
            $placeholders = implode(',', array_fill(0, count($chunk), '%d'));

            $sql = "DELETE FROM {$wpdb->term_relationships} WHERE object_id IN ($placeholders)";
            $result1 = $wpdb->query($wpdb->prepare($sql, $chunk));
            if ($result1 === false) {
            $this->log("Error deleting products: " . $wpdb->last_error);
            }

            $sql = "DELETE FROM {$wpdb->postmeta} WHERE post_id IN ($placeholders)";
            $result2 = $wpdb->query($wpdb->prepare($sql, $chunk));
            if ($result2 === false) {
            $this->log("Error deleting products: " . $wpdb->last_error);
            }

            $sql = "DELETE FROM {$wpdb->posts} WHERE ID IN ($placeholders)";
            $result3 = $wpdb->query($wpdb->prepare($sql, $chunk));
            if ($result3 === false) {
            $this->log("Error deleting products: " . $wpdb->last_error);
            }
             */

            // $sql = "DELETE p, pm, tr
            //     FROM {$wpdb->posts} p
            //     LEFT JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id
            //     LEFT JOIN {$wpdb->term_relationships} tr ON p.ID = tr.object_id
            //     WHERE p.post_type = 'product'
            //     AND p.ID IN ($placeholders)
            // ";
            // $result = $wpdb->query($wpdb->prepare($sql, $chunk));
            // if ($result === false) {
            //     $this->log("Error deleting products: " . $wpdb->last_error);
            // } else {
            //     $this->log("Deleted " . count($chunk) . " products.");
            // }
            // $a = $chunk[0];
            // $this->log("delete {$a}...1000");
        }
        /*
        // $total = count($product_ids);
        // $this->log("deleted {$total} products");

        $leftover_product_ids = [];//$wpdb->get_col($wpdb->prepare($main_sql, $meta_key, $meta_value));

        foreach ($leftover_product_ids as $product_id) {
        $ids[] = $product_id;
        $success = wp_delete_post($product_id, true);
        $bool = json_encode((bool) $success);
        $this->log("delete (!) {$product_id} success={$bool}");
        }
        $total = count($leftover_product_ids);
         */
        // $this->log("deleted {$total} leftover products");

        // WooTools::delete_orphaned_attachments();
        // WooTools::delete_orphaned_meta();
        // WooTools::delete_orphaned_meta_lookup();

        return [
            'meta' => [
                'results' => $results,
                // 'meta_key' => '_ci_supplier_key',
                'supplier' => $this->key,
                'product_ids' => ($product_ids),
                // 'leftover_product_ids' => count($leftover_product_ids),
            ],
            // 'data' => $product_ids,
        ];
    }
    // $ids = [];
    // foreach ($product_ids as $product_id) {
    //     $ids[] = $product_id;
    //     $this->log("delete {$product_id}");
    //     wp_delete_post($product_id, true);
    // }

    public function get_update_action($supplier_product)
    {
        // WPS returns a differnt object depending on list or single product
        if (isset($supplier_product['error']) && $supplier_product['status_code'] === 404) {
            // supplier product no longer exists
            $supplier_product_id = $supplier_product['data']['id'];
            $sku = $this->get_product_sku($supplier_product_id);
            $woo_product_id = wc_get_product_id_by_sku($sku);
            return $woo_product_id ? 'delete' : 'ignore';
        }
        if (!isset($supplier_product['data'])) {
            $supplier_product = ['data' => $supplier_product];
        }
        if (!isset($supplier_product['data']['id'])) {
            $this->log('Houston...' . json_encode(['supplier_product' => $supplier_product]));
            return 'ignore';
        }
        $action = 'ignore';
        $supplier_product_id = $supplier_product['data']['id'];
        $supplier_updated = $this->extract_product_updated($supplier_product);
        $sku = $this->get_product_sku($supplier_product_id);
        $woo_product_id = wc_get_product_id_by_sku($sku);
        $supplier_import_version = $this->import_version;
        $is_available = $this->is_available($supplier_product);

        if ($woo_product_id) {
            $woo_import_version = get_post_meta($woo_product_id, '_ci_import_version', true);
            $woo_updated_str = get_post_meta($woo_product_id, '_ci_import_timestamp', true);
            $woo_updated = strtotime($woo_updated_str);
            $is_stale = $woo_updated < $supplier_updated;
            $is_deprecated = $supplier_import_version !== $woo_import_version;

            if (!$is_available) {
                $action = 'delete';
            } else if ($is_stale || $is_deprecated) {
                $action = 'update';
            }
        } else {
            if ($is_available) {
                // $this->log('sku='.$sku.' woo_product_id='.$woo_product_id);
                $action = 'insert';
            }
        }
        return $action;
    }
    /**
     *
     * @param string    $product_id
     */
    public function get_product_sku($product_id)
    {
        return implode('_', ['MASTER', strtoupper($this->key), $product_id]);
    }

    public function get_variation_sku($product_id, $variation_id)
    {
        return implode('_', ['MASTER', strtoupper($this->key), $product_id, 'VARIATION', $variation_id]);
    }

    public function get_woo_id($supplier_product_id)
    {
        $sku = $this->get_product_sku($supplier_product_id);
        $woo_product_id = wc_get_product_id_by_sku($sku);
        return $woo_product_id;
    }

    public function get_woo_product($supplier_product_id)
    {
        $woo_product_id = $this->get_woo_id($supplier_product_id);
        if ($woo_product_id) {
            $woo_product = wc_get_product($woo_product_id);
            return $woo_product;
        }
        return null;
    }

    public function get_product_status($supplier_product_id)
    {
        $supplier_product = $this->get_product($supplier_product_id);
        $woo_id = $this->get_woo_id($supplier_product_id);
        $is_available = $this->check_is_available($supplier_product_id);

        return [
            'is_available' => $is_available,
            'woo_id' => $woo_id,
            'supplier_product' => $supplier_product,
            'is_importing' => false,
        ];
    }

    public function schedule_import_product($supplier_product_id)
    {
        if ($this->is_import_product_scheduled($supplier_product_id)) {
            return wp_schedule_single_event(time() + 1, 'ci_import_product', [$this->key, $supplier_product_id]);
        }
        return null;
    }

    public function is_import_product_scheduled($supplier_product_id)
    {
        return (bool) wp_next_scheduled('ci_import_product', [$this->key, $supplier_product_id]);
    }

    public function is_import_product_running($supplier_product_id)
    {
        wp_cache_flush();
        $option_name = 'ci_import_' . $this->key . '_product' . $supplier_product_id . '_running';
        return (bool) get_option($option_name, false);
    }

    public function allow_logging($allow = null)
    {
        $option_name = 'ci_supplier_' . $this->key . '_allow_logging';
        if (isset($allow)) {
            $updated = update_option($option_name, (bool) $allow);
            if (!$updated) {
                error_log("Failed to update option: $option_name");
                return $allow;
            }
        }
        return (bool) get_option($option_name, false);
    }

    public function is_importing_product($supplier_product_id = null)
    {
        return $this->is_import_product_running($supplier_product_id) || $this->is_import_product_scheduled($supplier_product_id);
    }

    public function is_importing()
    {
        return $this->is_import_running() || $this->is_import_scheduled();
    }

    public function is_import_running()
    {
        wp_cache_flush();
        return (bool) get_option($this->import_flag, false);
    }

    public function ping()
    {
        update_option($this->ping_flag, gmdate('c'));
    }

    public function seconds_since_last_ping()
    {
        wp_cache_flush();
        $ping = get_option($this->ping_flag);
        $updated_time = strtotime($ping);
        $current_time = strtotime(gmdate("c"));
        $time_difference = $current_time - $updated_time;
        $seconds_elapsed = round($time_difference);
        return $seconds_elapsed;
    }

    public function is_import_stalled()
    {
        // this is redundant is most use cases but it's required for this
        if ($this->is_import_running()) {
            $seconds_elapsed = $this->seconds_since_last_ping();
            return $seconds_elapsed > 60 * 1;
        }
        return false;
    }

    public function set_is_import_running($is_running)
    {
        update_option($this->import_flag, $is_running);
        if (!$is_running) {
            update_option($this->cancel_flag, false);
        }
        return $is_running;
    }

    public function cancel_import()
    {
        $is_import_running = $this->is_import_running();
        $is_import_scheduled = $this->is_import_scheduled();
        $this->log('cancel_import() ' . $this->key . ' is_import_running=' . json_encode($is_import_running) . ' is_import_scheduled=' . json_encode($is_import_scheduled));
        $stalled = false;

        if ($is_import_scheduled) {
            $this->unschedule_import();
        }

        if ($is_import_running) {
            $stalled = $this->is_import_stalled();
            update_option($this->cancel_flag, true);
            if ($stalled) {
                $this->set_is_import_running(false);
            }
        } else {
            update_option($this->cancel_flag, false);
        }

        return ['is_import_scheduled' => $is_import_scheduled, 'is_import_running' => $is_import_running, 'stalled' => $stalled];
    }

    public function should_cancel_import()
    {
        wp_cache_flush();
        return (bool) get_option($this->cancel_flag, false);
    }

    public function is_import_scheduled()
    {
        return (bool) wp_next_scheduled($this->import_products_page_flag);
    }

    public function schedule_import()
    {
        if (!$this->is_importing()) {
            return wp_schedule_single_event(time() + 1, $this->import_products_page_flag);
        }
    }

    public function unschedule_import()
    {
        return wp_clear_scheduled_hook($this->import_products_page_flag);
    }

    public array $empty_report = [
        'products_count' => 0,
        'processed' => 0,
        'delete' => 0,
        'update' => 0,
        'ignore' => 0,
        'insert' => 0,
        'patched' => 0,
        'error' => '',
        'cursor' => '',
        'patch' => '',
        'page_size' => 50,
        'updated' => '',
        'started' => '',
        'stopped' => '',
        'completed' => '',
    ];

    // TODO: prob don't need this
    public function clear_import_report()
    {
        update_option($this->cancel_flag, false);
        $report = $this->get_import_report();
        $update = array_replace($report, $this->empty_report);
        update_option($this->import_report, $update);
    }

    public function get_import_status()
    {
        $report = $this->get_import_report();
        $now = new DateTime();
        $last_completed = isset($report['completed']) && !empty($report['completed']) ? new DateTime($report['completed']) : new DateTime('2020-01-01', new DateTimeZone('UTC'));
        $last_started = isset($report['started']) && !empty($report['started']) ? new DateTime($report['started']) : new DateTime('2020-01-01', new DateTimeZone('UTC'));
        $last_stopped = isset($report['stopped']) && !empty($report['stopped']) ? new DateTime($report['stopped']) : new DateTime('2020-01-01', new DateTimeZone('UTC'));
        $interval = $now->diff($last_started);
        $started_hours_ago = $interval->h + ($interval->days * 24);
        $is_running = $this->is_import_running();
        $is_scheduled = $this->is_import_scheduled();
        $is_stopped = !$is_running && !$is_scheduled && ($last_stopped > $last_started) && ($last_stopped > $last_completed);
        $next_import = $this->get_next_daily_import_time();

        return [
            'is_stalled' => $this->is_import_stalled(),
            'is_running' => $is_running,
            'is_scheduled' => $is_scheduled,
            'is_cancelled' => $this->should_cancel_import(),
            'is_stopped' => $is_stopped,
            'last_started' => $last_started,
            'last_completed' => $last_completed,
            'last_stopped' => $last_stopped,
            'started_hours_ago' => $started_hours_ago,
            'report' => $report,
            'next_import' => $next_import,
        ];
    }

    public function get_import_report()
    {
        wp_cache_flush();
        return get_option($this->import_report, $this->empty_report);
    }

    public function update_import_report($delta)
    {
        $report = $this->get_import_report();
        $update = array_merge($report, $delta);
        update_option($this->import_report, $update);
        return $update;
    }

    public function stall_import()
    {
        // test stall action
        $this->log('stall_import() ' . $this->key);
        update_option($this->stall_flag, true);
    }

    public function should_stall_import()
    {
        wp_cache_flush();
        return (bool) get_option($this->stall_flag, false);
    }

    public function clear_stall_test()
    {
        update_option($this->stall_flag, false);
    }

    public function stall_check()
    {
        if ($this->is_import_stalled()) {
            $this->log('stall_check() ' . $this->key);
            $this->cancel_import();
            if (!$this->is_import_scheduled()) {
                $this->schedule_import();
            }
        }
    }

    public function schedule_stall_check()
    {
        // we only want a stall check if we're already importing
        if ($this->is_importing()) {
            // check if stall check is already scheduled
            $is_scheduled = (bool) wp_next_scheduled($this->stall_check_action);
            if (!$is_scheduled) {
                $this->log('schedule_stall_check() ' . $this->key);
                $currentTime = time();
                // do a stall check every hour
                return wp_schedule_event(strtotime('+60 minutes', $currentTime), 'hourly', $this->stall_check_action);
                // return wp_schedule_event(time(), 'Once Hourly', $this->stall_check_action);
            } else {
                // $this->log('schedule_stall_check() NOT CALLED ' . $this->key);
            }
        }
    }
    // get total imported products for this supplier
    public function get_total_products()
    {
        $query = new \WP_Query(array(
            'post_status' => 'publish',
            'post_type' => 'product',
            'meta_query' => [
                ['key' => '_ci_supplier_key', 'value' => $this->key, 'compare' => '='],
            ],
            'fields' => 'ids',
        ));
        return $query->found_posts;
    }
    // placeholder
    public function get_total_remote_products()
    {
        return 0;
    }

    public function schedule_daily_import()
    {
        $next = wp_next_scheduled($this->daily_import_flag);
        if (!$next) {
            $this->log($this->key . ' schedule daily import');
            date_default_timezone_set('UTC');
            // Schedule the event for daily execution at 2:00am EST
            $est_time = time(); //strtotime('02:00:00 -0500');
            return wp_schedule_event($est_time, 'daily', $this->daily_import_flag);
        }
        return $next;
    }

    public function unschedule_daily_import()
    {
        $next = wp_next_scheduled($this->daily_import_flag);
        if ($next) {
            $this->log($this->key . ' unschedule daily import');
            return wp_unschedule_event($next, $this->daily_import_flag);
        }
        return $next;
    }

    public function start_daily_import()
    {
        $this->log('start_daily_import()');
        if (!$this->is_importing()) {
            $this->start_import_products();
        }
    }

    public function get_next_daily_import_time()
    {
        $next_run_timestamp = wp_next_scheduled($this->daily_import_flag);
        if ($next_run_timestamp) {
            // Convert timestamp to a readable date/time format
            $next_run_datetime = new DateTime();
            $next_run_datetime->setTimestamp($next_run_timestamp);
            $next_run_datetime->setTimezone(new DateTimeZone('UTC'));

            // Format the DateTime object to the desired format
            $next_run_time_formatted = $next_run_datetime->format('Y-m-d\TH:i:sP');

            // $next_run_time = gmdate( 'Y-m-d H:i:s', $next_run_timestamp );//date('Y-m-d H:i:s', $next_run_timestamp);
            return $next_run_time_formatted;
        } else {
            return null;
        }
    }
}
