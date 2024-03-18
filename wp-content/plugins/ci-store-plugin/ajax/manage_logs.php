<?php

namespace AjaxHandlers;

function get_error_log()
{
    $logContents = file_get_contents(CI_ERROR_LOG_FILEPATH);
    $break = "\n";
    $logRows = explode($break, $logContents); //PHP_EOL
    $logRows = array_filter($logRows);
    return $logRows;
}

function clear_error_log()
{
    if ($fileHandle = fopen(CI_ERROR_LOG_FILEPATH, 'w')) {
        ftruncate($fileHandle, 0);
        fclose($fileHandle);
        return true;
    }
    return false;
}
