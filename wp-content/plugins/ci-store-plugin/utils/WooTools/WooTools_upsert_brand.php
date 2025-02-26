<?php
namespace WooTools;

function upsert_brand($brand_name)
{
    $transient_key = __FUNCTION__ . $brand_name;
    $response      = get_transient($transient_key);

    if (false === $response) {
        $term     = term_exists($brand_name, 'product_brand'); // Check if the brand exists
        $response = false;

        if ($term === 0 || $term === null) {
            $new_term = wp_insert_term($brand_name, 'product_brand');

            if (is_wp_error($new_term)) {
                if (isset($new_term->error_data) && isset($new_term->error_data['term_exists'])) {
                    $response = $new_term->error_data['term_exists'];
                }
            } else {
                $response = $new_term['term_id'];
            }
        } else {
            $response = (int) $term['term_id']; // Return existing brand term ID
        }
        set_transient($transient_key, $response, WEEK_IN_SECONDS);
    }

    return $response;
}
