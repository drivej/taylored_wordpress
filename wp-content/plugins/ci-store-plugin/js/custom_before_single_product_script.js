// document.addEventListener('DOMContentLoaded', function () {
//   // Select all variation selects
//   var variationSelects = document.querySelectorAll('.variations select');

//   // Add change event listener to each variation select
//   variationSelects.forEach(function (select) {
//     select.addEventListener('change', function () {
//       // Get the selected variation
//       var selectedVariation = getSelectedVariation();
//       console.log({selectedVariation})

//       // Update the main product image with the selected variation's image
//       updateProductImage(selectedVariation);
//     });
//   });

//   // Function to get the selected variation
//   function getSelectedVariation() {
//     var variationData = {};
//     variationSelects.forEach(function (select) {
//       var attribute = select.getAttribute('name');
//       var value = select.value;
//       variationData[attribute] = value;
//     });
//     return variationData;
//   }

//   // Function to update the main product image with the selected variation's image
//   function updateProductImage(variation) {
//     // Make AJAX request to retrieve variation's images
//     // Replace the following URL with the endpoint to retrieve variation's images
//     var ajaxUrl = '/wp-admin/admin-ajax.php';
//     var data = {
//       action: 'get_variation_images',
//       variation: JSON.stringify({attribute_sku:'WPS_326440_VARIATION_611518'})// variation
//     };
//     fetch(ajaxUrl, {
//       method: 'POST',
//       body: JSON.stringify(data),
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     })
//       .then(function (response) {
//         return response.json();
//       })
//       .then(function (images) {
//         // Update the main product image with the variation's images
//         var mainProductImage = document.querySelector('.woocommerce-main-image img');
//         if (images.length > 0) {
//           mainProductImage.src = images[0];
//           mainProductImage.alt = 'Product Image';
//         }
//       })
//       .catch(function (error) {
//         console.error('Error retrieving variation images:', error);
//       });
//   }
// });

document.addEventListener('DOMContentLoaded', function () {

  const $select = document.querySelector('select[id="__required_attr"]');
  if ($select) {
    $select.value = '1';
    $select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // handle click on gallery thumbnail
  const $gallery = document.querySelector('.ci-gallery');
  const $thumbnails = document.querySelectorAll('.ci-gallery-thumbnail-container');
  const $hero = $gallery.querySelector('.ci-gallery-hero-container');

  function handleClickGalleryThumbnail($selected_thumbnail) {
    console.log({ xxhandleClickGalleryThumbnail: $selected_thumbnail });
    // const $gallery = $thumbnail_container.closest('.ci-gallery');

    $gallery.querySelector('.ci-gallery-hero').src = $selected_thumbnail.dataset.fullsize;
    // deselect selected thumbnails
    // const $thumbnails = $gallery.querySelectorAll('.ci-gallery-thumbnail-container.selected');
    for (var i = 0; i < $thumbnails.length; i++) {
      $thumbnails[i].classList.remove('selected');
    }
    // select current thumbnail
    $selected_thumbnail.classList.add('selected');
    // set link to large image on hero
    $hero.href = $selected_thumbnail.dataset.largesize;
    $hero.style.backgroundImage = `url(${$selected_thumbnail.dataset.fullsize})`;
    $gallery.querySelector('.hero-caption').innerText = 'Image SKU: ' + $selected_thumbnail.dataset.sku;
  }

  if ($gallery) {
    for (var i = 0; i < $thumbnails.length; i++) {
      $thumbnails[i].addEventListener('click', (e) => handleClickGalleryThumbnail(e.currentTarget));
    }

    // pre-select first thumbnail
    handleClickGalleryThumbnail($gallery.querySelector('.ci-gallery-thumbnail-container'));
  }

  function handleChangeSku(e) {
    const sku = e.target.value;
    console.log({ sku });
    if ($gallery) {
      let first = true;
      for (var i = 0; i < $thumbnails.length; i++) {
        if (sku) {
          if ($thumbnails[i].dataset.sku === sku) {
            if (first) {
              // $thumbnails[i].classList.add('selected');
              $thumbnails[i].classList.remove('filtered');
              first = false;
              handleClickGalleryThumbnail($thumbnails[i]);
            }
          } else {
            // $thumbnails[i].classList.remove('selected');
            $thumbnails[i].classList.add('filtered');
          }
        } else {
          $thumbnails[i].classList.remove('filtered');
          if (first) {
            handleClickGalleryThumbnail($thumbnails[i]);
            first = false;
          }
        }
      }
    }
  }

  $select_sku = document.querySelector('select[name="attribute_sku"]');
  if ($select_sku) {
    $select_sku.addEventListener('change', handleChangeSku);
  }

  const $options = $select_sku.querySelectorAll('option');
  if($options.length===2){
    $select_sku.value = $options[1].value;
    $select_sku.closest('tr').classList.add('d-none');
  }
  console.log('ddd', $options.length)

  $btn_reset = document.querySelector('.reset_variations');
  if ($btn_reset) {
    $btn_reset.addEventListener('click', () => handleChangeSku({ target: { value: '' } }));
  }
});
