<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/CronJob.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Supplier_Background_Process.php';

trait Supplier_T14_Cronjob
{
    public function start_cronjob($action)
    {
        $this->log("start_cronjob($action)");
        $result = false;

        switch ($action) {
            case 'price_table':
                $result = $this->background_process->start(['action' => $action, 'page_index' => 1]);
                break;

            case 'price_table_update':
                $yesterday = new DateTime('yesterday');
                $yesterday_formatted = $yesterday->format('Y-m-d');
                // Get the date 2 days before yesterday
                $day_before_yesterday = clone $yesterday;
                $day_before_yesterday->modify('-2 days');
                $day_before_yesterday_formatted = $day_before_yesterday->format('Y-m-d');
                $result = $this->background_process->start(['action' => $action, 'page_index' => 1, 'start_date' => $yesterday_formatted, 'end_date' => $day_before_yesterday_formatted]);
                break;

            case 'categories':
                $result = $this->background_process->start(['action' => $action, 'page_index' => 1]);
                break;

            case 'products':
                $result = $this->background_process->start(['action' => $action, 'page_index' => 1]);
                break;

            case 'images':
                break;
        }
        // // get yesterdays date
        // $yesterday = new DateTime('yesterday');
        // $yesterday_formatted = $yesterday->format('Y-m-d');

        // // Get the date 2 days before yesterday
        // $day_before_yesterday = clone $yesterday;
        // $day_before_yesterday->modify('-2 days');
        // $day_before_yesterday_formatted = $day_before_yesterday->format('Y-m-d');

        // $result = $this->background_process->start(['action' => 'price_table', 'page_index' => 1, 'start_date' => $yesterday_formatted, 'end_date' => $day_before_yesterday_formatted]);
        // $result = $this->background_process->start(['action' => 'categories', 'page_index' => 1]);
        // $result = $this->background_process->start(['action' => 'products', 'page_index' => 1]);
        // $result = $this->cronjob->start(['page_index' => 1, 'mode' => 'products']);
        return ['message' => 'start_cronjob()', 'start' => $result];
    }

    public function stop_cronjob()
    {
        $this->log('stop_cronjob()');
        // $this->cronjob->stop();
        // $this->background_process->cancel();
        // if (isset($this->background_process)) {
        return $this->background_process->cancel();
        // }
        // return false;
    }

    public function continue_cronjob()
    {
        return $this->background_process->continue();
    }

    public function get_cronjob_status()
    {
        return $this->background_process->get_status();
        // $is_running = $this->background_process->is_process_running();
        // return ['is_running' => $is_running];
        // return ['cronjob' => $this->cronjob->get_status(), 'task' => $this->background_process->get_status()];
    }

    // TODO: delete run_cronjob() - everywhere
    // public function run_cronjob($args)
    // {
    //     return false;
    //     $args_str = json_encode(['args' => $args]);
    //     $start_time = microtime(true);
    //     $this->cronjob->log("run_cronjob() start args:{$args_str}");
    //     $mode = $args['mode'];
    //     $page_index = $args['page_index'];

    //     if ($mode === 'products') {
    //         $result = $this->import_products_page($page_index);
    //     }

    //     if ($mode === 'images') {
    //         $result = $this->import_images_page($page_index);
    //     }

    //     $end_time = microtime(true);
    //     $exetime = round($end_time - $start_time);
    //     $this->cronjob->log("run_cronjob() end args:{$args_str} exe:{$exetime}");
    //     return $result;
    // }

    // expects $result = ['meta' => [...]]
    public function complete_cronjob($result, $args)
    {
        $in = json_encode(['result' => $result, 'args_in' => $args]);
        $this->cronjob->log("complete_cronjob() IN {$in}");
        if ($this->cronjob->should_stop()) {
            $this->cronjob->stop();
            return;
        }
        $total_pages = isset($result['meta']['total_pages']) ? $result['meta']['total_pages'] : 0;
        $page_index = $args['page_index'];
        $next_page = $page_index + 1;

        if ($total_pages > $next_page) {
            $args['page_index'] = $next_page;
            $out = json_encode(['result' => $result, 'args_out' => $args]);
            $this->cronjob->log("complete_cronjob() OUT {$out}");
            // $this->cronjob->log('continue() ' . json_encode(['result' => $result, 'args' => $args]));
            $this->cronjob->start($args);
        } else {
            // $this->cronjob->log('complete_cronjob() ' . json_encode(['result' => $result, 'args' => $args]));
            $this->cronjob->stop();
        }
    }
}
