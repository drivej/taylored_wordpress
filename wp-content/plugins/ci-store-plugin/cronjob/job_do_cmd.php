<?php

// require_once __DIR__ . '/updateJob.php';
// require_once __DIR__ . '/getJob.php';
require_once __DIR__ . '/get_jobs.php';
require_once __DIR__ . '/create_job.php';
require_once __DIR__ . '/start_job.php';
require_once __DIR__ . '/stop_job.php';
require_once __DIR__ . '/delete_job.php';
require_once __DIR__ . '/clean_jobs.php';
// require_once __DIR__ . '../../log/write_to_log_file/getJob.php';

function job_do_cmd()
{
    $cmd = $_GET['cmd'];
    $job_id = $_GET['job_id'];

    switch ($cmd) {

        case 'create_job':
            $args = (array)json_decode(stripcslashes($_GET['job_args']));
            if (!empty($args)) {
                wp_send_json(create_job($args['action'], $args));
            } else {
                wp_send_json(get_jobs());
            }
            break;

        case 'start_job':
            wp_send_json(start_job($job_id));
            break;

        case 'stop_job':
            wp_send_json(stop_job($job_id));
            break;

        case 'delete_job':
            wp_send_json(delete_job($job_id));
            break;

        case 'force_delete_job':
            wp_send_json(force_delete_job($job_id));
            break;

        case 'clean_jobs':
            wp_send_json(clean_jobs());
            break;

        case 'get_jobs':
        default:
            wp_send_json(get_jobs());
            break;
    }
    wp_die();
}
