<?php 
if (!defined('ABSPATH')) exit;


global $site_title, $site_description;
	
	$site_title = get_bloginfo( 'name' );
	$site_description = get_bloginfo( 'description' );
	



get_header(); 






?>



<?php the_content(); ?>



<?php get_footer(); ?>


