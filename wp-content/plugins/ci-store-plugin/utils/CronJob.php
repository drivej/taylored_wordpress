<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/CustomLog.php';

class CronJobInfo
{
    public bool $is_scheduled = false;
    public bool $is_running = false;
    public bool $is_stopping = false;
    public bool $is_stalled = false;
    public bool $is_completed = false;
    public bool $is_error = false;

    public function __construct(array $delta = [])
    {
        $this->update($delta);
    }

    public function update(array $delta): void
    {
        foreach ($delta as $key => $value) {
            if (property_exists($this, $key)) {
                $this->$key = $value;
            }
        }
    }
}

class CronJob
{
    public string $key;
    public string $schedule_hook;
    public string $should_stop_key;
    public string $option_info;
    public string $option_processing;
    public CustomLog $logger;
    private $action;
    private $on_complete;

    public function __construct($key, callable $action, callable $on_complete)
    {
        $this->key = sanitize_title($key);
        $this->schedule_hook = "{$this->key}_schedule_";
        $this->should_stop_key = "{$this->key}_should_stop";
        $this->option_info = "{$this->key}_option_info";
        $this->option_processing = "{$this->key}_processing";
        $this->logger = new CustomLog($key);
        $this->action = $action;
        $this->on_complete = $on_complete;
        add_action($this->key, array($this, 'do_action'), 10, 1);
    }

    public function log($message)
    {
        $this->logger->log($message);
    }
    /**
     * @return CronJobInfo
     */
    private function get_info()
    {
        wp_cache_delete($this->option_info, 'options');
        $info = get_option($this->option_info, []);
        return new CronJobInfo($info);
    }
    /**
	 * @param array $delta
     * @return CronJobInfo
     */
    private function set_info(array $delta)
    {
        $info = get_option($this->option_info, []);
        $update = array_merge($info, $delta);
        update_option($this->option_info, $update);
        return new CronJobInfo($update);
    }

    public function start($args)
    {
        $info = $this->get_info();

        if ($info->is_scheduled) {
            $this->log("CronJob::start() failed / scheduled");
            return false;
        }

        if ($this->is_scheduled()) {
            $this->log("CronJob::start() failed / scheduled");
            return false;
        }
        if ($this->is_processing()) {
            $this->log("CronJob::start() failed / processing");
            return false;
        }
        if ($this->should_stop()) {
            delete_transient($this->should_stop_key);
            $this->log("CronJob::start() failed / stopping");
            return false;
        }
        if ($this->is_active()) {
            $this->log("CronJob::start() failed / active");
            return false;
        }

        $this->log("CronJob::start()");
        $this->set_info($args);
        wp_schedule_single_event(time() + 30, $this->schedule_hook);
        return true;
    }

    public function do_action($args)
    {
        set_transient($this->key, true, 60 * 10);
        $start_time = microtime(true);
        $json = json_encode($args);
        $this->log("CronJob::do_action() {$this->key} {$json} (start)");
        $result = call_user_func($this->action, $args);
        delete_transient($this->key);
        call_user_func($this->on_complete, $result, $args);
        $end_time = microtime(true);
        $exetime = round($end_time - $start_time);
        $this->log("CronJob::do_action() {$this->key} {$json} (completed in {$exetime}s)");
    }

    public function is_active()
    {
        return $this->is_scheduled() || $this->is_processing();
    }

    public function is_scheduled()
    {
        return (bool) wp_next_scheduled($this->schedule_hook);
    }

    public function unschedule()
    {
        $this->log("CronJob::unschedule()");
        return wp_clear_scheduled_hook($this->schedule_hook);
    }

    public function is_processing()
    {
        return (bool) get_transient($this->key);
    }

    public function should_stop()
    {
        return (bool) get_transient($this->should_stop_key);
    }

    public function get_status()
    {
        return [
            'is_active' => $this->is_active(),
            'is_scheduled' => $this->is_scheduled(),
            'is_processing' => $this->is_processing(),
            'should_stop' => $this->should_stop(),
        ];
    }

    public function stop()
    {
        if ($this->is_scheduled()) {
            $this->unschedule();
            delete_transient($this->key);
            delete_transient($this->should_stop_key);
            $this->log("CronJob::stop()");
            return true;
        }
        if ($this->is_processing()) {
            set_transient($this->should_stop_key, true);
            $this->log("CronJob::stop()");
            return true;
        }
        // if (get_transient($this->key)) {
        //     // is running
        //     set_transient($this->should_stop_key, true);
        // } else if (wp_next_scheduled($this->key)) {
        //     return wp_clear_scheduled_hook($this->key);
        // }
        // if ($this->is_active()) {
        //     $this->log("CronJob::stop()");
        //     return wp_clear_scheduled_hook($this->key);
        // }
        // delete_transient($this->key);
        $this->log("CronJob::stop() failed");
        return false;
    }
}
