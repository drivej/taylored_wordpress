<?php
/*

https://turn14.com/api_settings.php

 */
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Supplier.php';
// include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/CronJob.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Timer.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/t14/Supplier_T14_Background_Process.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/t14/Supplier_T14_Prices.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/t14/Supplier_T14_Cronjob.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/t14/Supplier_T14_API.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/t14/Supplier_T14_Brands.php';

use Automattic\Jetpack\Constants;

class Supplier_T14 extends Supplier
{
    use Supplier_T14_Prices;
    use Supplier_T14_Cronjob;
    use Supplier_T14_API;
    use Supplier_T14_Brands;

    // public CronJob $cronjob;
    // public Import_T14_Products $background_process;
    public int $max_age = 0; // stale product age
    private bool $dry_run = false;
    public array $allow_brand_ids = [];

    public function __construct()
    {
        parent::__construct([
            'key' => 't14',
            'name' => 'Turn14',
            'supplierClass' => 'WooDropship\\Suppliers\\Turn14',
            'import_version' => '0.3',
        ]);
        $this->background_process = new Supplier_T14_Background_Process($this, $this->key);
        $this->active = false;
    }

    public function update_single_product($woo_product)
    {
        $needs_update = $this->product_needs_update($woo_product);
        // $has_images = WooTools::has_images($woo_product);

        if ($needs_update) {
            $supplier_product_id = $woo_product->get_meta('_ci_product_id', true);

            // update images
            $this->attach_images(['data' => ['id' => $supplier_product_id]]);
            $product_id = $woo_product->get_id();

            // update price
            $price = $this->get_price($supplier_product_id);
            $woo_product->set_regular_price($price);
            $woo_product->save();

            update_post_meta($product_id, '_last_updated', gmdate("c"));
            // clean_post_cache($product_id);
            // clear cache
            wc_delete_product_transients($woo_product->get_id());
            return ['supplier_product_id' => $supplier_product_id, 'price' => $price]; //true;
        }
        return false;
    }

    public function update_loop_product($woo_product)
    {
        $update_plp = $woo_product->get_meta('_ci_update_plp', true);
        $should_update = !(bool) $update_plp;

        if ($update_plp) {
            $age = $update_plp ? WooTools::get_age($update_plp, 'hours') : 99999;
            $max_age = 24 * 7;
            $should_update = $age > $max_age;
        }
        $sku = $woo_product->get_sku();
        error_log('sku=' . $sku . '-------------------->>>>>');

        if ($should_update) {
            $product_id = $woo_product->get_meta('_ci_product_id', true);
            $item_data = $this->get_api("/items/data/{$product_id}");
            $image = 0;
            $backup_image = 0;

            if (is_array($item_data['data'])) {
                $item_data['data'] = $item_data['data'][0];
            }

            if (!isset($item_data['data']['files'])) {
                return;
            }

            if (!WooTools::is_valid_array($item_data['data']['files'])) {
                return;
            }
            /*
            "files": [
            {
            "id": "31210971",
            "type": "Image",
            "file_extension": "TIF",
            "media_content": "User 3",
            "generic": true,
            "links": [
            {
            "url": "https://d32vzsop7y1h3k.cloudfront.net/7eb28d0f8b0f612af278bf76df4cd8ef.png",
            "height": "800.00",
            "width": "641.00",
            "size": "L"
            }
            ]
            }
            ],
             */
            // get better thumbnail
            foreach ($item_data['data']['files'] as $file) {
                // We should be using $file['type'] === 'Image', but the "type" is sometimes set to "Other" when it clearly says "Photo - Primary" - WTF?!?!
                if ($file['media_content'] === 'Photo - Primary') {
                    $image = $file['links'][0]['url'];
                    break;
                }
                if ($file['type'] === 'Image' && $file['generic']) {
                    $backup_image = $image = $file['links'][0]['url'];
                }
            }

            if (!$image && $backup_image) {
                $image = $backup_image;
            }

            if ($image) {
                $lookup_image = WooTools::attachment_urls_to_postids([$image]);
                if (isset($lookup_image[$image])) {
                    // $sku = $woo_product->get_sku();
                    $woo_id = $woo_product->get_id();
                    // $woo_product->set_image_id($lookup_image[$image]);
                    update_post_meta($woo_id, '_thumbnail_id', $lookup_image[$image]);
                    update_post_meta($woo_id, '_ci_update_plp', gmdate("c"));
                    // error_log('update PLP '. $sku);
                    // These do not clear the cache such that the loaded page shows the updated data
                    // wc_delete_product_transients($woo_id);
                    // wp_cache_flush();
                }
            }
        }
        return;
        // $age = $update_plp ? WooTools::get_age($update_plp, 'hours') : 9999999;
        // $max_age = 24 * 7;

        // if ($age > $max_age) { // max age is a week
        //     return true;
        // }
        // $id = $product->get_id();

        $needs_update = $this->product_needs_update($woo_product);

        if ($needs_update) {
            $supplier_product_id = $woo_product->get_meta('_ci_product_id', true);
            $supplier_product = $this->get_product_light($supplier_product_id);
            // TODO: test this
            $is_available = $this->is_available($supplier_product);

            if (!$is_available) {
                $woo_product->delete();
                return true;
            } else {
                $this->attach_images(['data' => ['id' => $supplier_product_id]]);
                $product_id = $woo_product->get_id();
                update_post_meta($product_id, '_last_updated', gmdate("c"));
                // clean_post_cache($product_id);
            }
        }
        return false;
    }

    public function get_items_page($page)
    {
        $items = $this->get_api('/items', ['page' => $page]);
        $skus = [];
        $products = [];
        foreach ($items['data'] as $i => $product) {
            $sku = $this->get_product_sku($product['id']);
            $products[] = ['data' => $product];
            $skus[] = $sku;
        }
        $lookup_woo_id = WooTools::lookup_woo_ids_by_skus($skus);
        $woo_ids = array_values($lookup_woo_id);
        $lookup_updated = WooTools::get_import_timestamps_by_ids($woo_ids);
        $lookup_version = WooTools::get_import_version_by_ids($woo_ids);
        $lookup_t14_item_updated = WooTools::get_meta_lookup_by_ids($woo_ids, '_ci_t14_item_updated');

        foreach ($products as $i => $supplier_product) {
            $products[$i]['meta'] = $this->build_product_meta($supplier_product, $lookup_woo_id, $lookup_updated, $lookup_version);
            $woo_id = $products[$i]['meta']['woo_id'];
            $products[$i]['meta']['item_updated'] = isset($lookup_t14_item_updated[$woo_id]) ? $lookup_t14_item_updated[$woo_id] : false;
        }
        return ['data' => $products, 'meta' => $items['meta']];
    }

