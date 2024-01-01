<?php

require_once __DIR__ . '/update_job.php';

function canStart($job)
{
    return $job['status'] === 'none';
}

function start_job($id)
{
    return update_job($id, ['status' => 'starting'], 'canStart');
}