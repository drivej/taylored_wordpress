<?php

require_once __DIR__ . '../../log/write_to_log_file.php';
require_once __DIR__ . '/get_jobs.php';
require_once __DIR__ . '/get_job.php';
require_once __DIR__ . '/update_jobs.php';

function create_job($action, $args = [])
{
    $jobs = get_jobs();
    $id = md5(serialize(['action' => $action, 'args' => $args]));
    $job = get_job($id);
    if ($job === null) {
        $job = [
            'id' => $id,
            'status' => 'none',
            'process' => 'idle',
            'action' => $action,
            'created' => gmdate("c"),
            'updated' => gmdate("c"),
            'started' => 0,
            'completed' => 0,
            'timeout' => 60,
            'retry' => 2,
            'args' => $args,
        ];
        array_push($jobs, $job);
        return update_jobs($jobs);
    }
    return $jobs;
}
