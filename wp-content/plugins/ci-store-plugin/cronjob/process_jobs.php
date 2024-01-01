<?php

// require_once __DIR__ . '../../actions/index.php';
require_once __DIR__ . '/get_jobs.php';
require_once __DIR__ . '/update_job.php';
require_once __DIR__ . '/start_job.php';
require_once __DIR__ . '../../log/write_to_log_file.php';
require_once __DIR__ . '../../actions/import_products.php';

function process_jobs()
{
    $jobs = get_jobs();
    if (count($jobs)) {

        foreach ($jobs as $job) {
            $is_running = process_job($job);
            if ($is_running) {
                break;
            }
        }
    }
}

function process_job($job)
{
    if ($job['process'] === 'running') {
        return true;
    }

    switch ($job['status']) {

        case 'none':
            run_job($job);
            return true;
            break;

        case 'stopping':
            update_job($job['id'], ['status' => 'stopped', 'process' => 'idle']);
            break;

        case 'starting':
            run_job($job);
            return true;
            break;

        case 'completed':
            delete_job($job['id']);
            break;

        case 'deleting':
            force_delete_job($job['id']);
            break;
    }
    return false;
}

function run_job($job)
{
    update_job($job['id'], ['process' => 'running', 'status' => 'started']);

    $action = 'job_action_' . $job['action'];
    $has_action = has_action($action);
    if ($has_action) {
        write_to_log_file("RUN action=" . $action . " has_action=" . $has_action);
        do_action($action, $job);
    }
    write_to_log_file("action=" . $action . " has_action=" . $has_action);

    // if (is_callable($job['action'])) {
    //     call_user_func($job['action'], $job);
    //     // import_products($job);
    //     // sleep(rand(5, 10));
    //     update_job($job['id'], ['process' => 'idle', 'status' => 'completed']);
    //     // write_to_log_file("is_callable import_products()");
    // } else {
    //     write_to_log_file("Action not found: " . $job['action']);
    //     update_job($job['id'], ['process' => 'idle', 'status' => 'error']);
    // }
    update_job($job['id'], ['process' => 'idle', 'status' => 'completed']);
}