    public function repair_products_page($page_index = 1)
    {
        $items = $this->get_api('/items', ['page' => $page_index]);
        $items = $this->filter_items($items);
        $skus = [];
        $names = [];

        foreach ($items['data'] as &$item) {
            $item = ['data' => $item, 'meta' => []];
            $product_id = $item['data']['id'];
            $post_title = $this->get_name($item);
            $product_slug = sanitize_title(implode('-', [$post_title, $product_id, $this->key, 'product']));
            $product_slug_partial = '-' . sanitize_title(implode('-', [$product_id, $this->key, 'product']));
            $sku = $this->get_product_sku($product_id);
            $item['meta']['slug'] = $product_slug_partial;
            $item['meta']['title'] = $post_title;
            $skus[] = $sku;
            $names[] = $product_slug_partial;
        }
        $lookup_woo_id = WooTools::lookup_woo_ids_by_skus($skus);
        // $woo_ids = array_values($lookup_woo_id);
        // $lookup_woo_name = WooTools::lookup_woo_ids_by_name($names);

        foreach ($items['data'] as $item) {
            $sku = $item['meta']['sku'];
            $woo_id = isset($lookup_woo_id[$sku]) ? $lookup_woo_id[$sku] : false;
            if(!$woo_id){
                error_log('no sku for '.$item['data']['id']);
            }
        }

        return $items;

        // return [
        //     // 'lookup_woo_name' => $lookup_woo_name,
        //     // 'lookup_woo_id' => $lookup_woo_id,
        //     'items' => $items
        // ];
    }
    /*

    1) load basic product from "items"
    - name, short desc, cat, subcat, dimensions, part number (long desc)
    - brand (need to load all data up front into cache)

    This is used by the background_process "products"
     */
    public function import_products_page($page_index = 1)
    {
        $this->log("START import_products_page({$page_index})");
        $items = $this->get_api('/items', ['page' => $page_index]);
        // if no products, abort

        if (!isset($items['data']) || !is_array($items['data']) || !count($items['data']) || isset($items['error'])) {
            return $items;
        }
        // $items['data'] = array_slice($items['data'], 0, 1);
        //
        //
        // CATEGORIES
        //
        //
        // if ($page_type === 'categories') {
        $timer = new Timer();
        // build object for save
        // this assumes that the price list has been updated

        $items = $this->filter_items($items);
        $items = $this->process_items_page($items);

        // $woo_id = $woo_product->get_id();
        // $item = $this->get_api("/items/{$product_id}");
        // $product_name = $item['data']['attributes']['part_description'];
        // error_log('$product_name = '. $product_name);
        // // $woo_product->set_post_title($product_name);
        // wp_update_post(['ID' => $woo_id, 'post_title' => $product_name]);
        // get better description
        // descriptions[] type:"Product Description - Short" -> description

        $items = $this->process_items_thumbnails($items);
        $items = $this->process_items_brands($items);
        $items = $this->process_items_prices($items);
        $items = $this->process_items_unavailable($items);
        $items = $this->process_items_categories($items);

        if (!$this->dry_run && isset($items['meta']['metadata']) && WooTools::is_valid_array($items['meta']['metadata'])) {
            WooTools::insert_unique_metas($items['meta']['metadata']);
            $items['meta']['metadata'] = count($items['meta']['metadata']);
            $items['meta']['posts'] = count($items['meta']['posts']);
        }

        $total_products = count($items['data']);
        $this->log("process {$total_products} products in {$timer->lap()}");
        $items['meta']['laptime'] = $timer->lap();
        return $items;

        // return ['$meta_result' => $meta_result, 'items' => $items];

        // return $this->insert_unique_posts($items['meta']['posts']);
        // return $items;

        $items = $this->process_items_prices($items);
        $this->log("process_items_prices {$timer->lap()}");
        $items = $this->process_items_brands($items);
        $this->log("process_items_brands {$timer->lap()}");
        $items = $this->process_items_prices($items);
        $this->log("process_items_prices {$timer->lap()}");
        $items = $this->process_items_categories($items);
        $this->log("process_items_categories {$timer->lap()}");
        $items = $this->process_items_tags($items);
        $this->log("process_items_tags {$timer->lap()}");
        $items = $this->process_items_thumbnails($items);
        // $this->log("process_items_thumbnails {$timer->lap()}");

        $items['meta']['page_index'] = $page_index;
        $items['meta']['update_thumbnail'] = 0;

        foreach ($items['data'] as $i => $supplier_product) {
            if ($supplier_product['meta']['should_update']) {
                // $this->log('save_product_terms()');
                $this->save_product_terms($supplier_product);
                $items['meta']['updates']++;
            }
            if ($supplier_product['meta']['add_thumbnail']) {
                // $this->log('update_post_meta()');
                update_post_meta($supplier_product['meta']['woo_id'], '_thumbnail_id', $supplier_product['meta']['_thumbnail_id']);
                $items['meta']['updates']++;
                $items['meta']['update_thumbnail']++;
            }
        }

        $this->log("COMPLETE import_products_page({$page_index})");
        $result = [];
        foreach ($items['data'] as $item) {
            $result[] = [
                'woo_id' => $item['meta']['woo_id'],
                'sku' => $item['meta']['sku'],
                'name' => $item['data']['attributes']['product_name'],
            ];
        }
        return ['meta' => $items['meta'], 'data' => $result];

        // $this->save_items_terms($items);
        //
        //
        // DEFAULT
        //
        //
        if (isset($test)) {
            $this->log("import_products_page({$page_index})");
            $start_time = microtime(true);
            $items = $this->get_items_page($page_index);
            $products = $items['data'];
            $total = count($products);
            $stats = ['insert' => 0, 'update' => 0, 'delete' => 0, 'ignore' => 0];

            foreach ($products as $i => $supplier_product) {
                if ($this->background_process->should_stop) {
                    break;
                }
                // $supplier_product_id = $supplier_product['data']['id'];
                $action = isset($supplier_product['meta']['action']) ? $supplier_product['meta']['action'] : '';
                // $woo_id = $supplier_product['meta']['woo_id'];
                // $woo_product = null;
                // $sku = $supplier_product['meta']['sku'];

                // if (!isset($stats[$action])) {
                //     $stats[$action] = 0;
                // }

                if ($action === 'insert') {
                    $stats['insert']++;
                    $woo_product = $this->create_base_product($supplier_product);
                    $woo_id = $woo_product->save();
                    $supplier_product['meta']['woo_id'] = $woo_id;
                    $this->update_product_terms($supplier_product);
                    $this->log("product {$woo_id} insert");
                }

                if ($action === 'update') {
                    $woo_id = $supplier_product['meta']['woo_id'];
                    $deprecated = $supplier_product['meta']['deprecated'];
                    $expired = $supplier_product['meta']['expired'];
                    $should_update = $deprecated || $expired;

                    if (!$should_update) {
                        $item_updated = $supplier_product['meta']['item_updated'];
                        $age = $item_updated ? WooTools::get_age($item_updated, 'hours') : 99999;
                        if ($age > 24 * 7) {
                            // update if mode date expired
                            $should_update = true;
                        }
                    }

                    if ($should_update) {
                        $stats['update']++;
                        $this->update_product_terms($supplier_product);
                        $woo_product = wc_get_product_object($supplier_product['meta']['product_type'], $woo_id);
                        $this->update_base_product($supplier_product, $woo_product);
                        $woo_id = $woo_product->save();
                        $this->log("product {$woo_id} update");
                    } else {
                        $stats['ignore']++;
                        $this->log("product {$woo_id} ignore");
                    }

                    // // is this product out of date
                    // $woo_id = $supplier_product['meta']['woo_id'];
                    // $woo_product = wc_get_product_object($supplier_product['meta']['product_type'], $woo_id);

                    // $last_updated = $woo_product->get_meta('_last_updated', true);
                    // $age = $last_updated ? WooTools::get_age($last_updated, 'hours') : 99999;

                    // if ($age > 24 * 7) {
                    //     $this->update_base_product($supplier_product, $woo_product);
                    //     $woo_id = $woo_product->save();
                    //     $this->log("product {$woo_id} update");
                    // } else {
                    //     $this->log("product {$woo_id} ignore");
                    // }
                }

                if ($action === 'delete') {
                    $stats['delete']++;
                    $this->log("product {$woo_id} delete");
                }

                // $this->cronjob->log("{$i}/{$total} mode:{$mode} action:{$action} sku:{$sku} supplier_product_id:{$supplier_product_id} => woo_id:{$woo_id}");
            }
            $stats_str = json_encode($stats);
            $end_time = microtime(true);
            $exetime = round($end_time - $start_time);
            $this->log("total:{$total} {$stats_str} exe:{$exetime}s");
            $items['meta']['total'] = $total;
            $items['meta']['stats'] = $stats;
            return ['meta' => $items['meta']];
        }
    }

    private function filter_items($items)
    {
        if (!WooTools::is_valid_array($items['data'])) {
            return $items;
        }
        // remove unsupported brands
        $allowed_brands = $this->get_allowed_brand_ids();
        $items['data'] = array_filter($items['data'], fn($item) => in_array((string) $item['attributes']['brand_id'], $allowed_brands));
        $items['meta']['allowed_brands'] = $allowed_brands;
        return $items;
    }

