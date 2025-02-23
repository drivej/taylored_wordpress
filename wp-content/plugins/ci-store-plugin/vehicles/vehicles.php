<?php
namespace CIStore\Vehicles;

include_once CI_STORE_PLUGIN . 'suppliers/Suppliers.php';

add_action('wp_enqueue_scripts', 'CIStore\Vehicles\vehicle_enqueue_scripts');
add_action('wp_ajax_nopriv_vehicles_handler', 'CIStore\Vehicles\vehicles_handler');
add_action('wp_ajax_vehicles_handler', 'CIStore\Vehicles\vehicles_handler');
add_shortcode('vehicle_filter', 'CIStore\Vehicles\vehicle_selection_form');
// add_action('woocommerce_single_product_summary', 'CIStore\Vehicles\woocommerce_single_product_summary', 20);

function vehicle_enqueue_scripts()
{
    wp_enqueue_style('vehicle-styles', plugins_url('vehicles/vehicles.css', CI_STORE_PLUGIN_FILE), null, CI_VERSION);
    wp_enqueue_script('vehicle_script', plugins_url('vehicles/vehicles.js', CI_STORE_PLUGIN_FILE), CI_VERSION, true);
    wp_localize_script('vehicle_script', 'vehicles_ajax', [
        'url'          => admin_url('admin-ajax.php'),
        'action'       => 'vehicles_handler',
        'nonce'        => wp_create_nonce('vehicles_ajax_nonce'),
        'product_id'   => is_product() ? get_the_ID() : 0,
        'is_product'   => is_product(),
        'has_vehicles' => is_product() ? has_term('', 'product_vehicle', get_the_ID()) : false,
    ]);
}

function get_vehicle_years()
{
    // just make year a year - no need to abstract
    $transient_key = __FUNCTION__;
    $response      = get_transient($transient_key);

    if (false === $response) {
        $supplier = \CIStore\Suppliers\get_supplier('wps');
        $response = $supplier->get_vehicle_years();
        foreach ($response as &$year) {
            $year['id'] = $year['name'];
        }
        set_transient($transient_key, $response, WEEK_IN_SECONDS);
    }

    return $response;
}

function get_vehicle_makes($year)
{
    $transient_key = __FUNCTION__ . $year;
    $response      = get_transient($transient_key);

    if (false === $response) {
        $supplier = \CIStore\Suppliers\get_supplier('wps');
        $response = $supplier->get_vehicle_makes_in_year($year);
        set_transient($transient_key, $response, WEEK_IN_SECONDS);
    }

    return $response;
}

function get_vehicle_models($year, $make)
{
    $transient_key = __FUNCTION__ . $year . '_' . $make;
    $response      = get_transient($transient_key);

    if (false === $response) {
        $supplier = \CIStore\Suppliers\get_supplier('wps');
        $response = $supplier->get_vehicle_models_by_make_in_year($make, $year);
        set_transient($transient_key, $response, WEEK_IN_SECONDS);
    }

    return $response;
}

function get_vehicle_id($year, $model)
{
    $transient_key = __FUNCTION__ . $year . '_' . $model;
    $response      = get_transient($transient_key);

    if (false === $response) {
        $supplier = \CIStore\Suppliers\get_supplier('wps');
        $response = $supplier->get_vehicle_id_by_year_model($year, $model);
        set_transient($transient_key, $response, WEEK_IN_SECONDS);
    }

    return $response;
}

function get_vehicle($year, $model)
{
    $transient_key = __FUNCTION__ . $year . '_' . $model;
    $response      = get_transient($transient_key);

    if (false === $response) {
        $supplier = \CIStore\Suppliers\get_supplier('wps');
        $response = $supplier->get_vehicle_by_year_model($year, $model);
        set_transient($transient_key, $response, WEEK_IN_SECONDS);
    }

    return $response;
}

function vehicles_handler()
{
    check_ajax_referer('vehicles_ajax_nonce', 'nonce');

    if (isset($_POST['type'])) {
        $type = $_POST['type'];
        $data = [];
        $meta = [];

        switch ($type) {
            // case 'info':
            //     if (! session_id()) {
            //         session_start();
            //     }
            //     $data = $_SESSION['selected_vehicle'];
            //     break;

            // case 'clear':
            //     session_unset();
            //     break;

            case 'get_years':
                $data = get_vehicle_years();
                break;

            case 'get_makes':
                if (isset($_POST['year'])) {
                    $data = get_vehicle_makes($_POST['year']);
                }
                break;

            case 'get_models':
                if (isset($_POST['year']) && isset($_POST['make'])) {
                    $data = get_vehicle_models($_POST['year'], $_POST['make']);
                }
                break;

            // case 'make':
            //     if (isset($_POST['make'])) {
            //         $make = isset($_POST['make']) ? $_POST['make'] : null;
            //         $year = isset($_POST['year']) ? $_POST['year'] : null;
            //         $data = get_vehicle_models($year, $make);
            //     }
            //     break;

            // case 'model':
            //     if (isset($_POST['model'])) {
            //         $data = get_vehicle_id($_POST['year'], $_POST['model']);
            //     }
            //     break;

            case 'get_vehicle':
                if (isset($_POST['year']) && isset($_POST['model'])) {
                    $data = get_vehicle($_POST['year'], $_POST['model']);
                }
                break;

            case 'fitment':
                $vehicle_id   = $_POST['vehicle_id'];
                $product_id   = $_POST['product_id'];
                $variation_id = $_POST['variation_id'];

                $data = [
                    'vehicle_id'     => $vehicle_id,
                    'product_id'     => $product_id,
                    'variation_id'   => $variation_id,
                    'has_vehicles'   => false,
                    'fitment'        => false,
                    'variation'      => false,
                    'product'        => false,
                    'variation_skus' => [],
                    'variation_ids'  => [],
                ];
                $term_slug = "vehicle_{$vehicle_id}";
                $taxonomy  = 'product_vehicle';

                if ($variation_id) {
                    $data['variation'] = has_term($term_slug, $taxonomy, $variation_id);
                    $data['fitment']   = true;
                }

                if ($product_id) {
                    $data['has_vehicles'] = has_term('', $taxonomy, $product_id);
                    $data['product']      = has_term($term_slug, $taxonomy, $product_id);
                    $data['fitment']      = true;
                }

                $variations = get_children([
                    'post_parent' => $product_id,
                    'post_type'   => 'product_variation',
                    'numberposts' => -1,
                ]);

                if (count($variations)) {
                    $variation_skus = [];
                    $variation_ids  = [];

                    if (! empty($variations)) {
                        foreach ($variations as $variation) {
                            if (has_term($term_slug, $taxonomy, $variation->ID)) {
                                $variation_ids[]  = $variation->ID;
                                $variation_skus[] = get_post_meta($variation->ID, 'attribute_sku', true);
                            }
                        }
                    }
                    $data['variation_skus'] = $variation_skus;
                    $data['variation_ids']  = $variation_ids;
                }
                break;
        }
        wp_send_json(['data' => $data, 'meta' => $meta]);
    }
}

function vehicle_selection_form()
{
    return file_get_contents(CI_STORE_PLUGIN . 'vehicles/vehicles.html');
}

// function woocommerce_single_product_summary()
// {
    // global $product;
    // if ($product) {
    //     $has_vehicles = has_term('', 'product_vehicle', $product->get_id());
    //     echo '<script>PRODUCT_HAS_VEHICLES=' . ($has_vehicles ? 'true' : 'false') . '</script>';
    // }
    // echo '<p id="vehicle_fitment_message" data-fitment=""></p>';
// }
