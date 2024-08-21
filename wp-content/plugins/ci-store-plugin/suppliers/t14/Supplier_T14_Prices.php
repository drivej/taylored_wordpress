<?php
/*

https://turn14.com/api_settings.php

 */
// include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Supplier.php';
// include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/Import_T14_Products.php';

trait Supplier_T14_Prices
{
    public function import_prices_page($page_index = 1, $page_type = null)
    {
        //
    }

    public function update_prices_table($page_index = 1, $start_date = null, $end_date = null)
    {
        $args = [];
        $args['page'] = $page_index;
        if ($start_date) {
            $args['start_date'] = $start_date;
        }

        if ($end_date) {
            $args['end_date'] = $end_date;
        }
        $path = '/pricing';

        if ($start_date && $end_date) {
            $path = '/pricing/changes';
        }

        $items = $this->get_api($path, $args);
        // $total_pages = $items['meta']['total_pages'];
        // $first_id = $items['data'][0]['id'];
        // $this->log("update_prices_table() ". json_encode(['path' => $path, 'args' => $args, 'id[0]' => $first_id, 'total_pages' => $total_pages]));
        $prices = [];

        foreach ($items['data'] as $item) {
            $price = $this->extract_price($item);
            // we always need a price to exclude unavailable products
            $prices[] = ['item_id' => $item['id'], 'price' => $price];
        }

        $result = $this->insert_prices($prices);
        // $this->log(json_encode($items['meta'], JSON_PRETTY_PRINT));
        return ['result' => $result, 'meta' => $items['meta']];
    }

    // get price from pricing API item
    public function extract_price($item)
    {
        $price = 0;
        $can_purchase = isset($item['attributes']['can_purchase']) && $item['attributes']['can_purchase'] === true;

        if ($can_purchase) {
            $price_lists = is_array($item['attributes']['pricelists']) ? $item['attributes']['pricelists'] : [];

            if (count($price_lists)) {
                $lookup_types = array_column($item['attributes']['pricelists'], 'price', 'name');
                // first check retail price
                $price = isset($lookup_types['Retail']) ? $lookup_types['Retail'] : 0;

                if (!$price) {
                    // check for Minimum Advertised Price
                    $price = isset($lookup_types['MAP']) ? $lookup_types['MAP'] : 0;
                }

                if (!$price) {
                    // check middleman price
                    $price = isset($lookup_types['Jobber']) ? $lookup_types['Jobber'] : 0;
                    if ($price) {
                        $price += 2; // TODO: 2$ COB
                        $price *= 1.5; // TODO: 20% markup
                    }
                }
                // if ($price) {
                //     return $price;
                //     $prices[] = ['item_id' => $item['id'], 'price' => $price];
                // } else {
                //     return $price;
                //     error_log('No price found for ' . $item['id']);
                //     error_log(json_encode($item, JSON_PRETTY_PRINT));
                // }
            } else {
                if (isset($item['attributes']['purchase_cost'])) {
                    $price = $item['attributes']['purchase_cost'];
                    $price += 2; // TODO: 2$ COB
                    $price *= 1.5; // TODO: 50% markup on purchase cost
                }
            }
        } else {
            error_log('can_purchase=false found for ' . $item['id']);
        }
        return $price;

    }

    public function get_prices_table($item_ids)
    {
        global $wpdb;
        $table_name = $wpdb->prefix . 't14_price_lookup';
        $placeholders = implode(',', array_fill(0, count($item_ids), '%s'));
        $sql = "SELECT item_id, price FROM {$table_name} WHERE item_id IN ($placeholders)";
        $query = $wpdb->prepare($sql, $item_ids);
        $results = $wpdb->get_results($query);
        $lookup = [];
        foreach ($results as $row) {
            $lookup[$row->item_id] = $row->price;
        }
        return $lookup;
    }

    public function get_price($item_id)
    {
        global $wpdb;
        $table_name = $wpdb->prefix . 't14_price_lookup';
        $sql = "SELECT price FROM {$table_name} WHERE item_id = %s";
        $query = $wpdb->prepare($sql, $item_id);
        $result = $wpdb->get_row($query);
        if ($result) {
            return $result->price;
        }
        return null;
    }

    // TODO: schedule event to run price update every day
    public function insert_prices($prices)
    {
        if (!is_array($prices) || !count($prices)) {
            // $this->log('prices empty');
            return ['success' => 'prices empty'];
        }
        // $this->log('prices '. count($prices));
        global $wpdb;
        // Define table name
        $table_name = $wpdb->prefix . 't14_price_lookup';
        // Prepare the values and placeholders for the bulk insert query
        $values = [];
        $placeholders = [];
        foreach ($prices as $price_data) {
            $placeholders[] = '(%s, %f)'; // TODO: should this be %f for float?
            $values[] = $price_data['item_id'];
            $values[] = $price_data['price'];
        }
        // Construct the bulk insert SQL
        // $sql = "INSERT INTO $table_name (item_id, price) VALUES " . implode(', ', $placeholders);
        $sql = "INSERT INTO $table_name (item_id, price) VALUES " . implode(', ', $placeholders) . " ON DUPLICATE KEY UPDATE price = VALUES(price)";
        $query = $wpdb->prepare($sql, ...$values);
        // $this->log($query);
        // Execute the query
        $wpdb->query($query);
        // Check for errors
        if ($wpdb->last_error) {
            $this->log('Error inserting prices: ' . $wpdb->last_error);
        } else {
            // $this->log('Prices inserted successfully.');
        }
        return ['success' => 'prices added'];
    }
}
