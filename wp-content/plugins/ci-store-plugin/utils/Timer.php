<?php

class Timer
{
    protected float $start_time;
    protected float $origin_time;
    protected float $seconds;

    public function __construct()
    {
        $this->origin_time = microtime(true);
        $this->start_time = microtime(true);
    }

    public function lap()
    {
        $end_time = microtime(true);
        $duration = $end_time - $this->start_time;
        $this->start_time = $end_time;
        // return floor($duration * 1000);// . " ms";
        return round($duration, 6);
    }

    public function total()
    {
        $end_time = microtime(true);
        $duration = $end_time - $this->origin_time;
        return round($duration, 6);
    }
}
