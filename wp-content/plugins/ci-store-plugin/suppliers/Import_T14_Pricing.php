<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/CronJob.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Supplier_Background_Process.php';

class Import_T14_Pricing extends Supplier_Background_Process
{
    // protected Supplier_t14 $supplier;

    public function __construct()
    {
        $supplier_key = 't14';
        $supplier = \CI\Admin\get_supplier($supplier_key);
        parent::__construct($supplier, $supplier_key . "_pricing");
    }

    protected function do_task($item)
    {
        if ($this->stop_requested()) {
            $this->clear_stop();
            return false;
        }
        $page_index = isset($item['page_index']) ? $item['page_index'] : false;
        $this->supplier->log("Import_T14_Pricing::do_task() page_index:{$page_index}");

        if ($page_index) {
            $result = $this->supplier->update_prices_table($page_index);
            return isset($result['meta']) ? $result['meta'] : false;
        }
        return false;
    }

    protected function should_continue()
    {
        if ($this->stop_requested()) {
            $this->cancel();
            $this->clear_stop();
            return false;
        }

        if ($this->task_result) {
            $page_index = $this->item['page_index'];
            $total_pages = $this->task_result['total_pages'];

            if ($page_index < $total_pages) {
                return ['page_index' => $page_index + 1, 'total_pages' => $total_pages];
            } else {
                $this->supplier->log("END {$this->action}");
                return false;
            }
        } else {
            $this->supplier->log("task result empty END");
        }
    }
}
