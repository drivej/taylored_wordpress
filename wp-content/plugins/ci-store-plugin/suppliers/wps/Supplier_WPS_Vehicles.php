<?php

use function WooTools\bulk_set_post_terms;

include_once CI_STORE_PLUGIN . 'utils/WooTools/WooTools_get_product_info_by_skus.php';
include_once CI_STORE_PLUGIN . 'utils/WooTools/WooTools_upsert_terms.php';
include_once CI_STORE_PLUGIN . 'utils/WooTools/WooTools_get_mem.php';
include_once CI_STORE_PLUGIN . 'utils/WooTools/WooTools_bulk_set_post_terms.php';

trait Supplier_WPS_Vehicles
{
    public function get_product_with_most_vehicle_terms()
    {
        global $wpdb;

        $query = "
            SELECT tr.object_id AS product_id, COUNT(tr.term_taxonomy_id) AS term_count
            FROM {$wpdb->term_relationships} tr
            INNER JOIN {$wpdb->term_taxonomy} tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
            WHERE tt.taxonomy = 'product_vehicle'
            GROUP BY tr.object_id
            ORDER BY term_count DESC
            LIMIT 1
        ";

        return $wpdb->get_row($query);
    }

    public function get_vehicle($vehicle_id)
    {
        $res = $this->get_api("/vehicles/{$vehicle_id}", [
            'include' => 'vehiclemodel.vehiclemake,vehicleyear',
        ]);

        if (isset($res['data']['id'])) {
            $year  = $res['data']['vehicleyear']['data']['name'];
            $make  = $res['data']['vehiclemodel']['data']['vehiclemake']['data']['name'];
            $model = $res['data']['vehiclemodel']['data']['name'];

            return [
                'id'    => $res['data']['id'],
                'year'  => $year,
                'make'  => $res['data']['vehiclemodel']['data']['vehiclemake']['data']['id'],
                'model' => $res['data']['vehiclemodel']['data']['id'],
                'name'  => "{$year} {$make} {$model}",
            ];
        }
        return 0;
    }

    public function get_vehicle_year_id($year)
    {
        $years  = $this->get_vehicle_years();
        $lookup = array_column($years, 'id', 'name');
        if (isset($lookup[$year])) {
            return $lookup[$year];
        }
        return false;
    }

    public function get_vehicle_models_in_year($year = '')
    {
        $transient_name = $this->key . __FUNCTION__ . $year;
        $response       = get_transient($transient_name);

        if (! $response) {
            $year_id = $this->get_vehicle_year_id($year);
            if (! $year_id) {
                return [];
            }
            $cursor   = '';
            $response = [];

            while (is_string($cursor)) {
                $page = $this->get_api("/vehicleyears/{$year_id}/vehiclemodels", ['page' => ['size' => 500, 'cursor' => $cursor]]);
                if (! empty($page['data']) && isset($page['data']['id'])) {
                    $page['data'] = [$page['data']];
                }
                if (! empty($page['data'])) {
                    foreach ($page['data'] as $model) {
                        $response[] = $model;
                    }
                }
                $cursor = $page['meta']['cursor']['next'] ?? false;
            }

            set_transient($transient_name, $response, WEEK_IN_SECONDS);
        }
        return $response;
    }

    public function get_vehicle_makes_in_year($year = '')
    {
        $transient_name = $this->key . __FUNCTION__ . $year . '1';
        $response       = get_transient($transient_name);

        if (! $response) {
            $year_id = $this->get_vehicle_year_id($year);
            if (! $year_id) {
                return [];
            }
            $cursor   = '';
            $make_ids = [];

            while (is_string($cursor)) {
                $page = $this->get_api("/vehicleyears/{$year_id}/vehiclemodels", ['page' => ['size' => 500, 'cursor' => $cursor]]);
                if (! empty($page['data']) && isset($page['data']['id'])) {
                    $page['data'] = [$page['data']];
                }
                if (! empty($page['data'])) {
                    foreach ($page['data'] as $model) {
                        $make_ids[] = $model['vehiclemake_id'];
                    }
                }
                $cursor = $page['meta']['cursor']['next'] ?? false;
            }

            $cursor   = '';
            $response = [];
            $make_ids = array_values(array_unique($make_ids));

            while (is_string($cursor)) {
                $page = $this->get_api('/vehiclemakes/' . implode(',', $make_ids), ['page' => ['size' => 500, 'cursor' => $cursor]]);
                if (! empty($page['data']) && isset($page['data']['id'])) {
                    $page['data'] = [$page['data']];
                }
                if (! empty($page['data'])) {
                    foreach ($page['data'] as $make) {
                        $response[] = ['id' => $make['id'], 'name' => $make['name']];
                    }
                }
                $cursor = $page['meta']['cursor']['next'] ?? false;
            }
            set_transient($transient_name, $response, WEEK_IN_SECONDS);
        }
        return $response;
    }

