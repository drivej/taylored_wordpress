<?php

require_once __DIR__ . '/update_job.php';

function reset_job($job_id)
{
    return update_job($job_id, ['status' => 'none', 'process' => 'idle']);
}
