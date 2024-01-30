<?php

require_once __DIR__ . '/get_log_file_path.php';

function clear_log_file()
{
    $log_file = get_log_file_path();
    if (file_exists($log_file)) {
        $file_handle = fopen($log_file, 'w');
        fclose($file_handle);
    }
}