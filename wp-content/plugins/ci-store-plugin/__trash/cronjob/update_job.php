<?php

// require_once __DIR__ . '../../log/write_to_log_file.php';
// require_once __DIR__ . '/get_jobs.php';

// function update_job($id, $delta, $fn = null)
// {
//     $jobs = get_jobs();
//     $should = true;
//     foreach ($jobs as $key => $job) {
//         if ($job['id'] === $id) {
//             if (isset($fn)) {
//                 $should = $fn($job);
//             }
//             if ($should) {
//                 $delta['updated'] = gmdate("c");//current_time('mysql', 1);
//                 $jobs[$key] = array_merge($job, $delta);
//             }
//         }
//     }
//     if ($should) {
//         // write_to_log_file("update_job() " . $id . " " . json_encode($delta));
//         update_option('ci_store_jobs', $jobs);
//     }
//     return $jobs;
// }
