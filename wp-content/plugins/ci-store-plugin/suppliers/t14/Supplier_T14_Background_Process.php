<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/CronJob.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Supplier_Background_Process.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/supplier_t14.php';

class Supplier_T14_Background_Process extends Supplier_Background_Process
{
    // protected Supplier_t14 $supplier;

    protected function do_task($item)
    {
        error_log('Supplier_T14_Background_Process::do_task() ' . json_encode($item));
        if ($this->stop_requested()) {
            $this->clear_stop();
            return false;
        }
        $page_index = isset($item['page_index']) ? $item['page_index'] : false;
        $action = isset($item['action']) ? $item['action'] : false;
        $this->supplier->log("do_task() page_index:{$page_index} action:{$action}");

        if ($page_index && $action) {
            switch ($action) {
                case 'price_table':
                    $start_date = isset($item['start_date']) ? $item['start_date'] : null;
                    $end_date = isset($item['end_date']) ? $item['end_date'] : null;
                    $result = $this->supplier->update_prices_table($page_index, $start_date, $end_date);
                    return isset($result['meta']) ? $result['meta'] : false;
                    break;

                case 'brands':
                    // TODO: loop through current woo product and publish/unpublish allowed brands
                    // $result = $this->supplier->import_products_page($page_index);
                    break;
                // case 'price_table_update':
                //     break;

                // case 'categories':
                //     $result = $this->supplier->import_products_page($page_index, 'categories');
                //     return isset($result['meta']) ? $result['meta'] : false;
                //     break;

                case 'products':
                    $result = $this->supplier->import_products_page($page_index);
                    return isset($result['meta']) ? $result['meta'] : false;
                    break;

                case 'repair':
                    $result = $this->supplier->repair_products_page($page_index);
                    return isset($result['meta']) ? $result['meta'] : false;
                    break;

                // case 'images':
                //     // $result = $this->supplier->import_images_page($page_index);
                //     // return isset($result['meta']) ? $result['meta'] : false;
                //     break;

                default:
                    return false;
            }
        }
        // custom code
        $this->supplier->log("do_task(" . json_encode($this->item) . ") {$this->action}");
        return false;
    }

    protected function should_continue()
    {
        // custom code
        // $this->supplier->log("XX should_continue()"); // . json_encode(['task_result' => $this->task_result, 'item' => $this->item], JSON_PRETTY_PRINT) . ")");
        // $this->supplier->log("--> task_result " . json_encode($this->task_result));
        // $this->supplier->log("--> item " . json_encode($this->item));

        if ($this->stop_requested()) {
            $this->cancel();
            $this->clear_stop();
            return false;
        }

        if ($this->task_result) {

            $page_index = $this->item['page_index'];
            // $action = $this->item['action'];
            $total_pages = $this->task_result['total_pages'];

            // $this->supplier->log("page_index {$page_index} total_pages {$total_pages}");

            if ($page_index < $total_pages) {
                // $next = [ ...$this->item, 'page_index' => $page_index + 1, 'total_pages' => $total_pages];
                // $this->supplier->log('NEXT '.json_encode($next, JSON_PRETTY_PRINT));
                return [ ...$this->item, 'page_index' => $page_index + 1, 'total_pages' => $total_pages];
            } else {
                $this->supplier->log("END {$this->action}");
                return false;
            }
        } else {
            $this->supplier->log("task result empty END {$this->action}");
        }
    }
}
