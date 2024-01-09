<?php

include_once __DIR__ . './../utils/print_utils.php';
include_once __DIR__ . './../utils/Report.php';
include_once __DIR__ . './../western/get_western_products_page.php';
include_once __DIR__ . './../western/import_western_product.php';

function wps_import_action($wps_product_id)
{
    $report = new Report();
    import_western_product($wps_product_id, false, $report);
    printData($report);
}
