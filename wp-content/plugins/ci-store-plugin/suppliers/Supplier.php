<?php

namespace CIStore\Suppliers;

include_once CI_STORE_PLUGIN . 'utils/CustomErrorLog.php';

use Automattic\Jetpack\Constants;
use CIStore\Utils\CustomErrorLog;
use DateTime;
use DateTimeZone;
use WC_Product_Variable;
use WooTools;

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
    // public string $import_flag = '';
    // public string $cancel_flag = '';
    // public string $ping_flag = '';
    // public string $import_report = '';
    // public string $stall_check_action = '';
    // public string $stall_flag = '';
    public string $access_token_flag = '';
    public string $access_token_expires_flag = '';
    // public string $import_products_page_flag = '';
    // public string $log_flag = '';
    // public string $log_path = '';
    // public string $start_import_products_flag = '';
    // public string $daily_import_flag = '';
    // public string $start_daily_import_flag = '';
    // public CronJob $cronjob;
    // public bool $deep_debug = false;
    public int $max_age = 24 * 7; // stale product age
    protected CustomErrorLog $logger;
    // protected $importer;

    public function __construct($config)
    {
        $this->key = $config['key'];
        $this->logger = new \CIStore\Utils\CustomErrorLog('SUPPLIER_' . strtoupper($this->key));
        $this->name = $config['name'];
        $this->supplierClass = $config['supplierClass'];
        $this->import_version = $config['import_version'];
        // $this->import_flag = 'ci_import_' . $this->key . '_products_running';
        // $this->cancel_flag = 'ci_import_' . $this->key . '_products_cancel';
        // $this->stall_flag = 'ci_import_' . $this->key . '_products_stall';
        // $this->ping_flag = 'ci_import_' . $this->key . '_products_ping';
        $this->access_token_flag = $this->key . '_access_token';
        $this->access_token_expires_flag = $this->key . '_access_token_expires';
        // $this->start_import_products_flag = $this->key . '_start_import_products';
        // $this->import_products_page_flag = $this->key . '_import_products_page';
        // $this->import_report = 'ci_import_' . $this->key . '_report';
        // $this->stall_check_action = $this->key . '_stall_check';
        // $this->log_flag = $this->key . '_log';
        // $this->log_path = CI_STORE_PLUGIN . 'logs/' . date('Y-m-d') . '_' . strtoupper($this->key) . '_LOG.log';
        // $this->daily_import_flag = $this->key . '_daily_import';
        // $this->start_daily_import_flag = $this->key . '_start_daily_import';
        // $this->cronjob = new CronJob("cronjob_import_{$this->key}", [$this, 'run_cronjob'], [$this, 'complete_cronjob']);

        // add_action($this->stall_check_action, array($this, 'stall_check'));
        // add_action($this->start_import_products_flag, array($this, 'start_import_products'), 10);
        // add_action($this->import_products_page_flag, array($this, 'import_products_page'), 10);
        // add_action('wp', array($this, 'schedule_daily_import'));
        // add_action($this->start_daily_import_flag, array($this, 'start_daily_import'), 10);
        set_error_handler([$this, 'log']);
    }

    // placeholder
    public function start_import_products()
    {
        return ['error' => 'start_import_products() undefined'];
    }

    // public function resume_import()
    // {
    //     $scheduled = false;
    //     $is_scheduled = (bool) wp_next_scheduled($this->import_products_page_flag);
    //     if (!$is_scheduled) {
    //         $scheduled = wp_schedule_single_event(time(), $this->import_products_page_flag);
    //     }
    //     return $scheduled;
    // }

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

    public function log($message = null, $context = 'unknown')
    {
        if ($message === 2) {
            $this->logger->log('context=' . $context . ' message=' . $message . ' key=' . $this->key);
        }
        $this->logger->log('Supplier::' . $this->key . '::' . json_encode($message));
        return false;
    }

    public function logs()
    {
        return $this->logger->logs();
    }

    public function clear()
    {
        return $this->logger->clear();
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
    }
    // placeholder
    public function update_product($supplier_product_id, $supplier_product = null)
    {
    }
    // placeholder
    public function get_api($path, $params = [])
    {
        return null;
    }
    // placeholder
    public function get_product($product_id, $flag = 'pdp')
    {
        return [];
    }

    public function get_products($product_ids, $flag = 'basic')
    {
        $data = [];
        foreach ($product_ids as $product_id) {
            $data[] = $this->get_product($product_id);
        }
        return ['data' => $data];
    }
    // placeholder
    // public function get_product_light($product_id)
    // {
    //     return $this->get_product($product_id);
    // }
    // placeholder
    public function get_description($supplier_product)
    {
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
    public function update_pdp_product($woo_product)
    {
        // fires woocommerce_before_single_product
        if (\WooTools::should_update_product($woo_product, '_ci_update_pdp')) {
            // custom code
        }
    }
    /**
     *
     * @param WC_Product    $woo_product
     */
    public function update_plp_product($woo_product)
    {
        // fires woocommerce_before_shop_loop_item
        if (WooTools::should_update_product($woo_product, '_ci_update_plp')) {
            // custom code
        }
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
        $product = $this->get_product($supplier_product_id, 'stock');

        if ($product['error']) {
            return ['action' => 'error', 'result' => $product];
        }
        $action = $this->get_update_action($product);
        // if ($this->deep_debug) {
        //     $this->log('import_product() ' . $this->key . ':' . $supplier_product_id . ' ' . $action);
        // }
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

    public function invalidate_all($flag = 'pdp')
    {
        global $wpdb;
        $meta_key_to_delete = '_ci_update_pdp';

        $sql = $wpdb->prepare("DELETE pm
            FROM {$wpdb->postmeta} pm
            WHERE pm.meta_key = %s
            AND pm.post_id IN (
                SELECT post_id
                FROM {$wpdb->postmeta}
                WHERE meta_key = '_ci_supplier_key'
                AND meta_value = %s
            )
        ", $meta_key_to_delete, $this->key);

        return $sql;

        $rows_affected = $wpdb->query($sql);

        if ($rows_affected !== false) {
            if ($rows_affected > 0) {
                return ['data' => "Successfully deleted {$rows_affected} rows."];
            } else {
                return ['data' => "No rows were deleted."];
            }
        } else {
            return ['error' => "There was an error executing the query."];
        }
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

        $chunks = array_chunk($product_ids, 10000);
        $results = [];

        foreach ($chunks as $chunk) {
            $results[] = WooTools::delete_products($chunk);
        }

        return [
            'meta' => [
                'results' => $results,
                'supplier' => $this->key,
                'product_ids' => ($product_ids),
            ],
        ];
    }

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
                // $this->log("Failed to update option: $option_name");
                return $allow;
            }
        }
        return (bool) get_option($option_name, false);
    }

    // public function is_importing_product($supplier_product_id = null)
    // {
    //     return $this->is_import_product_running($supplier_product_id) || $this->is_import_product_scheduled($supplier_product_id);
    // }

    // public function is_importing()
    // {
    //     return $this->is_import_running() || $this->is_import_scheduled();
    // }

    // public function is_import_running()
    // {
    //     wp_cache_flush();
    //     return (bool) get_option($this->import_flag, false);
    // }

    // public function ping()
    // {
    //     update_option($this->ping_flag, gmdate('c'));
    // }

    // public function seconds_since_last_ping()
    // {
    //     wp_cache_flush();
    //     $ping = get_option($this->ping_flag);
    //     $updated_time = strtotime($ping);
    //     $current_time = strtotime(gmdate("c"));
    //     $time_difference = $current_time - $updated_time;
    //     $seconds_elapsed = round($time_difference);
    //     return $seconds_elapsed;
    // }

    // public function is_import_stalled()
    // {
    //     // this is redundant is most use cases but it's required for this
    //     if ($this->is_import_running()) {
    //         $seconds_elapsed = $this->seconds_since_last_ping();
    //         return $seconds_elapsed > 60 * 1;
    //     }
    //     return false;
    // }

    // public function set_is_import_running($is_running)
    // {
    //     update_option($this->import_flag, $is_running);
    //     if (!$is_running) {
    //         update_option($this->cancel_flag, false);
    //     }
    //     return $is_running;
    // }

    // public function cancel_import()
    // {
    //     $is_import_running = $this->is_import_running();
    //     $is_import_scheduled = $this->is_import_scheduled();
    //     $this->log('cancel_import() ' . $this->key . ' is_import_running=' . json_encode($is_import_running) . ' is_import_scheduled=' . json_encode($is_import_scheduled));
    //     $stalled = false;

    //     if ($is_import_scheduled) {
    //         $this->unschedule_import();
    //     }

    //     if ($is_import_running) {
    //         $stalled = $this->is_import_stalled();
    //         update_option($this->cancel_flag, true);
    //         if ($stalled) {
    //             $this->set_is_import_running(false);
    //         }
    //     } else {
    //         update_option($this->cancel_flag, false);
    //     }

    //     return ['is_import_scheduled' => $is_import_scheduled, 'is_import_running' => $is_import_running, 'stalled' => $stalled];
    // }

    // public function should_cancel_import()
    // {
    //     wp_cache_flush();
    //     return (bool) get_option($this->cancel_flag, false);
    // }

    // public function is_import_scheduled()
    // {
    //     return (bool) wp_next_scheduled($this->import_products_page_flag);
    // }

    // public function schedule_import()
    // {
    //     if (!$this->is_importing()) {
    //         return wp_schedule_single_event(time() + 1, $this->import_products_page_flag);
    //     }
    // }

    // public function unschedule_import()
    // {
    //     return wp_clear_scheduled_hook($this->import_products_page_flag);
    // }

    // public array $empty_report = [
    //     'products_count' => 0,
    //     'processed' => 0,
    //     'delete' => 0,
    //     'update' => 0,
    //     'ignore' => 0,
    //     'insert' => 0,
    //     'patched' => 0,
    //     'error' => '',
    //     'cursor' => '',
    //     'patch' => '',
    //     'page_size' => 50,
    //     'updated' => '',
    //     'started' => '',
    //     'stopped' => '',
    //     'completed' => '',
    // ];

    // // TODO: prob don't need this
    // public function clear_import_report()
    // {
    //     update_option($this->cancel_flag, false);
    //     $report = $this->get_import_report();
    //     $update = array_replace($report, $this->empty_report);
    //     update_option($this->import_report, $update);
    // }

    // public function get_import_status()
    // {
    //     $report = $this->get_import_report();
    //     $now = new DateTime();
    //     $last_completed = isset($report['completed']) && !empty($report['completed']) ? new DateTime($report['completed']) : new DateTime('2020-01-01', new DateTimeZone('UTC'));
    //     $last_started = isset($report['started']) && !empty($report['started']) ? new DateTime($report['started']) : new DateTime('2020-01-01', new DateTimeZone('UTC'));
    //     $last_stopped = isset($report['stopped']) && !empty($report['stopped']) ? new DateTime($report['stopped']) : new DateTime('2020-01-01', new DateTimeZone('UTC'));
    //     $interval = $now->diff($last_started);
    //     $started_hours_ago = $interval->h + ($interval->days * 24);
    //     $is_running = $this->is_import_running();
    //     $is_scheduled = $this->is_import_scheduled();
    //     $is_stopped = !$is_running && !$is_scheduled && ($last_stopped > $last_started) && ($last_stopped > $last_completed);
    //     $next_import = $this->get_next_daily_import_time();

    //     return [
    //         'is_stalled' => $this->is_import_stalled(),
    //         'is_running' => $is_running,
    //         'is_scheduled' => $is_scheduled,
    //         'is_cancelled' => $this->should_cancel_import(),
    //         'is_stopped' => $is_stopped,
    //         'last_started' => $last_started,
    //         'last_completed' => $last_completed,
    //         'last_stopped' => $last_stopped,
    //         'started_hours_ago' => $started_hours_ago,
    //         'report' => $report,
    //         'next_import' => $next_import,
    //     ];
    // }

    // public function get_import_report()
    // {
    //     wp_cache_flush();
    //     return get_option($this->import_report, $this->empty_report);
    // }

    // public function update_import_report($delta)
    // {
    //     $report = $this->get_import_report();
    //     $update = array_merge($report, $delta);
    //     update_option($this->import_report, $update);
    //     return $update;
    // }

    // public function stall_import()
    // {
    //     // test stall action
    //     $this->log('stall_import() ' . $this->key);
    //     update_option($this->stall_flag, true);
    // }

    // public function should_stall_import()
    // {
    //     wp_cache_flush();
    //     return (bool) get_option($this->stall_flag, false);
    // }

    // public function clear_stall_test()
    // {
    //     update_option($this->stall_flag, false);
    // }

    // public function stall_check()
    // {
    //     if ($this->is_import_stalled()) {
    //         $this->log('stall_check() ' . $this->key);
    //         $this->cancel_import();
    //         if (!$this->is_import_scheduled()) {
    //             $this->schedule_import();
    //         }
    //     }
    // }

    // public function schedule_stall_check()
    // {
    //     // we only want a stall check if we're already importing
    //     if ($this->is_importing()) {
    //         // check if stall check is already scheduled
    //         $is_scheduled = (bool) wp_next_scheduled($this->stall_check_action);
    //         if (!$is_scheduled) {
    //             $this->log('schedule_stall_check() ' . $this->key);
    //             $currentTime = time();
    //             // do a stall check every hour
    //             return wp_schedule_event(strtotime('+60 minutes', $currentTime), 'hourly', $this->stall_check_action);
    //             // return wp_schedule_event(time(), 'Once Hourly', $this->stall_check_action);
    //         } else {
    //             // $this->log('schedule_stall_check() NOT CALLED ' . $this->key);
    //         }
    //     }
    // }
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
        // $this->importer->schedule_daily_import();
    //     $next = wp_next_scheduled($this->daily_import_flag);
    //     if (!$next) {
    //         $this->log('schedule_daily_import()');
    //         date_default_timezone_set('UTC');
    //         // Schedule the event for daily execution at 2:00am EST
    //         $est_time = time(); //strtotime('02:00:00 -0500');
    //         return wp_schedule_event($est_time, 'daily', $this->daily_import_flag);
    //     }
    //     return $next;
    }

    public function unschedule_daily_import()
    {
    //     $next = wp_next_scheduled($this->daily_import_flag);
    //     if ($next) {
    //         $this->log('unschedule_daily_import()');
    //         return wp_unschedule_event($next, $this->daily_import_flag);
    //     }
    //     return $next;
    }

    // public function start_daily_import()
    // {
    //     $this->log('start_daily_import()');
    //     if (!$this->is_importing()) {
    //         $this->start_import_products();
    //     }
    // }

    // public function get_next_daily_import_time()
    // {
    //     $next_run_timestamp = wp_next_scheduled($this->daily_import_flag);
    //     if ($next_run_timestamp) {
    //         // Convert timestamp to a readable date/time format
    //         $next_run_datetime = new DateTime();
    //         $next_run_datetime->setTimestamp($next_run_timestamp);
    //         $next_run_datetime->setTimezone(new DateTimeZone('UTC'));

    //         // Format the DateTime object to the desired format
    //         $next_run_time_formatted = $next_run_datetime->format('Y-m-d\TH:i:sP');

    //         // $next_run_time = gmdate( 'Y-m-d H:i:s', $next_run_timestamp );//date('Y-m-d H:i:s', $next_run_timestamp);
    //         return $next_run_time_formatted;
    //     } else {
    //         return null;
    //     }
    // }
}