    public function process_items_page($items)
    {
        if (!WooTools::is_valid_array($items['data'])) {
            return $items;
        }
        // TODO: remvoe TESTING!!
        // $items['data'] = array_slice($items['data'], 0, 2);

        // $this->log('process_items_page()');

        // mutate into predictable shape: data => [[data,meta], [data, meta]...], meta]
        // so it can be populated by the other filters
        // populate: woo_id
        $skus = [];
        $meta = &$items['meta'];
        $meta['import_version'] = $this->import_version;
        $meta['created'] = 0;
        $meta['updates'] = 0;
        $meta['inserts'] = 0;
        $meta['metadata'] = [];
        $meta['posts'] = [];
        // $meta['attachments'] = [];
        $meta['terms'] = [];
        // $allowed_brands = $this->get_allowed_brand_ids();

        // array_filter(fn($item) => $item[''])

        foreach ($items['data'] as $i => &$product) {
            $sku = $this->get_product_sku($product['id']);
            $post_title = $this->get_name(['data' => $product]);
            // we have to guarantee that this slug is unique or this breaks
            $product_slug = sanitize_title(implode('-', [$post_title, $product['id'], $this->key, 'product']));

            $product = [
                'meta' => [
                    'woo_id' => 0,
                    'sku' => $sku,
                    'slug' => $product_slug,
                    'title' => $post_title,
                    'product_type' => $this->get_product_type($product),
                    'is_available' => $this->is_available(['data' => $product]),
                    'product_tag' => [],
                    'product_tag_ids' => [],
                    'product_cat' => [],
                    'product_cat_ids' => [],
                    // 'updates' => 0,
                    // 'inserts' => 0,
                ],
                'data' => $product,
            ];

            $skus[] = $sku;
        }

        // get existing woo products
        $lookup_woo_id = WooTools::lookup_woo_ids_by_skus($skus);
        $woo_ids = array_values($lookup_woo_id);
        // get meta tags for products to check status
        $meta_tags_lookup = WooTools::get_metas($woo_ids, ['_ci_t14_item_updated', '_ci_import_version', '_thumbnail_id']);

        foreach ($items['data'] as $i => &$product) {
            $sku = $product['meta']['sku'];
            $woo_id = isset($lookup_woo_id[$sku]) ? $lookup_woo_id[$sku] : false;
            $metatags = isset($meta_tags_lookup[$woo_id]) ? $meta_tags_lookup[$woo_id] : [];
            $stock_status = $product['meta']['is_available'] ? 'instock' : 'outofstock';

            $product['meta']['stock_status'] = $stock_status;
            $product['meta']['woo_id'] = 0;
            // if (!$woo_id) {
            // create product
            // $woo_product = $this->create_base_product($product);
            // $woo_id = $woo_product->save();
            // $meta['created']++;
            // }
            if ($woo_id) {
                // determine if product needs updating
                $_ci_import_version = isset($metatags['_ci_import_version']) ? $metatags['_ci_import_version'] : false;
                $_ci_t14_item_updated = isset($metatags['_ci_t14_item_updated']) ? $metatags['_ci_t14_item_updated'] : false;
                $age = $_ci_t14_item_updated ? WooTools::get_age($metatags['_ci_t14_item_updated'], 'hours') : 999999;
                $stale = $age > 24 * 7; // expire after a week
                $deprecated = $this->import_version !== $_ci_import_version;

                // $product['meta']['woo_id'] = $woo_id;
                $product['meta']['metatags'] = $metatags;
                $product['meta']['age'] = $age;
                $product['meta']['stale'] = $stale;
                $product['meta']['deprecated'] = $deprecated;
                $product['meta']['should_update'] = $deprecated || $stale;

                // TODO: temporary to fix title
                wp_update_post(['ID' => $woo_id, 'post_title' => $this->get_name($product)]);
                // update product
                // $meta['metadata'][] = [
                //     'post_id' => $woo_id,
                //     'meta_key' => '_stock_status',
                //     'meta_value' => $stock_status,
                // ];
                // $meta['posts'][] = [
                //     'sku' => $sku,
                //     'i' => $i,
                //     'p' => $product,
                // ];
            } else {
                // insert product
                // $product_id = $product['data']['id'];
                // $post_title = $product['meta']['title']; //$this->get_name($product);
                $product_slug = $product['meta']['slug']; //sanitize_title(implode('-', [$post_title, $product_id, $this->key, 'product']));
                // $product['meta']['slug'] = $product_slug;
                $guid = home_url() . "/product/$product_slug";

                $meta['posts'][] = [
                    'post_title' => $this->get_name($product), // $product['meta']['title'], // product name
                    'post_excerpt' => $this->get_short_description($product), // short description
                    'post_name' => $product_slug, // product slug
                    'post_content' => $this->get_description($product), // long description
                    'guid' => $guid,
                    'post_type' => 'product',
                ];
            }
        }
        // $posts = array_slice($items['meta']['posts'], 0, 2);

        if ($this->dry_run) {
            // TEST
            $lookup_slug = [];
            foreach ($items['data'] as $i => $item) {
                $lookup_slug[$item['meta']['slug']] = $i + 100;
            }
        } else {
            $posts = $items['meta']['posts'];
            $lookup_slug = WooTools::insert_unique_posts($posts);
        }
        // get woo ID by post_name

        // return $items;

        foreach ($items['data'] as &$product) {
            $slug = $product['meta']['slug'];
            $sku = $product['meta']['sku'];
            $stock_status = $product['meta']['stock_status'];
            $product_id = $product['data']['id'];
            // $woo_id = isset($lookup_woo_id[$sku]) ? $lookup_woo_id[$sku] : false;

            if (isset($lookup_slug[$slug])) {
                $woo_id = $lookup_slug[$slug];
                $product['meta']['woo_id'] = $woo_id;
                $meta['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_sku', 'meta_value' => $sku];
                $meta['metadata'][] = ['post_id' => $woo_id, 'meta_key' => 'total_sales', 'meta_value' => 0];
                $meta['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_tax_status', 'meta_value' => 'taxable'];
                $meta['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_manage_stock', 'meta_value' => 'no'];
                $meta['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_backorders', 'meta_value' => 'no'];
                $meta['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_sold_individually', 'meta_value' => 'no'];
                $meta['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_virtual', 'meta_value' => 'no'];
                $meta['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_downloadable', 'meta_value' => 'no'];
                $meta['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_download_limit', 'meta_value' => '-1'];
                $meta['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_download_expiry', 'meta_value' => '-1'];
                $meta['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_stock', 'meta_value' => null];
                $meta['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_stock_status', 'meta_value' => $stock_status];
                $meta['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_wc_average_rating', 'meta_value' => 0];
                $meta['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_wc_review_count', 'meta_value' => 0];
                $meta['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_product_version', 'meta_value' => Constants::get_constant('WC_VERSION')];
                $meta['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_supplier_class', 'meta_value' => $this->supplierClass];
                $meta['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_ci_supplier_key', 'meta_value' => $this->key];
                $meta['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_ci_product_id', 'meta_value' => $product_id];
                $meta['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_ci_import_version', 'meta_value' => $this->import_version];
                $meta['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_ci_import_timestamp', 'meta_value' => gmdate("c")];
                $meta['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_ci_import_details', 'meta_value' => gmdate("c")];
                $meta['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_ci_import_price', 'meta_value' => gmdate("c")];
                $meta['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_ci_update_plp', 'meta_value' => 0]; // TODO: update list view
                $meta['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_ci_update_pdp', 'meta_value' => 0];
                $meta['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_ci_t14_item_updated', 'meta_value' => gmdate("c")];
                // $meta['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_thumbnail_id', 'meta_value' => ''];
                $meta['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_product_image_gallery', 'meta_value' => ''];
                $meta['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_last_updated', 'meta_value' => gmdate("c")];
            }
        }

        // $meta_result = $this->insert_unique_metas($meta['metadata']);
        // return ['lookup' => $lookup, 'posts' => $posts];

        // foreach ($items['data'] as &$product) {
        //     $sku = $product['meta']['sku'];
        //     $woo_id = isset($lookup_woo_id[$sku]) ? $lookup_woo_id[$sku] : false;
        // }
        // wp_cache_flush();

        // return ['meta_result' => $meta_result, 'lookup' => $lookup, 'metadata' => $meta['metadata']];

        return $items;
    }

    public function process_items_unavailable($items)
    {
        if (!WooTools::is_valid_array($items['data'])) {
            return $items;
        }
        $post_ids = [];
        foreach ($items['data'] as &$item) {
            $woo_id = isset($item['meta']['woo_id']) ? $item['meta']['woo_id'] : false;
            $item['meta']['post_status'] = 'publish';
            if ($woo_id) {
                $is_available = isset($item['meta']['is_available']) ? $item['meta']['is_available'] : true;
                if (!$is_available) {
                    $post_ids[] = $woo_id;
                    $item['meta']['post_status'] = 'draft';
                }
            }
        }
        $items['meta']['unpublish'] = count($post_ids);
        if (!$this->dry_run) {
            WooTools::unpublish($post_ids);
        }
        return $items;
    }

