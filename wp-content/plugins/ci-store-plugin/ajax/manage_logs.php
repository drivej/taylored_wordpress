<?php

namespace AjaxHandlers;

function get_log($params)
{
    $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);
    $supplier = \CI\Admin\get_supplier($supplier_key);
    return $supplier->get_log();

    // $logContents = file_get_contents(CI_ERROR_LOG_FILEPATH);
    // $break = "\n";
    // $logRows = explode($break, $logContents); //PHP_EOL
    // $logRows = array_filter($logRows);
    // return $logRows;
}

function clear_log($params)
{
    $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);
    $supplier = \CI\Admin\get_supplier($supplier_key);
    return $supplier->clear_log();

    // if ($fileHandle = fopen(CI_ERROR_LOG_FILEPATH, 'w')) {
    //     ftruncate($fileHandle, 0);
    //     fclose($fileHandle);
    //     return true;
    // }
    // return false;
}
