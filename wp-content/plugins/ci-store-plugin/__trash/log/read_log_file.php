<?php

require_once __DIR__ . '/get_log_file_path.php';

function read_log_file($lines = 200)
{
    $log_file = get_log_file_path();
    if (file_exists($log_file)) {

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
