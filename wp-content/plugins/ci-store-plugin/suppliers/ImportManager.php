<?php

namespace CIStore\Suppliers;

// include_once CI_STORE_PLUGIN . 'suppliers/wps/Supplier_WPS.php';

class ImportManager
{
    protected $id;
    protected $import_start_hook;
    protected $import_loop_hook;
    protected $import_complete_hook;
    protected $import_info_option;
    protected $import_stop_option;
    protected $import_processing_option;
    protected $import_kill_hook;

    public function __construct(
        $id
    ) {
        // error_log("ImportManager::__construct('{$id}')");
        $this->id = $id;
        $this->import_start_hook = "CIStore\Suppliers\\{$id}\start_import";
        $this->import_loop_hook = "CIStore\Suppliers\\{$id}\import_loop";
        $this->import_complete_hook = "CIStore\Suppliers\\{$id}\import_complete";
        $this->import_info_option = "CIStore\Suppliers\\{$id}\import_info";
        $this->import_stop_option = "CIStore\Suppliers\\{$id}\import_stop";
        $this->import_processing_option = "CIStore\Suppliers\\{$id}\import_processing";
        $this->import_kill_hook = "CIStore\Suppliers\\{$id}\import_kill";
        $this->init();
    }
    /**
     * The single instance of the class.
     *
     * @var ImportManager
     * @since 2.1
     */
    protected static $_instance = null;

    public static function instance($id)
    {
        if (is_null(self::$_instance)) {
            self::$_instance = new self($id);
        }
        return self::$_instance;
    }

    protected function get_default_args()
    {
        return [];
    }

    public function init()
    {
        if (!has_action($this->import_start_hook, [$this, 'start'])) {
            add_action($this->import_start_hook, [$this, 'start'], 10);
        }
        if (!has_action($this->import_loop_hook, [$this, 'import_loop'])) {
            add_action($this->import_loop_hook, [$this, 'import_loop'], 10);
        }
        if (!has_action($this->import_complete_hook, [$this, 'import_complete'])) {
            add_action($this->import_complete_hook, [$this, 'import_complete'], 10);
        }
    }

    public function start($args = []) //$updated_at = null, $cursor = '')
    {
        $is_active = $this->is_active();
        if ($is_active) {
            return $this->get_info();
        }
        $this->clear_stop();
        $this->unschedule($this->import_kill_hook); // just in case

        $args = [ ...$this->get_default_args(), ...$args];
        error_log("ImportManager({$this->id})::start(" . json_encode($args) . ")");

        // if (!$updated_at) {
        //     $updated_at = $this->default_updated_at;
        // }
        // error_log('ImportManager::start(' . json_encode($args) . ')');

        $info = $this->update_info([
            'started' => gmdate("c"),
            'processed' => 0,
            'total' => 0,
            'progress' => 0,
            'complete' => false,
            'completed' => false,
            'args' => $args,
            // 'cursor' => $cursor,
            // 'updated_at' => $updated_at,
        ]);

        $info = $this->update_info($this->before_start($info));

        $this->schedule($this->import_loop_hook);

        return array_merge($info, $this->get_report());
    }

    protected function before_start($info)
    {
        error_log('ImportManager::before_start()');

        // $supplier = \Supplier_WPS::instance();
        // $info = $this->get_info();
        // $updated_at = $info['updated_at'] ?? $this->default_updated_at;
        $total = 0; //$supplier->get_total_remote_products($updated_at);
        return ['total' => $total];
    }

    protected function do_process($info)
    {
        error_log('ImportManager::do_process()');
        // $cursor = $info['cursor'];
        // if (is_string($cursor)) {
        //     $updated_at = $info['updated_at'] ?? $this->default_updated_at;
        //     $supplier = \Supplier_WPS::instance();

        //     $items = $supplier->get_products_page($cursor, 'basic', $updated_at);

        //     $ids = array_map(fn($item) => $item['id'], $items['data'] ?? []);
        //     $next_cursor = $items['meta']['cursor']['next'] ?? false;
        //     error_log('do_process() ' . json_encode(['cursor' => $cursor, 'next_cursor' => $next_cursor, 'date' => $updated_at, 'ids' => $ids]));
        //     $processed_delta = is_countable($items['data']) ? count($items['data']) : 0;
        //     $processed = $info['processed'] + $processed_delta;
        //     $progress = $info['total'] > 0 ? ($processed / $info['total']) : 0;
        //     return [
        //         'cursor' => $next_cursor,
        //         'processed' => $processed,
        //         'progress' => $progress,
        //     ];
        // } else {
        return [
            'complete' => true,
        ];
        // }
    }

    public function import_loop()
    {
        $info = $this->get_info();

        if ($this->should_stop()) {
            return;
        }
        $this->start_processing();
        $delta = $this->do_process($info);
        $info = $this->update_info($delta);
        $this->stop_processing();

        if ($info['complete'] === true) {
            $this->schedule($this->import_complete_hook);
            return;
        }
        if ($this->should_stop()) {
            return;
        }
        $this->schedule($this->import_loop_hook);
    }

