<?php

namespace CIStore\Suppliers\WPS;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/wps/Supplier_WPS.php';

class Props
{
    public static $import_start_hook = 'CIStore\Suppliers\WPS\start_import';
    public static $import_loop_hook = 'CIStore\Suppliers\WPS\import_loop';
    public static $import_complete_hook = 'CIStore\Suppliers\import_complete';
    public static $import_info_option = 'CIStore\Suppliers\import_info';
    public static $import_stop_option = 'CIStore\Suppliers\import_stop';
    public static $import_processing_option = 'CIStore\Suppliers\import_processing';
    public static $import_kill_hook = 'CIStore\Suppliers\import_kill';
}

add_action('wps_init', 'CIStore\Suppliers\WPS\init');

function init()
{
    if (!has_action(Props::$import_start_hook, 'CIStore\Suppliers\WPS\start_import')) {
        add_action(Props::$import_start_hook, 'CIStore\Suppliers\WPS\start_import', 10);
    }
    if (!has_action(Props::$import_loop_hook, 'CIStore\Suppliers\WPS\import_loop')) {
        add_action(Props::$import_loop_hook, 'CIStore\Suppliers\WPS\import_loop', 10);
    }
    if (!has_action(Props::$import_complete_hook, 'CIStore\Suppliers\WPS\import_complete')) {
        add_action(Props::$import_complete_hook, 'CIStore\Suppliers\WPS\import_complete', 10);
    }
}

function start_import()
{
    $is_active = is_active();
    if ($is_active) {
        return get_info();
    }
    error_log('WPS::start_import()');
    clear_stop();
    unschedule(Props::$import_kill_hook); // just in case

    $info = update_info([
        'started' => gmdate("c"),
        'processed' => 0,
        'total' => 0,
        'progress' => 0,
        'cursor' => '',
        'complete' => false,
        'completed' => false,
        ...before_start(),
    ]);

    schedule(Props::$import_loop_hook);

    return [ ...$info, ...get_report()];
}

// return a delta for the import info data
function before_start()
{
    $supplier = \Supplier_WPS::instance();
    $total = $supplier->get_total_remote_products();
    return ['total' => $total];
}

function do_process($info)
{
    $cursor = $info['cursor'];
    $supplier = \Supplier_WPS::instance();
    $items = $supplier->get_products_page($cursor);
    // sleep(3);
    // $items = ['data' => [1], 'meta' => ['cursor' => ['next' => $info['processed'] < $info['total'] ? 'xxx' : false]]];

    $next_cursor = $items['meta']['cursor']['next'] ?? false;
    $processed_delta = (is_countable($items['data']) ? count($items['data']) : 0);
    $processed = $info['processed'] + $processed_delta;
    $progress = $info['total'] > 0 ? ($processed / $info['total']) : 0;
    return [
        'cursor' => $next_cursor,
        'processed' => $processed,
        'progress' => $progress,
    ];
}

function import_loop()
{
    $info = get_info();

    if (should_stop()) {
        return;
    }

    $cursor = $info['cursor'];

    if (is_string($cursor)) {
        start_processing();
        $delta = do_process($info);
        update_info($delta);
        stop_processing();

        if (!should_stop()) {
            schedule(Props::$import_loop_hook);
        }
    } else {
        schedule(Props::$import_complete_hook);
    }
}

function import_complete()
{
    update_info([
        'complete' => true,
        'completed' => gmdate("c"),
        'progress' => 1,
    ]);
}

function stop_import()
{
    request_stop();
    // sometimes error is thrown if you call this function directly
    schedule(Props::$import_kill_hook);
    // prefer to remove thse immediately
    unschedule(Props::$import_start_hook);
    unschedule(Props::$import_loop_hook);
    unschedule(Props::$import_complete_hook);

    $info = update_info([
        'stopped' => gmdate("c"),
        'complete' => false,
        'completed' => false,
    ]);

    return [ ...$info, ...get_report()];
}

function kill_import_events()
{
    unschedule(Props::$import_start_hook);
    unschedule(Props::$import_loop_hook);
    unschedule(Props::$import_complete_hook);
}

add_action('wps_kill_import_events', 'CIStore\Suppliers\WPS\kill_import_events');

function unschedule($hook)
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

function schedule($hook)
{
    $scheduled = wp_next_scheduled($hook);
    if (!$scheduled) {
        $success = wp_schedule_single_event(time(), $hook);
        if (is_wp_error($success)) {
            error_log('schedule() ' . $hook);
            return false;
        }
        return true;
    }
    return false;
}

function reset_import()
{
    $is_active = is_active();
    if ($is_active) {
        $info = get_info();
    } else {
        clear_stop();
        $info = update_info([
            'status' => 0,
            'started' => false,
            'processed' => 0,
            'total' => 0,
            'progress' => 0,
            'cursor' => false,
            'complete' => false,
            'completed' => false,
        ]);
    }
    return [ ...$info, ...get_report()];
}

function continue_import()
{
    $is_active = is_active();
    if ($is_active) {
        return get_info();
    }
    unschedule(Props::$import_kill_hook); // just in case
    clear_stop();
    $info = get_info();

    if (is_string($info['cursor'])) {
        schedule(Props::$import_loop_hook);
        $info = update_info([
            'status' => 1,
            'complete' => false,
            'completed' => false,
        ]);
    }
    return [ ...$info, ...get_report()];
}

function get_import_info()
{
    return [ ...get_info(), ...get_report()];
}

function get_report()
{
    return [
        'stopping' => is_stopping(),
        'processing' => is_processing(),
        'waiting' => is_waiting(),
        'active' => is_processing() || is_waiting(),
        'should_stop' => should_stop(),
    ];
}

function get_info()
{
    return get_site_transient(Props::$import_info_option) ?: [];
    // $trans = get_site_transient(Props::$import_info_option);

    // if (!$trans) {
    //     return [];
    // }
    // return get_site_transient(Props::$import_info_option);
}

function set_info($delta)
{
    set_site_transient(Props::$import_info_option, $delta);
    return $delta;
}

function update_info($delta)
{
    $info = get_info();
    return set_info([ ...$info, ...$delta, 'updated' => gmdate("c")]);
}

function is_processing()
{
    return (bool) get_site_transient(Props::$import_processing_option);
}

function is_waiting()
{
    return wp_next_scheduled(Props::$import_start_hook) || wp_next_scheduled(Props::$import_loop_hook) || wp_next_scheduled(Props::$import_complete_hook);
}

function is_active()
{
    return is_processing() || is_waiting();
}

function is_stopping()
{
    return should_stop() && is_active();
}

function start_processing()
{
    return set_site_transient(Props::$import_processing_option, true);
}

function stop_processing()
{
    return delete_site_transient(Props::$import_processing_option);
}

function should_stop()
{
    return get_site_transient(Props::$import_stop_option);
}

function request_stop()
{
    return set_site_transient(Props::$import_stop_option, true);
}

function clear_stop()
{
    return delete_site_transient(Props::$import_stop_option);
}
