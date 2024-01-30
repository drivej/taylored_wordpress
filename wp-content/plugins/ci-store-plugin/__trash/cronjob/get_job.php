<?php

require_once __DIR__ . '/get_jobs.php';

function get_job($id)
{
    $jobs = get_jobs();

    foreach ($jobs as $job) {
        if ($job['id'] === $id) {
            return $job;
        }
    }
    return null;
}
