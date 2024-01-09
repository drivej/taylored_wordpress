<?php

function printLine($msg)
{
    echo "<p>&middot; " . $msg . "</p>";
}

function printData($data)
{
    echo "<pre>" . json_encode($data, JSON_PRETTY_PRINT) . "</pre>";
}
