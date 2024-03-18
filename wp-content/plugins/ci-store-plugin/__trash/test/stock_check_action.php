<?php

include_once __DIR__ . './../utils/print_utils.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/western/wps_stock_check.php';

function stock_check_action()
{
    $is_running = is_running_stock_check();
    $info = get_option('wps_stock_check_info');
    $should_stop = get_option('wps_stock_check_should_stop', false);
    printData(['is_running' => $is_running, 'info' => $info, 'should_stop' => $should_stop]);

    if (is_running_stock_check()) {

        $confirm_stop = isset($_GET['confirm_stop_stock_check']) ? (bool) $_GET['confirm_stop_stock_check'] : false;
        if ($confirm_stop) {
            update_option('wps_stock_check_should_stop', true);
        }

        $force_stop = isset($_GET['force_stop_stock_check']) ? (bool) $_GET['force_stop_stock_check'] : false;
        if ($force_stop) {
            delete_option('wps_stock_check_info');
            delete_option('wps_stock_check_should_stop');
            delete_option('wps_stock_check_in_progress');
        }

        printLine('running stock check');
        ?>
        <div class="p-3">
            <form id="ci_delete_logs_form" onsubmit="return confirm('Are you sure?');">
                <input type="hidden" name="cmd" value="stock_check" />
                <input type="hidden" name="page" value="ci-store-plugin-page-test" />
                <input type="hidden" name="confirm_stop_stock_check" value="1" />
                <button>Stop Stock Check</button>
            </form>
        </div>
        <div class="p-3">
            <form id="ci_delete_logs_form" onsubmit="return confirm('Are you sure?');">
                <input type="hidden" name="cmd" value="stock_check" />
                <input type="hidden" name="page" value="ci-store-plugin-page-test" />
                <input type="hidden" name="force_stop_stock_check" value="1" />
                <button>Force Stop Stock Check</button>
            </form>
        </div>
        <?php

    } else {
        $confirm = isset($_GET['confirm_stock_check']) ? (bool) $_GET['confirm_stock_check'] : false;
        if ($confirm) {
            printLine('run stock check');
            run_wps_stock_check();
        } else {
            ?>
            <div class="p-3">
                <form id="ci_delete_logs_form" onsubmit="return confirm('Are you sure?');">
                    <input type="hidden" name="cmd" value="stock_check" />
                    <input type="hidden" name="page" value="ci-store-plugin-page-test" />
                    <input type="hidden" name="confirm_stock_check" value="1" />
                    <button>Run Stock Check</button>
                </form>
            </div>
            <?php

            $total_products = get_western_products_count();
            printData(['total_products' => $total_products]);
        }
    }
}

function ajax_stock_check_handler()
{
    wp_send_json(['is_running' => is_running_stock_check()]);
}

add_action('wp_ajax_stock_check_handler', 'ajax_stock_check_handler');