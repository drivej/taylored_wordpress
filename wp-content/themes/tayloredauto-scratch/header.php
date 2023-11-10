<!DOCTYPE html>
<?php global $site_title, $site_description; ?>
<html <?php language_attributes(); ?>>  
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">

	<title><?php wp_title(''); echo  $site_title ; ?> </title>
	<meta name="description" content="Page Description or <?php echo $site_description ; ?>">
	
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="profile" href="https://gmpg.org/xfn/11">
	<link href="/wp-content/themes/tayloredauto-scratch/bootstrap-5.3.2-dist/css/bootstrap.min.css" rel="stylesheet">

	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;900&family=Work+Sans:wght@400;700&display=swap" rel="stylesheet">

	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>

	
<main>
		
<div class="sticky-top">
	
	<nav id="top-bar" class="navbar navbar-expand-lg navbar-light bg-dark navbar-dark shadow">
    <div class="container-fluid">
     
    
      <div class="" id="navbar-content">
						<?php
				            wp_nav_menu( array(
				                'menu'              => 'secondary',
				                'theme_location'    => 'secondary',
				                'depth'             => 8,
				                'container'         => 'div',
				                'menu_class'        => 'navbar-nav ml-auto mb-0 mb-lg-0 d-flex flex-row',
				                'fallback_cb'       => 'wp_bootstrap_navwalker::fallback'
				              )
				            );
				        ?>
		</div>
		</div>
	</nav>
		
	
		
	<header class="py-3 border-bottom">
		<div class="container-fluid d-flex flex-wrap justify-content-center">
		  <a href="/" class="d-flex align-items-center mb-3 mb-lg-0 me-lg-auto link-body-emphasis text-decoration-none">
			<img src="<?php echo get_template_directory_uri(); ?>/theme-images/taylored-power-sports-logo.png" alt="Taylored Power Sports E-commerce Logo" width="258" height="51" class="img-fluid" />
		  </a>

		</div>
	  </header>



				
				
	

	
	<nav id="main-shop-menu" class="navbar navbar-expand-lg navbar-light bg-red navbar-dark shadow">
    <div class="container-fluid">
     
      <button class="navbar-toggler collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-content">
        <div class="hamburger-toggle">
          <div class="hamburger">
            <span>-</span>
            <span>-</span>
            <span>-</span>
          </div>
        </div>
      </button>
      <div class="collapse navbar-collapse" id="navbar-content">
						<?php
				            wp_nav_menu( array(
				                'menu'              => 'primary',
				                'theme_location'    => 'primary',
				                'depth'             => 8,
				                'container'         => 'div',
				                'menu_class'        => 'navbar-nav mr-auto ml-auto mb-0 mb-lg-0',
				                'fallback_cb'       => 'wp_bootstrap_navwalker::fallback'
				              )
				            );
				        ?>
		  <!--
          <li class="nav-item">
            <a class="nav-link active" aria-current="page" href="#">Home</a>
          </li>
          <li class="nav-item dropdown-hover  dropdown">
            <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown" data-bs-auto-close="outside">Multilevel</a>
            <ul class="dropdown-menu shadow">
              <li><a class="dropdown-item" href="#">Gallery</a></li>
              <li><a class="dropdown-item" href="blog.html">Blog</a></li>
              <li class="dropstart">
                <a href="#" class="dropdown-item dropdown-toggle" data-bs-toggle="dropdown">Submenu Left</a>
                <ul class="dropdown-menu shadow">
                  <li><a class="dropdown-item" href=""> Third level 1</a></li>
                  <li><a class="dropdown-item" href=""> Third level 2</a></li>
                  <li><a class="dropdown-item" href=""> Third level 3</a></li>
                  <li><a class="dropdown-item" href=""> Third level 4</a></li>
                  <li><a class="dropdown-item" href=""> Third level 5</a></li>
                </ul>
              </li>
              <li class="dropend">
                <a href="#" class="dropdown-item dropdown-toggle" data-bs-toggle="dropdown" data-bs-auto-close="outside">Submenu Right</a>
                <ul class="dropdown-menu shadow">
                  <li><a class="dropdown-item" href=""> Second level 1</a></li>
                  <li><a class="dropdown-item" href=""> Second level 2</a></li>
                  <li><a class="dropdown-item" href=""> Second level 3</a></li>
                  <li class="dropend">
                    <a href="#" class="dropdown-item dropdown-toggle" data-bs-toggle="dropdown">Let's go deeper!</a>
                    <ul class="dropdown-menu dropdown-submenu shadow">
                      <li><a class="dropdown-item" href=""> Third level 1</a></li>
                      <li><a class="dropdown-item" href=""> Third level 2</a></li>
                      <li><a class="dropdown-item" href=""> Third level 3</a></li>
                      <li><a class="dropdown-item" href=""> Third level 4</a></li>
                      <li><a class="dropdown-item" href=""> Third level 5</a></li>
                    </ul>
                  </li>
                  <li><a class="dropdown-item" href=""> Third level 5</a></li>
                </ul>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" href="#">Something else here</a></li>
            </ul>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Link</a>
          </li>
          <li class="nav-item dropdown dropdown-hover dropdown-mega position-static">
            <a class="nav-link  dropdown-toggle" href="#" data-bs-toggle="dropdown" data-bs-auto-close="outside">Megamenu</a>
            <div class="dropdown-menu shadow">
              <div class="mega-content px-4">
                <div class="container-fluid">
                  <div class="row">
                    <div class="col-12 col-sm-4 col-md-3 py-4">
                      <h5>Title</h5>
                      <div class="list-group">
                        <a class="list-group-item" href="#">Mega Menu Link</a>
                        <a class="list-group-item" href="#">Mega Menu Link</a>
                        <a class="list-group-item" href="#">Mega Menu Link</a>
                      </div>
                    </div>
                    <div class="col-12 col-sm-4 col-md-3 py-4">
                      <h5>Card Title</h5>
                      <div class="card">
                  <img src="img/banner-image.jpg" class="img-fluid" alt="image">
                  <div class="card-body">
                    <p class="card-text">Description goes here...</p>
                  </div>
                </div>
                    </div>
                    <div class="col-12 col-sm-4 col-md-3 py-4">
                      <h5>Title</h5>
                        <p>Description goes here...</p>
                    </div>
                    <div class="col-12 col-sm-12 col-md-3 py-4">
                      <h5>Title</h5>
                      <div class="list-group">
                        <a class="list-group-item" href="#">Menu Link</a>
                        <a class="list-group-item" href="#">Menu Link</a>
                        <a class="list-group-item" href="#">Menu Link</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
          <li class="nav-item">
            <a class="nav-link disabled" href="#" tabindex="-1" aria-disabled="true">Disabled</a>
          </li>
        </ul>
-->
        <form class="d-flex ms-auto">
            <div class="input-group">
                <?php get_search_form() ; ?>
            </div>
        </form>
      </div>
    </div>
  </nav>

</div>	




	