<?php
/*
I would love to use the wp functions but they dont'work for some reason

update_option('wps_stock_check_info', $report->data);
$info = get_option('wps_stock_check_info', []);
delete_option('wps_stock_check_should_stop');

 */
// class JobData
// {
//     public array $logs = [];
//     private $filename;
//     public array $data = [];

//     public function __construct($filename, $defaultData = [])
//     {
//         $this->filename = WP_CONTENT_DIR . '/uploads/job_data_' . $filename . '.json';
//         $this->data = $this->load();

//         if (count($this->data) === 0) {
//             $this->save($defaultData);
//         }
//         $this->save(['key' => $filename]);
//     }

//     public function start()
//     {
//         $this->save([
//             'is_running' => true,
//             'is_complete' => false,
//             'is_stopping' => false,
//             'is_stalled' => false,
//             'started' => gmdate("c"),
//             'stopped' => null,
//         ]);
//     }

//     public function stop()
//     {
//         $this->save([
//             // 'is_running' => false,
//             'is_stopping' => true,
//             // 'stopped' => gmdate("c"),
//         ]);
//     }

//     public function complete_stop()
//     {
//         $this->save([
//             'is_running' => false,
//             'is_stopping' => false,
//             'stopped' => gmdate("c"),
//         ]);
//     }

//     public function complete()
//     {
//         $this->save([
//             'is_running' => false,
//             'is_stopping' => true,
//             // 'stopped' => gmdate("c"),
//             'is_complete' => true,
//             'completed' => gmdate("c"),
//         ]);
//     }

//     public function save($data = null)
//     {
//         if ($data) {
//             $this->data = array_merge($this->data, $data);
//         }

//         $this->push();
//     }

//     public function merge($data)
//     {
//         $this->data = array_merge($this->data, $data);
//     }

//     public function push()
//     {
//         $json_data = json_encode($this->data, JSON_PRETTY_PRINT);
//         $result = file_put_contents($this->filename, $json_data);
//         if ($result === false) {
//             error_log('Error saving jobData ' . $this->filename);
//         }
//     }

//     public function load()
//     {
//         $json_data = file_get_contents($this->filename);
//         if ($json_data === false) {
//             return [];
//         }

//         $data = json_decode($json_data, true);
//         if ($data === null) {
//             return [];
//         }

//         return $data;
//     }

//     public function addLog($msg)
//     {
//         $this->logs[] = $msg;
//     }

//     public function addData($key, $val)
//     {
//         $this->save([$key => $val]);
//     }

//     public function getData($key, $defaultValue = null)
//     {
//         if (array_key_exists($key, $this->data)) {
//             return $this->data[$key];
//         }
//         return $defaultValue;
//     }

//     public function updateData($key, $fn, $defaultValue)
//     {
//         $this->data[$key] = $fn($this->getData($key, $defaultValue));
//     }

//     public function tick($key)
//     {
//         $this->updateData($key, fn($val) => $val + 1, 0);
//         return $this->data[$key];
//     }

//     public function export()
//     {
//         return '<pre>' . json_encode(['logs' => $this->logs, 'data' => $this->data], JSON_PRETTY_PRINT) . '</pre>';
//     }
// }
