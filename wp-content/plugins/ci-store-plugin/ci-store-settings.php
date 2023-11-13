<?php

$SUPPLIER = array(
    "WPS" => array(
        "name" => "Western Power Sports",
        "key" => "WPS",
        "supplierClass" => "WooDropship\\Suppliers\\Western",
        // "auth" => "Bearer aybfeye63PtdiOsxMbd5f7ZAtmjx67DWFAQMYn6R",
        "api" => "http://api.wps-inc.com",
        "allowParams" => ['page', 'include'],
        'headers' => [
            'Authorization' => "Bearer aybfeye63PtdiOsxMbd5f7ZAtmjx67DWFAQMYn6R",
            'Content-Type' => 'application/json',
        ],
    ),
);
