<?php

if (!isset($content_width)) {
    $content_width = 1400; /* pixels */
}

if (!function_exists('taylored_theme_setup')) {
    /**
     * Sets up theme defaults and registers support for various
     * WordPress features.
     *
     * Note that this function is hooked into the after_setup_theme
     * hook, which runs before the init hook. The init hook is too late
     * for some features, such as indicating support post thumbnails.
     */
    function taylored_theme_setup()
    {

        /**
         * Add default posts and comments RSS feed links to <head>.
         */
        add_theme_support('automatic-feed-links');

        /**
         * Enable support for post thumbnails and featured images.
         */
        add_theme_support('post-thumbnails');
        //set_post_thumbnail_size( 1568, 9999 );

        // Add support for Block Styles.
        add_theme_support('wp-block-styles');

        /**
         * Add support for two custom navigation menus.
         */
        register_nav_menus(array(
            'primary' => __('Primary Menu', 'myfirsttheme'),
            'secondary' => __('Secondary Menu', 'myfirsttheme'),
        ));

        /**
         * Enable support for the following post formats:
         * aside, gallery, quote, image, and video
         */
        add_theme_support('post-formats', array('aside', 'gallery', 'quote', 'image', 'video'));

    }
}

add_action('after_setup_theme', 'taylored_theme_setup');

function custom_enqueue()
{
    //wp_enqueue_style('string $handle', mixed $src, array $deps, mixed $ver, string $meida );
    wp_enqueue_style('customstyle', get_template_directory_uri() . '/style.css', array(), '1.0.0', 'all');
    //wp_enqueue_style('string $handle', mixed $src, array $deps, mixed $ver, bol $in_footer );
    //wp_enqueue_script('customjs', get_template_directory_uri() . '/js/fatblog.js', array(), '1.0.0', 'true' );
}
add_action('wp_enqueue_scripts', 'custom_enqueue');

function sidebars_init()
{
    register_sidebar(array(
        'name' => __('Right', 'tayloredauto-scratch'),
        'id' => 'sidebar-right',
        'description' => __('Widgets in this area will be shown on all posts and pages.', 'tayloredauto-scratch'),
        'before_widget' => '<li id="%1$s" class="widget %2$s">',
        'after_widget' => '</li>',
        'before_title' => '<h2 class="widgettitle">',
        'after_title' => '</h2>',
    ));
}
add_action('widgets_init', 'sidebars_init');

function woocommerce_before_single_product()
{
    echo "<pre>" . json_encode(array("hook" => "woocommerce_before_single_product")) . "</pre>";
}
add_action('woocommerce_before_single_product', 'woocommerce_before_single_product');
