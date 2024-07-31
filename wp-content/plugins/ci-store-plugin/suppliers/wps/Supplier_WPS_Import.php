<?php

trait Supplier_WPS_Import
{
    protected $page_size = 24;
    private string $import_hook_name = '';
    private string $import_hook_loop_name = '';
    private string $import_hook_init_name = '';
    private string $import_option_name = '';
    private string $default_updated_at = '2023-01-01';

    protected function init_import_actions()
    {
        $this->import_hook_init_name = "{$this->key}_import_products_init_action";
        $this->import_hook_name = "{$this->key}_import_products_page_action";
        $this->import_option_name = "import_status_{$this->key}";
        add_action($this->import_hook_init_name, [$this, 'import_hook_init_action'], 10);
        add_action($this->import_hook_loop_name, [$this, 'import_loop'], 10);
    }

    protected function get_default_info()
    {
        return [
            'prev_cursor' => false,
            'cursor' => '',
            'updated_at' => $this->default_updated_at,
            'size' => $this->page_size,
            'running' => false,
            'attempt' => 0,
            'status' => 'idle',
            'stopping' => false,
            'started' => gmdate("c"),
            'processed' => 0,
            'total_products' => 0,
        ];
    }

    // this kicks off the big import each week
    public function init_import()
    {
        // create weekely import event
        $next_scheduled = wp_next_scheduled($this->import_hook_init_name);
        if (!$next_scheduled) {
            error_log('init_import() - create scheduled event');
            wp_schedule_event(time(), 'weekly', $this->import_hook_init_name);
        }
    }

    // this is the first function that fires
    public function import_hook_init_action()
    {
        $is_scheduled = (bool) wp_next_scheduled($this->import_hook_loop_name);
        if ($is_scheduled) {
            return ['error' => 'loop is scheduled'];
        }
        // run weekly import action
        error_log('import_hook_init_action()');
        $info = get_option($this->import_option_name, $this->get_default_info());
        $info['size'] = $this->page_size;
        $info['total_products'] = $this->get_total_remote_products();
        $info['started'] = gmdate("c");
        $info['processed'] = 0;
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

    public function chunk_products_page($cursor, $size = 24, $updated_at = null)
    {
        // the API fails if the response is too large
        $items = [];
        $ids = [];
        $next_cursor = $cursor;
        $page_size = 4;

        while (is_string($next_cursor) && count($ids) <= $size) {
            $prev_cursor = $next_cursor;
            $items_page = $this->load_products_page($next_cursor, $page_size, $updated_at);
            $ids_page = is_array($items_page['data']) ? array_map(fn($item) => $item['id'], $items_page['data']) : [];
            $next_cursor = isset($items_page['meta']['cursor']['next']) && is_string($items_page['meta']['cursor']['next']) && strlen($items_page['meta']['cursor']['next']) ? $items_page['meta']['cursor']['next'] : false;

            if (count($ids_page)) {
                array_push($items, ...$items_page['data']);
                array_push($ids, ...$ids_page);
            }
            error_log("{$prev_cursor} => {$next_cursor}");
        }

        $items_page['meta']['cursor']['count'] = count($items);
        $items_page['meta']['cursor']['initial'] = $cursor;

        return [
            'meta' => $items_page['meta'],
            'data' => $items,
        ];
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
                $items = $this->import_products_page($info['cursor'], $info['size']);

                $ids = is_array($items['data']) ? array_map(fn($item) => $item['id'], $items['data']) : [];
                $next_cursor = is_string($items['meta']['cursor']['next']) && strlen($items['meta']['cursor']['next']) ? $items['meta']['cursor']['next'] : false;

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
            error_log('import_loop() - stopped');
        } else if ($next_cursor) {
            $info['cursor'] = $next_cursor;
            wp_schedule_single_event(time(), $this->import_hook_loop_name);
        } else {
            $info['status'] = 'stalled';
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

    public function is_importing()
    {
        $next_scheduled = wp_next_scheduled($this->import_hook_loop_name);
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

    //
    // Utility
    //
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

// public function start_import_products()
// {
//     $result = [];
//     $result = $this->get_import_status();

//     if ($result['is_stalled']) {
//         $result['error'] = 'import stalled';
//     }

//     if ($result['is_running']) {
//         $result['error'] = 'import running';
//     }

//     if ($result['is_scheduled']) {
//         $result['error'] = 'import scheduled';
//     }

//     if (isset($result['error'])) {
//         return $result;
//     }

//     $should_schedule_import = true;

//     // if (!$result['is_stopped'] && $result['started_hours_ago'] < 48) {
//     //     $should_schedule_import = false;
//     //     $result['error'] = 'started ' . $result['started_hours_ago'] . ' hours ago';
//     // }

//     if ($should_schedule_import) {
//         $updated = $result['last_started']->format('Y-m-d'); // updated since
//         $products_count = $this->get_products_count($updated);
//         $result['report'] = $this->update_import_report([
//             'processed' => 0,
//             'delete' => 0,
//             'update' => 0,
//             'ignore' => 0,
//             'insert' => 0,
//             'patched' => 0,
//             'error' => '',
//             'updated' => $updated,
//             'products_count' => $products_count,
//             'cursor' => '',
//             'started' => gmdate("c"),
//             'stopped' => '',
//             'page_size' => $this->page_size,
//         ]);
//         $result['scheduled'] = $this->schedule_import();
//     }
//     $result['should_schedule_import'] = $should_schedule_import;
//     return $result;
// }
/*

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

// if ($is_scheduled) {
// error_log('scheduled: skip');
// } else {
// if ($is_running) {
// $age = WooTools::get_age($info['started'], 'seconds');
// if ($age > 60) {
// error_log('stalled: restart');
// $info['started'] = gmdate("c");
// update_option($this->import_option_name, $info);
// $scheduled = wp_schedule_single_event(time(), $this->import_hook_name);
// } else {
// error_log('running: skip');
// }
// } else {
// error_log('schedule import');
// $scheduled = wp_schedule_single_event(time(), $this->import_hook_name);
// }
// }

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

 */
