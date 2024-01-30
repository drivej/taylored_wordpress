<?php
// TODO: delete 
// require_once __DIR__ . './../cronjob/create_job.php';
// require_once __DIR__ . './../log/write_to_log_file.php';
// require_once __DIR__ . './../western/import_western_product.php';

// function import_western_page($job)
// {
//     $cursor = $job['args']['cursor'];
//     $data = get_western_products_page($cursor);
//     $products = $data['data'];

//     foreach ($products as $product) {
//         create_job('import_western_product', ['product_id' => $product['id']]);
//     }

//     $count = is_countable($products) ? count($products) : 'not countable!';

//     write_to_log_file("import_western_page() cursor=" . $cursor . " products=" . $count);
//     // sleep(10);

//     $next_cursor = $data['meta']['cursor']['next'];
//     if (isset($next_cursor)) {
//         create_job('import_western_page', ['cursor' => $next_cursor]);
//     }
// }

// add_action('job_action_import_western_page', 'import_western_page');

// function import_western_product_job_handler($job)
// {
//     $wps_product_id = $job['args']['product_id'];
//     import_western_product($wps_product_id);
// }

// add_action('job_action_import_western_product', 'import_western_product_job_handler');