    public function import_complete()
    {
        $this->update_info([
            'complete' => true,
            'completed' => gmdate("c"),
            'progress' => 1,
        ]);
    }

    public function stop()
    {
        $this->request_stop();
        $this->schedule($this->import_kill_hook);
        $this->unschedule($this->import_start_hook);
        $this->unschedule($this->import_loop_hook);
        $this->unschedule($this->import_complete_hook);

        $info = $this->update_info([
            'stopped' => gmdate("c"),
            'complete' => false,
            'completed' => false,
        ]);

        return array_merge($info, $this->get_report());
    }

    public function kill_import_events()
    {
        $this->unschedule($this->import_start_hook);
        $this->unschedule($this->import_loop_hook);
        $this->unschedule($this->import_complete_hook);
    }

    public function unschedule($hook)
    {
        $scheduled = wp_next_scheduled($hook);
        if ($scheduled) {
            $res = wp_unschedule_event($scheduled, $hook, [], true);
            if (is_wp_error($res)) {
                error_log('failed to unsched ' . $hook);
            } else {
                error_log('unsched ' . $hook);
            }
        } else {
            error_log('skip unsched ' . $hook);
        }
    }

    public function schedule($hook)
    {
        if(!has_action($this->import_loop_hook)){
            error_log('no hook!!!'.$hook);
        }
        $scheduled = wp_next_scheduled($hook);
        if (!$scheduled) {
            $success = wp_schedule_single_event(time(), $hook);
            if (is_wp_error($success)) {
                error_log('fail schedule() ' . $hook);
                return false;
            }
            error_log('schedule() ' . $hook);
            return true;
        }
        return false;
    }

    public function reset()
    {
        $is_active = $this->is_active();
        if ($is_active) {
            $info = $this->get_info();
        } else {
            $this->clear_stop();
            $info = $this->update_info([
                'status' => 0,
                'started' => false,
                'processed' => 0,
                'total' => 0,
                'progress' => 0,
                // 'cursor' => false,
                'complete' => false,
                'completed' => false,
                'args' => $this->get_default_args(),
                // 'updated_at' => $this->default_updated_at,
            ]);
        }
        return array_merge($info, $this->get_report());
    }

    public function continue ()
    {
        $is_active = $this->is_active();
        if ($is_active) {
            return $this->get_info();
        }
        $this->unschedule($this->import_kill_hook); // just in case
        $this->clear_stop();
        $info = $this->get_info();

        // if (is_string($info['cursor'])) {
        $this->schedule($this->import_loop_hook);
        // }
        return array_merge($info, $this->get_report());
    }

    public function get_import_info()
    {
        return array_merge($this->get_info(), $this->get_report());
    }

    protected function get_report()
    {
        return [
            'stopping' => $this->is_stopping(),
            'processing' => $this->is_processing(),
            'waiting' => $this->is_waiting(),
            'active' => $this->is_active(),
            'should_stop' => $this->should_stop(),
            'import_start_hook' => wp_next_scheduled($this->import_start_hook),
            'import_loop_hook' => wp_next_scheduled($this->import_loop_hook),
            'import_complete_hook' => wp_next_scheduled($this->import_complete_hook),
        ];
    }

    protected function get_info()
    {
        return get_site_transient($this->import_info_option) ?: [];
    }

    protected function set_info($delta)
    {
        set_site_transient($this->import_info_option, $delta);
        return $delta;
    }

    protected function update_info($delta)
    {
        $info = $this->get_info();
        return $this->set_info(array_merge($info, $delta, ['updated' => gmdate("c")]));
    }

    protected function is_processing()
    {
        return (bool) get_site_transient($this->import_processing_option);
    }

    protected function is_waiting()
    {
        return wp_next_scheduled($this->import_start_hook) || wp_next_scheduled($this->import_loop_hook) || wp_next_scheduled($this->import_complete_hook);
    }

    protected function is_active()
    {
        return $this->is_processing() || $this->is_waiting();
    }

    protected function is_stopping()
    {
        return $this->should_stop() && $this->is_active();
    }

    protected function start_processing()
    {
        return set_site_transient($this->import_processing_option, true);
    }

    protected function stop_processing()
    {
        return delete_site_transient($this->import_processing_option);
    }

    protected function should_stop()
    {
        return (bool) get_site_transient($this->import_stop_option);
    }

    protected function request_stop()
    {
        return set_site_transient($this->import_stop_option, true);
    }

    protected function clear_stop()
    {
        return delete_site_transient($this->import_stop_option);
    }
}
/*

// Usage example
$importManager = new ImportManager(
'unique_identifier'
);
$importManager->init();

add_action('wps_kill_import_events', [$importManager, 'kill_import_events']);

 */