    public function process_items_categories($items)
    {
        if (!WooTools::is_valid_array($items['data'])) {
            return $items;
        }
        // $this->log('process_items_categories()');
        /*
        find product_cat related to each product
        get the id of existing or create a new category
         */
        $cats_lookup = [];
        $subcats_lookup = [];
        $items['meta']['new_categories'] = 0;
        // brands container
        $cats_lookup['brands'] = ['name' => 'Brands', 'slug' => 'brands'];

        foreach ($items['data'] as $i => $product) {
            // category
            if (isset($product['data']['attributes']['category'])) {
                $cat_name = $product['data']['attributes']['category'];
                $cat_slug = sanitize_title($cat_name);
                if (!array_key_exists($cat_slug, $cats_lookup)) {
                    $cats_lookup[$cat_slug] = ['name' => $cat_name, 'slug' => $cat_slug];
                }
            }
            // subcategory
            if (isset($product['data']['attributes']['subcategory'])) {
                $subcat_name = $product['data']['attributes']['subcategory'];
                $subcat_slug = sanitize_title($subcat_name);
                if (!array_key_exists($subcat_slug, $subcats_lookup)) {
                    $subcats_lookup[$subcat_slug] = ['name' => $subcat_name, 'slug' => $subcat_slug, 'parent_slug' => $cat_slug];
                }
            }
            // brand
            if (isset($product['data']['brand']['attributes']['name'])) {
                $brand = $product['data']['brand'];
                $brand_name = $brand['attributes']['name'];
                $brand_slug = sanitize_title($brand_name);
                if (!array_key_exists($brand_slug, $cats_lookup)) {
                    $cats_lookup[$brand_slug] = ['name' => $brand_name, 'slug' => $brand_slug];
                }
            }
        }

        $taxonomy = 'product_cat';
        $slugs = array_merge(array_keys($cats_lookup), array_keys($subcats_lookup));
        $found = get_terms(['slug' => $slugs, 'taxonomy' => $taxonomy, 'hide_empty' => false]);
        $lookup_term = array_column($found, null, 'slug');

        foreach ($cats_lookup as $slug => $term) {
            if (isset($lookup_term[$slug]) && $lookup_term[$slug]->term_id) {
                $cats_lookup[$slug]['id'] = $lookup_term[$slug]->term_id;
            } else {
                $items['meta']['new_categories']++;
                $woo_tag = wp_insert_term($term['name'], $taxonomy, ['slug' => $slug]);
                if ($woo_tag) {
                    $cats_lookup[$slug]['id'] = $woo_tag->term_id;
                } else {
                    $this->log('cat woo_tag error');
                }
            }
        }

        foreach ($subcats_lookup as $slug => $term) {
            $parent_slug = $term['parent_slug'];
            $parent_id = $cats_lookup[$parent_slug]['id'];
            $subcats_lookup[$slug]['parent_id'] = $parent_id;

            if (isset($lookup_term[$slug]) && $lookup_term[$slug]->term_id) {
                $subcats_lookup[$slug]['exists'] = true;
                $subcats_lookup[$slug]['id'] = $lookup_term[$slug]->term_id;
            } else {
                $subcats_lookup[$slug]['exists'] = false;
                $items['meta']['new_categories']++;
                $woo_tag = wp_insert_term($term['name'], $taxonomy, ['slug' => $slug, 'parent' => $parent_id]);
                if ($woo_tag) {
                    $subcats_lookup[$slug]['id'] = $woo_tag->term_id;
                } else {
                    $this->log('subcat woo_tag error');
                }
            }
        }

        foreach ($items['data'] as &$item) {
            $category = $product['data']['attributes']['category'];
            $cat_slug = sanitize_title($category);
            $cat = $cats_lookup[$cat_slug];
            $item['meta']['product_cat'][] = $cat;
            $item['meta']['product_cat_ids'][] = $cat['id'];

            $subcategory = $product['data']['attributes']['subcategory'];
            $subcat_slug = sanitize_title($subcategory);
            $subcat = $subcats_lookup[$subcat_slug];
            $item['meta']['product_cat'][] = $subcat;
            $item['meta']['product_cat_ids'][] = $subcat['id'];
        }

        // save data
        if (!$this->dry_run) {
            foreach ($items['data'] as $supplier_product) {
                $woo_id = $supplier_product['meta']['woo_id'];
                // save categories
                $cat_ids = $supplier_product['meta']['product_cat_ids'];
                if (is_array($cat_ids) && count($cat_ids) && $woo_id) {
                    wp_set_object_terms($woo_id, $cat_ids, 'product_cat', false);
                }
                // save tags
                $tag_ids = $supplier_product['meta']['product_tag_ids'];
                if (is_array($tag_ids) && count($tag_ids) && $woo_id) {
                    wp_set_object_terms($woo_id, $tag_ids, 'product_tag', true);
                }
            }
        }

        return $items;
    }

    public function prepare_brands()
    {
        // load brands from API and create categories for each under the brands parent category
        // find/create parent brands category
        $brands_cat = wp_insert_term('Brands', 'product_cat', ['slug' => 'brands']);

        if (is_wp_error($brands_cat)) {
            // If the term already exists, use the existing term's ID
            $parent_id = $brands_cat->get_error_data('term_exists');
        } else {
            // If the term was successfully created, use the new term ID
            $parent_id = $brands_cat['term_id'];
        }

        $brands = $this->get_api("/brands");
        $taxonomy = 'product_cat';
        $terms = [];

        foreach ($brands['data'] as $i => $brand) {
            $name = $brand['attributes']['name'];
            $terms[] = ['id' => 0, 'name' => $name, 'parent' => $parent_id, 'brand_id' => $brand['id']];
        }

        $terms = $this->resolve_terms($terms, $taxonomy, $parent_id);
        return $terms;
    }

    public function process_items_brands($items)
    {
        if (!WooTools::is_valid_array($items['data'])) {
            return $items;
        }
        // $this->log('process_items_brands()');
        $taxonomy = 'product_cat';
        $brand_tags = $this->prepare_brands();
        $lookup_brand_id = array_column($brand_tags, null, 'brand_id');

        foreach ($items['data'] as &$item) {
            $brand_id = $item['data']['attributes']['brand_id'];
            // $brand = $lookup_brand_data[$brand_id];
            $term = $lookup_brand_id[$brand_id];
            // $items['data'][$i]['data']['brand'] = $brand;
            $item['meta'][$taxonomy . '_ids'][] = $term['id'];
            $item['meta'][$taxonomy][] = $term;
        }

        $brands = $this->get_api("/brands"); // TODO: loop and get all brand pages - currently they have 450 brands - each page is 1000.
        $lookup_brand_data = array_column($brands['data'], null, 'id');
        $taxonomy = 'product_tag';
        $brand_lookup = [];
        $terms = [];

        foreach ($brands['data'] as &$brand) {
            $name = $brand['attributes']['name'];
            $slug = sanitize_title($name);
            $terms[] = ['id' => 0, 'name' => $name, 'slug' => $slug, 'brand_id' => $brand['id']];
            $brand['slug'] = $slug;
            $brand_lookup[$slug] = $brand;
        }

        $slugs = array_column($terms, 'slug');
        $found = get_terms(['slug' => $slugs, 'taxonomy' => $taxonomy, 'hide_empty' => false]);

        // TODO: prod remove this - this will never happen
        if (is_wp_error($found)) {
            $this->log('major error getting brands data - wtf wp?');
            return $items;
        }

        $lookup_term = [];
        foreach ($found as $term) {
            $lookup_term[$term->slug] = $term;
        }

        foreach ($terms as &$term) {
            $slug = $term['slug'];
            if (isset($lookup_term[$slug]) && $lookup_term[$slug]->term_id) {
                $term['id'] = $lookup_term[$slug]->term_id;
            } else {
                $woo_tag = wp_insert_term($term['name'], $taxonomy, ['slug' => $slug]);

                if (is_wp_error($woo_tag)) {
                    $this->log('error error error');
                } else if (is_object($woo_tag)) {
                    $this->log('is_object');
                    $term['id'] = $woo_tag->term_id;
                } else if (is_array($woo_tag)) {
                    $this->log('is_array');
                    $term['id'] = $woo_tag['term_id'];
                }
            }
        }

        $lookup_brand_term = array_column($terms, null, 'brand_id');

        foreach ($items['data'] as &$item) {
            $brand_id = $item['data']['attributes']['brand_id'];
            $brand = $lookup_brand_data[$brand_id];
            $term = $lookup_brand_term[$brand_id];
            $item['data']['brand'] = $brand;
            $item['meta']['product_tag_ids'][] = $term['id'];
            $item['meta']['product_tag'][] = $term;
        }
        return $items;
    }

    public function process_items_prices($items)
    {
        if (!WooTools::is_valid_array($items['data'])) {
            return $items;
        }
        $item_ids = array_map(fn($item) => $item['data']['id'], $items['data']);
        $prices = $this->get_prices_table($item_ids);

        foreach ($items['data'] as &$item) {
            $supplier_product_id = $item['data']['id'];
            $woo_id = isset($item['meta']['woo_id']) ? $item['meta']['woo_id'] : false;
            $price = array_key_exists($supplier_product_id, $prices) ? $prices[$supplier_product_id] : 0;
            $item['meta']['price'] = $price;

            if ($woo_id && $price) {
                if ($price === 0) {
                    $item['meta']['is_available'] = false;
                }
                // _price inferred normally after setting regular price and sale price in the admin - here we habe to manually set
                $items['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_price', 'meta_value' => $price];
                // required
                $items['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_regular_price', 'meta_value' => $price];
            }
        }
        return $items;
    }

    public function process_items_tags($items)
    {
        if (!WooTools::is_valid_array($items['data'])) {
            return $items;
        }
        // $this->log('process_items_tags()');
        // $tags = [];
        foreach ($items['data'] as $i => $product) {
            // capture tags
            if (isset($product['data']['brand']['attributes']['name'])) {
                $name = $product['data']['brand']['attributes']['name'];
                $slug = sanitize_title($name);
                // $tags[] = ['slug' => $slug, 'name' => $name];
                $items['data'][$i]['meta']['product_tag'][] = ['slug' => $slug, 'name' => $name];
            }
        }
        return $items;
    }

