<?php

class JobWorker
{
    public $wp_action_name = '';
    public string $key;
    private array $default_data = [
        'is_running' => false,
        'is_stopping' => false,
        'is_complete' => false,
        'started' => null,
        'stopped' => null,
        'completed' => null,
    ];

    public function __construct(string $key)
    {
        $this->key = 'job_worker_' . $key;
        $this->wp_action_name = 'job_worker_task_' . $key;
        add_action($this->wp_action_name, array($this, 'task'), 10);
        add_option($this->key, [...$this->default_data, 'key' => $this->key]);
        add_option($this->key . '_stop_flag', false);
        $this->stall_check();
    }

    public function task()
    {
        $this->complete();
    }

    public function run_task()
    {
        if (!wp_next_scheduled($this->wp_action_name)) {
            error_log('JobWorker::run_task()');
            wp_schedule_single_event(time() + 1, $this->wp_action_name);
        }
    }

    public function get_data()
    {
        $data = get_option($this->key);
        return $data; //[...$this->default_data, ...$data];
    }

    public function put_data($data)
    {
        update_option($this->key, $data);
    }

    public function update_result($result)
    {
        $data = $this->get_data();
        $data['result'] = $result;
        $data['updated'] = gmdate("c");
        $this->put_data($data);
    }

    public function start()
    {
        $data = $this->get_data();
        if ($data['is_running'] !== true) {
            error_log('JobWorker::start');
            delete_option($this->key . '_stop_flag');
            $data['is_running'] = true;
            $data['is_stopping'] = false;
            $data['is_complete'] = false;
            $data['started'] = gmdate("c");
            $data['stopped'] = null;
            $data['completed'] = null;
            $this->put_data($data);
            $this->run_task();
        }
        return $data;
    }

    public function is_stopping()
    {
        return (bool) get_option($this->key . '_stop_flag');
    }

    public function stop($force = false)
    {
        $data = $this->get_data();
        if ($data['is_running'] === true) {
            error_log('JobWorker::stop() ' . ($force ? 'forcexx' : ''));
            update_option($this->key . '_stop_flag', true);
            $data['is_running'] = false;
            $data['is_stopping'] = true;

            // error_log('--> JobWorker::stop()');
            // if ($force) {
            //     $data['is_stopping'] = true;
            //     $data['stopped'] = gmdate("c");
            // } else {
            //     $data['is_stopping'] = true;
            // }
            $this->put_data($data);
            error_log('--> ' . json_encode($data, JSON_PRETTY_PRINT));
        }
        return $data;
    }

    public function resume()
    {
        $data = $this->get_data();
        if ($data['is_running'] !== true) {
            delete_option($this->key . '_stop_flag');
            $data['is_running'] = true;
            $data['is_stalled'] = false;
            $data['is_stopping'] = false;
            $data['is_complete'] = false;
            $data['stopped'] = null;
            $this->put_data($data);
        }
        return $data;
    }

    public function complete()
    {
        error_log('JobWorker::complete()');
        $data = $this->get_data();
        $data['is_running'] = false;
        $data['is_complete'] = true;
        $data['is_stopping'] = false;
        $data['is_stalled'] = false;
        $data['completed'] = gmdate("c");
        $this->put_data($data);
        return $data;
    }

    public function stall()
    {
        $data = $this->get_data();
        if ($data['is_running'] === true) {
            $data['is_running'] = false;
            $data['is_complete'] = true;
            $data['is_stopping'] = false;
            $data['is_stalled'] = true;
            $data['stopped'] = gmdate("c");
            $this->put_data($data);
        }
        return $data;
    }

    public function stall_check()
    {
        $is_stalled = false;
        $data = $this->get_data();
        if (isset($data['updated'])) {
            if ($data['is_running'] === true) {
                $updated_time = strtotime($data['updated']);
                $current_time = strtotime(gmdate("c"));
                $time_difference = $current_time - $updated_time;
                $minutes_elapsed = round($time_difference / 60);
                $is_stalled = $minutes_elapsed > 2; // set stall minutes threshold
                if ($is_stalled) {
                    $this->stall();
                }
            }
        } else {
            $data['updated'] = gmdate("c");
            $this->put_data($data);
        }
    }
}
