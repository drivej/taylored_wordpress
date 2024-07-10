<?php

class CustomLog
{
    public string $key;
    public string $log_path = '';

    public function __construct($key)
    {
        $this->key = sanitize_title($key);
        $this->log_path = CI_STORE_PLUGIN . 'logs/' . strtoupper($this->key) . '.log';
        // error_log($this->log_path);
        // TODO:Not sure I need this? I def do not understand it clearly
        // https://www.php.net/manual/en/function.set-error-handler.php 
        // set_error_handler([$this, 'log']);
    }

    public function log($message)
    {
        error_log(gmdate("c") . "\t" . $message . "\n", 3, $this->log_path);
        return;

        $spacer = "\n";
        $t = gmdate("c");
        if (is_object($message) || is_array($message)) {
            $message = json_encode($message, JSON_PRETTY_PRINT);
        }
        error_log($t . "\t" . $message . $spacer, 3, $this->log_path);
    }

    public function get_log()
    {
        $logContents = file_get_contents($this->log_path);
        $break = "\n";
        $logRows = explode($break, $logContents); //PHP_EOL
        $logRows = array_filter($logRows);
        return $logRows;
    }

    public function clear_log()
    {
        if ($fileHandle = fopen($this->log_path, 'w')) {
            ftruncate($fileHandle, 0);
            fclose($fileHandle);
            return true;
        }
        return false;
    }
}
