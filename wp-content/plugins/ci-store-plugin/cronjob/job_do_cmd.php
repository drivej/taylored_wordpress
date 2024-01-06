<?php

require_once __DIR__ . '/get_jobs.php';
require_once __DIR__ . '/create_job.php';
require_once __DIR__ . '/start_job.php';
require_once __DIR__ . '/stop_job.php';
require_once __DIR__ . '/delete_job.php';
require_once __DIR__ . '/reset_job.php';
require_once __DIR__ . '/clean_jobs.php';
require_once __DIR__ . '/process_jobs.php';
require_once __DIR__ . '/update_job.php';
require_once __DIR__ . '../../log/write_to_log_file.php';

function job_do_cmd()
{
    $cmd = $_GET['cmd'];
    $job_id = $_GET['job_id'];

    switch ($cmd) {

        case 'jobs_status':
            $active = get_option('ci_jobs_process_active', true);
            wp_send_json(['active' => (bool)$active]);
            break;

        case 'pause_jobs':
            update_option('ci_jobs_process_active', false);
            write_to_log_file("pause_jobs");
            wp_send_json(['active' => false]);
            break;

        case 'resume_jobs':
            update_option('ci_jobs_process_active', true);
            write_to_log_file("resume_jobs");
            process_jobs();
            wp_send_json(['active' => true]);
            break;

        case 'create_job':
            $args = (array) json_decode(stripcslashes($_GET['job_args']));
            if (!empty($args)) {
                wp_send_json(create_job($args['action'], $args));
            } else {
                wp_send_json(get_jobs());
            }
            break;

        case 'reset_job':
            wp_send_json(reset_job($job_id));
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

        case 'process_jobs':
            process_jobs();
            wp_send_json(get_jobs());
            break;

        case 'get_jobs':
        default:
            wp_send_json(get_jobs());
            break;
    }
    wp_die();
}
