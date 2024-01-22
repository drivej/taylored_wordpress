<?php

include_once __DIR__ . '/print_utils.php';

function should_debug()
{
    return isset($_GET['debug']);
}

function debug_hook($name, $type = 'action')
{
    if (should_debug()) {
        print('<div onclick="onClickWTHook(event)" title="' . $type . '" data-name="' . $name . '" class="debug-hook type-' . $type . '">' . $name . '()</div>');
    }
}

function debug_filter($name)
{
    debug_hook($name, 'filter');
}

function debug_action($name)
{
    debug_hook($name, 'action');
}

function debug_data($data)
{
    if (should_debug()) {
        echo '<pre class="debug-data">' . json_encode($data, JSON_PRETTY_PRINT) . '</pre>';
    }
}
