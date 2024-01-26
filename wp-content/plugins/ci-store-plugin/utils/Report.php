<?php

class Report
{
    public array $logs = [];
    public array $data = [];

    public function addLog($msg)
    {
        $this->logs[] = $msg;
    }

    public function addData($key, $val)
    {
        $this->data[$key] = $val;
    }

    public function getData($key, $defaultValue = null)
    {
        if (array_key_exists($key, $this->data)) {
            return $this->data[$key];
        }
        return $defaultValue;
    }

    public function updateData($key, $fn, $defaultValue)
    {
        $this->data[$key] = $fn($this->getData($key, $defaultValue));
    }

    public function tick($key)
    {
        $this->updateData($key, fn($val) => $val + 1, 0);
    }

    public function export()
    {
        return '<pre>' . json_encode(['logs' => $this->logs, 'data' => $this->data], JSON_PRETTY_PRINT) . '</pre>';
    }
}
