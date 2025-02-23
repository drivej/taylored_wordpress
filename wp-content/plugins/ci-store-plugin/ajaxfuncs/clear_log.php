<?php
namespace CIStore\Ajax;

use CIStore\Utils\CustomErrorLog;

include_once CI_STORE_PLUGIN . 'utils/CustomErrorLog.php';

function clear_log($key)
{
    if (isset($key)) {
        $logger = new CustomErrorLog($key);
        $logger->clear();
    }
    return '';
}