    public function process_items_thumbnails($items)
    {
        if (!WooTools::is_valid_array($items['data'])) {
            return $items;
        }
        $thumbnails = [];
        foreach ($items['data'] as &$item) {
            $thumbnail = isset($item['data']['attributes']['thumbnail']) ? $item['data']['attributes']['thumbnail'] : 0;
            $item['meta']['thumbnail'] = $thumbnail;
            if ($thumbnail) {
                $thumbnails[] = $thumbnail;
            }
        }

        $lookup_thumbnail = WooTools::attachment_urls_to_postids($thumbnails);

        foreach ($items['data'] as &$item) {
            $thumbnail = $item['meta']['thumbnail'];
            $thumbnail_id = isset($lookup_thumbnail[$thumbnail]) ? $lookup_thumbnail[$thumbnail] : 0;
            if ($thumbnail && $thumbnail_id) {
                $woo_id = $item['meta']['woo_id'];
                $items['meta']['metadata'][] = ['post_id' => $woo_id, 'meta_key' => '_thumbnail_id', 'meta_value' => $thumbnail_id];
            }
        }

        return $items;
    }

    public function save_product_terms($supplier_product)
    {
        $woo_id = $supplier_product['meta']['woo_id'];
        // save categories
        $cat_ids = $supplier_product['meta']['product_cat_ids'];
        if (is_array($cat_ids) && count($cat_ids) && $woo_id) {
            wp_set_object_terms($woo_id, $cat_ids, 'product_cat', false);
        }
        // save tags
        $tag_ids = $supplier_product['meta']['product_tag_ids'];
        if (is_array($tag_ids) && count($tag_ids) && $woo_id) {
            wp_set_object_terms($woo_id, $tag_ids, 'product_tag', true);
        }
    }

    // TODO: move to WooTools
    public function resolve_terms($terms, $taxonomy)
    {
        // take an array of terms ['name' => 'Term Name', 'slug' => {optional} ]
        // resolve to existing ids
        // create those that don't exist
        foreach ($terms as $i => $term) {
            if (!isset($term['slug'])) {
                $terms[$i]['slug'] = sanitize_title($term['name']);
            }
        }

        $slugs = array_column($terms, 'slug');
        $found = get_terms(['slug' => $slugs, 'taxonomy' => $taxonomy, 'hide_empty' => false]);
        $lookup_term = array_column($found, null, 'slug');

        foreach ($terms as $i => $term) {
            $slug = $term['slug'];
            if (isset($lookup_term[$slug]) && $lookup_term[$slug]->term_id) {
                $terms[$i]['id'] = $lookup_term[$slug]->term_id;
                if ($lookup_term[$slug]->parent !== $term['parent']) {
                    $this->log("term parents don't match " . ($lookup_term[$slug]->parent) . "==" . $term['parent']);
                    wp_update_term($lookup_term[$slug]->term_id, $taxonomy, ['parent' => $term['parent']]);
                }
            } else {
                $parent = isset($term['parent']) ? $term['parent'] : 0;
                $woo_tag = wp_insert_term($term['name'], $taxonomy, ['slug' => $slug, 'parent' => $parent]);
                if (!is_wp_error($woo_tag) && isset($woo_tag['term_id'])) {
                    $terms[$i]['id'] = $woo_tag['term_id'];
                }
            }
        }
        return $terms;
    }

    //
    //
    //
    //
    //

    public function import_images_page($page_index = 1)
    {
        // return \WooTools::delete_orphaned_attachments();

        $start_time = microtime(true);
        // $r = [];
        $items = $this->get_api("/items/data", ['page' => $page_index]);
        $image_urls = [];
        $all_images = [];
        $skus = [];
        $products = [];

        foreach ($items['data'] as $i => $product) {
            $sku = $this->get_product_sku($product['id']);
            $product = [
                'data' => [
                    'id' => $product['id'],
                    'item_data' => $product,
                ],
                'meta' => [
                    'sku' => $this->get_product_sku($product['id']),
                ],
            ];
            $images = $this->extract_images($product);
            $product['meta']['images'] = $images;
            $urls = array_column($images, 'file');
            array_push($image_urls, ...$urls);
            $products[] = $product;
            $skus[] = $sku;
        }

        $lookup_woo_id = WooTools::lookup_woo_ids_by_skus($skus);
        $lookup_attachment_id = \WooTools::getAllAttachmentImagesIdByUrl($image_urls);
        $created = 0;

        foreach ($products as $i => $supplier_product) {
            $products[$i]['meta']['woo_id'] = $lookup_woo_id[$supplier_product['meta']['sku']];
            $attachment_ids = [];

            foreach ($supplier_product['meta']['images'] as $ii => $image) {
                $attachment_id = $lookup_attachment_id[$image['file']];

                if (!$attachment_id) {
                    $attachment_id = \WooTools::createRemoteAttachment($image, $this->key);
                    $created++;
                }

                $products[$i]['meta']['images'][$ii]['attachment_id'] = $attachment_id;
                $attachment_ids[] = $attachment_id;
            }
            $products[$i]['meta']['attachment_ids'] = $attachment_ids;
            $woo_id = $products[$i]['meta']['woo_id'];

            if ($woo_id) {
                if (count($attachment_ids) > 0) {
                    $woo_product = wc_get_product_object('simple', $woo_id);
                    if ($woo_product) {
                        $woo_product->update_meta_data('_thumbnail_id', $attachment_ids[0]);
                        if (count($attachment_ids) > 1) {
                            $woo_product->set_gallery_image_ids(array_slice($attachment_ids, 1));
                        }
                    }
                }
            }

        }

        return ['created' => $created, 'meta' => ['page_index' => $page_index, 'total_pages' => $items['meta']['total_pages']]];

        //////////
        //////////

        $lookup_woo_id = WooTools::lookup_woo_ids_by_skus($skus);
        // $woo_ids = array_values($lookup_woo_id);

        foreach ($products as $i => $supplier_product) {
            // $products[$i]['meta']['woo_id'] = $lookup_woo_id[$supplier_product['meta']['sku']];
            // $products[$i]['meta']['images'] = $this->extract_images(['data' => ['id' => $supplier_product['id'], 'item_data' => $item]]);
            // 'sku' => $this->get_product_sku($supplier_product['data']['id']);
            // $this->build_product_meta($supplier_product, $lookup_woo_id, $lookup_updated, $lookup_version);
            // ]
        }

        return $products;

        foreach ($items['data'] as $i => $item) {
            $images = $this->extract_images(['data' => ['id' => $item['id'], 'item_data' => $item]]);
            $urls = array_column($images, 'file');
            array_push($image_urls, ...$urls);
            array_push($all_images, ...$images);
            // $sku = $this->get_product_sku($item['id']);
            // $r[] = ['sku' => $sku, 'images' => $images];
        }
        // $urls = array_column($all_images, 'file');
        $lookup_attachment_id = \WooTools::getAllAttachmentImagesIdByUrl($image_urls);

        // return ['count' => count($lookup_attachment_id), 'lookup_attachment_id' => $lookup_attachment_id];
        // return ['all_images' => $all_images, 'urls' => $image_urls];
        // return $lookup_attachment_id;
        $created = [];

        $new_images = [];
        // $test = 0;
        $inserts = [];

        foreach ($all_images as $i => $image) {
            if ($lookup_attachment_id[$image['file']]) {
                $all_images[$i]['attachment_id'] = $lookup_attachment_id[$image['file']];
            } else {
                $attachment_id = \WooTools::createRemoteAttachment($image, $this->key);
                $all_images[$i]['attachment_id'] = $attachment_id; // . ' !NEW';
                $inserts[] = ['result' => $attachment_id, 'image' => $image];
            }
        }

        $products = []; //array_column($all_images, null, 'supplier_product_id');

        foreach ($all_images as $image) {
            $sku = $this->get_product_sku($image['supplier_product_id']);
            if (!isset($products, $sku)) {
                $products[$sku] = [];
            }
            $products[$sku][] = $image['attachment_id'];
        }
        return ['products' => $products];

        // $insert = \WooTools::bulkCreateRemoteAttachments($new_images, $this->key);

        // foreach ($new_images as $image) {
        // $inserts[] = WooTools::createRemoteAttachment($image, $this->key);
        // }
        // $inserts[] = \WooTools::createRemoteAttachment($new_images[0], $this->key);

        $end_time = microtime(true);
        $exetime = round($end_time - $start_time);

        return [
            'exetime' => $exetime,
            'count' => count($inserts),
            'insertsC' => count($inserts),
            'inserts' => $inserts,
            // 'new_images' => $new_images,
            'all_images' => $all_images,
            'lookup_attachment_id' => $lookup_attachment_id,
        ];

        $insert = \WooTools::bulkCreateRemoteAttachments($new_images, $this->key);

        return ['insert' => $insert, 'all_images' => $all_images, 'new_images' => $new_images];

        foreach ($lookup_attachment_id as $url => $attachment_id) {
            if (!$attachment_id) {
                $created[] = ['url' => $url, 'key' => $this->key];
                $attachment_id = WooTools::createRemoteAttachment($url, $this->key);
                if ($attachment_id) {
                    // $lookup_attachment_id[$url] = 'NEW '.$attachment_id;
                    // $created++;
                }
            }
        }

        /*
        if (count($master_image_ids) > 0) {
        $woo_product->update_meta_data('_thumbnail_id', $master_image_ids[0]);
        if (count($master_image_ids) > 1) {
        $woo_product->set_gallery_image_ids(array_slice($master_image_ids, 1));
        }
        }
         */

        return ['all_images' => $all_images, 'created' => $created, 'image_urls' => $image_urls, 'lookup_attachment_id' => $lookup_attachment_id];
        // return $r;
    }

