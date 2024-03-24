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

let product_variations;

const findVariations = (attributes) => {
  const product_variations = woo_product_details?.variations ?? [];
  const attr_keys = Object.keys(attributes).filter((k) => attributes[k]);
  return product_variations.filter((v) => {
    Object.keys(attributes);
    let count = 0;
    for (let i = 0; i < attr_keys.length; i++) {
      let k = attr_keys[i];
      if (attributes[k] === v.attributes[k]) {
        count++;
      }
    }
    if (count === attr_keys.length) {
      return true;
    }
    return false;
  });
};

document.addEventListener('DOMContentLoaded', function () {
  // get variations from woo injected data
  // const product_variations_data = document.querySelector('form[data-product_variations]').dataset.product_variations;
  const product_variations = woo_product_details.variations;
  // try {
  //   product_variations = JSON.parse(product_variations_data);
  // } catch (err) {
  //   //
  // }
  console.log({ product_variations });


  // this spoofs variable products with 1 variation into acting like single products
  const $select = document.querySelector('select[id="__required_attr"]');
  if ($select) {
    $select.value = '1';
    $select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // handle click on gallery thumbnail
  const $gallery = document.querySelector('.ci-gallery');
  const $thumbnails = document.querySelectorAll('.ci-gallery-thumbnail-container');
  const $hero = $gallery.querySelector('.ci-gallery-hero-container');
  const $select_sku = document.querySelector('select[data-attribute_name="attribute_supplier_sku"]');

  if($gallery){
    const $woo_gallery = document.querySelector('.woocommerce-product-gallery');
    if($woo_gallery){
      console.log('woo gallery found v2');
      // $woo_gallery.style.display = 'none';
      // $woo_gallery.classList.add('d-none');
    }
  }

  const handleChangeAttribute = (e) => {
    const name = e.currentTarget.dataset.attribute_name;
    const value = e.currentTarget.value;
    console.log({ name, value });
    collectAttributes();
  };

  const $selects = document.querySelectorAll('select[data-attribute_name]');
  for (let i = 0; i < $selects.length; i++) {
    $selects[i].addEventListener('change', handleChangeAttribute);
  }

  const collectAttributes = () => {
    let selected_variation;

    const attributes = {};
    for (let i = 0; i < $selects.length; i++) {
      attributes[$selects[i].dataset.attribute_name] = $selects[i].value;
    }

    if (attributes['attribute_supplier_sku']) {
      // a sku is selected
      selected_variation = product_variations.find((v) => v.attributes?.attribute_supplier_sku === attributes.attribute_supplier_sku);

      for (let i = 0; i < $selects.length; i++) {
        const name = $selects[i].dataset.attribute_name;
        if (name !== 'attribute_supplier_sku') {
          $selects[i].value = selected_variation.attributes[name];
        }
        // attributes[$selects[i].dataset.attribute_name] = $selects[i].value;
      }
    } else {
      const valid_variations = findVariations(attributes);
      if (valid_variations.length === 1) {
        selected_variation = valid_variations[0];
      } else {
        updateSku(valid_variations.map(v => v.attributes['attribute_supplier_sku']));
      }
    }
    console.log({ selected_variation });
    if (selected_variation) {
      $select_sku.value = selected_variation.attributes['attribute_supplier_sku'];
      updateSku([selected_variation.attributes['attribute_supplier_sku']]);
    }
  };

  function handleClickGalleryThumbnail($selected_thumbnail) {
    if (!$selected_thumbnail) return;
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

  function updateSku(skus) {
    console.log({ updateSku: skus });
    if ($gallery) {
      let first = true;
      for (var i = 0; i < $thumbnails.length; i++) {
        if (skus.length > 0) {
          if (skus.indexOf($thumbnails[i].dataset.sku) > -1) {
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

  if ($select_sku) {
    // $select_sku.addEventListener('change', handleChangeSku);

    const $options = $select_sku.querySelectorAll('option');
    if ($options.length === 2) {
      $select_sku.value = $options[1].value;
      $select_sku.closest('tr').classList.add('d-none');
    }
    // console.log('ddd', $options.length);

    $btn_reset = document.querySelector('.reset_variations');
    if ($btn_reset) {
      $btn_reset.addEventListener('click', () => updateSku([]));
    }
  }
});
