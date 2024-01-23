<?php

include_once __DIR__ . './../utils/print_utils.php';
// include_once __DIR__ . './../western/get_western_product.php';

function clear_logs_action()
{
    global $wpdb;

    $confirm_delete = isset($_GET['confirm_delete']) ? (bool)$_GET['confirm_delete'] : false;

    ?>
    <div class="p-3">
        <form id="ci_delete_logs_form" onsubmit="return confirm('Are you sure?');">
            <input type="hidden" name="cmd" value="clear_logs" />
            <input type="hidden" name="page" value="ci-store-plugin-page-test" />
            <input type="hidden" name="confirm_delete" value="1" />
            <button>Delete Scheduled Logs</button>
        </form>
    </div>
    <?

    $scheduled_events = _get_cron_array();

    // Check if there are any scheduled events
    if ($scheduled_events) {
        echo '<table class="table"><tbody>';
        foreach ($scheduled_events as $timestamp => $cronhooks) {
            // Loop through each hook scheduled for the current timestamp
            foreach ($cronhooks as $hook => $args) {
                // Check if the event is completed (in the past)
                if ($timestamp < time()) {
                    $status = 'complete';
                } else {
                    $status = 'pending';
                }
                echo "<tr><td>".$hook."</td><td>".$timestamp."</td><td>".$status."</td></tr>";
            }
        }
        echo '</tbody></table>';
    } else {
        echo "No scheduled events found.";
    }
    // // $updated = array_filter($crons, function ($v) {return !array_key_exists("CRON_NAME", $v);});
    // //echo "Reduced to ".count($updated)."<br />";
    // // _set_cron_array($updated);

    // $all = [];
    // foreach ($crons as $cron) {
    //     $jobs = array_keys($cron);
    //     foreach ($jobs as $job_key) {
    //         if (!isset($all[$job_key])) {
    //             $all[$job_key] = 0;
    //         }
    //         $all[$job_key]++;
    //     }
    // }
    // // printData($updated);
    // printData($crons);
    // printData($all);
    // wp_unschedule_event($timestamp, $hook, $args);
    
    
    if($confirm_delete){

        $table_name = $wpdb->prefix . 'actionscheduler_actions';

        $result = $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM $table_name WHERE `status` = %s",
                'complete'
            )
        );

        if ($result !== false) {
            echo "Actions deleted successfully.";
        } else {
            echo "Error deleting actions.";
        }

        $table_name = $wpdb->prefix . 'actionscheduler_logs';

        $result = $wpdb->query("DELETE FROM $table_name");

        if ($result !== false) {
            echo "Logs deleted successfully.";
        } else {
            echo "Error deleting logs.";
        }
    }
}