    // public function get_products_page($cursor = 1, $size = 10, $updated = '2020-01-01')
    // {
    //     return 'This no work';
    //     // get page of products with additional info
    //     if (empty($cursor)) {
    //         $cursor = 1;
    //     }

    //     $products = $this->get_api('/items', ['page' => $cursor]);
    //     $response = ['data' => [], 'meta' => $products['meta']];

    //     if (isset($products['error'])) {
    //         return $products;
    //     }

    //     $item_data = $this->get_api("/items/data", ['page' => $cursor]);
    //     $lookup_item = array_column($item_data['data'], null, 'id');

    //     $fitments = $this->get_api("/items/fitment", ['page' => $cursor]);
    //     $lookup_fitment = array_column($fitments['data'], null, 'id');

    //     $pricing = $this->get_api("/pricing", ['page' => $cursor]);
    //     $lookup_pricing = array_column($pricing['data'], null, 'id');

    //     $brands = $this->get_api("/brands");
    //     $lookup_brand = array_column($brands['data'], null, 'id');

    //     // if($lookup_item['100420']){
    //     //     return 'found item_data for 100420';
    //     // } else {
    //     //     return 'NOT FOUND';
    //     // }
    //     $t = 0;
    //     foreach ($products['data'] as $product) {
    //         $id = $product['id'];
    //         if ($lookup_item[$id]) {
    //             $t++;
    //         }
    //     }
    //     return ['total' => count($item_data['data']), 'matched' => $t, 'look' => $lookup_item];
    //     $skus = [];
    //     $errs = [];

    //     foreach ($products['data'] as $i => $product) {

    //         $id = $product['id'];
    //         $brand_id = $product['attributes']['brand_id'];

    //         if (!$lookup_item[$id]) { // !== $item_data['data'][$i]['id']) {
    //             $errs[$i] = ['a' => $lookup_item[$id], 'b' => $item_data['data'][$i]['id']];
    //         } else {
    //             $errs[$i] = 'matches';
    //         }

    //         $product['item_data'] = $lookup_item[$id]; //$item_data['data'][$i];
    //         $product['fitment'] = $lookup_fitment[$id]; //$fitments['data'][$i];
    //         $product['pricing'] = $lookup_pricing[$id];
    //         $product['brand'] = $lookup_brand[$brand_id];

    //         $product_enhanced = ['data' => $product, 'meta' => []];
    //         $skus[] = $this->get_product_sku($product['id']);
    //         $response['data'][] = $product_enhanced;
    //     }

    //     return $errs;

    //     // bulk check for woo ids
    //     $lookup_woo_id = WooTools::lookup_woo_ids_by_skus($skus);

    //     foreach ($response['data'] as $i => $product) {
    //         $response['data'][$i]['meta'] = $this->build_product_meta($product, $lookup_woo_id);
    //     }

    //     return $response;
    // }

    private function get_product_type($supplier_product)
    {
        return $this->is_variable($supplier_product) ? 'variable' : 'simple';
    }

    private function build_product_meta($supplier_product, $lookup_woo_id = null, $lookup_updated = null, $lookup_version = null)
    {
        $meta = [];
        $meta['name'] = $this->get_name($supplier_product);
        $meta['short_description'] = $this->get_short_description($supplier_product);
        $meta['is_available'] = $this->is_available($supplier_product);
        $meta['sku'] = $this->get_product_sku($supplier_product['data']['id']);
        $meta['is_variable'] = $this->is_variable($supplier_product);
        $meta['product_type'] = $this->get_product_type($supplier_product);
        $meta['terms'] = $this->extract_terms($supplier_product);
        $meta['images'] = $this->extract_images($supplier_product, false);
        $action = 'ignore';
        $reason = '';

        if (!$lookup_woo_id) {
            $lookup_woo_id = WooTools::lookup_woo_ids_by_skus([$meta['sku']]);
        }

        if (isset($lookup_woo_id[$meta['sku']])) {
            // product exists in woo
            $woo_id = $lookup_woo_id[$meta['sku']];
            $meta['woo_id'] = $woo_id;
            $meta['updated'] = $lookup_updated[$woo_id];
            $meta['age'] = WooTools::get_age($meta['updated'], 'seconds');
            $meta['import_version'] = $lookup_version[$woo_id];
            $expired = $meta['age'] > 24 * 7; // expire after a week
            $deprecated = $meta['import_version'] !== $this->import_version;
            $meta['expired'] = $expired;
            $meta['deprecated'] = $deprecated;

            if ($expired || $deprecated) {
                $action = 'update';
            } else {
                $action = 'ignore';
                $reason = 'recently updated';
            }
        } else {
            // product does not exist
            $meta['woo_id'] = false;
            $action = 'insert';
        }
        $meta['action'] = $action;
        $meta['reason'] = $reason;
        return $meta;
    }

    // public function get_next_products_page($previous_result_meta)
    // {
    //     $cursor = '';
    //     $size = 10;
    //     $updated = '2020-01-01';

    //     if ($previous_result_meta !== null) {
    //         if (isset($previous_result_meta['cursor']['next'])) {
    //             $cursor = $previous_result_meta['cursor']['next'];
    //         }
    //         if (isset($previous_result_meta['cursor']['count'])) {
    //             $size = $previous_result_meta['cursor']['count'];
    //         }
    //     }
    //     return $this->get_products_page($cursor, $size, $updated);
    // }

    public function get_product_light($supplier_product_id)
    {
        return $this->get_api("/items/{$supplier_product_id}");
    }

    public function get_product($supplier_product_id)
    {
        $response = $this->get_api("/items/{$supplier_product_id}");
        if (isset($response['error'])) {
            return $response;
        } else {
            $item_data = $this->get_api("/items/data/{$supplier_product_id}");
            $fitments = $this->get_api("/items/fitment/{$supplier_product_id}");
            $pricing = $this->get_api("/pricing/{$supplier_product_id}");
            $brand_id = $response['data']['attributes']['brand_id'];
            if (isset($brand_id)) {
                $brand = $this->get_api("/brands/{$brand_id}");
                $response['data']['brand'] = $brand['data'];
            } else {
                $response['data']['brand'] = false;
            }

            $response['data']['item_data'] = $item_data['data'][0];
            $response['data']['fitment'] = $fitments['data'];
            $response['data']['pricing'] = $pricing['data'];
            $response['meta'] = $this->build_product_meta($response);
        }
        return $response;
    }

    public function is_available($supplier_product)
    {
        $is_active = $supplier_product['data']['attributes']['active'] === true;
        return $is_active;
    }

    // public function insert_product_page($page_index)
    // {
    //     $start_time = microtime(true);
    //     $products = $this->get_products_page($page_index);
    //     $result = [];
    //     $deletes = 0;
    //     $inserts = 0;
    //     $updates = 0;
    //     $ignores = 0;

    //     foreach ($products['data'] as $supplier_product) {
    //         $action = $supplier_product['meta']['action'];
    //         $woo_id = $supplier_product['meta']['woo_id'];
    //         $supplier_product_id = $supplier_product['data']['id'];

    //         if ($action === 'update') {
    //             // $this->update_woo_product($woo_id, $supplier_product);
    //             $updates++;
    //         } else if ($action === 'insert') {
    //             $this->insert_product($supplier_product_id, $supplier_product);
    //             $inserts++;
    //         } else if ($action === 'delete') {
    //             $this->delete_product($supplier_product_id, $supplier_product);
    //             $deletes++;
    //         } else if ($action === 'ignore') {
    //             $ignores++;
    //         }
    //         $result[] = [
    //             'id' => $supplier_product['data']['id'],
    //             'action' => $supplier_product['meta']['action'],
    //             'reason' => $supplier_product['meta']['reason'],
    //         ];
    //     }
    //     $end_time = microtime(true);
    //     $exetime = $end_time - $start_time;
    //     $output['exetime'] = $exetime;

    //     return [
    //         'meta' => [
    //             'page_index' => $page_index,
    //             'deletes' => $deletes,
    //             'inserts' => $inserts,
    //             'updates' => $updates,
    //             'ignores' => $ignores,
    //             'exetime' => $exetime,
    //             'total_pages' => $products['meta']['total_pages'],
    //         ],
    //         // 'data' => $result,
    //     ];
    // }
    /**
     *
     * @param SupplierProduct    $supplier_product
     */
    public function create_base_product($supplier_product)
    {
        if ($supplier_product['meta']['product_type'] === 'simple') {
            $woo_product = new WC_Product_Simple();
        } else {
            $woo_product = new WC_Product_Variable();
        }
        // $this->log('create_base_product() ' . $supplier_product['meta']['sku']);
        $woo_product->set_sku($supplier_product['meta']['sku']); //$this->get_product_sku($supplier_product['data']['id']));
        $woo_product->update_meta_data('_ci_supplier_key', $this->key);
        $woo_product->update_meta_data('_ci_product_id', $supplier_product['data']['id']);
        $woo_product->update_meta_data('_supplier_class', $this->supplierClass);

        $this->update_base_product($supplier_product, $woo_product);

        // $is_available = $supplier_product['meta']['is_available'] === true;
        // $woo_product->set_stock_status('instock');
        // $woo_product->set_status($is_available ? 'publish' : 'draft');
        // $woo_product->set_name($this->get_name($supplier_product));
        // $woo_product->set_short_description($this->get_short_description($supplier_product));
        // $woo_product->update_meta_data('_ci_import_version', $this->import_version);
        // $woo_product->update_meta_data('_ci_import_timestamp', gmdate("c"));

        return $woo_product;
    }

