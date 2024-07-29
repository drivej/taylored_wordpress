<?php
/*

https://www.wps-inc.com/data-depot/v4/api/introduction

// TODO: incliude WPS tags as Woo tags - currently they're in early development

 */
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/wps/Supplier_WPS_API.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/wps/Supplier_WPS_Cronjob.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/wps/Supplier_WPS_Background_Process.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/wps/Supplier_WPS_Brands.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Timer.php';

class Supplier_WPS extends Supplier
{
    use Supplier_WPS_API;
    use Supplier_WPS_Cronjob;
    use Supplier_WPS_Brands;
    /**
     * The single instance of the class.
     *
     * @var Supplier_WPS
     * @since 2.1
     */
    protected static $_instance = null;

    private string $import_hook_name = '';
    private string $import_hook_loop_name = '';
    private string $import_hook_init_name = '';
    private string $import_option_name = '';
    private string $default_updated_at = '2023-01-01';

    public function __construct()
    {
        parent::__construct([
            'key' => 'wps',
            'name' => 'Western Power Sports',
            'supplierClass' => 'WooDropship\\Suppliers\\Western',
            'import_version' => '0.4',
        ]);
        $this->background_process = new Supplier_WPS_Background_Process($this, $this->key);
        $this->deep_debug = false;
        $this->import_hook_init_name = "{$this->key}_import_products_init_action";
        $this->import_hook_name = "{$this->key}_import_products_page_action";
        $this->import_option_name = "import_status_{$this->key}";

        add_action($this->import_hook_init_name, [$this, 'import_hook_init_action'], 10);
        add_action($this->import_hook_loop_name, [$this, 'import_loop'], 10);
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

    public function update_loop_product($woo_product)
    {
        $should_update = $this->should_update_single_product($woo_product);
        return ['should_update' => $should_update];

        $update_plp = $woo_product->get_meta('_ci_update_plp', true);
        $should_update = !(bool) $update_plp;

        if ($update_plp) {
            $age = $update_plp ? WooTools::get_age($update_plp, 'hours') : 99999;
            $max_age = 24 * 7;
            $should_update = $age > $max_age;
        }
        $sku = $woo_product->get_sku();
        error_log('sku=' . $sku . '-------------------->>>>>');

        // $needs_update = $this->product_needs_update($woo_product);
        // $has_images = WooTools::has_images($woo_product);

        if ($should_update) {
            // TODO: check if product exists
            $supplier_product_id = $woo_product->get_meta('_ci_product_id', true);
            $supplier_product = $this->get_product($supplier_product_id);
            $is_available = $this->is_available($supplier_product);

            if (!$is_available) {
                $woo_product->delete();
                return true;
            } else {
                $this->update_product_images($woo_product, $supplier_product);
                // $this->import_product($supplier_product_id);
                $woo_id = $woo_product->get_id();
                update_post_meta($woo_id, '_last_updated', gmdate("c"));
                update_post_meta($woo_id, '_ci_update_plp', gmdate("c"));
                // clean_post_cache($product_id);
                return true;
            }
        }
        return false;
    }

    public function update_single_product($woo_product)
    {
        $should_update = $this->should_update_single_product($woo_product);
        return ['should_update' => $should_update];

        $needs_update = $this->product_needs_update($woo_product);

        if ($needs_update) {
            $supplier_product_id = $woo_product->get_meta('_ci_product_id', true);
            $result = $this->import_product($supplier_product_id);
            $product_id = $woo_product->get_id();
            update_post_meta($product_id, '_last_updated', gmdate("c"));
            // clean_post_cache($product_id);
            return $result;
        }
        $age = WooTools::get_product_age($woo_product);
        return ['updated' => false, 'age' => $age, 'reason' => 'does not need update'];
    }

    public function start_import_products()
    {
        $result = [];
        $result = $this->get_import_status();

        if ($result['is_stalled']) {
            $result['error'] = 'import stalled';
        }

        if ($result['is_running']) {
            $result['error'] = 'import running';
        }

        if ($result['is_scheduled']) {
            $result['error'] = 'import scheduled';
        }

        if (isset($result['error'])) {
            return $result;
        }

        $should_schedule_import = true;

        // if (!$result['is_stopped'] && $result['started_hours_ago'] < 48) {
        //     $should_schedule_import = false;
        //     $result['error'] = 'started ' . $result['started_hours_ago'] . ' hours ago';
        // }

        if ($should_schedule_import) {
            $updated = $result['last_started']->format('Y-m-d'); // updated since
            $products_count = $this->get_products_count($updated);
            $result['report'] = $this->update_import_report([
                'processed' => 0,
                'delete' => 0,
                'update' => 0,
                'ignore' => 0,
                'insert' => 0,
                'patched' => 0,
                'error' => '',
                'updated' => $updated,
                'products_count' => $products_count,
                'cursor' => '',
                'started' => gmdate("c"),
                'stopped' => '',
                'page_size' => 100,
            ]);
            $result['scheduled'] = $this->schedule_import();
        }
        $result['should_schedule_import'] = $should_schedule_import;
        return $result;
    }

    private function time_until($timestamp)
    {
        $current_timestamp = time();
        // $time_difference = $timestamp - $current_timestamp;
        $time_difference = abs($timestamp - $current_timestamp);
        $days = floor($time_difference / 86400);
        $hours = floor(($time_difference % 86400) / 3600);
        $minutes = floor(($time_difference % 3600) / 60);
        $seconds = $time_difference % 60;
        $until = sprintf("%dd %02dh %02dm %02ds", $days, $hours, $minutes, $seconds);
        return $until;
    }

    protected function get_default_info()
    {
        return [
            'prev_cursor' => false,
            'cursor' => '',
            'updated_at' => $this->default_updated_at,
            'size' => 25,
            'running' => false,
            'attempt' => 0,
            'status' => 'idle',
            'stopping' => false,
            'started' => gmdate("c"),
            'tag' => gmdate("c"),
            'processed' => 0,
            'total_products' => 0,
        ];
    }

    // this kicks off the big import each week
    public function init_import()
    {
        // create weekely import event
        $next_scheduled = wp_next_scheduled($this->import_hook_init_name);
        if ($next_scheduled) {
            // error_log('init_import() - already scheduled ' . $this->time_until($next_scheduled));
        } else {
            error_log('init_import() - create scheduled event');
            wp_schedule_event(time(), 'weekly', $this->import_hook_init_name);
        }
    }

    public function is_importing()
    {
        $next_scheduled = wp_next_scheduled($this->import_hook_loop_name);
        if ($next_scheduled) {
            return true;
        }
        $info = $this->get_import_info();
        return $info['running'];
    }

    public function import_hook_init_action()
    {
        // run weekly import action
        error_log('import_hook_init_action()');
        $info = get_option($this->import_option_name, $this->get_default_info());
        $info['tag'] = gmdate("c");
        $info['size'] = 25;
        $info['total_products'] = $this->get_products_count();
        // get the first page and cursor
        $items = $this->import_products_page('', $info['size']);
        $ids = is_array($items['data']) ? array_map(fn($item) => $item['id'], $items['data']) : [];
        $next_cursor = is_string($items['meta']['cursor']['next']) && strlen($items['meta']['cursor']['next']) ? $items['meta']['cursor']['next'] : false;
        error_log('import_hook_init_action() - ' . json_encode($ids));

        if ($next_cursor) {
            $info['cursor'] = $next_cursor;
            update_option($this->import_option_name, $info);
            wp_schedule_single_event(time() + 5, $this->import_hook_loop_name);
        } else {
            error_log('import_hook_init_action() - failed');
        }
        return $info;
    }

    public function import_loop()
    {
        $info = $this->get_import_info();
        $next_cursor = false;
        $ids = [];
        $info['running'] = true;
        update_option($this->import_option_name, $info);

        try {
            $items = $this->import_products_page($info['cursor'], $info['size']);
            $ids = is_array($items['data']) ? array_map(fn($item) => $item['id'], $items['data']) : [];
            $next_cursor = is_string($items['meta']['cursor']['next']) && strlen($items['meta']['cursor']['next']) ? $items['meta']['cursor']['next'] : false;
            error_log('import_loop() - ' . $info['cursor'] . ' ' . json_encode($ids));
        } catch (Exception $e) {
            error_log('import_loop() - Error processing ' . $info['cursor']);
            return;
        }
        $info = $this->get_import_info();
        $info['running'] = false;
        $info['processed'] += count($ids);

        if ($info['stopping']) {
            error_log('import_loop() - stopped');
        } else if ($next_cursor) {
            $info['cursor'] = $next_cursor;
            $next = wp_schedule_single_event(time(), $this->import_hook_loop_name);
            error_log('import_loop() - schedule next ' . $next);
        } else {
            error_log('import_loop() - failed/ended');
        }
        update_option($this->import_option_name, $info);
    }

    public function start_import()
    {
        // check if import is scheduled
        $is_scheduled = (bool) wp_next_scheduled($this->import_hook_name);
        $schedule = -1;

        if ($is_scheduled) {
            $message = 'busy';
        } else {
            $info = get_option($this->import_option_name, $this->get_default_info());
            $is_running = $info['running'] === true;

            // check if import is running
            if ($is_running) {
                $age = WooTools::get_age($info['started'], 'seconds');
                if ($age > 30) {
                    $info['attempt']++;
                    if ($info['attempt'] < 2) {
                        update_option($this->import_option_name, $info);
                        $message = 'start_import() - attempt ' . $info['attempt'];
                        // return ['error' => 'import is running'];
                    } else {
                        $info['status'] = 'stalled';
                        update_option($this->import_option_name, $this->get_default_info());
                        $message = 'start_import() - stalled';
                        // return ['error' => 'import is running'];
                    }
                } else {
                    $message = 'start_import() - stand by';
                    // return ['error' => 'import is running'];
                }
            } else {
                if ($info['cursor'] === false) {
                    update_option($this->import_option_name, $this->get_default_info());
                    $schedule = wp_schedule_single_event(time(), $this->import_hook_name);
                    $message = 'start_import() - new import';
                } else {
                    $info['stopping'] = false;
                    update_option($this->import_option_name, $info);
                    $schedule = wp_schedule_single_event(time(), $this->import_hook_name);
                    $message = 'start_import() - continue import';
                }
            }
        }
        return ['message' => $message, 'schedule' => $schedule];
    }

    public function import_hook_action()
    {
        // $GLOBALS['wp_object_cache']->delete($this->import_option_name, 'options');
        wp_cache_delete($this->import_option_name, 'options');
        $info = get_option($this->import_option_name);

        if ($info['stopping'] === true) {
            error_log('import_hook_action() - stopping');
            return;
        }
        error_log('START import_hook_action() cursor:' . $info['cursor']);
        $info['running'] = true;
        // $info['stopping'] = false;
        $info['started'] = gmdate("c");
        $info['age'] = 0;
        $info['size'] = is_int($info['size']) ? $info['size'] : 1;
        update_option($this->import_option_name, $info);

        if ($info && is_string($info['cursor']) && $info['size']) {
            //
            $items = $this->import_products_page($info['cursor'], $info['size']);

            wp_cache_delete($this->import_option_name, 'options');
            $info = get_option($this->import_option_name);

            if (!is_countable($items['data'])) {
                error_log('bad data');
                error_log(json_encode($items, JSON_PRETTY_PRINT));
                return;
            }
            $ids = array_map(fn($item) => $item['id'], $items['data']);
            error_log(json_encode($ids));
            $info['processed'] += count($items['data']);
            $next_cursor = is_string($items['meta']['cursor']['next']) && strlen($items['meta']['cursor']['next']) ? $items['meta']['cursor']['next'] : false;

            if ($next_cursor) {
                if ($next_cursor === $info['prev_cursor']) {
                    error_log('next cursor is same?? next_cursor=' . $next_cursor . ' cursor=' . $info['cursor']);
                    $info['stopping'] = true;
                } else {
                    $info['prev_cursor'] = $info['cursor'];
                }
            }
            $info['cursor'] = $next_cursor;
            $info['running'] = false;
            update_option($this->import_option_name, $info);
            $this->start_import();
        } else {
            $info['running'] = false;
            update_option($this->import_option_name, $info);
            error_log('import_hook_action() - bad info');
            // error_log(json_encode(['error' => '123', 'info' => $info], JSON_PRETTY_PRINT));
        }
        // $info['running'] = false;
        // update_option($this->import_option_name, $info);
        // error_log('import_hook_action() - END');
    }

    public function continue_import()
    {
        $info = $this->get_import_info();
        $info['stopping'] = false;
        update_option($this->import_option_name, $info);
        $this->import_loop();
        return $info;
    }

    public function reset_import()
    {
        update_option($this->import_option_name, $this->get_default_info());
        return get_option($this->import_option_name);
    }

    public function check_import()
    {
        // error_log('check_import()');
        $is_scheduled = (bool) wp_next_scheduled($this->import_hook_name);

        if (!$is_scheduled) {
            $info = get_option($this->import_option_name, $this->get_default_info());
            $is_running = $info['running'] === true;

            if ($is_running) {
                $age = WooTools::get_age($info['started'], 'seconds');
                if ($age > 30) {
                    $info['attempt']++;
                    if ($info['attempt'] < 2) {
                        update_option($this->import_option_name, $info);
                        error_log('check_import() - attempt ' . $info['attempt']);
                    } else {
                        $info['status'] = 'stalled';
                        update_option($this->import_option_name, $this->get_default_info());
                        error_log('check_import() - stalled');
                    }
                }
            } else {
                if ($info['cursor'] === false) {
                    update_option($this->import_option_name, $this->get_default_info());
                    error_log('check_import() - completed');
                } else {
                    error_log('check_import() - schedule update');
                    wp_schedule_single_event(time(), $this->import_hook_name);
                }
            }
        }
    }

    public function get_import_info()
    {
        // $GLOBALS['wp_object_cache']->delete($this->import_option_name, 'options');
        wp_cache_delete($this->import_option_name, 'options');
        $info = get_option($this->import_option_name);
        $info['is_scheduled'] = wp_next_scheduled($this->import_hook_name);
        $date = strtotime($info['started']);
        $info['age'] = $this->time_until($date);
        // $info['age'] = WooTools::get_age($info['started'], 'seconds') . 's';
        return $info;
    }

    public function stop_import()
    {
        wp_cache_delete($this->import_option_name, 'options');
        $info = $this->get_import_info();

        if ($info['running']) {
            $age = WooTools::get_age($info['started'], 'minutes');
            if ($age > 5) {
                // stalled
                $info = $this->get_default_info();
                update_option($this->import_option_name, $info);
            } else {
                $info['stopping'] = true;
                $info['updated'] = gmdate("c");
                update_option($this->import_option_name, $info);
            }
        }

        if ($info['is_scheduled']) {
            wp_unschedule_event($info['is_scheduled'], $this->import_hook_name);
        }

        return $info;
    }

    public function import_next_products_page()
    {
        // error_log('import_next_products_page()');
        // $GLOBALS['wp_object_cache']->delete($this->import_option_name, 'options');
        $info = get_option($this->import_option_name);
        return $info;

        $is_scheduled = (bool) wp_next_scheduled($this->import_hook_name);
        $is_running = $info['running'] === true;
        $scheduled = false;

        if (!$is_scheduled) {
            $scheduled = wp_schedule_single_event(time(), $this->import_hook_name, []);
        }
        /*
        if ($is_scheduled) {
        error_log('scheduled: skip');
        } else {
        if ($is_running) {
        $age = WooTools::get_age($info['started'], 'seconds');
        if ($age > 60) {
        error_log('stalled: restart');
        $info['started'] = gmdate("c");
        update_option($this->import_option_name, $info);
        $scheduled = wp_schedule_single_event(time(), $this->import_hook_name);
        } else {
        error_log('running: skip');
        }
        } else {
        error_log('schedule import');
        $scheduled = wp_schedule_single_event(time(), $this->import_hook_name);
        }
        }
         */
        return [
            'scheduled' => $scheduled,
            'import_hook_name' => $this->import_hook_name,
            'is_scheduled' => $is_scheduled,
            'is_running' => $is_running,
            'has_action' => has_action($this->import_hook_name),
            // 'age' => $age,
            'info' => $info,
        ];
    }

    // $option_name = "import_status_{$this->key}";
    // $GLOBALS['wp_object_cache']->delete($option_name, 'options');
    // $info = get_option($option_name, [
    //     'cursor' => '',
    //     'size' => 1,
    //     'running' => false,
    // ]);
    // // find reasons to quit
    // if ($info['running']) {
    //     if ($info['started']) {
    //         if ($info['cursor'] || $info['cursor'] === '') {
    //             $age = WooTools::get_age($info['started'], 'minutes');
    //             if ($age < 2) {
    //                 $info['age'] = $age;
    //                 $info['status'] = 'ignored';
    //                 return $info;
    //             } else {
    //                 $info['status'] = 'aborted';
    //                 $info['cursor'] = '';
    //             }
    //         } else {
    //             $info['status'] = 'aborted';
    //             $info['cursor'] = '';
    //         }
    //     }
    // }
    // $info['running'] = true;
    // $info['started'] = gmdate("c");
    // return $info;
    // $info = update_option($option_name, $info);
    // if ($info['cursor'] || $info['cursor'] === '') {
    //     $items = $this->import_products_page($info['cursor'], $info['size']);
    //     try {
    //         $info['cursor'] = $items['meta']['cursor']['next'] ?? false;
    //     } catch (Exception $e) {
    //         $info['cursor'] = false;
    //     }
    // }
    // $info['running'] = false;
    // $info = update_option($option_name, $info);
    // return $info;
    // }

    public function import_product($supplier_product_id)
    {
        $params = [
            'include' => implode(',', [
                'features', //
                // 'tags',
                // 'attributekeys',
                // 'attributevalues',
                // 'items',
                'items.images',
                // 'features.item',
                // 'items.inventory',
                'items.attributevalues',
                'items.taxonomyterms',
                // 'taxonomyterms',
                'items:filter(status_id|NLA|ne)',
            ]),
        ];
        // $item = $this->get_api('/products', $params);
        $items = $this->get_api("/products/{$supplier_product_id}", $params);
        $items['data'] = [$items['data']];
        $items = $this->process_items_native($items);
        return $items;
    }

    public function import_products_page($cursor = '', $size = 25, $updated_at = null)
    {
        $updated_at = $updated_at ?? $this->default_updated_at;
        error_log("import_products_page(" . json_encode($cursor) . ", {$size}, {$updated_at})");

        $items = $this->process_items_load($cursor, $size, $updated_at);
        // $items = $this->process_items_declutter($items);
        $items = $this->process_items_native($items);

        return $items;

        // $items = $this->process_items_format($items);
        // $items = $this->process_items_filter($items);
        // $items = $this->process_items_sync($items);
        // $items = $this->process_items_test($items);

        // return $items;
    }

    private function process_items_load($cursor, $size = 10, $updated_at = null)
    {
        $updated_at = $updated_at ?? $this->default_updated_at;
        $params = [
            'include' => implode(',', [
                'features', //
                // 'tags',
                // 'attributekeys',
                // 'attributevalues',
                // 'items',
                'items.images',
                // 'features.item',
                // 'items.inventory',
                'items.attributevalues',
                'items.taxonomyterms',
                // 'taxonomyterms',
                'items:filter(status_id|NLA|ne)',
            ]),
            'filter' => ['updated_at' => ['gt' => $updated_at]],
            'page' => ['cursor' => $cursor, 'size' => $size],
        ];
        $items = $this->get_api('/products', $params);
        return $items;

        if (!isset($items['data']) || !WooTools::is_valid_array($items['data'])) {
            return ['data' => [], 'meta' => []];
        }
        $items['meta']['total'] = count($items['data']);
        return $items;
    }

    private function process_items_format($items)
    {
        if (!WooTools::is_valid_array($items['data'])) {
            return $items;
        }
        // master lookups
        $items['meta']['skus'] = [];
        $items['meta']['post_names'] = [];
        $items['meta']['images'] = [];
        $items['meta']['attachments'] = [];

        foreach ($items['data'] as $i => &$product) {
            $product = ['meta' => [], 'data' => $product];
            $supplier_product_id = $product['data']['id'];
            $product['meta']['woo_id'] = 0;
            $product['meta']['sku'] = $this->get_product_sku($supplier_product_id);
            $product['meta']['product_type'] = $this->get_product_type($product);
            $product['meta']['post'] = [];
            $product['meta']['metadata'] = [];
            $product['meta']['is_available'] = $this->is_available($product);
            $product['meta']['title'] = $this->get_product_name($product);
            $product['meta']['slug'] = $this->build_product_slug($supplier_product_id, $product['meta']['title']);
            $product['meta']['slug_search'] = '-' . $this->build_product_slug($supplier_product_id);
            $product['meta']['price'] = $this->get_product_price($product);
            $product['meta']['images'] = [];
            $product['meta']['image'] = 0;
            $product['meta']['prices'] = []; //array_map([$this, 'get_item_price'], $product['data']['items']['data']);
            $product['meta']['attributes'] = [];
            $product['meta']['product_cats'] = [];
            $product['meta']['product_tags'] = [];
            $product['meta']['variations'] = [];
            // master lookups
            $items['meta']['skus'][] = $product['meta']['sku'];
            $items['meta']['post_names'][] = $product['meta']['slug_search'];

            foreach ($product['data']['items']['data'] as &$variation) {
                $supplier_variation_id = $variation['id'];
                $variation['meta'] = [];
                $variation['meta']['woo_id'] = 0;
                $variation['meta']['sku'] = $this->get_variation_sku($supplier_product_id, $supplier_variation_id);
                $variation['meta']['product_type'] = 'variation';
                $variation['meta']['post'] = [];
                $variation['meta']['metadata'] = [];
                $variation['meta']['name'] = ucwords(strtolower($variation['name']));
                $variation['meta']['price'] = $this->get_item_price($variation);
                $variation['meta']['slug'] = $this->build_product_slug($supplier_product_id, $variation['meta']['name'], $supplier_variation_id);
                $variation['meta']['slug_search'] = '-' . $this->build_product_slug($supplier_product_id, null, $supplier_variation_id);
                $variation['meta']['images'] = $this->get_item_images($variation, 500);
                $variation['meta']['image'] = $this->resize_image($variation['meta']['images'][0] ?? 0, 500); //count($variation['meta']['images']) ? $variation['meta']['images'][0] : 0;
                $product['meta']['prices'][] = $variation['meta']['price'];
                // $product['meta']['variations'][] = $variation['meta'];
                $product['meta']['images'] = array_merge($product['meta']['images'], $variation['meta']['images']);
                // master lookups
                $items['meta']['skus'][] = $variation['meta']['sku'];
                $items['meta']['post_names'][] = $variation['meta']['slug_search'];
                $items['meta']['images'] = array_merge($items['meta']['images'], $variation['meta']['images']);
                $items['meta']['attachments'] = array_merge($items['meta']['attachments'], array_map(fn($img) => $this->convert_image_to_attachment_data($img), $variation['images']['data'] ?? []));
                // $items['meta']['attachments'] = array_merge($items['meta']['attachments'], $variation['images']['data']);
            }
            // need to gather images from items first
            $product['meta']['image'] = $this->resize_image($product['meta']['images'][0] ?? 0, 500); //count($product['meta']['images']) ? $product['meta']['images'][0] : 0;
            unset($product['meta']['images']);
            $product['meta']['prices'] = array_unique($product['meta']['prices']);
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

    private function process_items_filter($items)
    {
        $items['data'] = array_filter($items['data'], [$this, 'is_available']);
        $items['meta']['available'] = count($items['data']);
        return $items;
    }

    private function process_items_sync($items)
    {
        $lookup_attachment = WooTools::attachment_data_to_postids($items['meta']['attachments']);
        $items['meta']['lookup_attachment'] = $lookup_attachment;

        $skus = $items['meta']['skus']; //array_map(fn($item) => $item['meta']['sku'], $items['data']);
        $lookup_woo_id = WooTools::lookup_woo_ids_by_skus($skus);

        $woo_ids = array_values($lookup_woo_id);
        $meta_tags_lookup = WooTools::get_metas($woo_ids, ['_ci_update_plp', '_ci_update_pdp', '_ci_import_version', '_thumbnail_id']);

        $post_names = $items['meta']['post_names'];
        $lookup_woo_id_by_name = WooTools::lookup_woo_ids_by_name($post_names);

        $items['meta']['lookup_woo_id'] = $lookup_woo_id;
        $items['meta']['lookup_woo_id_by_name'] = $lookup_woo_id_by_name;
        $items['meta']['posts'] = [];
        $items['meta']['variations_posts'] = [];
        $items['meta']['metadata'] = [];
        $items['meta']['slugs'] = [];
        $items['meta']['product_cat_slugs'] = [];
        $items['meta']['delete_products'] = [];

        foreach ($items['data'] as &$product) {
            $product_id = $product['data']['id'];
            $is_available = $this->is_available($product);
            $stock_status = $is_available ? 'instock' : 'outofstock';
            $sku = $product['meta']['sku'];
            $slug = $product['meta']['slug'];
            $woo_id = isset($lookup_woo_id[$sku]) ? $lookup_woo_id[$sku] : (isset($lookup_woo_id_by_name[$slug]) ? $lookup_woo_id_by_name[$slug] : 0);

            if ($is_available) {
                $metatags = isset($meta_tags_lookup[$woo_id]) ? $meta_tags_lookup[$woo_id] : [];
                $is_simple = count($product['data']['items']['data']) === 1;

                $product['meta']['metatags'] = $metatags;
                $product['meta']['woo_id'] = $woo_id;
                $product['meta']['is_available'] = $is_available;
                $product['meta']['metadata']['_sku'] = $sku;
                $product['meta']['metadata']['_ci_product_id'] = $product_id;
                $product['meta']['metadata']['_thumbnail_id'] = $items['meta']['lookup_attachment'][$product['meta']['image']];
                $product['meta']['metadata']['_price'] = $product['meta']['prices'][0] ?? 0;
                $product['meta']['metadata']['_regular_price'] = $product['meta']['prices'][0] ?? 0;
                $product['meta']['metadata']['_product_type'] = $is_simple ? 'simple' : 'variable';
                $product['meta']['metadata']['_stock_status'] = $stock_status;
                $product['meta']['tags'] = []; // TODO: kill this

                $items['meta']['slugs'][] = $slug;

                if ($is_simple) {
                    //
                } else {
                    foreach ($product['data']['items']['data'] as $i => &$variation) {
                        $variation_id = $variation['id'];
                        $variation_sku = $variation['meta']['sku'];
                        $variation_slug = $variation['meta']['slug'];
                        $variation['meta']['attributes'] = [];
                        $variation_woo_id = isset($lookup_woo_id[$variation_sku]) ? $lookup_woo_id[$variation_sku] : (isset($lookup_woo_id_by_name[$variation_slug]) ? $lookup_woo_id_by_name[$variation_slug] : 0);
                        $variation['meta']['woo_id'] = $variation_woo_id;

                        $items['meta']['slugs'][] = $variation_slug;

                        $term_name = $variation['product_type'];
                        $term_slug = sanitize_title($variation['product_type']);

                        // Terms: product_cats
                        $product['meta']['tags'][$term_slug] = ['id' => 0, 'slug' => $term_slug, 'name' => $term_name];

                        $items['meta']['product_cat_slugs'][$term_slug] = 0;

                        foreach ($variation['taxonomyterms']['data'] ?? [] as $term) {
                            $term_name = $term['name'];
                            $term_slug = sanitize_title($term['slug']);
                            $product['meta']['tags'][$term_slug] = ['id' => 0, 'slug' => $term_slug, 'name' => $term_name];
                            $items['meta']['product_cat_slugs'][$term_slug] = 0;

                            $product['meta']['product_cats'][$term_slug] = $term_name;
                        }

                        $variation['meta']['post']['post_parent'] = 0;
                        $variation['meta']['post']['post_title'] = $variation['meta']['name'];
                        $variation['meta']['post']['post_excerpt'] = $this->get_short_description($product);
                        $variation['meta']['post']['post_name'] = $variation_slug;
                        $variation['meta']['post']['post_content'] = $this->get_description($product);
                        $variation['meta']['post']['guid'] = home_url() . "/product/{$variation_slug}";
                        $variation['meta']['post']['post_type'] = 'product_variation';
                        $variation['meta']['post']['menu_order'] = $i + 1;
                        $variation['meta']['post']['comment_status'] = 'closed';

                        $variation['meta']['metadata']['_sku'] = $variation_sku;
                        $variation['meta']['metadata']['_stock_status'] = $stock_status;
                        $variation['meta']['metadata']['_ci_product_id'] = $variation_id;
                        $variation['meta']['metadata']['_regular_price'] = $variation['meta']['price'];
                        $variation['meta']['metadata']['_price'] = $variation['meta']['price'];
                        $variation['meta']['metadata']['_thumbnail_id'] = $items['meta']['lookup_attachment'][$variation['meta']['image']];

                        if (!$variation_woo_id) {
                        } else {
                            // update variation
                            if (!$is_available) {
                                $variation['meta']['metadata']['_stock_status'] = $stock_status;
                            }
                        }

                        if ($product['meta']['product_type'] === 'variable') {
                            $attributekeys = $product['data']['attributekeys']['data'] ?? [];
                            if (count($attributekeys)) {
                                // seems like we have real facets
                                error_log('real attributes ' . $product_id);
                            } else {
                                // No meanigful attributes are available -> we have to use sku as a facet - this is ridiculous
                                $attributekeys[] = [];
                                $attr_name = sanitize_title('SKU');
                                $attr_slug = sanitize_title($attr_name);
                                $attr_value = $variation['sku'];
                                $attr_key = "attribute_{$attr_slug}";

                                if (!$product['meta']['attributes'][$attr_slug]) {
                                    $product['meta']['attributes'][$attr_slug] = ['name' => $attr_name, 'options' => []];
                                }
                                $product['meta']['attributes'][$attr_slug]['options'][] = $attr_value;
                                $variation['meta']['attributes'][$attr_slug] = $attr_value;
                                $variation['meta']['metadata'][$attr_key] = $attr_value;
                            }
                        }

                        $product['meta']['variations'][] = $variation['meta'];
                    }
                }

                $product['meta']['post']['post_parent'] = 0;
                $product['meta']['post']['post_title'] = $product['meta']['title'];
                $product['meta']['post']['post_name'] = $product['meta']['slug'];
                $product['meta']['post']['post_content'] = $this->get_description($product);
                $product['meta']['post']['guid'] = home_url() . "/product/{$product['meta']['slug']}";
                $product['meta']['post']['post_type'] = 'product';

                if ($product['meta']['product_type'] === 'variable') {
                    foreach ($product['meta']['attributes'] as $attr_slug => &$attr) {
                        $attr['value'] = implode(' | ', array_unique($attr['options']));
                        $attr['position'] = 0;
                        $attr['is_visible'] = 1;
                        $attr['is_variation'] = 1;
                        $attr['is_taxonomy'] = 0;
                        unset($attr['options']);
                    }
                    // $attributes = [];
                    // foreach ($product['meta']['attributes'] as $attr_slug => $attr) {
                    //     $attributes[$attr_slug] = [
                    //         'name' => $attr['name'],
                    //         'value' => implode(' | ', array_unique($attr['options'])),
                    //         'position' => 0,
                    //         'is_visible' => 1,
                    //         'is_variation' => 1,
                    //         'is_taxonomy' => 0,
                    //     ];
                    // }

                    $product['meta']['metadata']['_product_attributes'] = serialize($product['meta']['attributes']);
                    $product['meta']['metadata']['_stock_status'] = 'outofstock'; // TODO: alert
                }
            } else {
                if ($woo_id) {
                    // delete post
                    $items['meta']['delete_products'] = [$woo_id];
                }
            }
        }

        // $SAVE_DATA = false;
        $DEBUG_MODE = false;
        $dummy_woo_id = 100;
        $lookup_product = [];
        $lookup_variation = [];

        // $items['meta']['save'] = $SAVE_DATA;

        // Terms: find/create product_cat
        $found = get_terms(['slug' => array_keys($items['meta']['product_cat_slugs']), 'taxonomy' => 'product_cat', 'hide_empty' => false]);
        unset($items['meta']['product_cat_slugs']);
        $lookup_term = array_column($found, 'term_id', 'slug');
        $items['meta']['lookup_term'] = $lookup_term;

        // gather all new products
        $product_posts = [];
        foreach ($items['data'] as &$product) {
            if (!$product['meta']['woo_id']) {
                if (count($product['meta']['post'])) {
                    $product_posts[] = $product['meta']['post'];
                }
                if ($DEBUG_MODE) {
                    $lookup_product[$product['meta']['slug']] = $dummy_woo_id++;
                }
            }
        }
        // add new products
        if (!$DEBUG_MODE) {
            $lookup_product = WooTools::insert_unique_posts($product_posts);
        }
        $items['meta']['product_posts'] = $product_posts;
        $items['meta']['lookup_product'] = $lookup_product;

        // gather all the metadata
        $variation_posts = [];
        $hydrated_metadata = [];

        foreach ($items['data'] as &$product) {
            // assign woo_id to each product
            if (!$product['meta']['woo_id']) {
                $product['meta']['action'] = 'insert';
                $product['meta']['woo_id'] = $lookup_product[$product['meta']['slug']] ?? 0;
            } else {
                $product['meta']['action'] = 'update';
            }
            foreach ($product['meta']['variations'] as &$variation) {
                $variation['post']['post_parent'] = $product['meta']['woo_id'];
                if (!$variation['woo_id']) {
                    if (count($variation['post'])) {
                        $variation_posts[] = $variation['post'];
                    }
                    if ($DEBUG_MODE) {
                        $lookup_variation[$variation['slug']] = $dummy_woo_id++;
                    }
                }
            }
        }

        WooTools::delete_edit_locks();

        if (!$DEBUG_MODE) {
            $lookup_variation = WooTools::insert_unique_posts($variation_posts);
        }
        $items['meta']['variation_posts'] = $variation_posts;
        $items['meta']['lookup_variation'] = $lookup_variation;

        foreach ($items['data'] as $product) {
            foreach ($product['meta']['variations'] as &$variation) {
                // assign woo_id to each variation
                if (!$variation['woo_id']) {
                    $variation['action'] = 'insert';
                    $variation['woo_id'] = $lookup_variation[$variation['slug']] ?? 0;
                } else {
                    $variation['action'] = 'update';
                }
            }
        }

        $hydrated_metadata = [];
        // $hydrated_variation_metadata = [];

        // $test = [];

        foreach ($items['data'] as $product) {
            // $test[] = [
            //     'post_id' => $product['meta']['woo_id'],
            //     'metadata' => $product['meta']['metadata'],
            // ];
            array_push($hydrated_metadata, ...WooTools::hydrate_metadata($product['meta']['woo_id'], $product['meta']['metadata']));
            // $hydrated_metadata = array_merge($hydrated_metadata, WooTools::hydrate_metadata($product['meta']['woo_id'], $product['meta']['metadata']));
            // if ($product['meta']['action'] === 'insert') {
            array_push($hydrated_metadata, ...WooTools::hydrate_metadata($product['meta']['woo_id'], $this->get_base_metadata()));
            // }
            foreach ($product['meta']['variations'] as $variation) {
                // $test[] = [
                //     'post_id' => $variation['woo_id'],
                //     'metadata' => $variation['metadata'],
                // ];
                array_push($hydrated_metadata, ...WooTools::hydrate_metadata($variation['woo_id'], $variation['metadata']));
                // if ($variation['action'] === 'insert') {
                array_push($hydrated_metadata, ...WooTools::hydrate_metadata($variation['woo_id'], $this->get_base_metadata()));
                // }
            }
        }

        foreach ($hydrated_metadata as &$meta) {
            $success = update_metadata('post', $meta['post_id'], $meta['meta_key'], $meta['meta_value']);
            $meta['saved'] = $success;
        }
        // return $hydrated_metadata;

        // foreach ($test as $a) {
        //     foreach ($a['metadata'] as $k => $v) {
        //         $success = update_post_meta($a['post_id'], $k, $v);
        //         // update_metadata( 'post', $a['post_id'], $meta_key, $meta_value, $prev_value = '' )
        //         error_log(implode(' | ', [$success ? 'success' : 'fail', $a['post_id'], $k, $v]));
        //     }
        // }
        $items['meta']['hydrated_metadata'] = $hydrated_metadata;
        // $items['meta']['hydrated_variation_metadata'] = $hydrated_variation_metadata;

        if (!$DEBUG_MODE) {
            $items['meta']['metadata_result'] = WooTools::insert_unique_metas($hydrated_metadata);
            // $items['meta']['variation_metadata_result'] = WooTools::insert_unique_metas($hydrated_variation_metadata);
        }

        $product_lookups = [];
        foreach ($items['data'] as $product) {
            $product_lookups[] = [
                'product_id' => $product['meta']['woo_id'],
                'sku' => $product['meta']['metadata']['_sku'],
                'price' => $product['meta']['metadata']['_price'],
                // 'virtual'] ?? 0;
                // 'downloadable'] ?? 0;
                // 'min_price'] ?? $meta['price'] ?? 0;
                // 'max_price'] ?? $meta['price'] ?? 0;
                // 'onsale'] ?? 0;
                // 'stock_quantity'] ?? 100;
                // 'stock_status'] ?? 'instock';
                // 'rating_count'] ?? 0;
                // 'average_rating'] ?? 0;
                // 'total_sales'] ?? 0;
            ];
        }

        WooTools::insert_product_meta_lookup($product_lookups);
        $items['meta']['delete_products_result'] = WooTools::delete_products($items['meta']['delete_products']);

        // return $test;
        return $items;
    }

    private function process_items_test($items)
    {
        $types = [];
        foreach ($items['data'] as &$product) {
            $woo_id = $product['meta']['woo_id'];
            $woo_product = wc_get_product_object('variable', $woo_id);
            $product_type = $woo_product->get_type();
            $woo_product->save();
            // set_type
            $types[$woo_id] = ['type' => $product_type, 'children' => $woo_product->get_children()];
        }
        return $types;
    }

    private function process_items_declutter($items)
    {
        // declutter unused properties
        WooTools::deep_unset_key($items, 'created_at');
        WooTools::deep_unset_key($items, 'updated_at');
        WooTools::deep_unset_key($items, 'designation_id');
        WooTools::deep_unset_key($items, 'alternate_name');
        WooTools::deep_unset_key($items, 'care_instructions');
        WooTools::deep_unset_key($items, 'image_360_id');
        WooTools::deep_unset_key($items, 'image_360_preview_id');
        WooTools::deep_unset_key($items, 'size_chart_id');
        WooTools::deep_unset_key($items, 'sort');
        WooTools::deep_unset_key($items, 'icon_id');
        WooTools::deep_unset_key($items, 'has_map_policy');
        WooTools::deep_unset_key($items, 'published_at');
        WooTools::deep_unset_key($items, 'propd1');
        WooTools::deep_unset_key($items, 'propd2');
        WooTools::deep_unset_key($items, 'link_target_blank');
        WooTools::deep_unset_key($items, 'link');
        WooTools::deep_unset_key($items, 'vocabulary_id');
        return $items;
    }

    private function process_items_native($items)
    {
        $timer = new Timer();

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
                    error_log('deleted product');
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
                            $woo_variation->update_meta_data('_ci_import_version', $this->import_version);
                        }
                        $woo_variation->set_name($variation['name']);
                        $woo_variation->set_image_id($lookup_attachment[$variation['attachments'][0]['file']]);
                        $woo_variation->set_regular_price(9.99); //$variation['list_price']);
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
        error_log('process_items_native ' . $exe_time);
        $items['exe_time'] = $exe_time;
        return $items;
    }

    // private function get_category_ids_from_item($item)
    // {
    //     $category_ids = [];
    //     $term_name = $item['product_type'];
    //     $term = get_term_by('name', $term_name, 'product_cat');
    //     if (!$term) {
    //         $term = wp_insert_term($term_name, 'product_cat');
    //     }
    //     $category_ids[] = $term->term_id;

    //     foreach ($item['taxonomyterms']['data'] as $taxonomy_term) {
    //         $term_name = $taxonomy_term['name'];
    //         $term = get_term_by('name', $term_name, 'product_cat');
    //         if (!$term) {
    //             $term = wp_insert_term($term_name, 'product_cat');
    //         }
    //         $category_ids[] = $term->term_id;
    //     }
    //     return $category_ids;
    // }

    private function get_product_type($supplier_product)
    {
        if (isset($supplier_product['data']['items']['data']) && is_countable($supplier_product['data']['items']['data']) && count($supplier_product['data']['items']['data']) > 1) {
            return 'variable';
        }
        return 'simple';
    }

    private function get_product_name($supplier_product)
    {
        if (isset($supplier_product['data']['name'])) {
            return $supplier_product['data']['name'];
        }
        return '';
    }

    private function build_product_slug($product_id, $name = null, $variation_id = null)
    {
        $parts = ['pid', $product_id, $this->key, 'product'];

        if ($variation_id) {
            array_unshift($parts, 'vid', $variation_id);
        }
        if ($name) {
            array_unshift($parts, $name);
        }
        return sanitize_title(implode('-', $parts));
    }

    private function get_product_price($supplier_product)
    {
        $prices = array_map([$this, 'get_item_price'], $supplier_product['data']['items']['data']);
        sort($prices, SORT_NUMERIC); // get lowest number the "starting at" price
        return $prices[0];
    }

    private function get_item_price($item)
    {
        return $item['list_price'];
    }

    // public function Ximport_products_page()
    // {
    //     $this->ping();
    //     $this->set_is_import_running(true);
    //     $report = $this->get_import_report();

    //     // fix page_size=0
    //     if (!is_numeric($report['page_size']) || $report['page_size'] < 10) {
    //         $this->update_import_report(['page_size' => 10]);
    //     }
    //     $this->log(json_encode(['cursor' => $report['cursor'], 'page_size' => $report['page_size'], 'updated' => $report['updated']]));
    //     $products = $this->get_products_page($report['cursor'], $report['page_size'], $report['updated']);

    //     // sometimes the data doesn't return anything - try again
    //     if (!isset($products['data'])) {
    //         $this->log('api failed - sleep 10, the try again');
    //         sleep(10);
    //         $products = $this->get_products_page($report['cursor'], $report['page_size'], $report['updated']);
    //     }

    //     $cancelled = false;
    //     $stalled = false;

    //     if (isset($products['data'])) {
    //         $tally = ['insert' => [], 'update' => [], 'delete' => [], 'ignore' => [], 'patched' => []];
    //         $this->log('Recieved ' . count($products['data']) . ' products');

    //         foreach ($products['data'] as $product) {
    //             $action = $this->get_update_action($product); //
    //             $product_id = $product['id'];

    //             if ($report['patch']) {
    //                 //
    //                 // Begin:Patch
    //                 //
    //                 if ($action === 'update' || $action === 'ignore') {
    //                     // eficient availability check
    //                     $is_available = $this->is_available(['data' => $product]);
    //                     if ($is_available) {
    //                         $this->patch($report['patch'], $product_id);
    //                         $action = 'patch';
    //                     } else {
    //                         $action = 'ignore';
    //                     }
    //                     $tally[$action][] = $product_id;
    //                     $this->log($this->key . ':' . $product_id . ' ' . $action . ':' . $report['patch']);
    //                 }
    //                 //
    //                 // End: Patch
    //                 //
    //             } else {
    //                 $tally[$action][] = $product_id;
    //                 $this->log($this->key . ':' . $product_id . ' ' . $action);

    //                 switch ($action) {
    //                     case 'insert':
    //                         $this->insert_product($product_id);
    //                         break;

    //                     case 'update':
    //                         $this->update_product($product_id);
    //                         break;

    //                     case 'delete':
    //                         $this->delete_product($product_id);
    //                         break;

    //                     case 'ignore':
    //                         break;
    //                 }
    //             }
    //             // let wp know we are alive
    //             $this->ping();

    //             // escape hatch
    //             if ($this->should_cancel_import()) {
    //                 $cancelled = true;
    //                 $this->log('Import cancelled');
    //                 break;
    //             }

    //             // for testing
    //             if ($this->should_stall_import()) {
    //                 $stalled = true;
    //                 $this->log('Import force stalled');
    //                 break;
    //             }
    //         }

    //         // log pretty useful data
    //         $useful_data = array_filter($tally, fn($v) => count($v));
    //         $results = '';
    //         foreach ($useful_data as $k => $v) {
    //             $results .= "\n\t" . $k . ': (' . count($v) . ') ' . implode(',', $v);
    //         }
    //         $this->log('results:' . $results);

    //         $cursor = $products['meta']['cursor']['next'];

    //         if ($stalled) {
    //             $this->clear_stall_test();
    //             return;
    //         }

    //         if (!$cancelled) {
    //             $this->update_import_report([
    //                 'processed' => $report['processed'] + count($products['data']),
    //                 'cursor' => $cursor,
    //                 'delete' => $report['delete'] + count($tally['delete']),
    //                 'update' => $report['update'] + count($tally['update']),
    //                 'ignore' => $report['ignore'] + count($tally['ignore']),
    //                 'insert' => $report['insert'] + count($tally['insert']),
    //                 'patched' => $report['patched'] + count($tally['patched']),
    //             ]);

    //             if (!$cursor) {
    //                 $this->update_import_report(['completed' => gmdate("c")]);
    //                 $this->set_is_import_running(false);
    //             } else if ($this->should_cancel_import()) {
    //                 $this->set_is_import_running(false);
    //             } else {
    //                 // schedule and event to load the next page of products
    //                 $flag = $this->import_products_page_flag;
    //                 $is_scheduled = (bool) wp_next_scheduled($flag);
    //                 if (!$is_scheduled) {
    //                     $scheduled = wp_schedule_single_event(time(), $flag);
    //                     if (!$scheduled) {
    //                         $this->set_is_import_running(false);
    //                         $this->update_import_report(['error' => 'schedule failed']);
    //                         $this->log('schedule failed');
    //                     }
    //                 } else {
    //                     $this->log('schedule page import already scheduled - How did this duplicate?');
    //                 }
    //             }
    //         } else {
    //             $this->set_is_import_running(false);
    //         }
    //     } else {
    //         // failed after trying to load the page again - this is an error
    //         $this->set_is_import_running(false);
    //         $this->update_import_report([
    //             'stopped' => gmdate("c"),
    //             'error' => 'Product page data empty',
    //         ]);
    //         $this->log('Product page data empty');
    //     }
    // }

    public function patch($patch, $supplier_product_id)
    {
        $supplier_product = $this->get_product($supplier_product_id);
        if (!$supplier_product) {
            $this->log('patch() API Error' . $supplier_product_id);
            return;
        }
        $is_available = $this->is_available($supplier_product);

        if (!$is_available) {
            $this->log('patch() Product not available wps:' . $supplier_product_id);
            return;
        }

        $supplier_product_id = $supplier_product['data']['id'];
        $woo_product_id = $this->get_woo_id($supplier_product_id);

        if (!$woo_product_id) {
            $this->log('patch() wps:' . $supplier_product_id . ' no woo product found for update');
            return;
        }

        $woo_product = wc_get_product_object('variable', $woo_product_id);

        if ($patch === 'tags') {
            $this->update_product_taxonomy($woo_product, $supplier_product);
        }

        if ($patch === 'attributes') {
            $this->update_product_attributes($woo_product, $supplier_product);
            $this->update_product_variations($woo_product, $supplier_product);
        }

        if ($patch === 'images') {
            WooTools::removeProductAttribute($woo_product_id, '__required_attr');
            $this->update_product_images($woo_product, $supplier_product);
        }
    }

    public function insert_product($supplier_product_id, $supplier_product = null)
    {
        if ($supplier_product === null) {
            $supplier_product = $this->get_product($supplier_product_id);
        }
        if (!$supplier_product) {
            $this->log('insert_product() API Error' . $supplier_product_id);
            return;
        }
        $is_available = $this->is_available($supplier_product);

        if (!$is_available) {
            $this->log('insert_product() Product not available wps:' . $supplier_product_id);
            return;
        }
        $product_id = $this->create_product($supplier_product_id);
        $this->log('create_product() wps:' . $supplier_product_id . ' => woo:' . $product_id);
        $this->update_product_action($supplier_product);
    }

    public function update_product($supplier_product_id, $supplier_product = null)
    {
        if ($supplier_product === null) {
            $supplier_product = $this->get_product($supplier_product_id);
        }
        if (!$supplier_product) {
            $this->log('update_product() API Error' . $supplier_product_id);
            return ['error' => 'update_product() API Error' . $supplier_product_id];
        }
        $is_available = $this->is_available($supplier_product);

        if (!$is_available) {
            $this->log('update_product() Product not available wps:' . $supplier_product_id);
            return ['error' => 'update_product() Product not available wps:' . $supplier_product_id];
        }
        return $this->update_product_action($supplier_product);
    }

    public function update_product_action($supplier_product)
    {
        try {
            $supplier_product_id = $supplier_product['data']['id'];
            $this->log('update_product_action() ' . $supplier_product_id);
            $woo_product_id = $this->get_woo_id($supplier_product_id);

            if (!$woo_product_id) {
                $this->log('wps:' . $supplier_product_id . ' no woo product found for update');
                return;
            }

            $woo_product = wc_get_product_object('variable', $woo_product_id);
            $first_item = $supplier_product['data']['items']['data'][0];
            $woo_product->set_name($supplier_product['data']['name']);
            $woo_product->set_status('publish');
            $woo_product->set_regular_price($first_item['list_price']);
            $woo_product->set_stock_status('instock');
            $woo_product->update_meta_data('_ci_import_version', $this->import_version);
            $woo_product->update_meta_data('_ci_import_timestamp', gmdate("c"));
            $woo_product->set_description($this->get_description($supplier_product));

            // $time_start = microtime(true);
            $this->update_product_taxonomy($woo_product, $supplier_product);
            // $time_end = microtime(true);
            // $execution_time = $time_end - $time_start;
            // $this->log('update_product_taxonomy ' . $execution_time . 's');

            // $time_start = microtime(true);
            $this->update_product_attributes($woo_product, $supplier_product);
            // $time_end = microtime(true);
            // $execution_time = $time_end - $time_start;
            // $this->log('update_product_attributes ' . $execution_time . 's');

            // $time_start = microtime(true);
            $this->update_product_variations($woo_product, $supplier_product);
            // $time_end = microtime(true);
            // $execution_time = $time_end - $time_start;
            // $this->log('update_product_variations ' . $execution_time . 's');

            $time_start = microtime(true);
            $this->update_product_images($woo_product, $supplier_product);
            $time_end = microtime(true);
            $execution_time = $time_end - $time_start;
            $this->log('update_product_images ' . $execution_time . 's');

            $woo_id = $woo_product->save();
            if (!$woo_id) {
                $this->log('wps:' . $supplier_product_id . ' save failed for woo:' . $woo_id);
            }
            return ['updated' => true];
        } catch (Exception $e) {
            return ['error' => $e];
        }
        // $this->log('update_product_action() ' . $this->key . ':' . $supplier_product['data']['id'].' => woo:'.$woo_id);
    }

    public function update_product_images($woo_product, $supplier_product)
    {
        WooTools::sync_images($woo_product, $supplier_product, $this);
        // $images = [];
        // if (isset($supplier_product['data']['items']['data'])) {
        //     $items = $supplier_product['data']['items']['data'];
        //     foreach ($items as $item) {
        //         if (isset($item['images']['data'])) {
        //             if (count($item['images']['data']) && isset($item['images']['data'][0])) {
        //                 // show only the first image of each variation
        //                 $images[] = WPSTools::build_western_image_url($item['images']['data'][0]);
        //             }
        //         }
        //     }
        // }
        // $serialized_images = serialize($images);
        // $woo_product->update_meta_data('_ci_additional_images', $serialized_images);
    }

    public function update_product_taxonomy($woo_product, $wps_product)
    {
        $tags = $this->extract_product_tags($wps_product);
        $tag_ids = $this->get_tag_ids($tags);
        $woo_id = $woo_product->get_id();
        wp_set_object_terms($woo_id, $tag_ids, 'product_tag', true);
    }

    public function update_product_attributes($woo_product, $supplier_product)
    {
        $supplier_attributes = $this->extract_attributes($supplier_product);
        WooTools::sync_attributes($woo_product, $supplier_attributes);
    }

    public function update_product_variations($woo_product, $supplier_product)
    {
        $supplier_variations = $this->extract_variations($supplier_product);
        WooTools::sync_variations($woo_product, $supplier_variations);
    }

    public function get_description($supplier_product)
    {
        if ($this->deep_debug) {
            $this->log('get_description()');
        }

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

    public function get_products_count($updated_at = null)
    {
        $updated_at = $updated_at ?? $this->default_updated_at;
        $result = $this->get_api('products', [
            'filter[updated_at][gt]' => $updated_at,
            'countOnly' => 'true',
        ]);
        return $result['data']['count'] ?? -1;
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

        if ($this->deep_debug) {
            $this->log('get_attributes_from_product()');
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

    public function extract_product_tags($supplier_product)
    {
        $product_tags = [];
        $tag_slugs = [];
        // make WPS product_type from each item a product_tag
        if (is_countable($supplier_product['data']['items']['data'])) {
            foreach ($supplier_product['data']['items']['data'] as $item) {
                // WPS product_type
                if (isset($item['product_type']) && !empty($item['product_type'])) {
                    $name = $item['product_type'];
                    $slug = sanitize_title($name);
                    if (!isset($tag_slugs[$slug])) {
                        $product_tags[] = ['name' => $name, 'slug' => $slug];
                        $tag_slugs[$slug] = true;
                    }
                }
                // WPS taxonomy terms
                if (is_countable($item['taxonomyterms']['data'])) {
                    foreach ($item['taxonomyterms']['data'] as $term) {
                        $name = $term['name'];
                        $slug = sanitize_title($name);
                        if (!isset($tag_slugs[$slug])) {
                            $product_tags[] = ['name' => $name, 'slug' => $slug];
                            $tag_slugs[$slug] = true;
                        }
                    }
                }
            }
        }

        // get only unique tags
        return $product_tags;
        // $unique_tags = [];

        // foreach ($$product_tags as $tag) {
        //     if (!isset($unique_tags[$tag['slug']])) {
        //         $unique_tags[$tag['slug']] = $tag;
        //     }
        // }

        // $product_tags = array_values($unique_tags);

        return $product_tags;
    }

    public function get_product($product_id)
    {
        if ($this->deep_debug) {
            $this->log('get_product()');
        }
        if (empty($product_id)) {
            return null;
        }

        $params = [];
        $params['include'] = implode(',', [
            'features', //
            'tags',
            'attributekeys',
            'attributevalues',
            'items',
            'items.images',
            'items.inventory', // not used
            'items.attributevalues',
            'items.taxonomyterms',
            'taxonomyterms',
            'items:filter(status_id|NLA|ne)',
        ]);
        $product = $this->get_api('products/' . $product_id, $params);
        if (isset($product['status_code']) && $product['status_code'] === 404) {
            $product['data'] = ['id' => $product_id];
            return $product; //['error' => 'not found', 'status_code' => 404]; // product doesn't exist
        }
        // // remove items that are not valid
        // $initial_count = count($product['data']['items']['data']);
        // $product['data']['items']['data'] = array_filter($product['data']['items']['data'], 'isDeadItem');
        // $product['data']['items']['items_meta'] = ['original' => $initial_count, 'updated' => count($product['data']['items']['data'])];
        // $product['data']['attributekeys']['data'] = $this->get_attributes_from_product($product);
        return $product;
    }

    public function get_product_light($product_id)
    {
        if ($this->deep_debug) {
            $this->log('get_product_light()');
        }
        $params = [];
        $params['include'] = implode(',', [
            'items',
            'items:filter(status_id|NLA|ne)',
        ]);
        $product = $this->get_api('products/' . $product_id, $params);
        if (isset($product['status_code']) && $product['status_code'] === 404) {
            return null; // product doesn't exist
        }
        return $product;
    }

    public function attach_images($supplier_product, $woo_product = null)
    {
        //
    }

    public function extract_product_name($supplier_product)
    {
        if ($this->deep_debug) {
            $this->log('extract_product_name()');
        }

        return isset($supplier_product['data']['name']) ? $supplier_product['data']['name'] : 'error';
    }

    public function extract_variations($supplier_product)
    {
        if ($this->deep_debug) {
            $this->log('extract_variations()');
        }

        if (!isset($supplier_product['data']['attributekeys']['data'])) {
            $this->log(__FILE__, __LINE__, 'ERROR: extract_variations ' . json_encode(['supplier_product' => $supplier_product], JSON_PRETTY_PRINT));
            return [];
        }

        if (!isset($supplier_product['data']['items']['data'])) {
            $this->log(__FILE__, __LINE__, 'ERROR: extract_variations ' . json_encode(['supplier_product' => $supplier_product], JSON_PRETTY_PRINT));
            return [];
        }

        $items = isset($supplier_product['data']['items']['data']) && is_array($supplier_product['data']['items']['data']) ? $supplier_product['data']['items']['data'] : [];

        $attr_keys = isset($supplier_product['data']['attributekeys']['data']) ? $supplier_product['data']['attributekeys']['data'] : [];
        $lookup_slug_by_id = [];

        foreach ($attr_keys as $attr_id => $attr) {
            $lookup_slug_by_id[$attr_id] = $attr['slug'];
        }

        $valid_items = array_filter($items, [$this, 'isValidItem']);
        $variations = [];
        $attr_count = [];

        foreach ($valid_items as $item) {
            $variation = [];
            $variation['import_version'] = $this->import_version;
            $variation['id'] = $item['id'];
            $variation['sku'] = $this->get_variation_sku($supplier_product['data']['id'], $item['id']);
            $variation['supplier_sku'] = $item['sku'];
            $variation['name'] = $item['name'];
            $variation['list_price'] = $item['list_price'];
            $variation['images'] = $this->get_item_images($item);
            $variation['images_data'] = $this->get_item_images_data($item);
            $variation['meta_data'] = [];
            $variation['meta_data'][] = ['key' => '_ci_import_version', 'value' => $this->import_version];
            $variation['meta_data'][] = ['key' => '_ci_supplier_key', 'value' => $this->key];
            $variation['meta_data'][] = ['key' => '_ci_product_id', 'value' => $supplier_product['data']['id']];
            $variation['meta_data'][] = ['key' => '_ci_supplier_sku', 'value' => $item['sku']];
            $variation['meta_data'][] = ['key' => '_ci_additional_images', 'value' => $this->get_item_images($item)];
            $variation['meta_data'][] = ['key' => '_ci_import_timestamp', 'value' => gmdate("c")];

            $variation['attributes'] = [];

            // put measures in there anyways - but the units may change
            $variation['width'] = $item['width'];
            $variation['height'] = $item['height'];
            $variation['length'] = $item['length'];
            $variation['weight'] = $item['weight'];

            if ($item['unit_of_measurement_id'] !== 12) {
                // TODO: need to resolve these unit issues - currently not authorized to access this
                $this->log('wps:extract_variations() unit_of_measurement_id=' . $item['unit_of_measurement_id']);
            }

            foreach ($item['attributevalues']['data'] as $attr) {
                $attr_id = $attr['attributekey_id'];
                $attr_value = $attr['name'];
                $attr_slug = $lookup_slug_by_id[$attr_id];
                $variation['attributes'][$attr_slug] = $attr_value;
                if (!array_key_exists($attr_slug, $attr_count)) {
                    $attr_count[$attr_slug] = [];
                }
                if (!array_key_exists($attr_value, $attr_count[$attr_slug])) {
                    $attr_count[$attr_slug][$attr_value] = 0;
                }
                $attr_count[$attr_slug][$attr_value]++;
            }

            $variation['attributes']['supplier_sku'] = $variation['supplier_sku'];
            // NOT NEEDED!!! Woo Hoo!!!! this is a dummy attribute so that variable products with a single variation can be selected
            // $variation['attributes']['__required_attr'] = '1';

            $variations[] = $variation;
        }

        $validItemsCount = count($valid_items);

        foreach ($attr_count as $attr_slug => $attr_values) {
            foreach ($attr_values as $attr_value => $attr_tally) {
                if ($attr_tally === $validItemsCount) {
                    // $this->log('Need to delete attr ' . $attr_slug . ' value ' . $attr_value);

                    foreach ($variations as $variation) {
                        unset($variation['attributes'][$attr_slug]);
                    }
                }
            }
        }

        // check against master attributes
        // some items have an errant attribute that doesn't allow it to be selected for purchase

        $master_attributes = $this->extract_attributes($supplier_product);
        $master_slugs = array_column($master_attributes, 'slug');

        foreach ($variations as $i => $variation) {
            $variations[$i]['__delete'] = false;
            $variation_slugs = array_keys($variation['attributes']);

            // Test 1: check for missing attributes - this is cause my bad data from the 3rd party - nobody's perfect!
            $missing = array_diff($master_slugs, $variation_slugs);

            if (count($missing)) {
                // assume this attribute is not applicable to this variation
                foreach ($missing as $missingAttr) {
                    // TODO: fix product attribute like the regy helmet at WPS_381514
                }
                // TODO: troggle this to see if product resolves nicely or not
                // $this->log(__FILE__, __LINE__, 'Skip variation. ' . $variation['sku'] . ' is missing attributes ' . implode(',', $missing));
                // $variations[$i]['__delete'] = true;
                // no need to continue, this variation is junked
                continue;
            }

            // Test 2: check for attributes that don't need to be there
            $deletes = array_diff($variation_slugs, $master_slugs);

            foreach ($deletes as $attr_slug) {
                unset($variations[$i]['attributes'][$attr_slug]);
            }
        }

        $variations = array_filter($variations, fn($v) => $v['__delete'] === false);
        return $variations;
    }

    public function get_item_images($item, $size = 200)
    {
        if (isset($item['images']['data'])) {
            if (count($item['images']['data'])) {
                return array_map(fn($img) => $this->build_western_image_url($img, $size), $item['images']['data']);
            }
        }
        return null;
    }

    public function get_item_images_data($item)
    {
        $images = [];
        if (isset($item['images']['data']) && is_countable($item['images']['data']) && count($item['images']['data'])) {
            foreach ($item['images']['data'] as $image) {
                $file = $this->build_western_image_url($image);
                $width = isset($image['width']) ? $image['width'] : 200;
                $height = isset($image['height']) ? $image['height'] : 200;
                $filesize = isset($image['size']) ? $image['size'] : 0;
                $images[] = ['file' => $file, 'width' => $width, 'height' => $height, 'filesize' => $filesize];
            }
        }
        return $images;
    }

    public function extract_attributes($supplier_product)
    {
        if ($this->deep_debug) {
            $this->log('extract_attributes()');
        }

        if (!$supplier_product) {
            return [];
        }
        // extract an array of valid attributes
        $attr_keys = $supplier_product['data']['attributekeys']['data'];
        $attributes = [];
        $lookup_slug_by_id = [];

        if (is_countable($attr_keys)) {
            foreach ($attr_keys as $attr_id => $attr) {
                if (!isset($attr['name']) || !isset($attr['slug'])) {
                    $this->log(__FILE__, __LINE__, 'Error', $attr_keys);
                }
                $attributes[$attr['slug']] = [
                    'name' => $attr['name'],
                    'options' => [],
                    'slug' => $attr['slug'],
                ];
                $lookup_slug_by_id[$attr_id] = $attr['slug'];
            }
        }

        $items = isset($supplier_product['data']['items']['data']) ? $supplier_product['data']['items']['data'] : [];

        $valid_items = array_filter($items, [$this, 'isValidItem']);

        foreach ($valid_items as $item) {
            foreach ($item['attributevalues']['data'] as $item_attr) {
                $attr_id = $item_attr['attributekey_id'];
                $attr_value = $item_attr['name'];
                $attr_slug = $lookup_slug_by_id[$attr_id];

                if (!isset($attributes[$attr_slug]['options'][$attr_value])) {
                    $attributes[$attr_slug]['options'][$attr_value] = 0;
                }
                $attributes[$attr_slug]['options'][$attr_value]++;
            }
        }

        $changes = [];
        $valid_items_count = count($valid_items);
        foreach ($attributes as $attr_slug => $attribute) {
            foreach ($attribute['options'] as $attr_value => $option_count) {
                if ($option_count === 0 || $option_count === $valid_items_count) {
                    unset($attribute['options'][$attr_value]);
                    $changes[] = "remove {$attr_slug} -> {$attr_value}";
                }
            }

            if (count($attribute['options'])) {
                $attributes[$attr_slug]['options'] = array_keys($attributes[$attr_slug]['options']);
            } else {
                unset($attributes[$attr_slug]);
                $changes[] = "delete {$attr_slug}";
            }
        }

        // if (!count($attributes)) {
        //     // with no other attributes, a variable product requires something to validate it for adding to cart
        //     $attributes['__required_attr'] = [
        //         'name' => '__required_attr',
        //         'options' => ['1'],
        //         'slug' => '__required_attr',
        //         'visible' => 0,
        //         'variation' => 0,
        //     ];
        // }

        $valid_skus = array_map(fn($v) => $v['sku'], $valid_items);

        // if (count($valid_skus)) {
        // if there's only 1 sku, we don't need a sku selector
        $attributes['supplier_sku'] = [
            'name' => 'supplier_sku',
            'options' => array_map(fn($v) => $v['sku'], $valid_items),
            'slug' => 'supplier_sku',
        ];
        // }

        return array_values($attributes);
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

    public function extract_product_updated($supplier_product)
    {
        if ($this->deep_debug) {
            $this->log('extract_product_updated()');
        }

        if (isset($supplier_product['data']['updated_at'])) {
            // return wp_date('Y-m-d H:i:s', strtotime($woo_updated_str))
            return strtotime($supplier_product['data']['updated_at']);
        }
        return null;
    }

    public function check_is_available($product_id)
    {
        if ($this->deep_debug) {
            $this->log('check_is_available()');
        }

        $params = [];
        $params['include'] = implode(',', [
            'items',
            'items:filter(status_id|NLA|ne)',
        ]);
        $supplier_product = $this->get_api('products/' . $product_id, $params);
        if (isset($supplier_product['status_code']) && $supplier_product['status_code'] === 404) {
            $supplier_product = null; // product doesn't exist
        }
        return $this->is_available($supplier_product);
    }

    public function get_stock_status($product_id)
    {
        if ($this->deep_debug) {
            $this->log('get_stock_status()');
        }

        $status = 'notfound';
        $params = [];
        $params['include'] = implode(',', [
            'items',
            'items:filter(status_id|NLA|ne)',
        ]);
        $supplier_product = $this->get_api('products/' . $product_id, $params);

        if (isset($supplier_product['error'])) {
            return 'error';
        }
        if (isset($supplier_product['status_code']) && $supplier_product['status_code'] === 404) {
            $status = 'notfound';
            $supplier_product = null;
        }
        if ($supplier_product) {
            if ($this->is_available($supplier_product)) {
                $status = 'instock';
            } else {
                $status = 'outofstock';
            }
        }
        return $status;
    }

    /*

    {
    "include": "items:filter(status_id|NLA|ne)",
    "filter[updated_at][gt]": "2020-01-01",
    "page[cursor]": "",
    "page[size]": 10,
    "fields[items]": "id,updated_at,status_id",
    "fields[products]": "id,name,updated_at"
    }
     */
    public function get_products_page($cursor = '', $size = 10, $updated = '2020-01-01')
    {
        if ($this->deep_debug) {
            $this->log('get_products_page()');
        }

        $params = [];
        $params['include'] = implode(',', [
            'items:filter(status_id|NLA|ne)', // we don't want to consider products that are no longer available
        ]);
        $params['filter[updated_at][gt]'] = $updated;
        if (isset($cursor)) {
            $params['page[cursor]'] = $cursor;
        }
        $params['page[size]'] = $size;
        $params['fields[items]'] = 'id,updated_at,status_id';
        $params['fields[products]'] = 'id,name,updated_at';

        return $this->get_api('products', $params);
    }

    // experimental
    public function get_next_products_page($previous_result_meta)
    {
        $cursor = '';
        $size = 10;
        $updated = '2020-01-01';

        if ($previous_result_meta !== null) {
            if (isset($previous_result_meta['cursor']['next'])) {
                $cursor = $previous_result_meta['cursor']['next'];
            }
            if (isset($previous_result_meta['cursor']['count'])) {
                $size = $previous_result_meta['cursor']['count'];
            }
        }
        return $this->get_products_page($cursor, $size, $updated);
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
