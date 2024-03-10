<?php

$dir = __DIR__;

// Get an array of file paths matching the pattern "*.php" in the current directory
$files = glob($dir . '/*.php');

// Get the current file name
$currentFile = basename(__FILE__);

// Remove the current file from the array
$files = array_diff($files, [$dir . '/' . $currentFile]);

// Include or require each file
foreach ($files as $file) {
    require_once $file;
}