    public function update_base_product($supplier_product, $woo_product = false)
    {
        // $this->log('update_base_product() ' . $supplier_product['meta']['sku']);
        if (!$woo_product) {
            $woo_id = $supplier_product['meta']['woo_id'];
            $woo_product = wc_get_product_object($supplier_product['meta']['product_type'], $woo_id);
        }
        $is_available = $supplier_product['meta']['is_available'] === true;
        $woo_product->set_stock_status($is_available ? 'instock' : 'outofstock');
        $woo_product->set_status($is_available ? 'publish' : 'draft');
        $woo_product->set_name($this->get_name($supplier_product));
        $woo_product->set_short_description($this->get_short_description($supplier_product));
        $woo_product->update_meta_data('_ci_import_version', $this->import_version);
        $woo_product->update_meta_data('_ci_import_timestamp', gmdate("c"));

        // special update timestamps for each phase of the update
        $woo_product->update_meta_data('_ci_t14_item_updated', gmdate("c"));
        // $woo_product->update_meta_data('_ci_t14_images_updated', gmdate("c"));

        return $woo_product;
    }

    public function insert_product($supplier_product_id, $supplier_product = null)
    {
        if ($supplier_product === null) {
            $supplier_product = $this->get_product($supplier_product_id);
        }
        if (!$supplier_product) {
            $this->log('insert_product() API Error' . $supplier_product_id);
            return ['error' => 'insert_product() API Error' . $supplier_product_id];
        }
        $is_available = $this->is_available($supplier_product);

        if (!$is_available) {
            $this->log('insert_product() Product not available:' . $supplier_product_id);
            return ['error' => 'insert_product() Product not available:' . $supplier_product_id];
        }

        $images = $this->extract_images($supplier_product);
        if (!count($images)) {
            $this->log('insert_product() Product has no images:' . $supplier_product_id);
            return ['error' => 'insert_product() Product has no images:' . $supplier_product_id];
        }

        $is_variable = $this->is_variable($supplier_product);

        // return $this->get_product_sku($supplier_product_id);

        if ($is_variable) {
            return ['error' => 'product is_variable:' . $supplier_product_id];
        }

        $woo_product = $this->create_base_product($supplier_product);

        // $woo_product = new WC_Product_Simple();

        $woo_product->set_status('publish');
        $woo_product->set_stock_status('instock');
        // $woo_product->set_sku($this->get_product_sku($supplier_product_id));
        // $woo_product->set_name($this->get_name($supplier_product));
        $woo_product->set_regular_price($this->get_retail_price($supplier_product));
        // $woo_product->set_description($this->get_description($supplier_product));
        $woo_product->set_short_description($this->get_short_description($supplier_product));

        // $woo_product->update_meta_data('_ci_supplier_key', $this->key);
        // $woo_product->update_meta_data('_ci_product_id', $supplier_product_id);
        // $woo_product->update_meta_data('_supplier_class', $this->supplierClass);
        // $woo_product->update_meta_data('_ci_import_version', $this->import_version);
        // $woo_product->update_meta_data('_ci_import_timestamp', gmdate("c"));

        $attachments = $this->attach_images($supplier_product, $woo_product);

        $woo_id = $woo_product->save();

        $this->update_terms($supplier_product, $woo_id);

        return [
            'woo_id' => $woo_id,
            'stock_status' => $woo_product->get_stock_status(),
            'sku' => $woo_product->get_sku(),
            'name' => $woo_product->get_name(),
            'regular_price' => $woo_product->get_regular_price(),
            'description' => $woo_product->get_description(),
            'short_description' => $woo_product->get_short_description(),
            'meta_data' => $woo_product->get_meta_data(),
            'gallery_image_ids' => $woo_product->get_gallery_image_ids(),
            'attachments' => $attachments,
            'terms' => [
                'categories' => get_the_terms($woo_id, 'product_cat'),
                'product_tag' => get_the_terms($woo_id, 'product_tag'),
            ],
        ];

        // Define attributes
        $attributes = array(
            'color' => array(
                'name' => 'Color',
                'visible' => true,
                'variation' => true,
                'options' => array('Red', 'Blue', 'Green'),
            ),
            'size' => array(
                'name' => 'Size',
                'visible' => true,
                'variation' => true,
                'options' => array('Small', 'Medium', 'Large'),
            ),
        );

        // Add attributes to the variable product
        foreach ($attributes as $key => $attribute) {
            $product_attributes[sanitize_title($key)] = new WC_Product_Attribute();
            $product_attributes[sanitize_title($key)]->set_name($attribute['name']);
            $product_attributes[sanitize_title($key)]->set_visible($attribute['visible']);
            $product_attributes[sanitize_title($key)]->set_variation($attribute['variation']);
            $product_attributes[sanitize_title($key)]->set_options($attribute['options']);
        }
        $woo_product->set_attributes($product_attributes);
        $woo_product->save();

        // Add variations
        $variations = array(
            array(
                'attributes' => array(
                    'color' => 'Red',
                    'size' => 'Small',
                ),
                'regular_price' => '19.99',
                'sale_price' => '14.99',
            ),
            array(
                'attributes' => array(
                    'color' => 'Blue',
                    'size' => 'Medium',
                ),
                'regular_price' => '19.99',
                'sale_price' => '14.99',
            ),
        );

        foreach ($variations as $variation_data) {
            $variation = new WC_Product_Variation();
            $variation->set_parent_id($woo_id);
            $variation->set_attributes($variation_data['attributes']);
            $variation->set_regular_price($variation_data['regular_price']);
            $variation->set_sale_price($variation_data['sale_price']);
            $variation->save();
        }

        return $woo_id;

        // $product_id = $this->create_product($supplier_product_id);
        // $this->log('create_product() wps:' . $supplier_product_id . ' => woo:' . $product_id);
        // $this->update_product_action($supplier_product);
    }

    private function get_retail_price($supplier_product)
    {
        $retail_price = null;
        if (isset($supplier_product['data']['pricing'])) {
            $retail_price = $this->extract_price($supplier_product['data']['pricing']);
        }
        return $retail_price;
    }

    public function get_name($supplier_product)
    {
        // the part_description seems to be a more descriptive name
        // TODO: should we combine name/desc??
        if (isset($supplier_product['data']['attributes']['part_description'])) {
            return $supplier_product['data']['attributes']['part_description'];
        }
        if (isset($supplier_product['data']['attributes']['product_name'])) {
            return $supplier_product['data']['attributes']['product_name'];
        }
        return '';
    }

    public function get_description($supplier_product)
    {
        // types: "Market Description","Product Description - Short","Associated Comments","Product Description - Long","Product Description - Invoice","AAIA Part Type Description"
        if (isset($supplier_product['data']['item_data'][0]['descriptions'])) {
            $htm = [];
            $descriptions = $supplier_product['data']['item_data'][0]['descriptions'];
            if (isset($descriptions)) {
                foreach ($descriptions as $description) {
                    if ($description['type'] === 'Market Description' || $description['type'] === 'Associated Comments') {
                        $htm[] = "<p>{$description['description']}</p>";
                    }
                }
                return implode('', $htm);
            }
        } else if (isset($supplier_product['data']['attributes']['part_description'])) {
            return $supplier_product['data']['attributes']['part_description'];
        }
        return '';
    }

    public function get_short_description($supplier_product)
    {
        if (isset($supplier_product['data']['attributes']['part_description'])) {
            return $supplier_product['data']['attributes']['part_description'];
        }
        return '';
    }

