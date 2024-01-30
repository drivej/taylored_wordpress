<?php

require_once __DIR__ . '/get_log_file_name.php';

function get_log_file_path()
{
    $upload_dir = wp_upload_dir();
    $subfolder = 'ci-logs';
    $target_dir = $upload_dir['basedir'] . '/' . $subfolder;
    if (!file_exists($target_dir)) {
        mkdir($target_dir, 0755, true);
    }
    $file_path = $target_dir . '/' . get_log_file_name();
    return $file_path;
}
