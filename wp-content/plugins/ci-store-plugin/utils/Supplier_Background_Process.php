<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/CronJob.php';
// include_once WP_PLUGIN_DIR . '/ci-store-plugin/libraries/wp-background-process.php';

defined('WC_PLUGIN_FILE') || exit;

include_once WP_PLUGIN_DIR . '/woocommerce/includes/abstracts/class-wc-background-process.php';


class Supplier_Background_Process extends WP_Background_Process
{
    protected $item;
    protected $task_result;
    protected string $continue_option_name;
    protected string $stopping_option_name;
    protected string $running_option_name;
    protected Supplier $supplier;
    public bool $should_stop = false;

    public function __construct(Supplier $supplier, string $supplier_key)
    {
        $this->action = "{$supplier_key}_supplier_background_process";
        $this->continue_option_name = "{$supplier_key}_supplier_background_process_state";
        $this->stopping_option_name = "{$supplier_key}_supplier_background_process_stop";
        parent::__construct();
        $this->supplier = $supplier;
    }

    protected function task($item)
    {
        $this->item = $item;
        $this->task_result = [];

        if ($this->should_stop) {
            $this->cancel_process();
            return false;
        }
        // $this->supplier->log("task(" . json_encode($this->item) . ") {$this->action}");
        // START custom code
        try {
            // $this->supplier->log("start do_task()");
            // $start_time = microtime(true);
            $this->task_result = $this->do_task($item);
            // $end_time = microtime(true);
            // $exetime = round($end_time - $start_time);
            // $this->supplier->log("end do_task() {$exetime}");
        } catch (Exception $e) {
            $this->task_result = null;
            $this->supplier->log("ERROR task(" . json_encode($this->item) . ") {$this->action}");
        }
        // END custom code
        return false;
    }

    protected function do_task($item)
    {
        // custom code
        return false;
    }

    protected function complete()
    {
        parent::complete();
        $args = $this->should_continue($this->task_result, $this->item);
        if ($args) {
            $this->push_to_queue($args);
            $this->save()->dispatch();
        } else {
            delete_option($this->continue_option_name);
        }
    }

    protected function should_continue()
    {
        return false;
    }

    public function cancel()
    {
        $this->cancel_process();
        $this->should_stop = true;
        $continue = $this->get_continue_args();
        update_option($this->continue_option_name, $continue);
        update_option($this->stopping_option_name, true);
        return ['is_queue_empty' => $this->is_queue_empty(), 'continue' => $continue];
    }

    public function clear_stop()
    {
        delete_option($this->stopping_option_name);
    }

    public function start($args)
    {
        $this->supplier->log('Supplier_Background_Process::start()');
        if (!$this->is_running()) {
            $this->should_stop = false;
            $this->clear_stop();
            $this->push_to_queue($args);
            $this->supplier->log('Supplier_Background_Process::dispatch()');
            $this->save()->dispatch();
            return true;
        }
        return false;
    }

    public function stop_requested()
    {
        wp_cache_flush();
        return get_option($this->stopping_option_name);
    }

    public function is_running()
    {
        $is_running = $this->is_process_running();
        $is_empty = $this->is_queue_empty();
        return $is_running || !$is_empty;
    }

    public function get_status()
    {
        return [
            'is_queue_empty' => $this->is_queue_empty(),
            'is_running' => $this->is_process_running(),
            'action' => $this->action,
            'identifier' => $this->identifier,
            'supplier' => $this->supplier->name,
            'should_stop' => $this->should_stop,
        ];
    }

    public function get_continue_args()
    {
        return ['item' => $this->item, 'task_result' => $this->task_result];
    }

    public function continue ()
    {
        if (!$this->is_running()) {
            $continue = get_option($this->continue_option_name);
            if ($continue) {
                $this->item = isset($continue['item']) ? $continue['item'] : null;
                $this->task_result = isset($continue['task_result']) ? $continue['task_result'] : null;

                if ($this->task_result) {
                    $this->complete();
                    return ['continue' => true, 'task_result' => $this->task_result];
                } else if ($this->item) {
                    $this->task($this->item);
                    return ['continue' => true, 'item' => $this->item];
                }
            }
        }
        return false;
    }

}
