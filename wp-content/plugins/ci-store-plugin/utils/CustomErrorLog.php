<?php
namespace CIStore\Utils;

// error_reporting(E_ALL);

class CustomErrorLog
{
    protected $log_path = '';

    public function __construct($id)
    {
        $this->log_path = CI_STORE_PLUGIN . 'logs/' . date('Y-m-d') . '_' . strtoupper($id) . '.log';
        $this->ensureLogFileExists();
    }

    protected function ensureLogFileExists()
    {
        if (! file_exists($this->log_path)) {
            // Attempt to create the file if it doesn't exist
            if (! touch($this->log_path)) {
                error_log('Failed to create log file: ' . $this->log_path);
            }
        }
    }

    public function log(...$args) //$message = null)
    {
        if (! is_writable($this->log_path)) {
            error_log('Log file is not writable: ' . $this->log_path);
            return;
        }

        $timestamp = '[' . date('Y-m-d H:i:s') . '] ';
        $log       = implode(' ', array_map(fn($e) => is_string($e) ? $e : json_encode($e), $args)); // JSON_PRETTY_PRINT
        error_log($timestamp . $log . PHP_EOL, 3, $this->log_path);
    }

    public function logs()
    {
        if (file_exists($this->log_path)) {
            return file_get_contents($this->log_path);
        }
        return 'empty';
    }

    public function clear()
    {
        if ($fileHandle = fopen($this->log_path, 'w')) {
            ftruncate($fileHandle, 0);
            fclose($fileHandle);
        }
        return $this->logs();
    }
}
