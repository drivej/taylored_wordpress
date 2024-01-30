<?php

// require_once __DIR__ . '../../log/write_to_log_file.php';
// require_once __DIR__ . '/get_jobs.php';
// require_once __DIR__ . '/get_job.php';
// require_once __DIR__ . '/update_jobs.php';

// function force_delete_job($id)
// {
//     $jobs = get_jobs();
//     foreach ($jobs as $key => $job) {
//         if ($job['id'] === $id) {
//             // write_to_log_file("force_delete_job() " . $id);
//             unset($jobs[$key]);
//         }
//     }
//     return update_jobs(array_values($jobs));
// }

// function can_delete($job)
// {
//     return $job['process'] !== 'running';
// }

// function delete_job($id)
// {
//     $job = get_job($id);
//     $active = (bool) get_option('ci_jobs_process_active');
//     if (!$active || can_delete($job)) {
//         return force_delete_job($id);
//     } else {
//         return update_job($id, ['status' => 'deleting'], 'can_delete');
//     }

// }
