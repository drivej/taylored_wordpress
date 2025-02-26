<?php
namespace CIStore\Suppliers;

use CIStore\Utils\CustomErrorLog;
use Exception;
use function \CIStore\Utils\get_age;
use WooTools;

include_once CI_STORE_PLUGIN . 'utils/CustomErrorLog.php';
include_once CI_STORE_PLUGIN . 'utils/get_age.php';
include_once CI_STORE_PLUGIN . 'utils/WooTools/WooTools_get_mem.php';

class ImportManager
{
    protected $debug = false;
    protected $id    = 'none';
    protected $auto_import_hook;
    protected $import_start_hook;
    protected $import_loop_hook;
    protected $import_complete_hook;
    protected $import_info_option;
    protected $import_stop_option;
    protected $import_processing_option;
    protected $import_kill_hook;
    protected $stall_maxage = 5; // minutes
    protected CustomErrorLog $logger;
    protected $hook_names = [
        'auto_import_hook',
        'import_start_hook',
        'import_loop_hook',
        'import_complete_hook',
        'import_kill_hook',
    ];

    public function __construct($id, $logger = null)
    {
        $this->id     = $id;
        $this->logger = $logger ?? new \CIStore\Utils\CustomErrorLog('IMPORT_' . strtoupper($id));

        $this->auto_import_hook         = $this->hook_name('auto_import');
        $this->import_start_hook        = $this->hook_name('start_import');
        $this->import_loop_hook         = $this->hook_name('import_loop');
        $this->import_complete_hook     = $this->hook_name('import_complete');
        $this->import_kill_hook         = $this->hook_name('import_kill');
        $this->import_info_option       = $this->hook_name('import_info');
        $this->import_stop_option       = $this->hook_name('import_stop');
        $this->import_processing_option = $this->hook_name('import_processing');

        if (! has_action($this->auto_import_hook, [$this, 'auto_import'])) {
            add_action($this->auto_import_hook, [$this, 'auto_import']);
        } else {
            $this->log('ERROR: auto_import dupe');
        }
        if (! has_action($this->import_start_hook, [$this, 'start'])) {
            add_action($this->import_start_hook, [$this, 'start'], 10, 1); // TODO: I don;t think we need arguments? maybe?
        } else {
            $this->log('ERROR: start dupe');
        }
        if (! has_action($this->import_loop_hook, [$this, 'import_loop'])) {
            add_action($this->import_loop_hook, [$this, 'import_loop']);
        } else {
            $this->log('ERROR: import_loop dupe');
        }
        if (! has_action($this->import_complete_hook, [$this, 'import_complete'])) {
            add_action($this->import_complete_hook, [$this, 'import_complete']);
        } else {
            $this->log('ERROR: import_complete dupe');
        }
        if (! has_action($this->import_kill_hook, [$this, 'kill_import_events'])) {
            add_action($this->import_kill_hook, [$this, 'kill_import_events']);
        } else {
            $this->log('ERROR: kill_import_events dupe');
        }
    }

    private $hook_name_lookup = [];

    private function hook_name($func)
    {
        if (! isset($this->hook_name_lookup[$func])) {
            $this->hook_name_lookup[$func] = __NAMESPACE__ . "\\{$this->id}\{$func}";
        }
        return $this->hook_name_lookup[$func];
    }

    public function get_hooks_status()
    {
        return array_map(function ($n) {
            $hook           = $this->$n;
            $next_scheduled = wp_next_scheduled($hook);
            return [
                'name'       => $n,
                'hook'       => $hook,
                'has_action' => has_action($hook),
                'scheduled'  => $next_scheduled,
                'next'       => $next_scheduled ? date("Y-m-d H:i:s", $next_scheduled) : null,
            ];
        }, $this->hook_names);
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
        $this->log(__FUNCTION__);
        $next_scheduled = wp_next_scheduled($this->auto_import_hook);
        if (! $next_scheduled) {
            $timestamp = strtotime('today midnight') - get_option('gmt_offset') * HOUR_IN_SECONDS;
            $scheduled = wp_schedule_event($timestamp, 'daily', $this->auto_import_hook);
            if (! is_wp_error($scheduled)) {
                return true;
            }
        }
        return false;
    }

