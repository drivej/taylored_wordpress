<?php

namespace CIStore\Utils;

function get_age($dateString)
{
    $date = new \DateTime($dateString);
    $now = new \DateTime();
    $interval = $now->diff($date);
    return $interval;
}