    public function get_vehicle_models_by_make_in_year($make_id, $year)
    {
        $transient_name = $this->key . __FUNCTION__ . $make_id . '_' . $year;
        $response       = get_transient($transient_name);

        if (! $response) {
            $year_id = $this->get_vehicle_year_id($year);
            if (! $year_id) {
                return [];
            }
            $cursor   = '';
            $response = [];

            if ($year_id) {
                while (is_string($cursor)) {
                    $page = $this->get_api("/vehicleyears/{$year_id}/vehiclemodels", ['page' => ['size' => 500, 'cursor' => $cursor]]);
                    if (! empty($page['data']) && isset($page['data']['id'])) {
                        $page['data'] = [$page['data']];
                    }
                    if (! empty($page['data'])) {
                        foreach ($page['data'] as $model) {
                            if ($model['vehiclemake_id'] == $make_id) {
                                $response[] = ['id' => $model['id'], 'name' => $model['name']];
                            }
                        }
                    }
                    $cursor = $page['meta']['cursor']['next'] ?? false;
                }
            }
            set_transient($transient_name, $response, WEEK_IN_SECONDS);
        }
        return $response;
    }

    // public function get_vehicle_makes()
    // {
    //     $transient_name = $this->key . __FUNCTION__;
    //     $response       = get_transient($transient_name);

    //     if (! $response) {
    //         $cursor   = '';
    //         $response = [];

    //         while (is_string($cursor)) {
    //             $page = $this->get_api("/vehiclemakes", ['page' => ['size' => 500, 'cursor' => $cursor]]);
    //             if (! empty($page['data']) && isset($page['data']['id'])) {
    //                 $page['data'] = [$page['data']];
    //             }
    //             if (! empty($page['data'])) {
    //                 foreach ($page['data'] as $make) {
    //                     $response[$make['id']] = $make['name'];
    //                 }
    //             }
    //             $cursor = $page['meta']['cursor']['next'] ?? false;
    //         }
    //         set_transient($transient_name, $response, WEEK_IN_SECONDS);
    //     }
    //     return $response;
    // }

    public function get_vehicle_years()
    {
        $transient_name = $this->key . __FUNCTION__ . '1';
        $response       = get_transient($transient_name);

        if (! $response) {
            $cursor   = '';
            $response = [];

            while (is_string($cursor)) {
                $page = $this->get_api("/vehicleyears", ['page' => ['size' => 500, 'cursor' => $cursor]]);
                if (! empty($page['data']) && isset($page['data']['id'])) {
                    $page['data'] = [$page['data']];
                }
                if (! empty($page['data'])) {
                    foreach ($page['data'] as $make) {
                        $response[] = ['id' => $make['id'], 'name' => $make['name']];
                    }
                }
                $cursor = $page['meta']['cursor']['next'] ?? false;
            }
            set_transient($transient_name, $response, WEEK_IN_SECONDS);
        }
        return $response;
    }

    public function get_vehicles_by_id($vehicle_ids, $chunk_size = 50) // Adjust chunk size as needed
    {
        $vehicles = [];

        // Break vehicle IDs into manageable chunks
        $vehicle_id_chunks = array_chunk($vehicle_ids, $chunk_size);

        foreach ($vehicle_id_chunks as $chunk) {
            $cursor = '';

            while (is_string($cursor)) {
                $page = $this->get_api('/vehicles/' . implode(',', $chunk), [
                    'page'    => [
                        'size'   => 500,
                        'cursor' => $cursor,
                    ],
                    'include' => 'vehiclemodel.vehiclemake,vehicleyear',
                    'fields'  => 'vehiclemodel.name',
                ]);

                if (! empty($page['data'])) {
                    if (isset($page['data']['id'])) {
                        $page['data'] = [$page['data']];
                    }
                    foreach ($page['data'] as $item) {
                        $vehicles[] = $this->normalize_wps_vehicle($item);
                    }
                }
                $cursor = $page['meta']['cursor']['next'] ?? false;
            }
        }

        return $vehicles;
    }

    public function get_vehicle_id_by_year_model($year, $model_id)
    {
        $year_id = $this->get_vehicle_year_id($year);
        $res     = $this->get_api("/vehicles", ['filter' => ['vehicleyear' => ['eq' => $year_id], 'vehiclemodel' => ['eq' => $model_id]]]);
        if (isset($res['data'][0]['id'])) {
            return $res['data'][0]['id'];
        }
        return 0;
    }

