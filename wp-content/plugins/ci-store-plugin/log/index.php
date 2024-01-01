<?php

require_once __DIR__ . '/logs_do_cmd.php';

// add ajax handler
add_action('wp_ajax_logs_do_cmd', 'logs_do_cmd');

// render html for page
function render_ci_store_plugin_logs()
{
    ?>
    <div id='ci-store-plugin-container-logs'></div>
    <script>
        document.addEventListener("DOMContentLoaded", () => CIStore.render('ci-store-plugin-container-logs', 'logs'));
    </script>
    <?php
}

// add submenu item to side nav
function admin_menu_cistore_logs()
{
    add_submenu_page('ci-store-plugin-page', 'Logs', 'Logs', 'manage_options', 'ci-store-plugin-page-logs', 'render_ci_store_plugin_logs');
}

// need a lower priority so it executes after the main nav item is added
add_action('admin_menu', 'admin_menu_cistore_logs', 15);