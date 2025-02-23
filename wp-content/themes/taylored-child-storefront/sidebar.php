<?php
    /**
     * The sidebar containing the main widget area.
     *
     * @package storefront
     */

    if (! is_active_sidebar('sidebar-1')) {
        return;
    }
?>


<div id="secondary" class="widget-area" role="complementary">

	<form role="search" method="get" class="search-form" action="<?php echo esc_url(home_url('/')); ?>">
		<small>Search for your vehicle parts:</small>
		<label style="display:flex;">
			<span class="screen-reader-text"><?php echo _x('Search for:', 'label'); ?></span>
			<input 
				type="search" 
				class="search-field" 
				style="flex: 1 1 auto;"
				placeholder="<?php echo esc_attr_x('Search…', 'placeholder'); ?>"
				value="<?php echo get_search_query(); ?>" 
				name="s" 
			/>
		<input type="submit" class="search-submit" value="<?php echo esc_attr_x('Search', 'submit button'); ?>" />
		</label>
		<!-- Hidden input to hold the vehicle taxonomy value. populated by the vehicles.js -->
		<input type="hidden" name="product_vehicle" value="" id="product_vehicle_filter" />
	</form>

	<?php dynamic_sidebar('sidebar-1'); ?>
	<!--<?php //$terms = get_terms(array('taxonomy' => 'product_tag', 'hide_empty' => true)); ?>
	<div class="product-tags"><ul>
		<?php               //foreach ( $terms as $term ) { ?>
			<li><a href="<?php //echo get_term_link( $term->term_id, 'product_tag' ); ?> " rel="tag"><?php //echo $term->name; ?></a></li>
		<?php               //} ?>
		</ul>
	</div>

-->


</div><!-- #secondary -->
