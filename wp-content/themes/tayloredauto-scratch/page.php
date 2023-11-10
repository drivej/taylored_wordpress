<?php 
/* template name: Default */
get_header(); 
?>


<section>
	
	<div class="position-relative overflow-hidden p-3 p-md-5 m-md-3 text-center bg-light">
      <div class="col-md-5 p-lg-5 mx-auto my-5">
        <h1><?php echo the_title(); ?></h1>
        <p class="lead font-weight-normal">And an even wittier subheading to boot. Jumpstart your marketing efforts with this example based on Apple's marketing pages.</p>
        <a class="btn btn-outline-secondary" href="#">Coming soon</a>
      </div>
      <div class="product-device box-shadow d-none d-md-block"></div>
      <div class="product-device product-device-2 box-shadow d-none d-md-block"></div>
    </div>
</section>


<section id="page-body" class="d-flex flex-column d-lg-grid gap-3 p-3">

	<div class="body-content">
		<?php echo the_content(); ?>
	</div>
	
	<div class="sidebar">
		<?php get_sidebar( 'right' ); ?>
	</div>
	
</section>

 	<?php get_footer(); ?>