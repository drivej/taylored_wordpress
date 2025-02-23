<?php
    namespace CIStore\Admin;

    use function CIStore\Utils\get_age;

    function copyright()
    {
    ?>
    <p>&copy; Contento Interactive, 2024. All rights reserved.</p>
    <p>This WordPress plugin and its code are the property of Contento Interactive Group, LLC. Unauthorized copying, alteration, distribution, or use of this code in any form without express written permission from Contento Interactive Group, LLC is strictly prohibited.</p>
    <p><?php echo CI_VERSION?></p>
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

        function custom_manage_product_posts_columns($columns)
        {
            // Add last imported column to admin products table
            $columns['last_import'] = 'Imported';
            return $columns;
        }

        function custom_manage_product_posts_custom_column($column, $post_id)
        {
            // Show age of product since last import
            if ($column === 'last_import') {
                $imported = get_post_meta($post_id, '_ci_import_timestamp', true);
                $text     = $imported ? get_age($imported)->format('%d d') : '?';
                echo $text;
        }
    }