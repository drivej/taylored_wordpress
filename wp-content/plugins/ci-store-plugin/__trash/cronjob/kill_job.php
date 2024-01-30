<?php

require_once __DIR__ . '/update_job.php';

function kill_job($id)
{
    return update_job($id, ['status' => 'stopping', 'process' => 'idle']);
}
