<?php

require_once __DIR__ . '../../log/write_to_log_file.php';
require_once __DIR__ . '/get_jobs.php';
require_once __DIR__ . '/update_jobs.php';

function clean_jobs()
{
    write_to_log_file('clean jobs');
    $jobs = get_jobs();
    foreach ($jobs as $key => $job) {
        write_to_log_file($job['id']);
        if (!isset($job['timeout'])) {
            $jobs[$key]['timeout'] = 60;
        }
        if (!isset($job['retry'])) {
            $jobs[$key]['retry'] = 2;
        }
        if (!isset($job['id'])) {
            unset($jobs[$key]);
        }
    }
    return update_jobs($jobs);
}
