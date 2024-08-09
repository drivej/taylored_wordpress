<?php

trait Supplier_WPS_Import
{
    private string $start_import_action_hook_name = '';
    private string $import_loop_action_hook_name = '';
    private string $import_option_name = '';
    private string $default_updated_at = '2023-01-01';

    // constructor for this trait
    public function construct_import()
    {
        // error_log('construct_import()');
        $this->start_import_action_hook_name = "{$this->key}_import_products_init_action";
        $this->import_loop_action_hook_name = "{$this->key}_import_products_loop_action";
        $this->import_option_name = "{$this->key}_import_status";

        add_action($this->start_import_action_hook_name, [$this, 'start_import_action_test'], 10);
        add_action($this->import_loop_action_hook_name, [$this, 'import_loop_action_test'], 10);
    }

    public function check_import_actions()
    {
        error_log('check_import_actions()');
        $has_action = has_action($this->start_import_action_hook_name, [$this, 'start_import_action_test']);
        if (!$has_action) {
            error_log('create action ' . 'start_import_action_test');
            add_action($this->start_import_action_hook_name, [$this, 'start_import_action_test'], 10);
        } else {
            error_log('has action ' . 'start_import_action_test');
        }
        $has_action = has_action($this->import_loop_action_hook_name, [$this, 'import_loop_action_test']);
        if (!$has_action) {
            error_log('create action ' . 'import_loop_action_test');
            add_action($this->import_loop_action_hook_name, [$this, 'import_loop_action_test'], 10);
        } else {
            error_log('has action ' . 'import_loop_action_test');
        }
    }

    public function create_scheduled_import()
    {
        // this kick off nightly import
        error_log('schedule_import()');
        $next_scheduled = wp_next_scheduled($this->start_import_action_hook_name);
        if (!$next_scheduled) {
            $timestamp = strtotime('today midnight') - get_option('gmt_offset') * HOUR_IN_SECONDS;
            $scheduled = wp_schedule_event($timestamp, 'daily', $this->start_import_action_hook_name);
            if (!is_wp_error($scheduled)) {
                return true;
            }
        }
        return false;
    }

    public function cancel_scheduled_import()
    {
        // cancel nightly import
        error_log('cancel_scheduled_import()');
        $next_scheduled = wp_next_scheduled($this->start_import_action_hook_name);
        if ($next_scheduled) {
            $cancelled = wp_unschedule_event($next_scheduled, $this->start_import_action_hook_name);
            if (!is_wp_error($cancelled)) {
                return true;
            }
        }
        return false;
    }

    public function start_import()
    {
        error_log('start_import()');
        $this->check_import_actions();
        do_action($this->start_import_action_hook_name);
    }

    public function start_import_action_test()
    {
        error_log('start_import_action_test()');

        // $this->check_import_actions();

        $has_action = has_action($this->import_loop_action_hook_name, [$this, 'import_loop_action_test']);
        error_log('$has_action: ' . json_encode($has_action));
        if ($has_action) {
            error_log('Action found');
            $is_scheduled = wp_schedule_single_event(time() + 10, $this->import_loop_action_hook_name);
        } else {
            error_log('No action found');
        }

        error_log('scheduled: ' . json_encode($is_scheduled));
    }

    public function import_loop_action_test()
    {
        error_log('import_loop_action_test()');
    }

    protected function get_default_info()
    {
        return [
            'prev_cursor' => false,
            'cursor' => '',
            'updated_at' => $this->default_updated_at,
            'running' => false,
            'attempt' => 0,
            'status' => 'idle',
            'stopping' => false,
            'started' => gmdate("c"),
            'updated' => gmdate("c"),
            'completed' => false,
            'processed' => 0,
            'total_products' => 0,
        ];
    }

    public function get_next_import_time()
    {
        $next_scheduled = wp_next_scheduled($this->start_import_action_hook_name);
        if ($next_scheduled) {
            return ['data' => date("Y-m-d H:i:s", $next_scheduled)];
        }
        return ['data' => false];
    }

