<?php

// include_once __DIR__ . '/utils/Report.php';
// include_once __DIR__ . '/actions/import_western.php';
// include_once __DIR__ . '/western/get_western_products_page.php';
// include_once __DIR__ . '/western/get_western_attributes_from_product.php';
// include_once __DIR__ . '/western/western_utils.php';

// include_once __DIR__ . '/utils/print_utils.php';
// include_once __DIR__ . '/test/wps_page_action.php';
// include_once __DIR__ . '/test/wps_post_action.php';
// include_once __DIR__ . '/test/woo_repair_action.php';
// include_once __DIR__ . '/test/woo_product_action.php';
// include_once __DIR__ . '/test/wps_import_action.php';
// include_once __DIR__ . '/test/wps_product_action.php';
// include_once __DIR__ . '/test/clear_logs_action.php';
// include_once __DIR__ . '/test/stock_check_action.php';

// include_once WP_PLUGIN_DIR . '/ci-store-plugin/western/wps_stock_check.php';
// include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/JobData.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/FileCache.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Job.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/JobWorker.php';


class ProductImporter extends JobWorker
{
    public $wp_action_name = '';

    public function __construct()
    {
        parent::__construct('import_product');
    }

    public function task()
    {
        error_log('ProductImporter::task()');
        // $data = $this->get_data();
        $i = 0;
        $is_complete = true;
        sleep(1);
        $data = $this->get_data();
        $data['result'] = 0;
        $data['is_running'] = true;
        $this->put_data($data);
        // $this->update_result(0);

        sleep(5);
        $data = $this->get_data();
        $is_stopping = $data['is_stopping'];
        error_log('is_stopping='.($is_stopping ? 'true' : 'false'));


        sleep(5);
        $data = $this->get_data();
        $is_stopping = $data['is_stopping'];
        error_log('is_stopping='.($is_stopping ? 'true' : 'false'));


        sleep(5);
        $data = $this->get_data();
        $is_stopping = $data['is_stopping'];
        error_log('is_stopping='.($is_stopping ? 'true' : 'false'));


        sleep(5);
        $data = $this->get_data();
        $is_stopping = $data['is_stopping'];
        error_log('is_stopping='.($is_stopping ? 'true' : 'false'));

        $this->complete();

        // $this->task_loop(0);

        // while ($i < 10) {
        //     $data = $this->get_data();
        //     error_log('action loop is_stopping=' . ($this->is_stopping() ? 'true' : 'false'));
        //     sleep(2);
        //     $i++;

        //     $data['is_running'] = true;
        //     $data['result'] = $i;
        //     $data['updated'] = gmdate("c");
        //     $this->put_data($data);

        //     // $this->update_result($i);
        //     // error_log('--> ' . json_encode($data, JSON_PRETTY_PRINT));

        //     // $data['result'] = $i;
        //     // $data['active'] = gmdate("c");
        //     // $this->put_data($data);
        //     if ($this->is_stopping()) {
        //         // if ($data['is_stopping']) {
        //         $is_complete = false;
        //         break;
        //     }
        // }
        // error_log('action loop break');

        // if ($is_complete) {
        //     error_log('action complete');
        //     $this->complete();
        // } else {
        //     error_log('action stopped');
        //     $this->stop(true);
        // }
    }

    public function task_loop($result)
    {
        $result++;
        $data = $this->get_data();
        $is_stopping = $this->is_stopping();
        error_log('task_loop() is_stopping=' . ($is_stopping ? 'true' : 'false'));
        sleep(2);
        $data['is_running'] = true;
        $data['result'] = $result;
        $data['updated'] = gmdate("c");
        $this->put_data($data);
        $is_complete = $result > 10;

        if ($is_complete) {
            $this->complete();
        } else if ($is_stopping) {
            $this->stop(true);
        } else {
            $this->task_loop($result);
        }
    }
}

class ReactSubpage
{
    public $key = '';
    public $page_title = '';
    public $parent_slug = '';
    public $screen_prefix = '';
    public $action;
    // private $DEFAULT_IMPORT_PRODUCTS = [
    //     'is_running' => false,
    //     'is_complete' => false,
    //     'started' => null,
    //     'stopped' => null,
    //     'is_stopping' => false,
    //     'is_stalled' => false,
    // ];
    public $job;

    public function __construct($key, $page_title, $parent_slug, $action, $screen_prefix)
    {
        $this->action = $action;
        $this->screen_prefix = $screen_prefix;
        $this->key = $key;
        $this->page_title = $page_title;
        $this->parent_slug = $parent_slug;
        $this->job = new ProductImporter(); // new Job($this->key, $this->action);
        add_action('admin_menu', array($this, 'add_submenu'), 15);
        add_action('admin_enqueue_scripts', array($this, 'enqueue_script'));
        add_action('wp_ajax_' . $key . '_api', array($this, 'handle_ajax'));
    }

    // public function runAction()
    // {
    //     // if (is_callable($this->action)) {
    //     // $job = new JobData($this->key, $this->DEFAULT_IMPORT_PRODUCTS);
    //     // $job = new Job($this->key, $this->action);
    //     if ($this->job->start()) {
    //         // if ($job->data()['is_running'] !== true) {
    //         //     call_user_func($this->action);
    //         return true;
    //     }
    //     // }
    //     error_log('runAction() failed');
    //     return false;
    // }

    public function add_submenu()
    {
        add_submenu_page(
            $this->parent_slug,
            $this->page_title,
            $this->page_title,
            'manage_options',
            $this->parent_slug . '-' . $this->key,
            array($this, 'render_page'),
        );
    }

