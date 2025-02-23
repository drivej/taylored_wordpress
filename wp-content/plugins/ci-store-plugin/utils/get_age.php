<?php
namespace CIStore\Utils;

use DateTime;
use Exception;
/**
 * Calculates the difference between the given date and now.
 *
 * @param string $dateString The date to compare to now.
 * @param string $units      The unit of time to return.
 *                           Acceptable values: 'years', 'months', 'days', 'hours', 'minutes', 'seconds'.
 *                           If empty or unrecognized, the function returns the DateInterval object.
 *
 * @return int|DateInterval The age in the specified units or the DateInterval if no valid unit is provided.
 */
function get_age($dateString, $units = '')
{
    try {
        $date     = new DateTime($dateString);
        $now      = new DateTime();
        $interval = $now->diff($date);
    } catch (Exception $e) {
        return 0;
    }

    switch (strtolower($units)) {
        case 'year':
        case 'years':
            return $interval->y;
        case 'month':
        case 'months':
            return ($interval->y * 12) + $interval->m;
        case 'day':
        case 'days':
            return $interval->days; // Total days
        case 'hour':
        case 'hours':
            return ($interval->days * 24) + $interval->h;
        case 'minute':
        case 'minutes':
            return (($interval->days * 24 * 60) + ($interval->h * 60) + $interval->i);
        case 'second':
        case 'seconds':
            return (($interval->days * 24 * 60 * 60) + ($interval->h * 60 * 60) + ($interval->i * 60) + $interval->s);
        default:
            return $interval;
    }
}