    public function cancel_scheduled_import()
    {
        $this->log(__FUNCTION__);
        $next_scheduled = wp_next_scheduled($this->auto_import_hook);
        if ($next_scheduled) {
            $cancelled = wp_unschedule_event($next_scheduled, $this->auto_import_hook);
            if (! is_wp_error($cancelled)) {
                return true;
            }
        }
        return false;
    }

    public function log(...$args)
    {
        if ($this->debug) {
            return $this->logger->log(...$args);
        }
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

    public function getBaseInfo($args = [])
    {
        return [
            'started'   => gmdate("c"),
            'processed' => 0,
            'total'     => 0,
            'progress'  => 0,
            'complete'  => false,
            'completed' => false,
            'args'      => [ ...$this->get_default_args(), ...$args],
        ];
    }

    public function start($args = [])
    {
        $is_active = $this->is_active();
        if ($is_active) {
            $this->log(__FUNCTION__, 'killed: is_active');
            return $this->get_info();
        }
        $this->clear_stop();
        $this->unschedule($this->import_kill_hook); // just in case
        if (! is_countable($args)) {
            $this->log(__FUNCTION__, 'Error', 'Bad args');
            $args = [];
        }
        // TODO: use getBaseInfo
        $args = [ ...$this->get_default_args(), ...$args];

        $info = $this->update_info([
            'started'   => gmdate("c"),
            'processed' => 0,
            'total'     => 0,
            'progress'  => 0,
            'complete'  => false,
            'completed' => false,
            'args'      => $args,
        ]);

        $info      = $this->update_info($this->before_start($info));
        $scheduled = $this->schedule($this->import_loop_hook);
        if (! $scheduled) {
            $this->log(__FUNCTION__, 'Error', 'Not Scheduled');
        }
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
        // mem check
        // $this->log(__FUNCTION__ . ' ' . WooTools\check_mem());
        $capacity = WooTools\memory_capacity();
        if ($capacity > 0.5) {
            error_log(__FUNCTION__ . ': memory low: delay process');
            $this->schedule($this->import_loop_hook, 60);
        }

        $info = $this->get_info();

        // check for stop
        if ($this->should_stop()) {
            return;
        }

        // process import
        $this->start_processing();
        try {
            $delta = $this->do_process($info);
            $info  = $this->update_info($delta);
        } catch (Exception $e) {
            error_log($e->getMessage());
            $this->stop();
        }
        gc_collect_cycles();
        $this->stop_processing();

        // check for complete
        if ($info['complete'] === true) {
            // $this->log($logPrefix . 'complete');
            $this->schedule($this->import_complete_hook);
            return;
        }

        // check for stop
        if ($this->should_stop()) {
            // $this->log($logPrefix . 'should_stop (B)');
            return;
        }

        // schedule next import_loop
        // $this->log($logPrefix . 'scheduling next import_loop_hook');
        $this->schedule($this->import_loop_hook);
    }

    public function import_complete()
    {
        $info = $this->update_info([
            'complete'  => true,
            'completed' => gmdate("c"),
            'progress'  => 1,
        ]);
        $this->on_complete($info);
    }

    public function on_complete($info)
    {
        // customize...
    }

    public function stop()
    {
        $this->log(__FUNCTION__);
        $this->request_stop();
        $this->schedule($this->import_kill_hook);
        $this->unschedule($this->import_start_hook);
        $this->unschedule($this->import_loop_hook);
        $this->unschedule($this->import_complete_hook);

        $info = $this->update_info([
            'stopped'   => gmdate("c"),
            'complete'  => false,
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
            'stopped'   => gmdate("c"),
            'complete'  => false,
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

    public function schedule($hook, $delay = 1)
    {
        $scheduled = wp_next_scheduled($hook);

        if (! $scheduled) {
            if (has_action($hook)) {
                $success = wp_schedule_single_event(time() + $delay, $hook, [], true);
                if (is_wp_error($success)) {
                    $this->log(__FUNCTION__, 'Error', $success->get_error_message());
                    return false;
                }
                return true;
            } else {
                $this->log(__FUNCTION__, 'Error', 'Hook "' . $hook . '" not found');
                return false;
            }
        }
        return false;
    }

    public function reset()
    {
        $this->log(__FUNCTION__);
        $is_active = $this->is_active();
        if ($is_active) {
            $info = $this->get_info();
        } else {
            $this->clear_stop();
            $info = $this->update_info([
                'status'    => 0,
                'started'   => false,
                'processed' => 0,
                'total'     => 0,
                'progress'  => 0,
                'complete'  => false,
                'completed' => false,
                'args'      => $this->get_default_args(),
            ]);
        }
        return array_merge($info, $this->get_report());
    }

    public function resume($force = false)
    {
        try {
            $this->log(__FUNCTION__);
            $is_active = $this->is_active();
            if (! $force && $is_active) {
                return $this->get_info();
            }
            $this->unschedule($this->import_kill_hook); // just in case
            $this->clear_stop();
            $info = $this->get_info();
            $this->schedule($this->import_loop_hook);
            return array_merge($info, $this->get_report());
        } catch (Exception $e) {
            return false;
        }
    }

    public function rerun()
    {
        return $this->start($this->get_rerun_args());
    }

    public function ping()
    {
        return $this->update_info();
    }

    public function get_import_info()
    {
        $info = $this->get_info();
        if (empty($info)) {
            $info = $this->getBaseInfo();
        }
        $info['processing_age'] = isset($info['updated']) ? get_age($info['updated'], 'minutes') : 0;
        $report                 = $this->get_report();
        if (empty($report)) {
            $report = [];
        }
        return array_merge($info, $report);
    }

    protected function get_report()
    {
        return [
            'stopping'             => $this->is_stopping(),
            'processing'           => $this->is_processing(),
            'waiting'              => $this->is_waiting(),
            'active'               => $this->is_active(),
            'stalled'              => $this->is_stalled(),
            'should_stop'          => $this->should_stop(),
            'import_start_hook'    => wp_next_scheduled($this->import_start_hook),
            'import_loop_hook'     => wp_next_scheduled($this->import_loop_hook),
            'import_complete_hook' => wp_next_scheduled($this->import_complete_hook),
            'memory'               => WooTools\memory_capacity(),
        ];
    }

    protected function get_info()
    {
        $info = get_site_transient($this->import_info_option);
        return is_array($info) ? $info : ['updated' => '2020-01-01T00:00:00+00:00'];
    }

    protected function set_info($delta)
    {
        set_site_transient($this->import_info_option, $delta);
        return $delta;
    }

    protected function update_info($delta = [])
    {
        $info = $this->get_info();
        try {
            if (is_array($delta)) {
                return $this->set_info(array_merge($info, $delta, ['updated' => gmdate("c")]));
            } else {
                return $this->set_info(array_merge($info, ['updated' => gmdate("c")]));
            }
        } catch (\Exception $e) {
            throw new \Exception("update_info(): " . json_encode(['delta' => $delta]));
        }
    }

    protected function is_stalled()
    {
        if ($this->is_processing()) {
            $info = $this->get_info();
            if (isset($info['updated'])) {
                $age = get_age($info['updated'], 'minutes');
                if ($age) {
                    if ($age >= $this->stall_maxage) {
                        // TODO: should we unstall here?
                        // $this->resume(true);
                        // $this->kill();
                        $this->log(__FUNCTION__ . ' force resume from stall');
                        return true;
                    }
                }
            }

        }
        return false;
    }

    protected function is_processing()
    {
        return (bool) (get_site_transient($this->import_processing_option) ?? false);
    }

    protected function is_waiting()
    {
        $scheduled = [
            'start'    => wp_next_scheduled($this->import_start_hook),
            'loop'     => wp_next_scheduled($this->import_loop_hook),
            'complete' => wp_next_scheduled($this->import_complete_hook),
        ];
        return $scheduled['start'] || $scheduled['loop'] || $scheduled['complete'];
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
        return (bool) (get_site_transient($this->import_stop_option) ?? false);
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
