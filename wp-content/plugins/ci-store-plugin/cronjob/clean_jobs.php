<?php

require_once __DIR__ . '../../log/write_to_log_file.php';
require_once __DIR__ . '/get_jobs.php';
require_once __DIR__ . '/update_jobs.php';

function clean_jobs()
{
    $jobs = get_jobs();
    foreach ($jobs as $key => $job) {
        if (!isset($job['id'])) {
            unset($jobs[$key]);
        }
    }
    return update_jobs($jobs);
}
