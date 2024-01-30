<?php

require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/JobWorker.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Report.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/western/get_western_products_count.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/western/get_western_products_page.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/western/import_western_product.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/admin/ci_import_product.php';

class StockCheck extends JobWorker
{
    public function __construct()
    {
        parent::__construct('stock_check');
    }

    public function task($is_resuming = false, $get = null)
    {
        $since = isset($get['since']) && !empty($get['since']) ? $get['since'] : '2020-01-01';
        $total_products = get_western_products_count($since);
        $data = $this->get_data();
        $result = [
            'total_products' => $total_products,
            'processed' => 0,
            'delete' => 0,
            'update' => 0,
            'ignore' => 0,
            'insert' => 0,
            'error' => 0,
            'cursor' => '',
            'page_size' => 50,
            'since' => $since,
        ];
        if ($is_resuming) {
            $result = array_merge($result, $data['result']);
        }
        $data['result'] = $result;
        error_log(json_encode($data));
        ksort($data);
        $this->put_data($data);
        sleep(1);

        $is_complete = true;

        while ($result['cursor'] !== null) {
            $result = $this->process_page($result);

            $data = $this->get_data();
            $data['result'] = $result;
            $data['updated'] = gmdate("c");
            $data['progress'] = $result['processed'] / $result['total_products'];
            $this->put_data($data);

            if ($data['is_stopping']) {
                $is_complete = false;
                break;
            }
        }

        if ($is_complete) {
            $this->complete();
        } else {
            $this->stop();
        }
    }

    private function process_page($result)
    {
        $page = get_western_products_page($result['cursor'], $result['since'], $result['page_size']);
        $this->log(['get_western_products_page' => $result['cursor']]);

        if (!isset($page['data']) || !is_countable($page['data'])) {
            error_log('RETRY: process_page(' . $result['cursor'] . ', ' . $result['since'] . ', ' . $result['page_size'] . ')');
            sleep(5);
            $page = get_western_products_page($result['cursor'], $result['since'], $result['page_size']);
        }

        if (!isset($page['data']) || !is_countable($page['data'])) {
            error_log('ABORT: process_page(' . $result['cursor'] . ', ' . $result['since'] . ', ' . $result['page_size'] . ')');
            return null;
        }

        foreach ($page['data'] as $wps_product) {
            $res = 'error';
            try {
                $res = $this->process_product($wps_product);
                if ($res !== 'ignore') {
                    $this->log(['wps_id' => $wps_product['id'], 'action' => $res]);
                }
            } catch (Exception $e) {
                error_log('Error processing wps_product:' . $wps_product['id']);
            }
            $result['processed']++;
            $result[$res]++;
        }

        $result['cursor'] = isset($page['meta']['cursor']['next']) ? $page['meta']['cursor']['next'] : null;
        return $result;
    }

    public function process_product($wps_product)
    {
        $wps_stock_status = has_valid_items($wps_product) ? 'instock' : 'outofstock';
        $wps_product_id = $wps_product['id'];
        $sku = get_western_sku($wps_product_id);
        $product_id = wc_get_product_id_by_sku($sku);
        $res = '';

        if ($product_id) {
            $should_delete = wps_should_delete($wps_product);
            $woo_product = wc_get_product_object('product', $product_id);

            if ($should_delete) {
                $woo_product->delete(true);
                $res = 'delete';
            } else {
                $woo_stock_status = $woo_product->get_stock_status();
                if ($woo_stock_status !== $wps_stock_status) {
                    error_log('product_id=' . $product_id . ' woo:' . $woo_stock_status . '!= wps:' . $wps_stock_status);
                    $woo_product->set_stock_status($wps_stock_status);
                    $woo_product->save();
                    $res = 'update';
                } else {
                    $res = 'ignore';
                }
            }
        } else {
            if ($wps_stock_status === 'outofstock') {
                $res = 'ignore';
            } else {
                wp_schedule_single_event(time() + 1, 'ci_import_product', ['wps', $wps_product_id]);
                // $report = new Report();
                // import_western_product($wps_product_id, false, $report);
                // $this->log($report->data);
                $res = 'insert';
            }
        }
        return $res;
    }

    // public function Xtask($is_resuming = false, $get = null)
    // {
    //     $since = isset($get['since']) && !empty($get['since']) ? $get['since'] : '2020-01-01';
    //     error_log('StockCheck::task() ' . ($is_resuming ? 'is_resuming' : '') . ' since=' . $since);
    //     $is_complete = true;
    //     $total_products = get_western_products_count($since);
    //     $data = $this->get_data();
    //     $result = [
    //         'total_products' => $total_products,
    //         'processed' => 0,
    //         'delete' => 0,
    //         'update' => 0,
    //         'ignore' => 0,
    //         'insert' => 0,
    //         'cursor' => '',
    //         'since' => $since,
    //     ];
    //     if ($is_resuming) {
    //         $result = array_merge($result, $data['result']);
    //     }
    //     $data['result'] = $result;
    //     ksort($data);
    //     $this->put_data($data);

    //     // check if any products were found
    //     if (!$total_products) {
    //         $this->complete();
    //         return;
    //     }

    //     $cursor = $data['result']['cursor'];
    //     $page_size = 100;
    //     $page = get_western_products_page($cursor, $since, $page_size);
    //     $cursor = $page['meta']['cursor']['next'];

    //     while ($cursor !== null) {