    // this is the first function that fires to begin the import loop
    public function start_import_action()
    {
        $is_scheduled = (bool) wp_next_scheduled($this->import_loop_action);
        if ($is_scheduled) {
            return ['error' => 'loop is scheduled'];
        }
        // run weekly import action
        error_log('start_import()');
        $info = get_option($this->import_option_name, $this->get_default_info());

        // get updated_at value from previous start date if completed
        if ($info['completed']) {
            $updated_at = $this->default_updated_at;
            try {
                $started = new DateTime($info['started']);
                $updated_at = $started->format('Y-m-d');
            } catch (Exception $e) {
                // date is invalid
            }
            $info['updated_at'] = $updated_at;
        }
        //$this->is_valid_updated_date($info['updated_at']) ? $info['updated_at'] : '2024-08-02';
        $info['total_products'] = $this->get_total_remote_products($info['updated_at']);
        $info['started'] = gmdate("c");
        $info['completed'] = false;
        $info['processed'] = 0;
        $info['running'] = true;
        $info['status'] = 'running';
        update_option($this->import_option_name, $info);

        error_log('total_products: ' . $info['total_products']);

        if ($info['total_products'] === 0) {
            $info['running'] = false;
            $info['status'] = 'idle';
            error_log('Nothing to update');
        } else {
            // get the first page and cursor
            $items = $this->import_products_page($info['cursor'], $info['updated_at']);
            $ids = is_array($items['data']) ? array_map(fn($item) => $item['id'], $items['data']) : [];
            $next_cursor = is_string($items['meta']['cursor']['next']) && strlen($items['meta']['cursor']['next']) ? $items['meta']['cursor']['next'] : false;
            error_log('start_import() - ' . json_encode($ids));
            $info['running'] = false;

            if ($next_cursor) {
                $info['cursor'] = $next_cursor;
                $is_scheduled = wp_schedule_single_event(time(), $this->import_loop_action_hook_name);
                error_log('start_import() - schedule first loop $is_scheduled=' . json_encode($is_scheduled));
            } else {
                error_log('start_import() - no next cursor');
            }
        }
        update_option($this->import_option_name, $info);
        return $info;
    }

