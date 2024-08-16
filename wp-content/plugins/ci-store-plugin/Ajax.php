<?php

namespace CIStore\Ajax;

function api_handler()
{
    $response = [];
    $cmd = $_GET['cmd'];
    $args = $_GET['args'] ?? [];
    $file_path = CI_STORE_PLUGIN . 'ajaxfuncs/' . $cmd . '.php';
    $file_exists = file_exists($file_path);
    $function_exists = false;
    $func = "\\CIStore\\Ajax\\{$cmd}";

    if ($file_exists) {
        require_once $file_path;
        $function_exists = function_exists($func);
        if ($function_exists) {
            try {
                $response = call_user_func($func, ...$args);
            } catch (\Exception $e) {
                return ['error' => $e];
            }
        } else {
            $response['error'] = 'Function not found';
        }
    } else {
        $response['error'] = 'File not found';
    }

    wp_send_json($response, 200, JSON_PRETTY_PRINT);
}