    //         $page = get_western_products_page($cursor, $since, $page_size);

    //         if (!is_countable($page['data'])) {
    //             error_log('RETRY: page data undefined cursor=' . $cursor);
    //             sleep(5);
    //             $page = get_western_products_page($cursor, $since, $page_size);
    //         }

    //         if (is_countable($page['data'])) {
    //             foreach ($page['data'] as $wps_product) {
    //                 $res = $this->process_product($wps_product);
    //                 if ($res !== 'ignore') {
    //                     $this->log(['wps_id' => $wps_product['id'], 'action' => $res]);
    //                 }
    //                 $result['processed']++;
    //                 $result[$res]++;
    //             }
    //             $data = $this->get_data();
    //             $result['cursor'] = $cursor;
    //             $data['result'] = $result;
    //             $data['updated'] = gmdate("c");
    //             $data['progress'] = $result['processed'] / $result['total_products'];
    //             $this->put_data($data);

    //             // task atopped
    //             if ($data['is_stopping']) {
    //                 $is_complete = false;
    //                 break;
    //             }

    //             $cursor = isset($page['meta']['cursor']['next']) ? $page['meta']['cursor']['next'] : null;
    //         } else {
    //             error_log('page data undefined cursor=' . $cursor);
    //             $cursor = null;
    //         }
    //     }

    //     if ($is_complete) {
    //         error_log('StockCheck:task() complete');
    //         $this->complete();
    //     } else {
    //         error_log('StockCheck:task() stopped');
    //         $this->stop(true);
    //     }
    // }

    // public function task($is_resuming = false, $get = null)
    // {
    //     error_log('StockCheck::task() ' . ($is_resuming ? 'is_resuming' : ''));
    //     $since = isset($get['since']) && !empty($get['since']) ? $get['since'] : null;
    //     error_log('since=' . $since);
    //     $is_complete = true;
    //     $total_products = get_western_products_count($since);
    //     $data = $this->get_data();
    //     $result = [
    //         'total_products' => $total_products,
    //         'processed' => 0,
    //         'delete' => 0,
    //         'update' => 0,
    //         'ignore' => 0,
    //         'insert' => 0,
    //         'cursor' => '',
    //         'since' => $since,
    //     ];
    //     if ($is_resuming) {
    //         $result = array_merge($result, $data['result']);
    //     }
    //     $data['result'] = $result;
    //     $data['is_running'] = true;
    //     $data['is_stopping'] = false;
    //     ksort($data);
    //     $this->put_data($data);

    //     if (!$total_products) {
    //         $this->complete();
    //         return;
    //     }

    //     $cursor = $data['result']['cursor'];
    //     $page_size = 100;
    //     $page = get_western_products_page($cursor, $since, $page_size);
    //     $cursor = $page['meta']['cursor']['next'];

    //     while ($cursor) {
    //         // $data = $this->get_data();
    //         // $result = array_merge($result, $data['result']);

    //         // $is_stopping = $data['is_stopping'] === true;

    //         // if ($is_stopping) {
    //         //     $is_complete = false;
    //         //     break;
    //         // }
    //         // validate job data in case it gets deleted or corrupted
    //         // if (!isset($data['result']['cursor'])) {
    //         //     $is_complete = false;
    //         //     break;
    //         // }

    //         if (is_countable($page['data'])) {
    //             foreach ($page['data'] as $wps_product) {
    //                 $res = $this->process_product($wps_product);
    //                 if ($res !== 'ignore') {
    //                     $this->log(['timestamp' => gmdate("c"), 'wps_id' => $wps_product['id'], 'action' => $res]);
    //                 }
    //                 $result['processed']++;
    //                 $result[$res]++;
    //                 // $data['result']['processed']++;
    //                 // $data['result'][$res]++;
    //             }
    //         } else {
    //             error_log('page data undefined cursor=' . $cursor);
    //         }
    //         $data = $this->get_data();
    //         $data['result'] = $result;
    //         $data['updated'] = gmdate("c");
    //         $data['progress'] = $data['result']['processed'] / $data['result']['total_products'];
    //         $cursor = isset($page['meta']['cursor']['next']) ? $page['meta']['cursor']['next'] : null;
    //         $data['result']['cursor'] = $cursor;
    //         $this->put_data($data);

    //         if (!$cursor) {
    //             break;
    //         }

    //         if (isset($data['is_stopping']) && $data['is_stopping'] === false) {
    //             $is_complete = false;
    //             break;
    //         }

    //         $page = get_western_products_page($cursor, $since, $page_size);

    //         if (!is_countable($page['data'])) {
    //             error_log('RETRY: page data undefined cursor=' . json_encode(['cursor' => $cursor, 'since' => $since, 'page_size' => $page_size]));
    //             $page = get_western_products_page($cursor, $since, $page_size);
    //         }
    //         // if (isset($page['meta']['cursor']['next'])) {
    //         //     $cursor = $page['meta']['cursor']['next'];
    //         // } else {
    //         //     $cursor = null;
    //         // }

    //         // $page = get_western_products_page($cursor, null, $page_size);
    //         // $data['result']['cursor'] = $cursor;

    //     }

    //     if ($is_complete) {
    //         error_log('StockCheck:task() complete');
    //         $this->complete();
    //     } else {
    //         error_log('StockCheck:task() stopped');
    //         $this->stop(true);
    //     }
    // }
}
