<?php

namespace CIStore\Suppliers;

use CIStore\Utils\CustomErrorLog;

include_once CI_STORE_PLUGIN . 'utils/get_age.php';
include_once CI_STORE_PLUGIN . 'utils/CustomErrorLog.php';

class ImportManager
{
    protected $id = 'none';
    protected $auto_import_hook;
    protected $import_start_hook;
    protected $import_loop_hook;
    protected $import_complete_hook;
    protected $import_info_option;
    protected $import_stop_option;
    protected $import_processing_option;
    protected $import_kill_hook;
    protected $stall_maxage = 5; // minutes
    protected $log_path = '';
    protected CustomErrorLog $logger;

    public function __construct($id, $logger)
    {
        $this->id = $id;
        $this->auto_import_hook = "CIStore\Suppliers\\{$id}\auto_import";
        $this->import_start_hook = "CIStore\Suppliers\\{$id}\start_import";
        $this->import_loop_hook = "CIStore\Suppliers\\{$id}\import_loop";
        $this->import_complete_hook = "CIStore\Suppliers\\{$id}\import_complete";
        $this->import_info_option = "CIStore\Suppliers\\{$id}\import_info";
        $this->import_stop_option = "CIStore\Suppliers\\{$id}\import_stop";
        $this->import_processing_option = "CIStore\Suppliers\\{$id}\import_processing";
        $this->import_kill_hook = "CIStore\Suppliers\\{$id}\import_kill";
        $this->log_path = CI_STORE_PLUGIN . 'logs/' . date('Y-m-d') . '_' . strtoupper($id) . '_IMPORT_LOG.log';
        $this->logger = $logger ?? new \CIStore\Utils\CustomErrorLog(strtoupper($id) . '_IMPORT');

        if (!has_action($this->auto_import_hook, [$this, 'auto_import'])) {
            add_action($this->auto_import_hook, [$this, 'auto_import'], 10, 1);
        }
        if (!has_action($this->import_start_hook, [$this, 'start'])) {
            add_action($this->import_start_hook, [$this, 'start'], 10, 1);
        }
        if (!has_action($this->import_loop_hook, [$this, 'import_loop'])) {
            add_action($this->import_loop_hook, [$this, 'import_loop'], 10);
        }
        if (!has_action($this->import_complete_hook, [$this, 'import_complete'])) {
            add_action($this->import_complete_hook, [$this, 'import_complete'], 10);
        }
        if (!has_action($this->import_kill_hook, [$this, 'kill_import_events'])) {
            add_action($this->import_kill_hook, [$this, 'kill_import_events'], 10);
        }

        // $info = $this->get_import_info();
        // if ($info['stopping'] && $info['processing']) {
        //     $age = \CIStore\Utils\get_age($info['updated'], 'minutes');
        //     if ($age > $this->stall_maxage) {
        //         $this->stop_processing();
        //     }
        // }
    }

    public function get_auto_import_args()
    {
        return $this->get_default_args();
    }

    public function get_rerun_args()
    {
        return $this->get_default_args();
    }

    public function auto_import()
    {
        if ($this->is_active()) {
            $this->log('Auto import aborted. Import currently active.');
            return;
        }
        $args = $this->get_auto_import_args();
        $this->start($args);
    }

    public function get_next_import_time()
    {
        $next_scheduled = wp_next_scheduled($this->auto_import_hook);
        if ($next_scheduled) {
            return ['data' => date("Y-m-d H:i:s", $next_scheduled)];
        }
        return ['data' => false];
    }

    public function create_scheduled_import()
    {
        error_log('schedule_import()');
        // $this->import_start_hook
        $next_scheduled = wp_next_scheduled($this->auto_import_hook);
        if (!$next_scheduled) {
            $timestamp = strtotime('today midnight') - get_option('gmt_offset') * HOUR_IN_SECONDS;
            $scheduled = wp_schedule_event($timestamp, 'daily', $this->auto_import_hook);
            if (!is_wp_error($scheduled)) {
                return true;
            }
        }
        return false;
    }

    public function cancel_scheduled_import()
    {
        error_log('cancel_scheduled_import()');
        $next_scheduled = wp_next_scheduled($this->auto_import_hook);
        if ($next_scheduled) {
            $cancelled = wp_unschedule_event($next_scheduled, $this->auto_import_hook);
            if (!is_wp_error($cancelled)) {
                return true;
                // error_log('wp_unschedule_event failed ' . json_encode($cancelled));
            }
            // } else {
            //     error_log('not scheduled');
        }
        return false;
    }

    public function log($message = null)
    {
        return $this->logger->log('ImportManager::' . $message);
    }

    public function logs()
    {
        return $this->logger->logs();
    }

