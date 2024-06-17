<?php

require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/CustomLog.php';

class Tasket
{
    protected bool $active = true;
    public string $key;
    public string $report_flag;
    public string $event_flag;
    public CustomLog $logger;
    protected array $empty_report = [
        // data
        'input' => [],
        'output' => [],
        // flags
        'is_running' => false,
        'is_stalled' => false,
        'is_cancelled' => false,
        'is_complete' => false,
        'is_error' => false,
        // error
        'error' => '',
        // activity
        'ping' => 0,
        'loops' => 0,
        'progress' => 0,
        'duration' => 0,
        // timestamps
        'started' => '',
        'stopped' => '',
        'completed' => '',
    ];

    public function __construct($name)
    {
        $this->key = sanitize_title($name);
        $this->event_flag = 'task_' . $this->key . '_event';
        $this->report_flag = 'task_' . $this->key . '_report';
        $this->logger = new CustomLog($this->key);

        add_action($this->event_flag, array($this, 'run'), 10);
        set_error_handler([$this, 'log']);
    }

    public function start($input, $output)
    {
        if (!$this->is_busy()) {
            $this->clear_log();
            $this->log('start()');
            $this->update_report([
                'is_running' => false,
                'is_complete' => false,
                'is_stalled' => false,
                'is_error' => false,
                'error' => '',
                'ping' => gmdate('c'),
                'loops' => 0,
                'started' => gmdate('c'),
                'input' => $input,
                'output' => $output,
                'progress' => 0,
                'duration' => 0,
            ]);
            return wp_schedule_single_event(time(), $this->event_flag);
        } else {
            $report = $this->get_report();
            $this->log('start() - busy ' . json_encode(['is_scheduled' => $this->is_scheduled(), 'is_running' => $report['is_running']]));
        }
        return false;
    }

    public function run()
    {
        $this->log('run()');
        $report = $this->ping();

        if ($report['is_cancelled']) {
            $this->end('cancelled');
            return;
        }
        $this->process();
        $report = $this->ping();
        $report['loops'] = $report['loops'] + 1;
        $report['duration'] = $this->get_seconds_since($report['started']);

        $this->update_report($report);

        if ($this->should_cancel()) {
            $this->end('cancelled');
        } else if ($report['is_complete']) {
            $this->end();
        } else {
            $this->continue();
        }
    }

    public function process()
    {
        $this->log('default process()');
        $report['input']['next_page'] = time();
        $report['output']['steps']++;
        $report['is_complete'] = $report['loops'] > 5;
        $report['progress'] = $report['loops'] / 5;
        return $report;
    }

    public function continue ()
    {
        $this->log('continue()');
        sleep(1);
        $is_scheduled = $this->is_scheduled();
        if (!$is_scheduled) {
            $scheduled = wp_schedule_single_event(time(), $this->event_flag);
            if (!$scheduled) {
                $this->end('schedule failed');
            }
        }
    }

    public function end($error = '')
    {
        $this->log('end()');
        $report = $this->get_report();
        $is_error = (bool) $error;

        $update = [
            'is_running' => false,
            'is_complete' => true,
            'is_cancelled' => false,
            'is_error' => $is_error,
            'duration' => $this->get_seconds_since($report['started']),
            'error' => $error,
        ];

        if ($is_error) {
            $update['stopped'] = gmdate('c');
        } else {
            $update['completed'] = gmdate('c');
            $update['progress'] = 1;
        }

        $this->update_report($update);
    }

    public function resume()
    {
        if (!$this->is_busy()) {
            return wp_schedule_single_event(time(), $this->event_flag);
        }
        return false;
    }

    public function is_scheduled()
    {
        return wp_next_scheduled($this->event_flag);
    }

    public function is_busy()
    {
        $report = $this->get_report();
        return $this->is_scheduled() || $report['is_running'];
    }

    public function ping()
    {
        return $this->update_report(['ping' => gmdate('c'), 'is_running' => true]);
    }

    public function should_cancel()
    {
        return (bool) $this->get_report()['is_cancelled'];
    }

    public function cancel()
    {
        $this->log('cancel()');

        if ($this->is_scheduled()) {
            $this->unschedule();
        }

        $report = $this->get_report();

        if ($report['is_running']) {
            $this->update_report(['is_cancelled' => true]);
        }

        if ($report['is_cancelled']) {
            if ($report['is_stalled']) {
                $this->update_report([
                    'is_running' => false,
                    'is_cancelled' => false,
                    'is_stalled' => false,
                ]);
            }
        }

        return $this->get_report();
    }

    public function unschedule()
    {
        if ($this->is_scheduled()) {
            return wp_clear_scheduled_hook($this->event_flag);
        }
    }

    public function get_report()
    {
        wp_cache_flush();
        $report = get_option($this->report_flag, $this->empty_report);

        // determine stalled status
        $is_stalled = false;
        if ($report['is_running']) {
            $updated_time = strtotime($report['ping']);
            $current_time = strtotime(gmdate("c"));
            $time_difference = $current_time - $updated_time;
            $seconds_elapsed = round($time_difference);
            // $seconds_elapsed = $this->get_seconds_since($report['ping']);
            $is_stalled = $seconds_elapsed > 60 * 1;

            $seconds_elapsed = $this->get_seconds_since($report['ping']);
        }
        $report['is_stalled'] = $is_stalled;
        $is_scheduled = $this->is_scheduled();
        $report['is_scheduled'] = $is_scheduled;
        $report['time'] = time();

        if ($is_scheduled) {
            $current_time = time();
            $report['seconds_until_next_schedule'] = $is_scheduled - time();
        } else {
            $report['seconds_until_next_schedule'] = -1;
        }

        return $report;
    }

    public function update_report($delta, $ping = false)
    {
        $report = $this->get_report();
        $update = array_merge($report, $delta);
        if ($ping) {
            $update['ping'] = gmdate('c');
            $update['is_running'] = true;
        }
        update_option($this->report_flag, $update);
        return $update;
    }

    public function get_seconds_since($start)
    {
        $updated_time = strtotime($start);
        $current_time = strtotime(gmdate("c"));
        $time_difference = $current_time - $updated_time;
        $seconds_elapsed = round($time_difference);
        return $seconds_elapsed;
    }

    public function log($msg)
    {
        $this->logger->log($this->key . ': ' . $msg);
    }

    public function get_log()
    {
        return $this->logger->get_log();
    }

    public function clear_log()
    {
        $this->logger->clear_log();
    }

}
