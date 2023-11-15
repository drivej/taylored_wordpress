<?php

function get_var($array, $props, $default = null)
{
    if (is_string($props)) {
        $props = array($props);
    }
    $data = $array;
    foreach ($props as $prop) {
        if (isset($data[$prop])) {
            $data = $data[$prop];
        } else {
            return $default;
        }
    }
    return $data;
}
