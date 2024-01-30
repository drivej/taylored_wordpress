<?php

require_once __DIR__ . '/clear_log_file.php';
require_once __DIR__ . '/read_log_file.php';

function logs_do_cmd()
{
    $cmd = $_GET['cmd'];

    switch ($cmd) {
        case 'clear_logs':
            wp_send_json(clear_log_file());
            break;

        case 'get_logs':
        default:
            wp_send_json(read_log_file());
            break;
    }
}
