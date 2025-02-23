<?php
namespace CIStore\Activation;

function create_t14_table()
{
    // need to store the 1000s of prices for lookup. The Turn14 API does not allow lookup of price by product id
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();

    // Define table name
    $table_name = $wpdb->prefix . 't14_price_lookup';
    // Check if the table already exists
    if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
        // SQL to create the table
        $sql = "CREATE TABLE $table_name (
        item_id INT(11),
        price DECIMAL NOT NULL,
        PRIMARY KEY (item_id)
    ) $charset_collate;";

        dbDelta($sql);
    } else {
        // already exists
    }
}
