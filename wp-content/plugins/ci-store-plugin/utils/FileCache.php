<?php

class FileCache
{
    public array $logs = [];
    private $filename;
    public array $data = [];
    public int $updated = 0;

    public function __construct($filename, $defaultData = [])
    {
        $this->filename = WP_CONTENT_DIR . '/uploads/file_cache_' . $filename . '.json';
        if (!file_exists($this->filename)) {
            file_put_contents($this->filename, json_encode([...$defaultData, 'key' => $filename]));
            error_log('FileCache::construct() ' . $this->filename);
        }
        $this->pull();
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

    public function push()
    {
        $handle = fopen($this->filename, 'a');
        if (flock($handle, LOCK_EX)) {
            // Perform your read or write operations here
            $json_data = json_encode($this->data, JSON_PRETTY_PRINT);
            $result = file_put_contents($this->filename, $json_data);
            $this->updated = filemtime($this->filename);
            // error_log('FileCache::push()');
            if ($result === false) {
                // error_log('FileCache::push() save failed' . $this->filename);
            }
            // Release the lock
            flock($handle, LOCK_UN);
            return true;
        } else {
            // Handle lock acquisition failure
            // error_log("FileCache::push() Couldn't get the lock!");
            return false;
        }
    }

    public function pull($defaultData = [])
    {
        // $updated = filemtime($this->filename);
        // if ($this->updated !== $updated) {
        //     error_log('FileCache::pull() read file '.$updated.'=>'.$this->updated);
        // $this->updated = $updated;
        $this->data = $defaultData;
        $json_data = file_get_contents($this->filename);

        if ($json_data) {
            $data = json_decode($json_data, true);
            if ($data) {
                $this->data = $data;
            }
        }
        // }
        return $this->data;
    }
}
