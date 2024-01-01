<?php

require_once __DIR__ . './../cronjob/get_jobs.php';
require_once __DIR__ . './../cronjob/update_job.php';
require_once __DIR__ . './../cronjob/start_job.php';
require_once __DIR__ . './../log/write_to_log_file.php';

function import_products($job)
{
    write_to_log_file("import_products() " . $job['id']);
    sleep(10);
}

add_action('job_action_import_products', 'import_products');