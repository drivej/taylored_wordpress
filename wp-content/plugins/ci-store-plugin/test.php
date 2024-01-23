<?php

include_once __DIR__ . '/utils/Report.php';
include_once __DIR__ . '/actions/import_western.php';
include_once __DIR__ . '/western/get_western_products_page.php';
include_once __DIR__ . '/western/get_western_attributes_from_product.php';
include_once __DIR__ . '/western/western_utils.php';

include_once __DIR__ . '/utils/print_utils.php';
include_once __DIR__ . '/test/wps_page_action.php';
include_once __DIR__ . '/test/wps_post_action.php';
include_once __DIR__ . '/test/woo_repair_action.php';
include_once __DIR__ . '/test/woo_product_action.php';
include_once __DIR__ . '/test/wps_import_action.php';
include_once __DIR__ . '/test/wps_product_action.php';
include_once __DIR__ . '/test/clear_logs_action.php';
include_once __DIR__ . '/test/stock_check_action.php';

$action_handlers = [
    "wc_api",
    "wp_post",
    "woo_product",
    "wps_product" ,
    "woo_repair",
    "wps_import",
    "wps_page",
    "clear_logs",
    "stock_check"
];

function render_ci_store_plugin_test()
{
    global $action_handlers;
    $cmd = isset($_GET['cmd']) ? $_GET['cmd'] : '';
    $item_id = isset($_GET['item_id']) ? $_GET['item_id'] : '';

    ?>
    <div class="p-3">
        <form id="ci_store_plugin_test_form">
            <select name="cmd" value="<?=$cmd?>">
                <?
                foreach($action_handlers as $action){
                    if(is_callable($action.'_action')){
                        echo '<option value="'.$action.'" '.($cmd===$action ? 'selected' : '').'>'.$action.'</option>';
                    }
                }
                ?>
            </select>
            <input type="hidden" name="page" value="ci-store-plugin-page-test" />
            <label for="item_id">item id</label>
            <input name="item_id" value="<?=$item_id?>" />
            <button>go</button>
        </form>
    </div>
    <script>
        const $form = document.getElementById('ci_store_plugin_test_form');
        const $select = $form.querySelector('[name="cmd"]');
        const $label = $form.querySelector('label[for="item_id"]');
        const $input = $form.querySelector('input[name="item_id"]');

        function handleChangeSelect(e){
            $label.classList.remove('d-none');
            $input.classList.remove('d-none');

            switch(e.currentTarget.value){
                case 'wc_api' :
                    $label.classList.add('d-none');
                    $input.classList.add('d-none');
                    break;
                case 'woo_product' :
                    $label.innerText = 'Woo SKU';
                    break;
                case 'wps_product' :
                case 'wps_import' :
                case 'woo_repair' :
                    $label.innerText = 'WPS ID';
                    break;
                case 'wp_post' :
                    $label.innerText = 'Post ID';
                    break;
                case 'wps_page' :
                    $label.innerText = 'Cursor';
                    break;
            }
        }
        $select.addEventListener('change', handleChangeSelect);
        handleChangeSelect({currentTarget: $select});
    </script>
    <?

    if(is_callable($cmd.'_action')){
        call_user_func($cmd.'_action', $item_id);
    } else {
        print('fail');
    }
}

// add submenu item to side nav
function admin_menu_cistore_test()
{
    add_submenu_page('ci-store-plugin-page', 'Test', 'Test', 'manage_options', 'ci-store-plugin-page-test', 'render_ci_store_plugin_test');
}

// need a lower priority so it executes after the main nav item is added
add_action('admin_menu', 'admin_menu_cistore_test', 15);