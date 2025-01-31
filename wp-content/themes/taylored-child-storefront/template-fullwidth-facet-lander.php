<?php
/**
 * The template for displaying full width pages.
 *
 * Template Name: Full width FACET lander
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
			<div class="pagination-facets">
	  			 <?php echo do_shortcode('[facetwp facet="pagination"]'); ?>
				</div>
			<section class="page-section">
	   <div class="<?php echo $class;?> detail-content">
			 <header class="entry-header deal">			
				  <h1 style="clear:none;">Advance Search</h1>
			 </header>

		

							   <section id="rest-results">
								   
								<div class="selections">You Selected:</strong> <?php echo facetwp_display('selections'); ?></div>
								<hr>
								<?php echo do_shortcode('[facetwp template="product_example"]'); ?>
							</section>
				
				






          </div> <!-- /.end of detail-content -->
	
	


	<div class="pagination-facets">
	  			 <?php echo do_shortcode('[facetwp facet="pagination"]'); ?>
				</div>
</section><!-- /.end of section -->
		
		
	
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

		</main><!-- #main -->
	</div><!-- #primary -->
<div id="secondary" class="widget-area" role="complementary">
	<div class="adv-search-container" style="width:100%;max-width:1200px;">
							<div id="terms-name-static" style="border-top:1px solid #fff;">
								<h4>Search by...</h4>
								<div id="seach-input">
									<?php the_widget('WP_Widget_Search'); ?>
									<div style="margin-top:-25px;margin-left:10px;"> Enter the product name into the search field above and press your keyboard "enter" key. Narrow your search by using the filter checkboxes below or <a href="/shop/"> Click Here to Browse All products</a>
									</div>
								</div>
							</div>
					   </div>
	<h2 style="clear:none;">Filter by.... </h2>

							<div class="col-6 col-md-3">
								  <div class="adv-search-container" style="width:100%;max-width:1200px;">
									  <h4 id="cuisine">Categories</h4>
									  	
											<?php echo do_shortcode('[facetwp facet="category"]'); ?>
										
									  		<h4 id="geo">Tags</h4>
											<?php echo do_shortcode('[facetwp facet="tags"]'); ?>
									  
									   <h4 id="features">Color</h4>
											<?php echo do_shortcode('[facetwp facet="color"]'); ?>

								

										<h4 id="meals">Meals Served</h4>
											<?php //echo do_shortcode('[facetwp facet="meals_served"]'); ?>

										<h4 id="spec">Specialties</h4>
											<?php //echo do_shortcode('[facetwp facet="cuisine"]'); ?>

								</div>      
							</div>
</div>



<?php
get_footer();
