<?php

require_once __DIR__ . './../cronjob/get_jobs.php';
require_once __DIR__ . './../cronjob/update_job.php';
require_once __DIR__ . './../cronjob/start_job.php';
require_once __DIR__ . './../cronjob/create_job.php';
require_once __DIR__ . './../log/write_to_log_file.php';
require_once __DIR__ . './../western/getWesternProductsPage.php';
require_once __DIR__ . './../western/getWesternProduct.php';
include_once __DIR__ . './../utils/product_exists.php';

function import_western_page($job)
{
    $cursor = $job['args']['cursor'];
    $data = getWesternProductsPage($cursor);
    $products = $data['data'];

    foreach ($products as $product) {
        create_job('import_western_product', ['product_id' => $product['id']]);
    }

    // write_to_log_file("import_products() " . json_encode($data));
    // sleep(10);

    $next_cursor = $data['meta']['cursor']['next'];
    if (isset($next_cursor)) {
        create_job('import_western_page', ['cursor' => $next_cursor]);
    }
}

add_action('job_action_import_western_page', 'import_western_page');

function import_western_product($job)
{
    // does post exist
    // create post if not exist
    // update post if exists

    $product_id = $job['args']['product_id'];
    $post_id = product_exists('WPS', $product_id);
    $product = getWesternProduct($product_id);
    $is_valid = isValidProduct($product['data']);
    $action = '';

    if ($post_id) {
        if ($is_valid) {
            $action = 'update';
        } else {
            $action = 'delete';
        }
    } else {
        $action = 'insert';
    }
    write_to_log_file("import_western_product() " . json_encode(['action' => $action, 'id' => $product_id, 'post_id' => $post_id]));
    return ['job' => $job, 'post_id' => $post_id, 'product' => $product, 'action' => $action];
}

add_action('job_action_import_western_product', 'import_western_product');
