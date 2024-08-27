<?php

namespace CIStore\Ajax;

// transient tools

function get_transient_info()
{
    global $wpdb;

    $sql_size = "SELECT SUM(LENGTH(option_value)) AS total_transient_size FROM wp_options WHERE option_name LIKE '_transient_%'";
    $size = $wpdb->get_var($sql_size);

    $sql_count = "SELECT COUNT(*) FROM wp_options WHERE option_name LIKE '_transient_%'";
    $count = $wpdb->get_var($sql_count);

    return [
        'size' => $size,
        'count' => $count,
    ];
}

function delete_transients()
{
    global $wpdb;
    $sql = "DELETE FROM wp_options WHERE option_name LIKE '_transient_%'";
    $wpdb->query($sql);
    return get_transient_info();
}

function clean_transients()
{
    global $wpdb;
    $sql = "DELETE FROM wp_options WHERE option_name LIKE '_transient_timeout_%' AND option_value < UNIX_TIMESTAMP()";
    $wpdb->query($sql);
    return get_transient_info();
}
