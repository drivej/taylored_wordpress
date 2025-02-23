<?php

namespace CIStore\Utils;

add_action('plugins_loaded', 'CIStore\Utils\check_for_woocommerce', 10);

function check_for_woocommerce()
{
    if (!class_exists('WooCommerce')) {
        add_action('admin_notices', 'CIStore\Utils\woocommerce_not_installed_notice');
        deactivate_plugins(plugin_basename(CI_STORE_PLUGIN_FILE)); // Deactivate your plugin
    } else {
        // WooCommerce is active, run your plugin code
        add_action('init', 'CIStore\Utils\your_plugin_init_function');
    }
}

function woocommerce_not_installed_notice()
{
    ?>
    <div class="error">
        <p><?php _e('Your Plugin requires WooCommerce to be installed and active.', 'your-plugin-textdomain');?></p>
    </div>
    <?php
}

function your_plugin_init_function()
{
    // Your plugin's initialization code here
}