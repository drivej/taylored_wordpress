<?php

function get_log_file_name()
{
    $timestamp = time();
    $currentDate = gmdate('Y-m-d', $timestamp);
    return "ci-import-" . $currentDate . ".log";
}

function get_log_file_path()
{
    $upload_dir = wp_upload_dir();
    $subfolder = 'ci-logs';
    $target_dir = $upload_dir['basedir'] . '/' . $subfolder;
    if (!file_exists($target_dir)) {
        mkdir($target_dir, 0755, true); // Create the subfolder with appropriate permissions
    }
    $file_path = $target_dir . '/' . get_log_file_name();
    return $file_path;
    // return WP_CONTENT_DIR . '/' . get_log_file_name();
}

function read_log_file($lines = 200)
{
    $log_file = get_log_file_path();
    if (file_exists($log_file)) {
        // $lines = 10; // Number of lines to read from the end

        // Open the log file for reading
        $file_handle = fopen($log_file, 'r');

        if ($file_handle) {
            $pos = -2; // Start at the second-to-last byte

            // Move the pointer to the end of the file
            fseek($file_handle, 0, SEEK_END);
            $file_size = ftell($file_handle);

            $content = '';
            $read_lines = 0;

            while (-$pos < $file_size && $read_lines < $lines) {
                fseek($file_handle, $pos, SEEK_END);
                $char = fgetc($file_handle);

                if ($char === "\n") {
                    $read_lines++;
                }

                $content = $char . $content;
                $pos--;
            }

            // Split the content into an array of lines
            $last_lines = explode("\n", trim($content));

            fclose($file_handle);
            return $last_lines;
        }
    }
}

function write_to_log_file($message)
{
    $t = current_time('mysql', 1);
    error_log($t . "\t" . $message . "\n", 3, get_log_file_path());
}

function clear_log_file()
{
    $log_file = get_log_file_path();
    if (file_exists($log_file)) {
        $file_handle = fopen($log_file, 'w');
        fclose($file_handle);
    }
}
