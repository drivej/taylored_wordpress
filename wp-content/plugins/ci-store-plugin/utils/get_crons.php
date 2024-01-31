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