    public function get_vehicle_by_year_model($year, $model_id)
    {
        $year_id = $this->get_vehicle_year_id($year);
        $res     = $this->get_api("/vehicles", [
            'include' => 'vehiclemodel.vehiclemake,vehicleyear',
            'filter'  => [
                'vehicleyear'  => ['eq' => $year_id],
                'vehiclemodel' => ['eq' => $model_id],
            ],
        ]);

        $this->normalize_wps_api_response($res);

        if (isset($res['data'][0]['id'])) {
            $year  = $res['data'][0]['vehicleyear']['data']['name'];
            $make  = $res['data'][0]['vehiclemodel']['data']['vehiclemake']['data']['name'];
            $model = $res['data'][0]['vehiclemodel']['data']['name'];

            return [
                'id'    => $res['data'][0]['id'],
                'year'  => $year,
                'make'  => $res['data'][0]['vehiclemodel']['data']['vehiclemake']['data']['id'],
                'model' => $res['data'][0]['vehiclemodel']['data']['id'],
                'name'  => "{$year} {$make} {$model}",
            ];
        }
        return 0;
    }

    public function upsert_vehicles($vehicle_ids)
    {
        $parent            = WooTools\upsert_term(['name' => 'Vehicles']);
        $parent_id         = $parent['term_id'];
        $chunk_size        = 25;
        $vehicle_id_chunks = array_chunk($vehicle_ids, $chunk_size);
        $response          = [];

        foreach ($vehicle_id_chunks as $chunk) {
            $vehicles  = $this->get_vehicles_by_id($chunk);
            $new_terms = [];

            foreach ($vehicles as $vehicle) {
                $new_terms[] = [
                    'name'   => esc_html($vehicle['name']),
                    'slug'   => wc_attribute_taxonomy_slug('vehicle_' . $vehicle['id']),
                    'parent' => $parent_id,
                ];
            }

            // ✅ Process & merge results efficiently (avoiding `array_merge`)
            if (! empty($new_terms)) {
                $res = WooTools\upsert_terms($new_terms, 'product_cat');
                foreach ($res as $r) {
                    $response[] = $r; // More memory-efficient than `array_merge()`
                }
            }

            // ✅ Free memory after each chunk
            unset($vehicles, $new_terms);
            gc_collect_cycles();
        }

        unset($vehicle_id_chunks, $chunk, $parent);
        return $response;
    }

    public function normalize_wps_vehicle($item)
    {
        $year  = $item['vehicleyear']['data']['name'];
        $make  = $item['vehiclemodel']['data']['vehiclemake']['data']['name'];
        $model = $item['vehiclemodel']['data']['name'];
        $name  = "{$year} {$make} {$model}";
        return [
            'id'   => $item['id'],
            'name' => $name,
        ];
    }

    public function termify_wps_vehicle($item, $parent_id)
    {
        $vehicle = $this->normalize_wps_vehicle($item);
        return [
            'name'   => esc_html($vehicle['name']),
            'slug'   => wc_attribute_taxonomy_slug('vehicle_' . $vehicle['id']),
            'parent' => $parent_id,
        ];
    }

    public function import_vehicles_page($cursor)
    {
        $timer = new Timer();
        $page  = $this->get_api('vehicles', [
            'page'    => ['cursor' => $cursor, 'size' => 1000],
            'include' => 'vehiclemodel.vehiclemake,vehicleyear',
            'fields'  => [
                'vehicles'      => 'id',
                'vehiclemodels' => 'name',
                'vehiclemakes'  => 'name',
                'vehicleyears'  => 'name',
            ],
        ]);

        $response = [];

        if (! empty($page['data'])) {
            $parent_id = 0;

            foreach ($page['data'] as $item) {
                $new_terms[] = $this->termify_wps_vehicle($item, $parent_id);
                $response[]  = $item['id'];
            }
            if (! empty($new_terms)) {
                WooTools\upsert_terms($new_terms, 'product_vehicle');
            }
        }
        unset($new_terms);
        $this->log(__FUNCTION__ . '(' . $cursor . ') ' . count($response) . ' vehicles in ' . number_format($timer->total(), 2) . 's');
        return ['meta' => $page['meta'], 'data' => $response];
    }

    // this assume a vehicle import has already been run
    // public function import_item_vehicles($page)
    // {
    //     /** @var Supplier_WPS $this */
    //     global $wpdb;
    //     $item_keys    = [];
    //     $all_vehicles = [];

