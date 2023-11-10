<?php


echo 'footer here';


?>







       
       <script src="/wp-content/themes/tayloredauto-scratch/bootstrap-5.3.2-dist/js/bootstrap.bundle.min.js" ></script>

		<script>
				document.addEventListener('click',function(e){
				  // Hamburger menu
				  if(e.target.classList.contains('hamburger-toggle')){
					e.target.children[0].classList.toggle('active');
				  }
				}) 

		</script>


        <?php wp_footer(); ?>


		</main>
    </body>
</html>