    // this is the recursive import function
    public function import_loop_action()
    {
        error_log('import_loop()');
        $info = $this->get_import_info();
        $next_cursor = false;
        $ids = [];
        $info['running'] = true;
        update_option($this->import_option_name, $info);

        $attempt = 0;

        while ($attempt < 3 && count($ids) === 0) {
            try {
                $items = $this->import_products_page($info['cursor'], $info['updated_at']);

                $ids = is_array($items['data']) ? array_map(fn($item) => $item['id'], $items['data']) : [];

                $next_cursor = $items['meta']['cursor']['next'] ?? false;

                if ($next_cursor === null) {
                    // completed
                } else if (is_string($next_cursor)) {
                    // validated next page
                }

                // $next_cursor = is_string($items['meta']['cursor']['next']) && strlen($items['meta']['cursor']['next']) ? $items['meta']['cursor']['next'] : false;

                if (count($ids) === 0) {
                    error_log('import_loop() - ' . $info['cursor'] . ' ' . 'failed sleep(5)');
                    sleep(5);
                } else {
                    error_log('import_loop() - ' . $info['cursor'] . ' ' . json_encode($ids));
                }
            } catch (Exception $e) {
                $info['size'] = 10;
                error_log('import_loop() - Error processing ' . $info['cursor']);
            }
            $attempt++;
        }

        if ($attempt > 1) {
            if (count($ids)) {
                error_log('took multiple attempts to load page');
            } else {
                error_log('failed load page ' . json_encode($info, JSON_PRETTY_PRINT));
            }
        }

        $info = $this->get_import_info();
        $info['running'] = false;
        $info['processed'] += count($ids);

        if ($info['stopping']) {
            // user requested stop
            $info['status'] = 'stopped';
            error_log('import_loop() - stopped');
        } else if (is_string($next_cursor)) {
            // indicates valid cursor
            $info['cursor'] = $next_cursor;
            wp_schedule_single_event(time(), $this->import_loop_action_hook_name);
        } else if (is_null($next_cursor)) {
            // null indicates end of pagination
            $info['status'] = 'complete';
            $info['completed'] = gmdate("c");
            error_log('import_loop() - ended');
        } else {
            $info['status'] = 'stalled';
            $info['completed'] = false;
            error_log('import_loop() - failed');
        }
        update_option($this->import_option_name, $info);
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
            $items = $this->import_products_page($info['cursor'], $info['updated_at']);

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

    public function is_importing()
    {
        $next_scheduled = wp_next_scheduled($this->import_loop_action);
        if ($next_scheduled) {
            return true;
        }
        $info = $this->get_import_info();
        return $info['running'];
    }

    public function continue_import()
    {
        $info = $this->get_import_info();
        $info['stopping'] = false;
        update_option($this->import_option_name, $info);
        $this->import_loop();
        return $info;
    }

    public function import_latest()
    {
        $info = $this->get_import_info();
        if ($info['is_scheduled']) {
            return ['error' => 'Import is already scheduled', 'data' => $info];
        }
        if ($info['running']) {
            return ['error' => 'Import is already running', 'data' => $info];
        }
        $info['updated_at'] = (new DateTime($info['started']))->format('Y-m-d');
        update_option($this->import_option_name, $info);
        // $this->import_loop();
        return $info;
    }

    public function reset_import()
    {
        update_option($this->import_option_name, $this->get_default_info());
        return get_option($this->import_option_name);
    }

    public function get_import_info()
    {
        wp_cache_delete($this->import_option_name, 'options');
        $info = get_option($this->import_option_name);
        $info['is_scheduled'] = (bool) wp_next_scheduled($this->import_loop_action);
        $date = strtotime($info['started']);
        $info['age'] = $this->time_until($date);
        return $info;
    }

    public function update_import_info($delta)
    {
        wp_cache_delete($this->import_option_name, 'options');
        $info = get_option($this->import_option_name);
        $output = [ ...$info, ...$delta];
        update_option($this->import_option_name, $output);
        return $output;
    }

    public function stop_import()
    {
        $info = $this->get_import_info();
        $default_info = $this->get_default_info();

        if ($info['running']) {
            $age = WooTools::get_age($info['updated']);
            if ($age->i > 5) {
                // stalled
                $info = $this->get_default_info();
                update_option($this->import_option_name, [ ...$default_info, ...$info]);
            } else {
                $info['stopping'] = true;
                $info['updated'] = gmdate("c");
                update_option($this->import_option_name, [ ...$default_info, ...$info]);
            }
        } else {
            update_option($this->import_option_name, [ ...$default_info, ...$info]);
        }

        if ($info['is_scheduled']) {
            wp_unschedule_event($info['is_scheduled'], $this->import_loop_action_hook_name);
        }

        return $info;
    }

    //
    // Utility
    //

    private function is_valid_updated_date($date)
    {
        // Check if the date matches the format yyyy-mm-dd using a regular expression
        return preg_match('/^\d{4}-\d{2}-\d{2}$/', $date);
    }

    private function time_until($timestamp)
    {
        $current_timestamp = time();
        $time_difference = abs($timestamp - $current_timestamp);
        $days = floor($time_difference / 86400);
        $hours = floor(($time_difference % 86400) / 3600);
        $minutes = floor(($time_difference % 3600) / 60);
        $seconds = $time_difference % 60;
        $until = sprintf("%dd %02dh %02dm %02ds", $days, $hours, $minutes, $seconds);
        return $until;
    }

}
