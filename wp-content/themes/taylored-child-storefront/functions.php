<?php 
add_action( 'wp_enqueue_scripts', 'my_theme_enqueue_styles' );
function my_theme_enqueue_styles() {
    $parenthandle = 'storefront-style'; // This is 'storefront-style' for the Storefront theme.
    $theme = wp_get_theme();
    wp_enqueue_style( $parenthandle, get_template_directory_uri() . '/style.css', 
        array(), // if the parent theme code has a dependency, copy it to here
        $theme->parent()->get('Version')
    );
    wp_enqueue_style( 'custom-style', get_stylesheet_uri(),
        array( $parenthandle ),
        $theme->get('Version') // this only works if you have Version in the style header
    );
}

/*
function custom_content_below_title() {
       if (is_product_category() || is_product_tag() || (isset($queried_object->taxonomy) && $queried_object->taxonomy === 'vehicles')) {
        echo '<div class="faceted-pagination">';
		echo do_shortcode('[facetwp facet="sort_"]');
		echo 'Products:';
        echo do_shortcode('[facetwp counts="true"]'); // Replace with your actual shortcode.
         echo do_shortcode('[facetwp facet="pagination"]');
        echo '</div>';
    }
}
add_action('woocommerce_archive_description', 'custom_content_below_title', 15);

*/



/* kriss added to see about using custom attributes in facetwp plugin or search bar 
function custom_searchable_attributes( $query ) {
    if ( ! is_admin() && $query->is_search() && $query->is_main_query() ) {
        // Modify the search query to include custom attributes
        add_filter( 'posts_search', 'custom_product_search', 10, 2 );
    }
}
add_action( 'pre_get_posts', 'custom_searchable_attributes' );

function custom_product_search( $search, $query ) {
    global $wpdb;

    if ( $query->is_search() && ! is_admin() ) {
        // Here, we customize the SQL query to include custom attributes
        $search = $search . " OR EXISTS (
            SELECT * FROM {$wpdb->postmeta}
            WHERE {$wpdb->posts}.ID = {$wpdb->postmeta}.post_id
            AND {$wpdb->postmeta}.meta_key LIKE 'attribute_%'
            AND {$wpdb->postmeta}.meta_value LIKE '%" . esc_sql( $query->query_vars['s'] ) . "%'
        )";
    }

    return $search;
}*/
?>