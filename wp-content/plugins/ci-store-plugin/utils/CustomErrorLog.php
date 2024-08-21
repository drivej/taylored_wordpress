<?php

namespace CIStore\Utils;

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
        if (!file_exists($this->log_path)) {
            // Attempt to create the file if it doesn't exist
            if (!touch($this->log_path)) {
                error_log('Failed to create log file: ' . $this->log_path);
            }
        }
    }

    public function log($message = null)
    {
        if (!is_writable($this->log_path)) {
            error_log('Log file is not writable: ' . $this->log_path);
            return;
        }
        $formatted_message = '[' . date('Y-m-d H:i:s') . '] ' . $message . PHP_EOL;
        // error_log($formatted_message, 3, $this->log_path);
        if (file_put_contents($this->log_path, $formatted_message, FILE_APPEND) === false) {
            error_log('Failed to write to log file: ' . $this->log_path);
        }
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