    //     foreach ($page['data'] as &$item) {
    //         $item_key    = $this->key . '_' . $item['id'] . '_' . $item['sku'];
    //         $item_keys[] = $item_key;
    //         $item['key'] = $item_key;
    //         $vehicles    = [];

    //         if (isset($item['vehicles']['data']) && ! empty($item['vehicles']['data'])) {
    //             $vehicles         = array_map(fn($v) => $v['id'], $item['vehicles']['data']);
    //             $item['vehicles'] = $this->convert_vehicle_ids_to_term_ids($vehicles);
    //             $all_vehicles     = array_merge($all_vehicles, $vehicles);
    //         }
    //     }

    //     $page['meta']['total_vehicles'] = count(array_unique($all_vehicles));

    //     $placeholders   = implode(',', array_fill(0, count($item_keys), '%s'));
    //     $query          = $wpdb->prepare("SELECT post_id, meta_value AS 'sku' FROM {$wpdb->postmeta} WHERE meta_key='_ci_variation_id' AND meta_value IN ($placeholders)", ...$item_keys);
    //     $results        = $wpdb->get_results($query, ARRAY_A);
    //     $lookup_post_id = array_column($results, 'post_id', 'sku');

    //     unset($results, $query, $placeholders);

    //     foreach ($page['data'] as $item) {
    //         if (! empty($item['vehicles'])) {
    //             $variation_woo_id = $lookup_post_id[$item['key']] ?? 0;
    //             if ($variation_woo_id) {
    //                 $taxonomy = 'product_vehicle';
    //                 wp_set_post_terms($variation_woo_id, $item['vehicles'], $taxonomy, false);
    //                 $woo_id = wp_get_post_parent_id($variation_woo_id);

    //                 if ($woo_id) {
    //                     wp_set_post_terms($woo_id, $item['vehicles'], $taxonomy, true);
    //                 }
    //             }
    //         }
    //     }

    //     unset($lookup_post_id);
    //     $page['meta']['total'] = count($page['data']);
    //     $page['data']          = [];
    //     // $page['data'] = array_map(fn($v) => $v['id'], $page['data']);
    //     return $page;
    // }

    // public function OLD_import_product_vehicles($supplier_product_id, $use_cache = true)
    // {

    //     /** @var Supplier_WPS $this */
    //     // error_log(__FUNCTION__ . ' ' . $supplier_product_id);
    //     $timer  = new Timer();
    //     $sku    = $this->get_product_sku($supplier_product_id);
    //     $woo_id = wc_get_product_id_by_sku($sku);
    //     // error_log('sku=' . $sku . ' woo_id=' . $woo_id);
    //     if (! $woo_id) {
    //         return false;
    //     }

    //     $updated         = 0;
    //     $page_size       = 100;
    //     $taxonomy        = 'product_vehicle';
    //     $items           = $this->get_api("/products/{$supplier_product_id}/items", ['fields' => ['items' => 'id']], $use_cache);
    //     $master_term_ids = [];
    //     $all_vehicle_ids = [];

    //     if (isset($items['data']) && ! empty($items['data'])) {
    //         foreach ($items['data'] as $item) {
    //             $item_id                   = $item['id'];
    //             $all_vehicle_ids[$item_id] = [];
    //             $cursor                    = '';
    //             $variation_sku             = $this->get_variation_sku($supplier_product_id, $item_id);
    //             $variation_woo_id          = wc_get_product_id_by_sku($variation_sku);
    //             wp_set_post_terms($variation_woo_id, [], $taxonomy, false);

    //             while (is_string($cursor)) {
    //                 $vehicles = $this->get_api("/items/{$item_id}/vehicles", ['page' => ['cursor' => $cursor, 'size' => $page_size], 'fields' => ['vehicles' => 'id']], $use_cache);

    //                 if (isset($vehicles['data']) && ! empty($vehicles['data'])) {
    //                     $vehicle_ids               = array_map(fn($v) => $v['id'], $vehicles['data']);
    //                     $all_vehicle_ids[$item_id] = array_merge($all_vehicle_ids[$item_id], $vehicle_ids);
    //                     $term_ids                  = $this->convert_vehicle_ids_to_term_ids($vehicle_ids);

    //                     if (! empty($term_ids)) {
    //                         // error_log('--> variation_sku=' . $variation_sku . ' variation_woo_id=' . $variation_woo_id);

