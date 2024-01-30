<?php

function get_log_file_name()
{
    $timestamp = time();
    $currentDate = gmdate('Y-m-d', $timestamp);
    return "ci-import-" . $currentDate . ".log";
}