    /**
     *
     * @param SupplierProduct    $supplier_product
     */
    public function extract_images($supplier_product, $force = true)
    {
        // TODO: in what case does this return as an array?
        // Why does is is_array true and is_object false for an object??? WTF PHP?
        $images = [];
        $image_urls = [];
        $supplier_product_id = $supplier_product['data']['id'];

        if (!isset($supplier_product['data']['item_data'])) {
            if ($force) {
                $item_data = $this->get_api("/items/data/{$supplier_product_id}");
                $supplier_product['data']['item_data'] = $item_data['data'][0];
            } else {
                return false;
            }
        }
        $this->log('extract_images');

        $item_data = $supplier_product['data']['item_data'];
        // return ['is_array'=>is_array($item_data), 'is_object'=>is_object($item_data), 'item_data' => $item_data];//;
        // if (is_array($item_data)) {
        //     $item_data = $item_data[0];
        // }
        $files = isset($item_data['files']) ? $item_data['files'] : [];
        foreach ($files as $file) {
            if ($file['type'] === 'Image') {
                $image_urls[] = $file['links'][0]['url'];
                $images[] = [
                    'file' => $file['links'][0]['url'],
                    'width' => floor($file['links'][0]['width']),
                    'height' => floor($file['links'][0]['height']),
                    'size' => 'Large',
                    'supplier_product_id' => $supplier_product['data']['id'],
                ];

            }
        }
        return $images;
    }
    /**
     *
     * @param SupplierProduct    $supplier_product
     * @param WC_Product    $woo_product
     */
    public function attach_images($supplier_product, $woo_product = null)
    {
        $this->log('attach_images() ' . $supplier_product['data']['id']);
        $result = [];
        $images = $this->extract_images($supplier_product);

        if (!count($images)) {
            return false;
        }
        $image_urls = array_column($images, 'file');
        $lookup_attachment_id = \WooTools::getAllAttachmentImagesIdByUrl($image_urls);
        $master_image_ids = [];
        $attachments = [];

        foreach ($images as $image) {
            $attachment_id = $lookup_attachment_id[$image['file']];
            if (!$attachment_id) {
                $attachment_id = WooTools::createRemoteAttachment($image, $this->key);
                $attachments[$attachment_id] = 'created';
            } else {
                $attachments[$attachment_id] = 'found';
            }
            if ($attachment_id) {
                $master_image_ids[] = $attachment_id;
            }
        }

        $save_woo = false;

        if (count($master_image_ids) > 0) {
            if (!$woo_product) {
                $woo_id = isset($supplier_product['meta']['woo_id']) ? $supplier_product['meta']['woo_id'] : false;

                if (!$woo_id) {
                    $sku = $this->get_product_sku($supplier_product['data']['id']);
                    $woo_id = wc_get_product_id_by_sku($sku);
                }

                $save_woo = true;
                $product_type = isset($supplier_product['meta']['product_type']) ? $supplier_product['meta']['product_type'] : $this->get_product_type($supplier_product);

                $result['product_type'] = $product_type;
                if ($woo_id) {
                    $woo_product = wc_get_product_object($product_type, $woo_id);
                    $result['woo_product'] = 'found';
                } else {
                    $woo_product = $this->create_base_product($supplier_product);
                    $woo_id = $woo_product->get_id();
                    $result['woo_product'] = 'created';
                }
                $result['woo_id'] = $woo_id;
            }

            $result['thumb_success'] = set_post_thumbnail($woo_id, $master_image_ids[0]);
            if (count($master_image_ids) > 1) {
                $woo_product->set_gallery_image_ids(array_slice($master_image_ids, 1));
            }
        }

        if ($save_woo) {
            $woo_product->save();
        }
        $result['saved'] = $save_woo;

        $product = wc_get_product($woo_id);
        if ($product) {
            $result['image'] = $product->get_image_id('edit');
            $result['gallery'] = $product->get_gallery_image_ids('edit');
        }

        // $test = get_the_post_thumbnail_url($supplier_product['data']['id'], 'full');
        return $result;
    }

    public function extract_terms($supplier_product)
    {
        $tags = [];

        // vehicle tags
        $vehicle_ids = [];
        if (isset($supplier_product['data']['fitment']['attributes']['vehicle_ids'])) {
            $vehicle_ids = $supplier_product['data']['fitment']['attributes']['vehicle_ids'];
            if (count($vehicle_ids)) {
                foreach ($vehicle_ids as $vehicle_id) {
                    $name = "vehicle_id_{$vehicle_id}";
                    $tags[] = ['name' => $name, 'slug' => sanitize_title($name)];
                }
            }
        }

        // category tags
        if (isset($supplier_product['data']['attributes'])) {
            $category = $supplier_product['data']['attributes']['category'];
            $tags[] = ['name' => $category, 'slug' => sanitize_title($category)];

            $subcategory = $supplier_product['data']['attributes']['subcategory'];
            $tags[] = ['name' => $subcategory, 'slug' => sanitize_title($subcategory)];

            if (isset($supplier_product['data']['brand']['attributes']['name'])) {
                $brand = $supplier_product['data']['brand']['attributes']['name'];
                $tags[] = ['name' => $brand, 'slug' => sanitize_title($brand)];
            }
        }

        // supplier tag
        $tags[] = ['name' => $this->name, 'slug' => sanitize_title($this->name)];

        return $tags;
    }

    public function update_terms($supplier_product, $woo_id)
    {
        $tags = $this->extract_terms($supplier_product);
        $tag_ids = $this->get_tag_ids($tags);
        wp_set_object_terms($woo_id, $tag_ids, 'product_tag', true); // appends terms
    }

    private function is_variable($supplier_product)
    {
        if (isset($supplier_product['data']['attributes']['units_per_sku'])) {
            return $supplier_product['data']['attributes']['units_per_sku'] > 1;
        }
        return false;
    }

    public function update_product_action($supplier_product)
    {
        return ['update' => $supplier_product['data']['id']];

        try {
            $supplier_product_id = $supplier_product['data']['id'];
            $this->log('update_product_action() ' . $supplier_product_id);
            $woo_product_id = $this->get_woo_id($supplier_product_id);

            if (!$woo_product_id) {
                $this->log($supplier_product_id . ' no woo product found for update');
                return;
            }

            $woo_product = wc_get_product_object('variable', $woo_product_id);
            $first_item = $supplier_product['data']['items']['data'][0];
            $woo_product->set_name($supplier_product['data']['name']);
            $woo_product->set_status('publish');
            $woo_product->set_regular_price($first_item['list_price']);
            $woo_product->set_stock_status('instock');
            $woo_product->update_meta_data('_ci_import_version', $this->import_version);
            $woo_product->update_meta_data('_ci_import_timestamp', gmdate("c"));
            $woo_product->set_description($this->get_description($supplier_product));

            // $this->update_product_taxonomy($woo_product, $supplier_product);
            // $this->update_product_attributes($woo_product, $supplier_product);
            // $this->update_product_variations($woo_product, $supplier_product);
            // $this->update_product_images($woo_product, $supplier_product);

            $woo_id = $woo_product->save();
            if (!$woo_id) {
                $this->log($supplier_product_id . ' save failed for woo:' . $woo_id);
            }
            return ['updated' => true];
        } catch (Exception $e) {
            return ['error' => $e];
        }
    }

    public function update_woo_product($woo_id, $supplier_product)
    {
        $supplier_product_id = $supplier_product['data']['id'];
        $is_variable = $supplier_product['meta']['is_variable'];

        if (!$supplier_product_id) {
            return ['error' => "product id not set"];
        }
        if ($is_variable) {
            return ['error' => "product is variable {$supplier_product_id}"];
        }
        $is_available = $supplier_product['meta']['is_available'];

        if ($is_available) {
            $woo_id = $supplier_product['meta']['woo_id'];
            if (!$woo_id) {
                return ['error' => 'woo id not set'];
            }
            $woo_product = wc_get_product_object('simple', $woo_id);

            if ($woo_product) {
                $this->update_product_terms($supplier_product);
                // $terms = $supplier_product['meta']['terms'];
                // if ($terms) {
                //     $term_ids = $this->get_tag_ids($terms);
                //     wp_set_object_terms($woo_id, $term_ids, 'product_tag', true);
                // }
                $this->attach_images($supplier_product, $woo_product);
                return ['message' => 'product updated:' . $supplier_product_id];
            } else {
                return ['error' => 'woo product not found'];
            }
        } else {
            $this->delete_product($supplier_product_id);
            return ['message' => 'product deleted:' . $supplier_product_id];
        }
    }

    public function get_update_action($supplier_product)
    {
        return 'update';
    }

    public function import_product($supplier_product_id)
    {
        $supplier_product = $this->get_product($supplier_product_id);
        $woo_product = $this->update_base_product($supplier_product);
        $woo_id = $woo_product->save();
        $attachments = $this->attach_images($supplier_product, $woo_product);
        return ['attachments' => $attachments, 'product' => $supplier_product];
    }

    // placeholder
    public function update_product($supplier_product_id, $supplier_product = null)
    {
        return $this->get_product($supplier_product_id);
        // $this->log('update_product() not defined for ' . $this->key);
    }

    public function update_product_terms($supplier_product)
    {
        if (isset($supplier_product['meta']['terms']) && isset($supplier_product['meta']['woo_id'])) {
            $woo_id = $supplier_product['meta']['woo_id'];
            $terms = $supplier_product['meta']['terms'];
            if ($terms) {
                $this->log("update_product_terms() {$woo_id}");
                $term_ids = $this->get_tag_ids($terms);
                wp_set_object_terms($woo_id, $term_ids, 'product_tag', true);
            }
        }
    }
}
