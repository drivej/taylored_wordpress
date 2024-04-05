document.addEventListener('DOMContentLoaded', function () {
  // get variations from woo injected data
  const product_variations = woo_product_details.variations;

  console.log({ product_variations });

  const $gallery = document.querySelector('.ci-gallery');
  const $thumbnails_container = document.querySelector('.ci-gallery-thumbnails');
  const $thumbnails = document.querySelectorAll('.ci-gallery-thumbnail-container');
  const $hero_container = $gallery.querySelector('.ci-gallery-hero-container');
  const $hero_img = $gallery.querySelector('.ci-gallery-hero');
  const $hero_caption = $gallery.querySelector('.hero-caption');
  const $select_sku = document.querySelector('select[data-attribute_name="attribute_supplier_sku"]');
  const $selects = document.querySelectorAll('select[data-attribute_name]');

  let validThumbnails = [...$thumbnails];
  let selectedThumbnail = null;

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

  let currentAttributeKey = '';

  const handleChangeAttribute = (e) => {
    const name = e.currentTarget.dataset.attribute_name;
    const value = e.currentTarget.value;
    currentAttributeKey = name;

    console.log({ handleChangeAttribute: { name, value } });
    // wait for woo to update selects
    setTimeout(() => collectAttributes(), 1);
  };

  const collectAttributes = () => {
    console.log('collectAttributes()');

    // return;
    // let selected_variation;

    const attributes = {};
    const validAttributes = {};

    for (let i = 0; i < $selects.length; i++) {
      const attr_name = $selects[i].dataset.attribute_name;
      if ($selects[i].value) {
        attributes[attr_name] = $selects[i].value;
      }
      validAttributes[attr_name] = new Set();
    }
    console.log({ attributes });

    const validVariations = findVariations(attributes);
    console.log({ validVariations });

    for (let i = 0; i < validVariations.length; i++) {
      Object.keys(validVariations[i].attributes).forEach((attr_key) => {
        validAttributes[attr_key].add(validVariations[i].attributes[attr_key]);
      });
    }
    console.log({ validAttributes });

    Object.keys(validAttributes).forEach((attr_key) => {
      if (attr_key !== currentAttributeKey) {
        const $options = document.querySelectorAll(`select[name="${attr_key}"] option`);
        for (let i = 0; i < $options.length; i++) {
          $options[i].disabled = !validAttributes[attr_key].has($options[i].value);
        }
        if (validAttributes[attr_key].length === 1) {
          // auto select then lone option
          const $select = document.querySelectorAll(`select[name="${attr_key}"]`);
          $select.value = validAttributes[attr_key][0];
          // $select.dispatchEvent(new Event('change', { bubbles: true }));
          // console.log({ [attr_key]: $select.value });
        }
      }
    });

    updateGallery(validVariations.map((v) => v.attributes['attribute_supplier_sku']));

    if (validVariations.length === 1) {
      const selectedVariation = validVariations[0];
      const sku = selectedVariation.attributes['attribute_supplier_sku'];
      const $select = document.querySelector(`select[name="attribute_supplier_sku"]`);
      // $select.value = sku;
      console.log({ sku });

      document.querySelector('input[name="variation_id"]').value = selectedVariation.variation_id;
    }

    return;

    // if (attributes['attribute_supplier_sku']) {
    //   // a sku is selected - so this should be easy
    //   selected_variation = product_variations.find((v) => v.attributes?.attribute_supplier_sku === attributes.attribute_supplier_sku);

    //   for (let i = 0; i < $selects.length; i++) {
    //     const name = $selects[i].dataset.attribute_name;
    //     if (name !== 'attribute_supplier_sku') {
    //       $selects[i].value = selected_variation.attributes[name];
    //     }
    //   }
    // } else {
    //   // get matching variations
    //   const valid_variations = findVariations(attributes);
    //   console.log({ valid_variations });
    //   if (valid_variations.length === 1) {
    //     selected_variation = valid_variations[0];
    //   } else {
    //     updateGallery(valid_variations.map((v) => v.attributes['attribute_supplier_sku']));
    //   }
    // }

    // if (selected_variation) {
    //   $select_sku.value = selected_variation.attributes['attribute_supplier_sku'];

    //   updateGallery([selected_variation.attributes['attribute_supplier_sku']]);

    //   document.querySelector('input[name="variation_id"]').value = selected_variation.variation_id;

    //   // auto select any attributes that have 1 option left when sku is down to 1
    //   for (let i = 0; i < $selects.length; i++) {
    //     if ($selects[i].options.length === 2) {
    //       $selects[i].value = $selects[i].options[1].value;
    //     }
    //   }
    // }
  };

  function handleClickGalleryThumbnail($selected_thumbnail) {
    if (!$selected_thumbnail) return;
    console.log({ handleClickGalleryThumbnail: $selected_thumbnail, $thumbnails });
    selectedThumbnail = $selected_thumbnail;

    // deselect selected thumbnails
    $thumbnails_container.querySelector('.selected')?.classList.remove('selected');

    // select current thumbnail
    $selected_thumbnail.classList.add('selected');

    // update hero image, background, link, caption
    $hero_img.src = $selected_thumbnail.dataset.fullsize;
    $hero_container.dataset.largeimg = $selected_thumbnail.dataset.largesize;
    $hero_container.style.backgroundImage = `url(${$selected_thumbnail.dataset.fullsize})`;
    $hero_caption.innerText = 'Image SKU: ' + $selected_thumbnail.dataset.sku;
  }

  function updateGallery(skus) {
    console.log({ updateSku: skus });
    if ($gallery) {
      let first = true;
      validThumbnails = [];

      for (var i = 0; i < $thumbnails.length; i++) {
        const $thumbnail = $thumbnails[i];
        const imgSkus = $thumbnail.dataset.sku.split(',').map((s) => s.trim());
        const found = imgSkus.reduce((q, sku) => q + (skus.indexOf(sku) > -1 ? 1 : 0), 0);

        if (found > 0) {
          $thumbnail.classList.remove('filtered');
          validThumbnails.push($thumbnail);

          if (first) {
            first = false;
            // select first valid image
            handleClickGalleryThumbnail($thumbnails[i]);
          }
        } else {
          $thumbnail.classList.add('filtered');
        }
      }
    }
  }

  function prevThumbnail() {
    let i = validThumbnails.findIndex((t) => t === selectedThumbnail);
    const next = (i - 1 + validThumbnails.length) % validThumbnails.length;
    handleClickGalleryThumbnail(validThumbnails[next]);
  }

  function nextThumbnail() {
    let i = validThumbnails.findIndex((t) => t === selectedThumbnail);
    const next = (i + 1) % validThumbnails.length;
    handleClickGalleryThumbnail(validThumbnails[next]);
  }

  function clearSelections() {
    updateGallery([]);
    // remove disable on all options
    const $options = document.querySelectorAll('select[data-attribute_name] option');
    for (let i = 0; i < $options.length; i++) {
      $options[i].disabled = false;
    }
  }

  if ($gallery) {
    // this spoofs variable products with 1 variation into acting like single products
    const $select = document.querySelector('select[id="__required_attr"]');
    if ($select) {
      $select.value = '1';
      $select.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // listen to attribute changes
    for (let i = 0; i < $selects.length; i++) {
      $selects[i].addEventListener('change', handleChangeAttribute);
    }

    // click to open large image in new window
    $hero_container.addEventListener('click', () => {
      console.log('show here');
      window.open($hero_container.dataset.largeimg, 'c_hero_image');
    });

    if ($thumbnails.length < 2) {
      document.querySelector('.ci-right-arrow').style.display = 'none';
      document.querySelector('.ci-left-arrow').style.display = 'none';
    } else {
      // click right arrow to go to next valid image
      document.querySelector('.ci-right-arrow').addEventListener('click', (e) => {
        e.stopPropagation();
        nextThumbnail();
      });

      // click left arrow to go to previous valid image
      document.querySelector('.ci-left-arrow').addEventListener('click', (e) => {
        e.stopPropagation();
        prevThumbnail();
      });
    }

    // click thumbnail
    for (var i = 0; i < $thumbnails.length; i++) {
      $thumbnails[i].addEventListener('click', (e) => handleClickGalleryThumbnail(e.currentTarget));
    }

    // pre-select first thumbnail
    handleClickGalleryThumbnail($gallery.querySelector('.ci-gallery-thumbnail-container'));

    // if there is only 1 sku, this is a pseudo-single product as a variation so auto-select the single sku so add-to-cart is enabled, then hide the sku select
    const $options = $select_sku.querySelectorAll('option');
    if ($options.length === 2) {
      $select_sku.value = $options[1].value;
      $select_sku.closest('tr').classList.add('d-none');
    }

    // handle click reset
    $btn_reset = document.querySelector('.reset_variations');
    if ($btn_reset) {
      $btn_reset.addEventListener('click', clearSelections);
    }

    setTimeout(() => {
      // select initial attributes if set in url
      collectAttributes();
    }, 100);
  }
});
