<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Timer.php';

trait WooTools_log_exception
{
    public static function log_exception($e, $logger, $data = null)
    {
        if ($e && is_object($logger) && method_exists($logger, 'log')) {
            $logger->log('<--------- START ERROR --------->');
            $logger->log($e->getMessage());
            $logger->log($e->getCode());
            $logger->log($e->getLine());
            $logger->log($e->getFile());
            $logger->log($e->getTraceAsString());
            if ($data) {
                $logger->log(json_encode($data, JSON_PRETTY_PRINT));
            }
            $logger->log('<--------- END ERROR --------->');
        }

    }
}
