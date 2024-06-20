<?php
/**
 * The template for displaying full width pages.
 *
 * Template Name: Full width TAG lander
 *
 * @package storefront
 */

get_header(); ?>

	<div id="primary" class="content-area">
		<main id="main" class="site-main" role="main">

			<?php
			while ( have_posts() ) :
				the_post();

				do_action( 'storefront_page_before' );
			?>
	
		<div id="full-width-category-lander" class="entry-content">
			
				<?php the_content(); ?>

		</div><!-- .entry-content -->

			<?php 
				//get_template_part( 'content', 'page' );

				/**
				 * Functions hooked in to storefront_page_after action
				 *
				 * @hooked storefront_display_comments - 10
				 */
				do_action( 'storefront_page_after' );

			endwhile; // End of the loop.
			
			?>
			
			END REGULAR LOOP 
			
<?php
// Get the taxonomy field value
$taxonomy_terms = get_field('my_product_tags');

// Check if there are any terms selected
if( $taxonomy_terms ) {
    $term_names = array(); // Initialize an empty array to store term names
    foreach( $taxonomy_terms as $term ) {
        $term_names[] = $term->name; // Add term name to the array
    }
}

// Pagination
$paged = (get_query_var('paged')) ? get_query_var('paged') : 1;

$args = array(
    'post_type'      => 'product',
    'posts_per_page' => 10,
    'paged'          => $paged, // Define pagination parameter
    'tax_query'      => array(
        array(
            'taxonomy' => 'product_tag',
            'field'    => 'slug',
            'terms'    => $term_names,
        ),
    ),
);

$products_query = new WP_Query( $args );

if ( $products_query->have_posts() ) {
    echo '<ul>';
    while ( $products_query->have_posts() ) {
        $products_query->the_post();
        echo '<li><a href="' . get_permalink() . '">' . get_the_title() . '</a></li>';
    }
    echo '</ul>';
	
    // Pagination
    echo '<div class="pagination">';
    echo paginate_links(array(
        'total' => $products_query->max_num_pages,
        'current' => $paged,
        'prev_text' => __('&laquo; Previous'),
        'next_text' => __('Next &raquo;'),
    ));
    echo '</div>';
	
    wp_reset_postdata();
} else {
    echo 'No products found.';
}
?>
			
		</main><!-- #main -->
	</div><!-- #primary -->

<?php
get_footer();
