<?php
/**
 * The sidebar containing the main widget area.
 *
 * @package storefront
 */

if ( ! is_active_sidebar( 'sidebar-1' ) ) {
	return;
}
?>


<div id="secondary" class="widget-area" role="complementary">



	<?php dynamic_sidebar( 'sidebar-1' ); ?>
	<!-- <?php //$terms = get_terms(array('taxonomy' => 'product_tag', 'hide_empty' => true)); ?>
	<div class="product-tags"><ul>
		<?php //foreach ( $terms as $term ) { ?>
			<li><a href="<?php //echo get_term_link( $term->term_id, 'product_tag' ); ?> " rel="tag"><?php //echo $term->name; ?></a></li>
		<?php //} ?>
		</ul>
	</div>

-->
	
	
</div><!-- #secondary -->
