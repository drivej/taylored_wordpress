<?php
namespace CIStore\Suppliers\WPS;

include_once CI_STORE_PLUGIN . 'utils/CustomErrorLog.php';

use CIStore\Utils\CustomErrorLog;

function wps_log(...$args)
{
    $logger = new CustomErrorLog('WPS');
    $logger->log(...$args);
}
