<?php

function get_crons($needle)
{
    $cron = get_option('cron');
    $found = [];
    foreach ($cron as $timestamp => $actions) {
        if (is_countable($actions)) {
            foreach ($actions as $name => $action) {
                if (str_contains($name, $needle)) {
                    $hash = array_key_first($action);
                    $found[] = ['name' => $name, 'hash' => $hash, 'timestamp' => $timestamp, ...$action[$hash]];
                }
            }
        }
    }
    return $found;
    // print('<pre>'.json_encode($found, JSON_PRETTY_PRINT).'</pre>');
}

function bulk_delete_completed_actions() {
    // Get all scheduled hooks
    $cron_events = _get_cron_array();
    $deletes = [];

    // Iterate through each hook
    foreach ($cron_events as $timestamp => $hooks) {
        foreach ($hooks as $hook => $events) {
            // Check if the hook has scheduled events
            if ($events) {
                // Iterate through each event
                foreach ($events as $key => $event) {
                    // Check if the event is completed
                    if ($timestamp < time() && $event['schedule'] === false) {
                        // Remove the completed event
                        $deletes[] = ['hook'=>$hook,'key'=>$key];
                        // unset($cron_events[$timestamp][$hook][$key]);
                    }
                }
            }
        }
    }

    return $deletes;

    // Update the cron array with the modified events
    // _set_cron_array($cron_events);
}