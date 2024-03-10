<?php

class Supplier
{
    public string $key;
    public string $name;
    public string $supplierClass;
    public string $import_version = '0.1';
    public string $import_flag = '';
    public string $cancel_flag = '';
    public string $ping_flag = '';
    public string $import_report = '';

    public function __construct($config)
    {
        $this->key = $config['key'];
        $this->name = $config['name'];
        $this->supplierClass = $config['supplierClass'];
        $this->import_version = $config['import_version'];
        $this->import_flag = 'ci_import_' . $this->key . '_products_running';
        $this->cancel_flag = 'ci_import_' . $this->key . '_products_cancel';
        $this->ping_flag = 'ci_import_' . $this->key . '_products_ping';
        $this->import_report = 'ci_import_' . $this->key . '_report';
    }

    public function get_api($path, $params = [])
    {
        return [];
    }

    public function get_product($product_id)
    {
        return [];
    }

    public function get_product_sku($product_id)
    {
        return implode('_', ['MASTER', 'WPS', $product_id]);
    }

    public function get_woo_id($product_id)
    {
        $sku = $this->get_product_sku($product_id);
        $woo_product_id = wc_get_product_id_by_sku($sku);
        return $woo_product_id;
    }

    public function get_variation_sku($product_id, $variation_id)
    {
        return implode('_', ['MASTER', 'WPS', $product_id, 'VARIATION', $variation_id]);
    }

    public function get_woo_product($product_id)
    {
        $sku = $this->get_product_sku($product_id);
        $woo_product_id = wc_get_product_id_by_sku($sku);
        if ($woo_product_id) {
            $woo_product = wc_get_product($woo_product_id);
            return $woo_product;
        }
        return null;
    }

    public function extract_variations($supplier_product)
    {
        return [];
    }

    public function is_available($supplier_product)
    {
        return true;
    }

    public function check_is_available($product_id)
    {
        return true;
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

    public function extract_product_updated($supplier_product)
    {
        return new DateTime();
    }

    public function is_stale($supplier_product)
    {
        // $woo_updated = 'unknown';
        // $supplier_updated = 'unknown';
        return false; //['woo' => $woo_updated, 'supplier' => $supplier_updated];
    }

    public function get_stock_status($supplier_product_id)
    {
        // notfound, instock, outofstock
        return 'instock';
    }

    // public function import_product($supplier_product_id)
    // {
    //     $supplier_product = $this->get_product($supplier_product_id);
    //     $woo_id = $this->get_woo_id($supplier_product_id);
    //     $is_available = $this->check_is_available($supplier_product_id);

    //     return [
    //         'is_available' => $is_available,
    //         'woo_id' => $woo_id,
    //         'supplier_product' => $supplier_product,
    //     ];
    // }

    public function schedule_import_product($supplier_product_id)
    {
        return wp_schedule_single_event(time() + 1, 'ci_import_product', [$this->key, $supplier_product_id]);
    }

    public function is_import_product_scheduled($supplier_product_id)
    {
        return (bool) wp_next_scheduled('ci_import_product', [$this->key, $supplier_product_id]);
        // return (bool) wp_next_scheduled('ci_import_supplier_product_event', [$this->key, $supplier_product_id]);
    }

    public function is_import_product_running($supplier_product_id)
    {
        wp_cache_flush();
        $option_name = 'ci_import_' . $this->key . '_product' . $supplier_product_id . '_running';
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
        $seconds_elapsed = $this->seconds_since_last_ping();
        return $seconds_elapsed > 60 * 1;
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
        $stalled = false;
        update_option($this->cancel_flag, true);

        if ($is_import_scheduled) {
            $this->unschedule_import();
        }

        if ($is_import_running) {
            $stalled = $this->is_import_stalled();
            update_option($this->cancel_flag, true);
            if ($stalled) {
                $this->set_is_import_running(false);
            }
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
        return (bool) wp_next_scheduled('ci_import_products_page', [$this->key]);
        // return (bool) wp_next_scheduled('ci_import_supplier_products_page', [$this->key]);
    }

    public function schedule_import()
    {
        return wp_schedule_single_event(time() + 1, 'ci_import_products_page', [$this->key]);
        // return wp_schedule_single_event(time() + 1, 'ci_import_supplier_products_page', [$this->key]);
    }

    public function unschedule_import()
    {
        return wp_clear_scheduled_hook('ci_import_products_page', [$this->key]);
        // return wp_clear_scheduled_hook('ci_import_supplier_products_page', [$this->key]);
    }

    private array $empty_report = [
        'products_count' => 0,
        'processed' => 0,
        'delete' => 0,
        'update' => 0,
        'ignore' => 0,
        'insert' => 0,
        'error' => 0,
        'cursor' => '',
        'page_size' => 0,
    ];

    public function clear_import_report()
    {
        update_option($this->cancel_flag, false);
        update_option($this->import_report, $this->empty_report);
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

}
