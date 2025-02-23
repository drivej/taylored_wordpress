<?php
namespace WooTools;

function check_mem(){
    $memory_limit = get_memory_limit();
    $memory_usage = memory_get_usage();
    $percent        = round(100 * $memory_usage / $memory_limit);
    $limit = prettyBytes($memory_limit);
    $usage = prettyBytes($memory_usage);
    return "{$percent}% {$usage} of {$limit}";
}

function get_mem()
{
    $bytes = memory_get_usage();
    return prettyBytes($bytes);
}

function prettyBytes($size)
{
    if ($size <= 0) {
        return '0 B';
    }
    // Prevent log(0) error
    $unit = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    $i    = min(floor(log($size, 1024)), count($unit) - 1); // Prevent out-of-bounds error
    return round($size / pow(1024, $i), 2) . ' ' . $unit[$i];
}

function convertToBytes($value)
{
    $unit  = strtoupper(substr($value, -1));
    $bytes = (int) $value;

    switch ($unit) {
        case 'K':return $bytes * 1024;
        case 'M':return $bytes * 1024 * 1024;
        case 'G':return $bytes * 1024 * 1024 * 1024;
        default:return $bytes; // Assume bytes if no unit
    }
}

function get_memory_limit()
{
    return convertToBytes(ini_get('memory_limit')); // Convert to bytes
}

// returns capacity used a a proportion 0-1
function memory_capacity()
{
    $memory_limit = get_memory_limit();
    $memory_usage = memory_get_usage();
    $usage        = $memory_usage / $memory_limit;
    return $usage;
}
