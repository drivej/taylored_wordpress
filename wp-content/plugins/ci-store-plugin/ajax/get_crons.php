<?php

namespace AjaxHandlers;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';

function get_scheduled_events()
{
    $cron_events = _get_cron_array();
    $filter = \AjaxManager::get_param('filter');
    $found = [];
    foreach ($cron_events as $timestamp => $actions) {
        if (is_countable($actions)) {
            foreach ($actions as $name => $action) {
                if (!$filter || str_contains($name, $filter)) {
                    $hash = array_key_first($action);
                    $found[] = ['name' => $name, 'hash' => $hash, 'timestamp' => $timestamp, ...$action[$hash]];
                }
            }
        }
    }
    return $found;
}