    public function render_page()
    {
        $container_id = $this->parent_slug . '-' . $this->key;
        ?>
            <div id="<?=$container_id?>"></div>
            <script>
                addEventListener("DOMContentLoaded", () => CIImportProducts.render("<?=$container_id?>"));
            </script>
        <?php //
    }

    public function enqueue_script()
    {
        $current_screen = get_current_screen();
        $screen = $this->screen_prefix . $this->parent_slug . '-' . $this->key; // 'ci-store_page_ci-store-plugin-page-import_products'
        // Check if the current screen is your desired subpage
        if ($current_screen && $current_screen->id === $screen) {
            wp_enqueue_script('job-ui-script-' . $this->key, plugin_dir_url(__FILE__) . '../dist/ci-import-products.js', array(), '1.0', true);
        }
    }

    public function handle_ajax()
    {
        $cmd = $_GET['cmd'];

        switch ($cmd) {
            case 'status':
                $is_stopping = $this->job->is_stopping();
                $data = $this->job->get_data();
                wp_send_json([...$data, '__is_stopping' => $is_stopping]);

                // wp_send_json($this->job->get_data());
                break;

            case 'start':
                error_log('cmd::start');
                wp_send_json($this->job->start());
                break;

            case 'resume':
                wp_send_json($this->job->resume());
                break;

            case 'stop':
                error_log('cmd::stop');
                wp_send_json($this->job->stop());
                break;

            case 'hack':
                wp_send_json($this->job->get_data());
                break;

            default:
                wp_send_json(['error' => 'no cmd']);
        }
        wp_die();
    }
}

function doWork()
{
    global $import_products_job;
    $job = $import_products_job->job;

    // error_log('START doWork()');
    // $i = 0;
    // $is_complete = false;
    // $job->update(['count' => 0]);

    // while ($i < 100) {
    //     error_log('runAction() loop');
    //     $is_stopping = $job->data()['is_stopping'];

    //     // $job = new JobData('import_products');
    //     // $job->tick('products');

    //     if ($is_stopping) {
    //         error_log('runAction() break loop');
    //         break;
    //     } else if ($i > 10) {
    //         $is_complete = true;
    //         break;
    //     } else {
    //         sleep(2);
    //     }
    //     $data = $job->data();
    //     $job->update(['count' => $data['count']++]);
    //     $i++;
    // }
    // error_log('END doWork()');
    // if ($is_complete) {
    //     $job->complete_action();
    // } else {
    //     $job->stop_action();
    // }
}

// Instantiate the class to trigger the constructor and set up the actions
$import_products_job = new ReactSubpage('import_products', 'Import Products', 'ci-store-plugin-page', 'doWork', 'ci-store_page_');

// function render_ci_store_plugin_page_import_products()
// {

// }

// add submenu item to side nav
// function admin_menu_ci_store_import_products()
// {
//     add_submenu_page('ci-store-plugin-page', 'Import Products', 'Import Products', 'manage_options', 'ci-store-plugin-page-import-products', 'render_ci_store_plugin_page_import_products');
// }

// need a lower priority so it executes after the main nav item is added
// add_action('admin_menu', 'admin_menu_ci_store_import_products', 15);

// function enqueue_script_for_import_products()
// {
//     $current_screen = get_current_screen();

//     // Check if the current screen is your desired subpage
//     if ($current_screen && $current_screen->id === 'ci-store_page_ci-store-plugin-page-import-products') {
//         // Enqueue your script here
//         wp_enqueue_script('ci-ui-script-import-products', plugin_dir_url(__FILE__) . '../dist/ci-import-products.js', array(), '1.0', true);
//     }
// }

// Hook the enqueue function to admin_enqueue_scripts
// add_action('admin_enqueue_scripts', 'enqueue_script_for_import_products');

// $DEFAULT_IMPORT_PRODUCTS = [
//     'is_running' => false,
//     'is_complete' => false,
//     'started' => null,
//     'stopped' => null,
//     'is_stopping' => false,
//     'is_stalled' => false,
// ];

// // create ajax service
// function handle_stock_check_api()
// {
//     global $DEFAULT_IMPORT_PRODUCTS;
//     $cmd = $_GET['cmd'];

//     switch ($cmd) {
//         case 'status':
//             wp_send_json(get_stock_check_info());
//             break;

//         case 'start_stock_check':
//             run_wps_stock_check();
//             wp_send_json(get_stock_check_info());
//             break;

//         case 'stop_stock_check':
//             request_stop_stock_check();
//             wp_send_json(get_stock_check_info());
//             break;

//         case 'resume_stock_check':
//             wps_stock_check_resume();
//             wp_send_json(get_stock_check_info());
//             break;

//         case 'hack_stock_check':
//             wp_send_json(get_stock_check_info());
//             break;

//         case '/job/import/status':
//             $job = new JobData('import_products', $DEFAULT_IMPORT_PRODUCTS);
//             wp_send_json($job->data);
//             break;

//         case '/job/import/start':
//             $job = new JobData('import_products', $DEFAULT_IMPORT_PRODUCTS);
//             $job->save([
//                 'is_running' => true,
//                 'is_complete' => false,
//                 'is_stopping' => false,
//                 'is_stalled' => false,
//                 'started' => gmdate("c"),
//                 'stopped' => null,
//             ]);
//             wp_send_json($job->data);
//             break;

//         case '/job/import/stop':
//             $job = new JobData('import_products', $DEFAULT_IMPORT_PRODUCTS);
//             $job->save([
//                 'is_running' => false,
//                 'is_stopping' => true,
//                 'stopped' => gmdate("c"),
//             ]);
//             wp_send_json($job->data);
//             break;

//         default:
//             return wp_send_json(get_stock_check_info());
//     }
//     wp_die();
// }

// add_action('wp_ajax_stock_check_api', 'handle_stock_check_api');