    public function clear()
    {
        return $this->logger->clear();
    }

    protected function get_default_args()
    {
        return [];
    }

    public function start($args = [])
    {
        $is_active = $this->is_active();
        if ($is_active) {
            return $this->get_info();
        }
        $this->clear_stop();
        $this->unschedule($this->import_kill_hook); // just in case
        $args = [ ...$this->get_default_args(), ...$args];
        $this->log("start(" . json_encode($args) . ")");

        $info = $this->update_info([
            'started' => gmdate("c"),
            'processed' => 0,
            'total' => 0,
            'progress' => 0,
            'complete' => false,
            'completed' => false,
            'args' => $args,
        ]);

        $info = $this->update_info($this->before_start($info));
        $this->schedule($this->import_loop_hook);
        return array_merge($info, $this->get_report());
    }

    protected function before_start($info)
    {
        $total = 0;
        return ['total' => $total];
    }

    protected function do_process($info)
    {
        return ['complete' => true];
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
        $info = $this->update_info([
            'complete' => true,
            'completed' => gmdate("c"),
            'progress' => 1,
        ]);
        $this->on_complete($info);
    }

    public function on_complete($info)
    {
        // customize...
    }

    public function stop()
    {
        $this->log('stop()');
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

        if (array_key_exists('stalled', $info) && $info['stalled']) {
            $this->log('try to break stalled state');
            $this->stop_processing();
            $this->clear_stop();
        }

        return array_merge($info, $this->get_report());
    }

    public function kill()
    {
        $this->log('kill()');
        $this->unschedule($this->import_start_hook);
        $this->unschedule($this->import_loop_hook);
        $this->unschedule($this->import_complete_hook);
        $this->stop_processing();
        $this->clear_stop();
        $info = $this->update_info([
            'stopped' => gmdate("c"),
            'complete' => false,
            'completed' => false,
        ]);
        return $this->get_import_info();
    }

    public function kill_import_events()
    {
        $this->unschedule($this->import_start_hook);
        $this->unschedule($this->import_loop_hook);
        $this->unschedule($this->import_complete_hook);
    }

    public function unschedule($hook)
    {
        // $this->log('unschedule(' . $hook . ')');
        $scheduled = wp_next_scheduled($hook);
        if ($scheduled) {
            $res = wp_unschedule_event($scheduled, $hook, [], true);
            if (is_wp_error($res)) {
                // $this->log('failed to unsched ' . $hook);
            } else {
                // $this->log('unsched ' . $hook);
            }
        }
    }

    public function schedule($hook)
    {
        // $this->log('schedule(' . $hook . ')');
        if (!has_action($this->import_loop_hook)) {
            // $this->log('--> no hook!!!' . $hook);
        }
        $scheduled = wp_next_scheduled($hook);
        if (!$scheduled) {
            $success = wp_schedule_single_event(time(), $hook);
            if (is_wp_error($success)) {
                // $this->log('--> fail schedule() ' . $hook);
                return false;
            }
            // $this->log('--> schedule() ' . $hook);
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
                'complete' => false,
                'completed' => false,
                'args' => $this->get_default_args(),
            ]);
        }
        return array_merge($info, $this->get_report());
    }

    public function resume()
    {
        $is_active = $this->is_active();
        if ($is_active) {
            return $this->get_info();
        }
        $this->unschedule($this->import_kill_hook); // just in case
        $this->clear_stop();
        $info = $this->get_info();
        $this->schedule($this->import_loop_hook);
        return array_merge($info, $this->get_report());
    }

    public function rerun()
    {
        return $this->start($this->get_rerun_args());
    }

    public function get_import_info()
    {
        $info = $this->get_info();
        $info['processing_age'] = \CIStore\Utils\get_age($info['updated'], 'minutes');
        return array_merge($info, $this->get_report());
    }

    protected function get_report()
    {
        return [
            'stopping' => $this->is_stopping(),
            'processing' => $this->is_processing(),
            'waiting' => $this->is_waiting(),
            'active' => $this->is_active(),
            'stalled' => $this->is_stalled(),
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
        // $this->log(json_encode(['delta' => $delta]));
        $info = $this->get_info();
        try {
            return $this->set_info(array_merge($info, $delta, ['updated' => gmdate("c")]));
        } catch (\Exception $e) {
            throw new \Exception("update_info(): " . json_encode(['delta' => $delta]));
        }
    }

    protected function is_stalled()
    {
        if ($this->is_processing()) {
            $info = $this->get_info();
            $age = \CIStore\Utils\get_age($info['updated'], 'minutes');
            if ($age >= $this->stall_maxage) {
                return true;
            }

        }
        return false;
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
