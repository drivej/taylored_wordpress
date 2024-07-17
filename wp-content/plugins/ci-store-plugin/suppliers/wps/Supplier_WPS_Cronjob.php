<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/CronJob.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Supplier_Background_Process.php';

trait Supplier_WPS_Cronjob
{
    public function start_cronjob($action)
    {
        $this->log("Supplier_WPS_Cronjob::start_cronjob($action)");
        $result = false;

        switch ($action) {
            case 'products':
                $result = $this->background_process->start(['action' => $action, 'page_index' => 1]);
                break;
        }
        return [
            'message' => 'start_cronjob()',
            'start' => $result,
            'is_running' => $this->background_process->is_running(),
            // 'identifier' => $this->background_process->identifier,
        ];
    }

    // public function stop_cronjob()
    // {
    //     return $this->background_process->cancel();
    // }

    // public function continue_cronjob()
    // {
    //     return $this->background_process->continue();
    // }

    // public function get_cronjob_status()
    // {
    //     return $this->background_process->get_status();
    // }

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
    // public function complete_cronjob($result, $args)
    // {
    //     $in = json_encode(['result' => $result, 'args_in' => $args]);
    //     $this->cronjob->log("complete_cronjob() IN {$in}");
    //     if ($this->cronjob->should_stop()) {
    //         $this->cronjob->stop();
    //         return;
    //     }
    //     $total_pages = isset($result['meta']['total_pages']) ? $result['meta']['total_pages'] : 0;
    //     $page_index = $args['page_index'];
    //     $next_page = $page_index + 1;

    //     if ($total_pages > $next_page) {
    //         $args['page_index'] = $next_page;
    //         $out = json_encode(['result' => $result, 'args_out' => $args]);
    //         $this->cronjob->log("complete_cronjob() OUT {$out}");
    //         // $this->cronjob->log('continue() ' . json_encode(['result' => $result, 'args' => $args]));
    //         $this->cronjob->start($args);
    //     } else {
    //         // $this->cronjob->log('complete_cronjob() ' . json_encode(['result' => $result, 'args' => $args]));
    //         $this->cronjob->stop();
    //     }
    // }
}
