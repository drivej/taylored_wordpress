<?php

$WPS_SETTINGS = array(
    "name" => "Western Power Sports",
    "key" => "WPS",
    "supplierClass" => "WooDropship\\Suppliers\\Western",
    "api" => "http://api.wps-inc.com",
    "allowParams" => ['page', 'include'],
    'headers' => [
        'Authorization' => "Bearer aybfeye63PtdiOsxMbd5f7ZAtmjx67DWFAQMYn6R",
        'Content-Type' => 'application/json',
    ],
    'import_version' => 1.30,
);
