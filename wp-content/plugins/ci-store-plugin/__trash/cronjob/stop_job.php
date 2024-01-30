<?php

require_once __DIR__ . '/update_job.php';

function canStop($job)
{
    // return $job['status'] === 'running';
    return $job['process'] === 'idle';
}

function stop_job($id)
{
    return update_job($id, ['status' => 'stopping'], 'canStop');
}
