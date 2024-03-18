<?php

class FileCache
{
    public array $logs = [];
    private string $filepath;
    public readonly string $url;
    public readonly string $filename;
    public array $data = [];
    public int $updated = 0;
    private $defaultData = [];

    public function __construct($filepath, $defaultData = [])
    {
        $this->defaultData = $defaultData;
        $this->defaultData['key'] = $filepath;
        $this->data = $this->defaultData;

        $this->filename = 'file_cache_' . $filepath . '.json';
        $this->filepath = WP_CONTENT_DIR . '/uploads/' . $this->filename;
        $this->url = '/wp-content/uploads/' . $this->filename;

        if (!file_exists($this->filepath)) {
            // $this->data = [...$defaultData, 'key' => $filepath];
            $this->push();
            // file_put_contents($this->filepath, json_encode([...$defaultData, 'key' => $filepath]));
            error_log('FileCache::construct() ' . $this->filepath);
        }
        // $this->pull();
    }

    public function update($data = [])
    {
        // error_log('FileCache::update()');
        $this->pull();
        $this->merge($data);
        return $this->push();
    }

    public function merge($data)
    {
        $this->data = array_merge($this->data, $data);
    }

    public function push($attempts = 0)
    {
        // $attempt = file_put_contents($this->filepath, json_encode($this->data) . PHP_EOL, FILE_APPEND | LOCK_EX);
        // if (!$attempt) {
        //     sleep(1);
        //     $attempt = file_put_contents($this->filepath, json_encode($this->data) . PHP_EOL, FILE_APPEND | LOCK_EX);
        // }
        // return $attempt;

        $handle = fopen($this->filepath, 'a');
        if (flock($handle, LOCK_EX)) {
            // Perform your read or write operations here
            $json_data = json_encode($this->data, JSON_PRETTY_PRINT);
            $result = file_put_contents($this->filepath, $json_data);
            $this->updated = filemtime($this->filepath);
            // error_log('FileCache::push()');
            if ($result === false) {
                // error_log('FileCache::push() save failed' . $this->filepath);
            }
            // Release the lock
            flock($handle, LOCK_UN);
            return true;
        } else if ($attempts < 2) {
            // Handle lock acquisition failure
            error_log("FileCache::push() RETRY: Couldn't get the lock!");
            sleep(1);
            return $this->push($attempts + 1);
        } else {
            error_log("FileCache::push() FAIL: Couldn't get the lock!");
            return false;
        }
    }

    public function pull() //$defaultData = [], $attempts = 0)
    {
        if (file_exists($this->filepath)) {
            $json_data = file_get_contents($this->filepath);
            if ($json_data) {
                $data = json_decode($json_data, true);
                if ($data) {
                    $this->data = $data;
                }
            }
        }
        return $this->data;
        // $handle = fopen($this->filepath, 'r');

        // if ($handle && flock($handle, LOCK_SH)) {
        //     // Lock acquired, read the contents
        //     $json_data = file_get_contents($this->filepath);

        //     if ($json_data) {
        //         $data = json_decode($json_data, true);
        //         if ($data) {
        //             $this->data = $data;
        //         }
        //     }

        //     // Release the lock
        //     flock($handle, LOCK_UN);
        //     fclose($handle);
        //     return $this->data;

        //     // Process $contents as needed
        //     // ...
        // } else if ($attempts === 0) {
        //     sleep(0.5);
        //     return $this->pull($defaultData, $attempts + 1);

        //     // Unable to acquire lock, handle accordingly
        //     // ...
        // } else {
        //     return false;
        // }

        // $updated = filemtime($this->filepath);
        // if ($this->updated !== $updated) {
        //     error_log('FileCache::pull() read file '.$updated.'=>'.$this->updated);
        // $this->updated = $updated;
        // $this->data = $defaultData;
        // error_log('pull '.$this->filepath);
        // $json_data = file_get_contents($this->filepath);

        // if ($json_data) {
        //     $data = json_decode($json_data, true);
        //     if ($data) {
        //         $this->data = $data;
        //     }
        // }
        // // }
        // return $this->data;
    }
}
