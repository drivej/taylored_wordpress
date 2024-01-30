<?php

require_once __DIR__ . '/get_log_file_path.php';

function write_to_log_file($message)
{
    $t = current_time('mysql', 1);
    error_log($t . "\t" . $message . "\n", 3, get_log_file_path());
}
