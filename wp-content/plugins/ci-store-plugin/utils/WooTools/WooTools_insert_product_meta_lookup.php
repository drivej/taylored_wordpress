<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Timer.php';

trait WooTools_insert_product_meta_lookup
{
    public static function insert_product_meta_lookup($products_meta)
    {
        if (!WooTools::is_valid_array($products_meta)) {
            return ['error' => 'data empty'];
        }
        global $wpdb;
        // Prepare the values and placeholders for the bulk insert query
        $values = [];
        $placeholders = [];

        foreach ($products_meta as $meta) {
            $placeholders[] = '(%d, %s, %d, %d, %f, %f, %d, %d, %s, %d, %f, %d)';
            $values[] = $meta['product_id'];
            $values[] = $meta['sku'];
            $values[] = $meta['virtual'] ?? 0;
            $values[] = $meta['downloadable'] ?? 0;
            $values[] = $meta['min_price'] ?? $meta['price'] ?? 0;
            $values[] = $meta['max_price'] ?? $meta['price'] ?? 0;
            $values[] = $meta['onsale'] ?? 0;
            $values[] = $meta['stock_quantity'] ?? 100;
            $values[] = $meta['stock_status'] ?? 'instock';
            $values[] = $meta['rating_count'] ?? 0;
            $values[] = $meta['average_rating'] ?? 0;
            $values[] = $meta['total_sales'] ?? 0;
        }

        // Combine the placeholders into a single string
        $placeholders = implode(', ', $placeholders);

        // Build the SQL query
        $sql = "INSERT INTO {$wpdb->prefix}wc_product_meta_lookup
            (product_id, sku, `virtual`, downloadable, min_price, max_price, onsale, stock_quantity, stock_status, rating_count, average_rating, total_sales)
            VALUES $placeholders
            ON DUPLICATE KEY UPDATE
            sku = VALUES(sku),
            `virtual` = VALUES(`virtual`),
            downloadable = VALUES(downloadable),
            min_price = VALUES(min_price),
            max_price = VALUES(max_price),
            onsale = VALUES(onsale),
            stock_quantity = VALUES(stock_quantity),
            stock_status = VALUES(stock_status),
            rating_count = VALUES(rating_count),
            average_rating = VALUES(average_rating),
            total_sales = VALUES(total_sales)
        ";
        // $sql = "INSERT INTO {$wpdb->prefix}wc_product_meta_lookup (product_id, sku, virtual, downloadable, min_price, max_price, onsale, stock_quantity, stock_status, rating_count, average_rating, total_sales) VALUES $placeholders";

        // Execute the query with the prepared values
        $wpdb->query($wpdb->prepare($sql, $values));
    }
}