    //                         if ($variation_woo_id) {
    //                             // error_log('--> --> ' . implode(',', $vehicle_ids));
    //                             wp_set_post_terms($variation_woo_id, $term_ids, $taxonomy, true);
    //                         }
    //                         // $this->log(['variation' => $item_id, 'count' => count($term_ids), '$term_ids' => $term_ids]);
    //                         $master_term_ids = array_merge($master_term_ids, $term_ids);
    //                         // wp_set_post_terms($woo_id, $term_ids, $taxonomy, true);
    //                         $updated += count($term_ids);
    //                     }
    //                 }

    //                 $this->importer->ping();

    //                 $cursor = $vehicles['meta']['cursor']['next'] ?? false;
    //             }
    //         }
    //         $master_term_ids = array_values(array_unique($master_term_ids));
    //         // $this->log(['master' => $supplier_product_id, 'count' => count($master_term_ids), '$master_term_ids' => $master_term_ids]);
    //         wp_set_post_terms($woo_id, $master_term_ids, $taxonomy, true);
    //     }

    //     $report = [
    //         'time'        => $timer->lap(),
    //         'items'       => (is_array($items['data']) && ! empty($items['data'])) ? count($items['data']) : 0,
    //         'page_size'   => $page_size,
    //         'updated'     => $updated,
    //         'vehicle_ids' => $all_vehicle_ids,
    //     ];

    //     error_log(__FUNCTION__ . '(' . $supplier_product_id . ') ' . count($master_term_ids) . ' vehicles in ' . number_format($timer->total(), 2) . 's');

    //     unset($items, $vehicles, $term_ids, $vehicle_ids);
    //     return $report;
    // }

    public function import_product_vehicles_page($cursor, $use_cache = true)
    {
        /** @var Supplier_WPS $this */

        // count vehicles for each item to stay below our threshold
        // we need to make the call again to get the next cursor
        // $page_size = $this->limit_vehicle_load($cursor);
        // $params    = $this->get_vehicle_params($cursor, $page_size);
        // $page = $this->get_api('/products', $params);

        $timer = new Timer();
        $page  = $this->get_products_page($cursor, 'id', '', [1, 5, 10]);

        if (isset($page['data']) && ! empty($page['data'])) {
            foreach ($page['data'] as $product) {
                $this->import_product_vehicles($product['id'], $use_cache);
            }
            $this->log(__FUNCTION__ . '(' . $cursor . ') ' . count($page['data']) . ' products in ' . number_format($timer->total(), 2) . 's');
        }

        return $page;
    }

    public function get_vehicle_params($cursor = '', $page_size = 10)
    {
        return [
            'page'    => [
                'cursor' => $cursor,
                'size'   => $page_size,
            ],
            'include' => 'items',
            'fields'  => [
                'products' => 'id,items',
                'items'    => 'id',
            ],
        ];
    }

    public function get_total_vehicles_for_product($supplier_product_id, $use_cache = true)
    {
        $transient_name = $this->key . __FUNCTION__ . '_' . $supplier_product_id;
        $response       = $use_cache == false ? false : get_transient($transient_name);

        if (! $response) {

            $data = $this->get_product_item_vehicles($supplier_product_id, $use_cache);
            $this->crunch_vehicle_data($data);
            $response = $data['data']['total_vehicles'] ?? 0;

            // $response = 0;
            // $page     = $this->get_api("/products/{$supplier_product_id}", ['fields' => ['items' => 'id'], 'include' => 'items.vehicles:count'], $use_cache);

            // if (isset($page['data']['items']['data']) && ! empty($page['data']['items']['data'])) {
            //     foreach ($page['data']['items']['data'] as $item) {
            //         if (isset($item['vehicles_count'])) {
            //             $response += $item['vehicles_count'];
            //         }
            //     }
            // }

            set_transient($transient_name, $response, WEEK_IN_SECONDS);
        }
        return (int) $response;
    }

