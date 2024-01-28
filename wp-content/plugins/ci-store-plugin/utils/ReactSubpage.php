<?php

class ReactSubpage
{
    public $key = '';
    public $page_title = '';
    public $parent_slug = '';
    public $screen_prefix = '';

    public function __construct($key, $page_title, $parent_slug, $screen_prefix)
    {
        $this->screen_prefix = $screen_prefix;
        $this->key = $key;
        $this->page_title = $page_title;
        $this->parent_slug = $parent_slug;
        add_action('admin_menu', array($this, 'add_submenu'), 15);
        add_action('admin_enqueue_scripts', array($this, 'enqueue_script'));
    }

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
                addEventListener("DOMContentLoaded", () => <?='ci_' . $this->key?>.render("<?=$container_id?>"));
            </script>
        <?php //
    }

    public function enqueue_script()
    {
        $current_screen = get_current_screen();
        $screen = $this->screen_prefix . $this->parent_slug . '-' . $this->key;
        // Check if the current screen is your desired subpage
        if ($current_screen && $current_screen->id === $screen) {
            wp_enqueue_script('react-ui-script-' . $this->key, plugin_dir_url(__FILE__) . '../dist/ci_' . $this->key . '.js', array(), '1.0', true);
        }
    }
}