<?php

class Timer
{
    protected float $start_time;
    protected float $seconds;

    public function __construct()
    {
        $this->start_time = microtime(true);
    }

    public function lap()
    {
        $end_time = microtime(true);
        $duration = $end_time - $this->start_time;
        $this->start_time = microtime(true);
        return floor($duration * 1000);// . " ms";
    }
}
