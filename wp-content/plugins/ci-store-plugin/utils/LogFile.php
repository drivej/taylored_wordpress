<?php

class LogFile
{

    private string $filepath;
    public readonly string $url;
    public readonly string $filename;

    public function __construct($name)
    {
        $this->filename = 'log_file_' . sanitize_title($name) . '.log';
        $this->url = '/wp-content/uploads/' . $this->filename;
        $this->filepath = WP_CONTENT_DIR . '/uploads/log_file_' . sanitize_title($name) . '.log';
    }

    public function log($message)
    {
        if (is_countable($message)) {
            $message['timestamp'] = gmdate("c");
        }
        file_put_contents($this->filepath, json_encode($message) . PHP_EOL, FILE_APPEND | LOCK_EX);
    }

    public function clear()
    {
        if (file_exists($this->filepath)) {
            $file_handle = fopen($this->filepath, 'w');
            fclose($file_handle);
        }
    }

    public function get_log()
    {
        if (file_exists($this->filepath)) {
            $content = file_get_contents($this->filepath);
            $lastBreak = strrpos($content, PHP_EOL);
            // Remove the last line break so json formats properly
            if ($lastBreak !== false) {
                $content = substr_replace($content, '', $lastBreak, 1);
            }
            $data = json_decode('[' . str_replace(PHP_EOL, ",", $content) . ']', true);

        } else {
            $data = [];
        }
        return $data;
    }
}
