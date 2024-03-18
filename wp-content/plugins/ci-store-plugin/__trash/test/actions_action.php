<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/get_crons.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/FileCache.php';

function do_test_schedule_event_action($a)
{
    sleep(3);
    ci_error_log('do_test_schedule_event_action()');
}

add_action('test_schedule_event', 'do_test_schedule_event_action', 12, 1);

function actions_action()
{
     // Wps 1789
    // get_western_attributes_from_product
    
    $cache = new FileCache('test', ['test'=>1]);
    $data = $cache->pull();
    print('<pre>' . json_encode($data, JSON_PRETTY_PRINT) . '</pre>');
    $data = $cache->update(['test'=>$data['test']+1]);

    update_option('test_cache', $data, true);

    $do = isset($_GET['do']) ? $_GET['do'] : null;

    switch ($do) {
        case 'schedule_event':
            wp_schedule_single_event(time() + 1, 'ci_import_product', ['wps', rand()]);
            wp_schedule_single_event(time() + 2, 'test_schedule_event', [rand()]);
            // wp_schedule_single_event(time() + 10, 'test_schedule_event', [rand()]);
            // wp_schedule_single_event(time() + 10, 'test_schedule_event', [rand()]);
            // wp_schedule_single_event(time() + 10, 'test_schedule_event', [rand()]);
            // wp_schedule_single_event(time() + 10, 'test_schedule_event', [rand()]);
            // wp_schedule_single_event(time() + 10, 'test_schedule_event', [rand()]);
            // wp_schedule_single_event(time() + 10, 'test_schedule_event', [rand()]);
            // wp_schedule_single_event(time() + 10, 'test_schedule_event', [rand()]);
            // wp_schedule_single_event(time() + 10, 'test_schedule_event', [rand()]);
            // wp_schedule_single_event(time() + 10, 'test_schedule_event', [rand()]);
            break;
    }

    ?>
    <form>
        <input type="hidden" name="cmd" value="actions" />
        <input type="hidden" name="page" value="ci-store-plugin-page-test" />
        <button>Home</button>
    </form>
    <form>
        <input type="hidden" name="cmd" value="actions" />
        <input type="hidden" name="page" value="ci-store-plugin-page-test" />
        <input type="hidden" name="do" value="schedule_event" />
        <button>Schedule Event</button>
    </form>
    do=<?=$do?>
    <?php

// $c = get_option('cron');
// print('<pre>'.json_encode($c, JSON_PRETTY_PRINT).'</pre>');

    $crons = get_crons('test_schedule_event');

    // $r = action_info();
    // $r['option_value'] =
    print('<pre>' . json_encode($crons, JSON_PRETTY_PRINT) . '</pre>');

    $crons = get_crons('');
    print('<pre>' . json_encode($crons, JSON_PRETTY_PRINT) . '</pre>');
    // print_r(json_encode($r, JSON_PRETTY_PRINT));
}

// not used  - just mucking around

function action_info()
{
    global $wpdb;
    $sql = "SELECT * FROM wp_options WHERE option_name LIKE 'cron%'";
    $result = $wpdb->get_results($sql);
    return $result;
}