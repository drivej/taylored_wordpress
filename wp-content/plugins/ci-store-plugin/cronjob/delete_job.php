<?php

require_once __DIR__ . '../../log/write_to_log_file.php';
require_once __DIR__ . '/get_jobs.php';
require_once __DIR__ . '/update_jobs.php';

function force_delete_job($id)
{
    $jobs = get_jobs();
    foreach ($jobs as $key => $job) {
        if ($job['id'] === $id) {
            write_to_log_file("force_delete_job() " . $id);
            unset($jobs[$key]);
        }
    }
    return update_jobs(array_values($jobs));
}

function canDelete($job)
{
    return $job['process'] !== 'running';
}

function delete_job($id, $force = false)
{
    if ($force) {
        return force_delete_job($id);
    } else {
        return update_job($id, ['status' => 'deleting'], 'canDelete');
    }
}