    public function get_total_vehicle_terms_for_product($supplier_product_id)
    {
        global $wpdb;

        $sku        = $this->get_product_sku($supplier_product_id);
        $product_id = wc_get_product_id_by_sku($sku);

        if ($product_id) {
            $query = $wpdb->prepare("
            SELECT COUNT(tr.term_taxonomy_id) AS term_count
            FROM {$wpdb->term_relationships} tr
            INNER JOIN {$wpdb->term_taxonomy} tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
            WHERE tt.taxonomy = 'product_vehicle'
            AND tr.object_id = %d
        ", $product_id);

            return $wpdb->get_var($query);
        }
        return 0;
    }

    public function limit_vehicle_load($cursor = '', $page_size = 10, $max_vehicles = 2000)
    {
        $page       = $this->get_api('/products', $this->get_vehicle_params($cursor, $page_size));
        $supertotal = 0;
        // $max_vehicles = 1820;
        // $max_count    = -1;

        foreach ($page['data'] as $i => &$product) {
            $total = 0;
            foreach ($product['items']['data'] as &$item) {
                $vehicles = $this->get_api("/items/{$item['id']}/vehicles", ['countOnly' => 'true']);
                $subtotal = $vehicles['data']['count'] ?? 0;
                // $item['total_vehicles'] = $subtotal;
                $total = $total + $subtotal;
            }
            // $product['total_vehicles'] = $total;
            $supertotal += $total;
            // $product['supertotal'] = $supertotal;

            if ($supertotal > $max_vehicles) { // && $max_count == -1) {
                $page_size = $i + 1;
                break;
                // $product['max'] = $max_count;
            }
        }

        // $page['meta']['max_count']  = $max_count;
        // $page['meta']['supertotal'] = $supertotal;
        // return ['meta' => $page['meta'], 'data' => $page['data']];

        // $page_size = $max_count + 1;
        return $page_size;
    }

    public function match_product_vehicle($supplier_product_id, $vehicle_id)
    {
        /** @var Supplier_WPS $this */

        $transient_key = __FUNCTION__ . $supplier_product_id . '_' . $vehicle_id;
                           // delete_transient($transient_key);
        $response = false; //get_transient($transient_key);

        if (false === $response) {

            $vehicle = $this->get_vehicle($vehicle_id);
            $sku     = $this->get_product_sku($supplier_product_id);
            $woo_id  = wc_get_product_id_by_sku($sku);
            $term    = "vehicle_{$vehicle_id}";

            if ($woo_id) {
                $has_term = has_term($term, 'product_vehicle', $woo_id);
            }
            $response = [
                'term'    => $term,
                'vehicle' => $vehicle,
                'master'  => [
                    'woo_id'   => $woo_id,
                    'has_term' => $has_term,
                ],
                'items'   => [],
            ];

            $sku                                = $this->get_product_sku($supplier_product_id);
            $woo_id                             = wc_get_product_id_by_sku($sku);
            $woo_product                        = wc_get_product($woo_id);
            $product_type                       = $woo_product->get_type();
            $response['master']['product_type'] = $product_type;

            if (! $woo_id) {
                return false;
            }

            // $page_size      = 100;
            $items          = $this->get_api("/products/{$supplier_product_id}/items", ['fields' => ['items' => 'id']]);
            $total_vehicles = 0;
            $items_report   = [];

            foreach ($items['data'] as $item) {
                $item_id          = $item['id'];
                $variation_sku    = $this->get_variation_sku($supplier_product_id, $item_id);
                $variation_woo_id = wc_get_product_id_by_sku($variation_sku);
                $vehicles         = $this->get_api("/items/{$item_id}/vehicles", ['countOnly' => 'true']);
                $item_vehicles    = $vehicles['data']['count'] ?? 0;
                $total_vehicles += $item_vehicles;
                $item_has_vehicle       = $this->get_api("/items/{$item_id}/vehicles", ['filter[id]' => $vehicle_id]);
                $item_match             = ($item_has_vehicle['data'][0]['id'] ?? 0) == $vehicle_id;
                $item_has_term          = $variation_woo_id ? has_term($term, 'product_vehicle', $variation_woo_id) : false;
                $items_report[$item_id] = [
                    'match'    => $item_match,
                    'vehicles' => $item_vehicles,
                    'woo_id'   => $variation_woo_id,
                    'has_term' => $item_has_term,
                ];
            }
            $response['master']['vehicles'] = $total_vehicles;
            $response['items']              = $items_report;

            // if (isset($items['data']) && ! empty($items['data'])) {
            //     foreach ($items['data'] as $item) {
            //         $item_id = $item['id'];
            //         $cursor  = '';

            //         while (is_string($cursor)) {
            //             $vehicles = $this->get_api("/items/{$item_id}/vehicles", ['page' => ['cursor' => $cursor, 'size' => $page_size], 'fields' => ['vehicles' => 'id']]);

            //             if (isset($vehicles['data']) && ! empty($vehicles['data'])) {
            //                 foreach ($vehicles['data'] as $vehicle) {
            //                     if ($vehicle['id'] == $vehicle_id) {
            //                         $variation_sku                = $this->get_variation_sku($supplier_product_id, $item_id);
            //                         $variation_woo_id             = wc_get_product_id_by_sku($variation_sku);
            //                         $response['match']            = true;
            //                         $response['item_id']          = $item_id;
            //                         $response['variation_sku']    = $variation_sku;
            //                         $response['variation_woo_id'] = $variation_woo_id;
            //                         set_transient($transient_key, $response, WEEK_IN_SECONDS);
            //                         return $response;
            //                     }
            //                 }
            //             }
            //             $cursor = $vehicles['meta']['cursor']['next'] ?? false;
            //         }
            //     }
            // }
            set_transient($transient_key, $response, WEEK_IN_SECONDS);
        }
        return $response;
    }

    public function get_vehicles_id_term_map($supplier_product_id)
    {
    }

    public function remove_product_vehicles($post_id)
    {
        // Get all terms associated with the post for product_vehicle taxonomy
        $terms = wp_get_object_terms($post_id, 'product_vehicle');

        if (! empty($terms) && ! is_wp_error($terms)) {
            // Remove all terms from the post
            $result = wp_remove_object_terms($post_id, wp_list_pluck($terms, 'term_id'), 'product_vehicle');

            if (is_wp_error($result)) {
                return false; // Error occurred
            }
            return true; // Success
        }
        return false; // No terms found or error
    }

    public function get_product_vehicles($supplier_product_id)
    {
        $master_sku    = $this->get_product_sku($supplier_product_id);
        $master_woo_id = wc_get_product_id_by_sku($master_sku);
        $terms         = get_the_terms($master_woo_id, 'product_vehicle');
        return wp_list_pluck($terms, 'term_id', 'slug');
    }
    /*

    attempt to efficiently attach vehicles to products

    */
    public function map_product_skus_to_woo_ids($skus = [])
    {
        if (empty($skus)) {
            return [];
        }
        global $wpdb;
        $meta_key     = '_sku';
        $meta_values  = $skus;
        $placeholders = implode(',', array_fill(0, count($meta_values), '%s'));

        $query = $wpdb->prepare(
            "SELECT post_id, meta_value FROM {$wpdb->postmeta}
             WHERE meta_key = %s
             AND meta_value IN ($placeholders)",
            array_merge([$meta_key], $meta_values)
        );

        return array_column($wpdb->get_results($query, ARRAY_A), 'post_id', 'meta_value');
    }

    // public function convert_vehicle_ids_to_term_ids($vehicles)
    // {
    //     global $wpdb;
    //     $taxonomy     = 'product_vehicle';
    //     $slugs        = array_map(fn($v) => "vehicle_{$v}", $vehicles);
    //     $placeholders = implode(',', array_fill(0, count($slugs), '%s'));
    //     $query        = $wpdb->prepare(
    //         "SELECT t.term_id FROM {$wpdb->terms} t
    //         INNER JOIN {$wpdb->term_taxonomy} tt ON t.term_id = tt.term_id
    //         WHERE tt.taxonomy = %s
    //         AND t.slug IN ($placeholders)",
    //         array_merge([$taxonomy], $slugs)
    //     );
    //     return $wpdb->get_col($query);
    // }
    //
    // map vehicle id to term id
    public function map_vehicle_ids_to_term_ids($vehicles = [])
    {
        if (empty($vehicles)) {
            return [];
        }
        global $wpdb;

        $taxonomy     = 'product_vehicle';
        $slugs        = array_map(fn($v) => "vehicle_{$v}", $vehicles);
        $placeholders = implode(',', array_fill(0, count($slugs), '%s'));
        $query        = $wpdb->prepare(
            "SELECT t.term_id, t.slug FROM {$wpdb->terms} t
            INNER JOIN {$wpdb->term_taxonomy} tt ON t.term_id = tt.term_id
            WHERE tt.taxonomy = %s
            AND t.slug IN ($placeholders)",
            array_merge([$taxonomy], $slugs)
        );
        return array_column($wpdb->get_results($query, ARRAY_A), 'term_id', 'slug');
    }

    // public function get_product_item_vehicles_v2($supplier_product_id, $use_cache = true)
    // {
    //     // $timer              = new Timer();
    //     $page_size   = 2000;
    //     $product     = $this->get_api("/products/{$supplier_product_id}", ['include' => 'items', 'fields' => ['items' => 'id']], $use_cache);
    //     $total_items = count($product['data']['items']['data']);

    //     if (isset($product['data']['items']['data']) && ! empty($product['data']['items']['data'])) {
    //         foreach ($product['data']['items']['data'] as $i => &$item) {
    //             $item['vehicles'] = ['data' => []];
    //             $item_id          = $item['id'];
    //             $cursor           = '';

    //             while (is_string($cursor)) {
    //                 error_log(json_encode(['cursor' => $cursor, 'i' => $i, 'total_items' => $total_items, 'item_id' => $item_id]));
    //                 $vehicles = $this->get_api("/items/{$item_id}/vehicles", ['page' => ['cursor' => $cursor, 'size' => $page_size], 'fields' => ['vehicles' => 'id']], $use_cache);

    //                 if (isset($vehicles['data']) && ! empty($vehicles['data'])) {
    //                     $item['vehicles']['data'] = array_merge($item['vehicles']['data'], $vehicles['data']);
    //                 }

    //                 $cursor = (! empty($vehicles['meta']['cursor']['next']) ? $vehicles['meta']['cursor']['next'] : false) ?? false;
    //             }
    //         }
    //     }

    //     // $this->crunch_vehicle_data($product);
    //     // error_log(__FUNCTION__ . '(' . $supplier_product_id . ') ' . $product['data']['total_vehicles'] . ' vehicles in ' . number_format($timer->total(), 2) . 's');

    //     return $product;
    // }

    public function crunch_vehicle_data(&$product)
    {
        $vehicle_ids = [];
        foreach ($product['data']['items']['data'] as &$item) {
            $item['vehicles']            = array_map(fn($v) => $v['id'], $item['vehicles']['data']);
            $item['total_item_vehicles'] = count($item['vehicles']);
            $vehicle_ids                 = array_merge($item['vehicles'], $vehicle_ids);
        }
        $vehicle_ids = array_values(array_unique($vehicle_ids));
        sort($vehicle_ids);
        $product['data']['vehicles']       = $vehicle_ids;
        $product['data']['total_vehicles'] = count($vehicle_ids);
    }

    // this is much quicker than v2 though memory may be an issue
    public function get_product_item_vehicles($supplier_product_id, $use_cache = true)
    {
        return $this->get_api("/products/{$supplier_product_id}", [
            'include' => 'items.vehicles',
            'fields'  => [
                'products' => 'id',
                'items'    => 'id',
                'vehicles' => 'id',
            ],
        ], $use_cache);
    }

    public function import_product_vehicles($supplier_product_id, $use_cache = true)
    {
        $res = $this->get_product_item_vehicles($supplier_product_id, $use_cache);

        if (! isset($res['data']['id'])) {
            $this->log('Error: ' . __FUNCTION__ . ' ' . $supplier_product_id . ' No data');
            return false;
        }

        $skus                       = [];
        $product_id                 = $res['data']['id'];
        $res['data']['sku']         = $this->get_product_sku($product_id);
        $res['data']['vehicle_ids'] = [];
        $skus[]                     = $res['data']['sku'];
        $vehicle_ids                = [];

        foreach ($res['data']['items']['data'] as &$item) {
            $item_id          = $item['id'];
            $item['sku']      = $this->get_variation_sku($product_id, $item_id);
            $skus[]           = $item['sku'];
            $item['vehicles'] = array_map(fn($v) => $v['id'], $item['vehicles']['data']);
            $vehicle_ids      = array_merge($item['vehicles'], $vehicle_ids);
        }

        $vehicle_ids    = array_values(array_unique($vehicle_ids));
        $lookup_vehicle = $this->map_vehicle_ids_to_term_ids($vehicle_ids);
        unset($vehicle_ids);

        $lookup_sku = $this->map_product_skus_to_woo_ids($skus);
        unset($skus);

        if (! isset($lookup_sku[$res['data']['sku']])) {
            return false;
        }

        $master_woo_id              = $lookup_sku[$res['data']['sku']] ?? 0;
        $bulk_terms                 = [];
        $bulk_terms[$master_woo_id] = [];

        foreach ($res['data']['items']['data'] as $item) {
            $variation_woo_id = $lookup_sku[$item['sku']] ?? 0;

            if ($variation_woo_id) {
                $bulk_terms[$variation_woo_id] = [];

                foreach ($item['vehicles'] as $vehicle_id) {
                    $term_id = isset($lookup_vehicle["vehicle_{$vehicle_id}"]) ? $lookup_vehicle["vehicle_{$vehicle_id}"] : 0;
                    if ($term_id) {
                        $bulk_terms[$variation_woo_id][]      = $term_id;
                        $bulk_terms[$master_woo_id][$term_id] = 1;
                    }
                }
            }
        }

        unset($res, $lookup_sku, $lookup_vehicle);

        $bulk_terms[$master_woo_id] = array_keys($bulk_terms[$master_woo_id]);

        $saved = bulk_set_post_terms($bulk_terms, 'product_vehicle');

        unset($bulk_terms);

        return $saved;
    }
}
