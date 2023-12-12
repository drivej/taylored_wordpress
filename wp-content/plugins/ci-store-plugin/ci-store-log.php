<?php

function get_log_file_name()
{
    $timestamp = time();
    $currentDate = gmdate('Y-m-d', $timestamp);
    return "ci-import-" . $currentDate . ".log";
}

function write_to_log_file($message)
{
    $t = current_time('mysql', 1);
    error_log($t . "\t" . $message . "\n", 3, WP_CONTENT_DIR . '/' . get_log_file_name());
}

function clear_log_file()
{
    $log_file = WP_CONTENT_DIR . '/' . get_log_file_name();
    if (file_exists($log_file)) {
        $file_handle = fopen($log_file, 'w');
        fclose($file_handle);
    }
}
