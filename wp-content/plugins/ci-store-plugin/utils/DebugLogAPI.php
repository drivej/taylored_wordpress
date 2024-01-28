<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/FileCache.php';

class DebugLogAPI
{
    public $filename = '';

    public function __construct()
    {
        $this->filename = WP_CONTENT_DIR . '/debug.log';
        add_action('wp_ajax_debug_log_api', array($this, 'handle_ajax'));
    }

    public function get_data()
    {
        $content = $this->loadDebugLog();
        return ['data' => $this->parseDebugLog($content)];
    }

    public function empty_data()
    {
        file_put_contents($this->filename, '');
        return ['data' => []];
    }

    public function handle_ajax()
    {
        $cmd = $_GET['cmd'];

        switch ($cmd) {
            case 'get_data':
                wp_send_json($this->get_data());
                break;

            case 'empty':
                wp_send_json($this->empty_data());
                break;

            default:
                wp_send_json(['error' => 'no cmd']);
        }
        wp_die();
    }

    private function loadDebugLog()
    {
        if (file_exists($this->filename)) {
            return file_get_contents($this->filename);
        }
        return '';
    }

    private function parseDebugLog($logContent)
    {
        $logEntries = [];
        // Split the log content into individual lines
        $logLines = explode("\n", $logContent);
        // Parse each line and extract date and message
        foreach ($logLines as $line) {
            // Match the timestamp pattern in the log entry
            if (preg_match('/^\[(.*?)\]/', $line, $matches)) {
                // Extract the timestamp and message
                $timestamp = $matches[1];
                $message = trim(str_replace("[$timestamp]", '', $line));

                // Create an entry with date and message properties
                $logEntries[] = [
                    'date' => $timestamp,
                    'message' => $message,
                ];
            }
        }
        return $logEntries;
    }
}
