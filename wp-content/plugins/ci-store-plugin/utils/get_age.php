<?php

namespace CIStore\Utils;

function get_age($dateString, $unit = 'interval')
{
    if (!$dateString) {
        return null;
    }
    $date = new \DateTime($dateString);
    $now = new \DateTime();
    $diffInSeconds = $now->getTimestamp() - $date->getTimestamp();
    $interval = $now->diff($date);

    switch ($unit) {
        case 'seconds':
            return $diffInSeconds;
        case 'minutes':
            return $diffInSeconds / 60;
        case 'hours':
            return $diffInSeconds / 3600;
    }

    return $interval;
}
