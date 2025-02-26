<?php
namespace CIStore\Suppliers\WPS\Utils;

use DateTime;
use DateTimeZone;

function normalize_wps_date($date_str)
{
    if (! empty($date_str) && is_string($date_str)) {
        $date = DateTime::createFromFormat("Y-m-d H:i:s", $date_str, new DateTimeZone('UTC'));
        return $date->format("Y-m-d\TH:i:sP");
    }
    return gmdate("c");
}
