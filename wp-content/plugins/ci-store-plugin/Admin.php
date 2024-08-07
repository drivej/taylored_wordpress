<?php

namespace CIStore\Admin;

function copyright()
{
    ?>
    <p>&copy; Contento Interactive, 2024. All rights reserved.</p>
    <p>This WordPress plugin and its code are the property of Contento Interactive Group, LLC. Unauthorized copying, alteration, distribution, or use of this code in any form without express written permission from Contento Interactive Group, LLC is strictly prohibited.</p>
    <?php
}

function create_admin_menu_error()
{
    add_menu_page('CI Store Plugin', 'CI Store', 'manage_options', 'ci-store-plugin-page', 'CIStore\Admin\render_ci_store_plugin_ui_error');
}

function create_admin_menu_restricted()
{
    add_menu_page('CI Store Plugin', 'CI Store', 'manage_options', 'ci-store-plugin-page', 'CIStore\Admin\render_ci_store_plugin_ui_restricted');
}

function render_ci_store_plugin_ui_error()
{
    ?>
    <div id='ci-store-plugin-container'></div>
    <h1>Welcome to the CI Store Manager</h1>
    <?php copyright()?>
    <script>
        document.addEventListener("DOMContentLoaded", () => CIStore.render('ci-store-plugin-container'));
    </script>
    <?php
}

function render_ci_store_plugin_ui_restricted()
{
    ?>
    <div id='ci-store-plugin-container'></div>
    <h1>Welcome to the CI Store Manager</h1>
    <div class="error">
        <p>You do not have permission to use this feature.</p>
    </div>
    <?php copyright()?>
    <script>
        document.addEventListener("DOMContentLoaded", () => CIStore.render('ci-store-plugin-container'));
    </script>
    <?php
}

function woocommerce_not_installed_notice()
{
    ?>
    <div class="error">
        <p>CI Store Plugin requires WooCommerce to be installed and active.</p>
    </div>
    <?php
}

function create_admin_menu()
{
    add_menu_page('CI Store Plugin', 'CI Store', 'manage_options', 'ci-store-plugin-page', 'CIStore\Admin\render_ci_store_plugin_ui');
}

function render_ci_store_plugin_ui()
{
    ?>
    <div id='ci-store-plugin-container'></div>
    <h1>Welcome to the CI Store Manager</h1>
    <p>This plugin imports products from 3rd party suppliers into WooCommerce.</p>
    <hr />
    <?php copyright()?>
    <script>
        document.addEventListener("DOMContentLoaded", () => CIStore.render('ci-store-plugin-container'));
    </script>
    <?php
}