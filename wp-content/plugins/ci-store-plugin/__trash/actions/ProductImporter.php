<?php

require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/JobWorker.php';

class ProductImporter extends JobWorker
{
    public $wp_action_name = '';

    public function __construct()
    {
        parent::__construct('import_products');
    }

    public function task($is_resuming = false, $get = null)
    {
        error_log('ProductImporter::task() ' . ($is_resuming ? 'is_resuming' : ''));
        $is_complete = true;
        sleep(1);
        $data = $this->get_data();
        $i = 0;
        if ($is_resuming) {
            $i = $data['result'];
        } else {
            $data['result'] = $i;
        }
        $data['is_running'] = true;
        $this->put_data($data);

        while ($i < 100) {
            sleep(1);
            $data = $this->get_data();
            $is_stopping = $data['is_stopping'];

            if ($is_stopping) {
                $is_complete = false;
                break;
            } else {
                // error_log('ProductImporter:task() loop');
                $data['result'] = $i;
                $data['updated'] = gmdate("c");
                $data['progress'] = $i / 100;
                $data['is_running'] = true;
                $i++;
                $this->put_data($data);
            }
        }

        if ($is_complete) {
            error_log('ProductImporter:task() complete');
            $this->complete();
        } else {
            error_log('ProductImporter:task() stopped');
            $this->stop(true);
        }
    }
}
