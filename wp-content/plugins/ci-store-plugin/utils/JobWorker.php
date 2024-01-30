<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/FileCache.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/LogFile.php';

class JobWorker
{
    public $wp_action_name = '';
    public string $key;
    private array $default_data = [
        'is_running' => false,
        'is_stopping' => false,
        'is_complete' => false,
        'is_stalled' => false,
        'started' => null,
        'stopped' => null,
        'completed' => null,
        'progress' => 0,
        'result' => [],
    ];
    public FileCache $cache; // TODO: It'd be nice to use something native or the actual wordpress db
    public LogFile $log_file;
    private $info = [];

    public function __construct(string $key)
    {
        $this->key = 'job_worker_' . $key;
        $this->log_file = new LogFile($key);
        $this->cache = new FileCache($this->key, [...$this->default_data, 'key' => $this->key]);
        if (!isset($this->cache->data['is_running'])) {
            $this->cache->update($this->default_data);
        }
        $this->info = [
            'key' => $this->key,
            'data_url' => $this->cache->url,
            'log_url' => $this->log_file->url,
        ];
        $this->wp_action_name = 'job_worker_task_' . $key;
        add_action($this->wp_action_name, array($this, 'task'), 10, 2);
        // add_option($this->key, [...$this->default_data, 'key' => $this->key]);
        add_action('wp_ajax_' . $key . '_api', array($this, 'handle_ajax'));
        $this->stall_check();
    }

    public function log($message)
    {
        $this->log_file->log($message);
    }

    public function handle_ajax()
    {
        $cmd = $_GET['cmd'];

        switch ($cmd) {
            case 'info':
                wp_send_json($this->info);
                break;

            case 'status':
                wp_send_json($this->get_data());
                break;

            case 'start':
                wp_send_json($this->start());
                break;

            case 'resume':
                wp_send_json($this->resume());
                break;

            case 'stop':
                wp_send_json($this->stop());
                break;

            case 'reset':
                wp_send_json($this->reset());
                break;

            case 'log':
                wp_send_json($this->log_file->get_log());
                break;

            case 'clear_log':
                wp_send_json($this->log_file->clear());
                break;

            case 'hack':
                wp_send_json($this->get_data());
                break;

            default:
                wp_send_json(['error' => 'no cmd']);
        }
        wp_die();
    }

    public function task($is_resuming = false, $get = null)
    {
        $is_resuming;
        $get;
        $this->complete();
    }

    public function run_task($is_resuming = false)
    {
        if (!wp_next_scheduled($this->wp_action_name)) {
            // error_log('JobWorker::run_task()');
            wp_schedule_single_event(time() + 1, $this->wp_action_name, [$is_resuming, $_GET]);
        }
    }

    public function get_data()
    {
        // wp_cache_delete($this->key, 'options');
        // $data = get_option($this->key, null);
        $data = $this->cache->pull();
        return $data;
    }

    public function put_data($data)
    {
        // update_option($this->key, $data);
        $this->cache->update($data);
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
            $this->log_file->clear();
            error_log('JobWorker::start');
            $data['is_running'] = true;
            $data['is_stopping'] = false;
            $data['is_complete'] = false;
            $data['is_stalled'] = false;
            $data['started'] = gmdate("c");
            $data['updated'] = gmdate("c");
            $data['stopped'] = null;
            $data['completed'] = null;
            $data['progress'] = 0;
            $this->put_data($data);
            $this->run_task();
        }
        return $data;
    }

    public function stop($force = false)
    {
        $data = $this->get_data();
        if ($data['is_running'] === true) {
            error_log('JobWorker::stop() ' . ($force ? 'force' : ''));
            $data['is_stopping'] = true;
            if ($force) {
                $data['is_running'] = false;
                $data['is_stopping'] = false;
                $data['stopped'] = gmdate("c");
            } else {
                $data['is_stopping'] = true;
            }
            $this->put_data($data);
        }
        return $data;
    }

    public function resume()
    {
        $data = $this->get_data();
        if ($data['is_running'] !== true) {
            $data['is_running'] = true;
            $data['is_stalled'] = false;
            $data['is_stopping'] = false;
            $data['is_complete'] = false;
            $data['stopped'] = null;
            $this->put_data($data);
            $this->run_task(true);
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

    public function reset()
    {
        error_log('JobWorker::reset()');
        $data = $this->get_data();
        if (!isset($data['is_running']) || $data['is_running'] !== true) {
            error_log('--> ' . json_encode([...$this->default_data, 'key' => $this->key]));
            $this->put_data([...$this->default_data, 'key' => $this->key]);
            $test = $this->cache->pull();
            error_log('--> test ' . json_encode($test));
        }
        return $data;
    }

    public function stall()
    {
        $data = $this->get_data();
        if ($data['is_running'] === true) {
            error_log('JobWorker::stall()');
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
            if ($data['is_running'] === true && $data['is_stopping'] === true) {
                $updated_time = strtotime($data['updated']);
                $current_time = strtotime(gmdate("c"));
                $time_difference = $current_time - $updated_time;
                $seconds_elapsed = round($time_difference);
                $is_stalled = $seconds_elapsed > 10; // set stall minutes threshold

                if ($is_stalled) {
                    // error_log('JobWorker::stall_check() stalled');
                    $data['is_running'] = false;
                    $data['is_complete'] = true;
                    $data['is_stopping'] = false;
                    $data['is_stalled'] = true;
                    $data['stopped'] = gmdate("c");
                    $this->put_data($data);
                }
            }
        } else {
            $data['updated'] = gmdate("c");
            $this->put_data($data);
        }
    }

    public function schedule($recurrence = 'every_day')
    {
        $next = wp_next_scheduled($this->wp_action_name);
        if ($next === false) {
            wp_schedule_event(time(), $recurrence, $this->wp_action_name);
        }
    }
}
