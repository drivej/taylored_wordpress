<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/FileCache.php';

class Job
{
    private $cache;
    private $data;
    public $action;

    public $default_data = [
        'is_running' => false,
        'is_complete' => false,
        'started' => null,
        'stopped' => null,
        'is_stopping' => false,
        'is_stalled' => false,
    ];

    public function __construct($key, $action)
    {
        $this->action = $action;
        $this->cache = new FileCache($key, $this->default_data);
        $this->data = $this->cache->data;
    }

    public function data()
    {
        return $this->cache->pull();
        return $this->data;
    }

    public function update($delta)
    {
        $this->cache->update($delta);
    }

    public function start_action()
    {
        if (is_callable($this->action)) {
            $data = $this->data();
            if ($data['is_running'] !== true) {
                $this->update([
                    'is_running' => true,
                    'is_complete' => false,
                    'started' => gmdate("c"),
                    'stopped' => null,
                    'is_stopping' => false,
                    'is_stalled' => false,
                ]);
                call_user_func($this->action, $this);
                return true;
            }
        }
        error_log('start_action() failed');
        return false;
    }

    public function stop_action()
    {
        error_log('Job::stop_action()');
        $data = $this->data();
        if ($data['is_stopping'] !== true) {
            $this->update([
                'is_stopping' => true,
            ]);
        }
    }

    public function complete_action()
    {
        $this->update([
            'is_running' => false,
            'is_complete' => true,
            'stopped' => gmdate("c"),
            'is_stopping' => false,
            'is_stalled' => false,
        ]);
    }

    public function stall_check()
    {
        $is_stalled = false;
        $data = $this->data();
        if (isset($data['updated'])) {
            $updated_time = strtotime($data['updated']);
            $current_time = strtotime(gmdate("c"));
            $time_difference = $current_time - $updated_time;
            $minutes_elapsed = round($time_difference / 60);
            $is_stalled = $minutes_elapsed > 2; // set stall minutes threshold
        } else {
            $this->update(['updated' => gmdate("c")]);
        }
        if ($is_stalled) {
            $this->update([
                'is_running' => false,
                'is_complete' => false,
                'stopped' => gmdate("c"),
                'is_stopping' => false,
                'is_stalled' => true,
            ]);
        }
    }
}
