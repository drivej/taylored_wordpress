<?php
/*
require_once __DIR__ . '/get_jobs.php';
require_once __DIR__ . '/update_job.php';
require_once __DIR__ . '/start_job.php';
require_once __DIR__ . '/kill_job.php';
require_once __DIR__ . '/reset_job.php';
require_once __DIR__ . '../../log/write_to_log_file.php';
require_once __DIR__ . '../../actions/index.php';

function process_jobs()
{

    // if (!$active) {
    //     return false;
    // }
    $jobs = get_jobs();
    // $running = array_filter($jobs, fn($job) => $job['process'] === 'running');
    // $is_running = count($running) > 0;
    // write_to_log_file("process_jobs() active=" . $active . " running=" . count($running));

    if (count($jobs)) {
        $active = (bool) get_option('ci_jobs_process_active');
        // are any jobs running?
        $is_running = false;
        foreach ($jobs as $job) {
            if ($job['process'] === 'running') {
                // check if job has stalled
                $timeout = isset($job['timeout']) ? $job['timeout'] : 60;
                $now = gmdate("c");
                $startTimestamp = strtotime($job['started']);
                $nowTimestamp = strtotime($now);
                $timePassedInSeconds = $nowTimestamp - $startTimestamp;
                if ($timePassedInSeconds > $timeout) {
                    if ($job['retry'] > 0) {
                        write_to_log_file('Job stalled - retry');
                        update_job($job['id'], ['status' => 'none', 'process' => 'idle', 'retry' => $job['retry'] - 1]);
                        // update_job($job['id'], ['status' => 'stopped', 'process' => 'idle']);
                        // reset_job($job['id']);
                    } else {
                        write_to_log_file('Job stalled - kill');
                        kill_job($job['id']);
                    }
                } else {
                    $is_running = true;
                }
                break;
            }
        }

        $can_run = !$is_running && $active;
        // write_to_log_file("process_jobs() active=" . ($active ? 'true' : 'false') . " can_run=" . ($can_run ? 'true' : 'false'));

        foreach ($jobs as $job) {
            switch ($job['status']) {

                case 'none':
                    if ($can_run) {
                        run_job($job);
                    }
                    break;

                case 'stopping':
                    update_job($job['id'], ['status' => 'stopped', 'process' => 'idle']);
                    break;

                case 'starting':
                    if ($can_run) {
                        run_job($job);
                    }

                    break;

                case 'completed':
                case 'stopped':
                    delete_job($job['id']);
                    break;

                case 'deleting':
                    force_delete_job($job['id']);
                    break;
            }
        }
        sleep(2);
        process_jobs();
    } else {
        // write_to_log_file("process_jobs() none");
    }
}

// function process_job($job)
// {
//     if ($job['process'] === 'running') {
//         return true;
//     }

//     switch ($job['status']) {

//         case 'none':
//             run_job($job);
//             return true;
//             break;

//         case 'stopping':
//             update_job($job['id'], ['status' => 'stopped', 'process' => 'idle']);
//             break;

//         case 'starting':
//             run_job($job);
//             return true;
//             break;

//         case 'completed':
//             delete_job($job['id']);
//             break;

//         case 'deleting':
//             force_delete_job($job['id']);
//             break;
//     }
//     return false;
// }

function can_run($job)
{
    // do not run jobs in the process of ending
    if ($job['status'] === 'deleting') {
        return false;
    }
    if ($job['status'] === 'stopping') {
        return false;
    }
    if ($job['status'] === 'starting') {
        return false;
    }
    if ($job['status'] === 'completed') {
        return false;
    }
    $active = get_option('ci_jobs_process_active', true);

    if (!$active) {
        return false;
    }
    return true;
}

function run_job($job)
{
    if (!can_run($job)) {
        return;
    }

    update_job($job['id'], ['process' => 'running', 'status' => 'started', 'started' => gmdate("c")]);
    $action = 'job_action_' . $job['action'];
    $has_action = has_action($action);
    if ($has_action) {
        do_action($action, $job);
    } else {
        write_to_log_file("ERROR: action not found: " . $action);
    }
    update_job($job['id'], ['process' => 'idle', 'status' => 'completed', 'completed' => gmdate("c")]);

    // completed job - go to the next
    // write_to_log_file("next wait 5s");
    // sleep(5);
    // process_jobs();
}
*/
