<?php

trait Supplier_T14_Import
{
    // TODO: Merge this with t14 import code
    
    // private string $import_hook_name = '';
    private string $import_loop_action = '';
    private string $start_import_action = '';
    private string $import_option_name = '';
    private string $default_updated_at = '2023-01-01';

    protected function init_import_actions()
    {
        $this->start_import_action = "{$this->key}_import_products_init_action";
        // $this->import_hook_name = "{$this->key}_import_products_page_action";
        $this->import_option_name = "import_status_{$this->key}";
        add_action($this->start_import_action, [$this, 'start_import'], 10);
        add_action($this->import_loop_action, [$this, 'import_loop'], 10);
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
            'completed' => false,
            'processed' => 0,
            'total_products' => 0,
        ];
    }

    // this kicks off the big import each week
    public function init_import()
    {
        // create weekely import event
        $next_scheduled = wp_next_scheduled($this->start_import_action);
        if (!$next_scheduled) {
            error_log('init_import() - create scheduled event');
            $timestamp = strtotime('today midnight') - get_option('gmt_offset') * HOUR_IN_SECONDS;
            wp_schedule_event($timestamp, 'daily', $this->start_import_action);
        } else {
            error_log('init_import() - failed ' . $next_scheduled);
        }
    }

    public function get_next_import_time()
    {
        $next_scheduled = wp_next_scheduled($this->start_import_action);
        if ($next_scheduled) {
            return ['data' => date("Y-m-d H:i:s", $next_scheduled)];
        }
        return ['data' => false];
    }

    public function create_scheduled_import()
    {
        error_log('schedule_import()');
        $next_scheduled = wp_next_scheduled($this->start_import_action);
        if (!$next_scheduled) {
            $timestamp = strtotime('today midnight') - get_option('gmt_offset') * HOUR_IN_SECONDS;
            $scheduled = wp_schedule_event($timestamp, 'daily', $this->start_import_action);
            if (!is_wp_error($scheduled)) {
                return true;
            }
        }
        return false;
    }

    public function cancel_scheduled_import()
    {
        error_log('cancel_scheduled_import()');
        $next_scheduled = wp_next_scheduled($this->start_import_action);
        if ($next_scheduled) {
            $cancelled = wp_unschedule_event($next_scheduled, $this->import_loop_name);
            if (!is_wp_error($cancelled)) {
                return true;
                // error_log('wp_unschedule_event failed ' . json_encode($cancelled));
            }
            // } else {
            //     error_log('not scheduled');
        }
        return false;
    }

    // this is the first function that fires to begin the import loop
    public function start_import()
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

        if ($info['total_products'] === 0) {
            error_log('Nothing to update');
        }
        // get the first page and cursor
        $items = $this->import_products_page($info['cursor'], $info['updated_at']);
        $ids = is_array($items['data']) ? array_map(fn($item) => $item['id'], $items['data']) : [];
        $next_cursor = is_string($items['meta']['cursor']['next']) && strlen($items['meta']['cursor']['next']) ? $items['meta']['cursor']['next'] : false;
        error_log('start_import() - ' . json_encode($ids));

        if ($next_cursor) {
            $info['cursor'] = $next_cursor;
            $info['running'] = false;
            update_option($this->import_option_name, $info);
            wp_schedule_single_event(time(), $this->import_loop_action);
        } else {
            error_log('start_import() - failed');
        }
        return $info;
    }

    // this is the recursive import function
    public function import_loop()
    {
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
            wp_schedule_single_event(time(), $this->import_loop_action);
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

    // public function start_import()
    // {
    //     // check if import is scheduled
    //     $is_scheduled = (bool) wp_next_scheduled($this->import_hook_name);
    //     $schedule = -1;

    //     if ($is_scheduled) {
    //         $message = 'busy';
    //     } else {
    //         $info = get_option($this->import_option_name, $this->get_default_info());
    //         $is_running = $info['running'] === true;

    //         // check if import is running
    //         if ($is_running) {
    //             $age = WooTools::get_age($info['started'], 'seconds');
    //             if ($age > 30) {
    //                 $info['attempt']++;
    //                 if ($info['attempt'] < 2) {
    //                     update_option($this->import_option_name, $info);
    //                     $message = 'start_import() - attempt ' . $info['attempt'];
    //                     // return ['error' => 'import is running'];
    //                 } else {
    //                     $info['status'] = 'stalled';
    //                     update_option($this->import_option_name, $this->get_default_info());
    //                     $message = 'start_import() - stalled';
    //                     // return ['error' => 'import is running'];
    //                 }
    //             } else {
    //                 $message = 'start_import() - stand by';
    //                 // return ['error' => 'import is running'];
    //             }
    //         } else {
    //             if ($info['cursor'] === false) {
    //                 update_option($this->import_option_name, $this->get_default_info());
    //                 $schedule = wp_schedule_single_event(time(), $this->import_hook_name);
    //                 $message = 'start_import() - new import';
    //             } else {
    //                 $info['stopping'] = false;
    //                 update_option($this->import_option_name, $info);
    //                 $schedule = wp_schedule_single_event(time(), $this->import_hook_name);
    //                 $message = 'start_import() - continue import';
    //             }
    //         }
    //     }
    //     return ['message' => $message, 'schedule' => $schedule];
    // }

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

    // public function check_import()
    // {
    //     // error_log('check_import()');
    //     $is_scheduled = (bool) wp_next_scheduled($this->import_hook_name);

    //     if (!$is_scheduled) {
    //         $info = get_option($this->import_option_name, $this->get_default_info());
    //         $is_running = $info['running'] === true;

    //         if ($is_running) {
    //             $age = WooTools::get_age($info['started'], 'seconds');
    //             if ($age > 30) {
    //                 $info['attempt']++;
    //                 if ($info['attempt'] < 2) {
    //                     update_option($this->import_option_name, $info);
    //                     error_log('check_import() - attempt ' . $info['attempt']);
    //                 } else {
    //                     $info['status'] = 'stalled';
    //                     update_option($this->import_option_name, $this->get_default_info());
    //                     error_log('check_import() - stalled');
    //                 }
    //             }
    //         } else {
    //             if ($info['cursor'] === false) {
    //                 update_option($this->import_option_name, $this->get_default_info());
    //                 error_log('check_import() - completed');
    //             } else {
    //                 error_log('check_import() - schedule update');
    //                 wp_schedule_single_event(time(), $this->import_hook_name);
    //             }
    //         }
    //     }
    // }

    public function get_import_info()
    {
        // $GLOBALS['wp_object_cache']->delete($this->import_option_name, 'options');
        wp_cache_delete($this->import_option_name, 'options');
        $info = get_option($this->import_option_name);
        $info['is_scheduled'] = (bool) wp_next_scheduled($this->import_loop_action);
        // $info['is_scheduled'] = wp_next_scheduled($this->import_hook_name);
        $date = strtotime($info['started']);
        $info['age'] = $this->time_until($date);
        // $info['age'] = WooTools::get_age($info['started'], 'seconds') . 's';
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
            wp_unschedule_event($info['is_scheduled'], $this->import_loop_name);
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
