<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/debug_hook.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/western/western_utils.php';

function custom_modify_before_single_product_summary()
{
    debug_hook('woocommerce_before_single_product_summary');
    global $product;

    if (!$product->get_meta('_ci_supplier_key')) {
        return;
    }
    // global $dummy_gallery;
    // print $dummy_gallery;
    // return;

    $src = get_product_image($product);
    $variations = WooTools::get_variations($product);

    $images = unserialize($product->get_meta('_ci_additional_images', true));

    $htm = '';
    $first_fullsize_src = '';
    $first_largesize_src = '';

    debug_data($variations);
    error_log(json_encode($variations, JSON_PRETTY_PRINT));

    foreach ($variations as $variation) {
        foreach ($variation['images'] as $i => $image) {
            // foreach ($images as $i => $image) {
            // $variation = ['sku' => ''];
            $thumb_src = resize_western_image($image, 200);
            $fullsize_src = resize_western_image($image, 500);
            $largesize_src = resize_western_image($image, 1000);
            $htm .= '<div
              title="SKU: ' . $variation['supplier_sku'] . '"
              data-fullsize="' . $fullsize_src . '"
              data-largesize="' . $largesize_src . '"
              data-sku="' . $variation['supplier_sku'] . '"
              class="ci-gallery-thumbnail-container"
            >';
            $htm .= '<figure><img class="ci-gallery-thumbnail" src="' . $thumb_src . '" />';
            $htm .= '</div>';

            if ($i === 0) {
                $first_fullsize_src = $fullsize_src;
                $first_largesize_src = $largesize_src;
            }
        }
    }
    // print_r($src);
    print '
    <div class="ci-gallery">
        <a href="' . $first_largesize_src . '" target="_blank" class="ci-gallery-hero-container">
          <img class="ci-gallery-hero" data-note="custom_modify_before_single_product_summary" src="' . $first_fullsize_src . '" />
        </a>
        <div class="hero-caption"></div>
        <div class="ci-gallery-thumbnails">
            ' . $htm . '
        </div>
    </div>';
}

add_action('woocommerce_before_single_product_summary', 'custom_modify_before_single_product_summary');

// if (isset($_GET['debug'])) {
//     print('<div class="border">woocommerce_before_single_product_summary()</div>');
// }
// global $post;
// $img = get_post_meta($post->ID, '_ci_additional_images', false);
// $src = $img[0];
// return '<img title="custom_modify_before_single_product_summary" src="' . $src . '" alt="Product Image">';

$dummy_gallery = '
<div class="hello woocommerce-product-gallery woocommerce-product-gallery--with-images woocommerce-product-gallery--columns-4 images" data-columns="4" style="opacity: 1; transition: opacity 0.25s ease-in-out 0s">
  <a href="#" class="woocommerce-product-gallery__trigger">🔍</a>
  <div class="flex-viewport" style="overflow: hidden; position: relative; height: 194.781px">
    <div class="woocommerce-product-gallery__wrapper" style="width: 800%; transition-duration: 0s; transform: translate3d(0px, 0px, 0px)">
      <div onclick="onClickWTHook(event)" title="filter" data-name="woocommerce_single_product_image_thumbnail_html" class="debug-hook type-filter">woocommerce_single_product_image_thumbnail_html()</div>
      <div
        data-thumb="http://tayloredlocal.local/wp-content/uploads/2024/03/placeholder-416x277.png"
        data-thumb-alt=""
        class="woocommerce-product-gallery__image flex-active-slide"
        style="width: 292.547px; margin-right: 0px; float: left; display: block; position: relative; overflow: hidden"
        data-o_data-thumb="http://tayloredlocal.local/wp-content/uploads/2024/03/master_placeholder-100x100.png"
      >
        <a href="http://tayloredlocal.local/wp-content/uploads/2024/03/placeholder.png" data-o_href="http://tayloredlocal.local/wp-content/uploads/2024/03/master_placeholder.png"
          ><img
            width="416"
            height="277"
            src="http://tayloredlocal.local/wp-content/uploads/2024/03/placeholder-416x277.png"
            class="wp-post-image"
            alt="placeholder"
            title="placeholder"
            data-caption=""
            data-src="http://tayloredlocal.local/wp-content/uploads/2024/03/placeholder.png"
            data-large_image="http://tayloredlocal.local/wp-content/uploads/2024/03/placeholder.png"
            data-large_image_width="600"
            data-large_image_height="400"
            decoding="async"
            fetchpriority="high"
            srcset="http://tayloredlocal.local/wp-content/uploads/2024/03/placeholder-416x277.png 416w, http://tayloredlocal.local/wp-content/uploads/2024/03/placeholder-300x200.png 300w, http://tayloredlocal.local/wp-content/uploads/2024/03/placeholder.png 600w"
            sizes="(max-width: 416px) 100vw, 416px"
            draggable="false"
            data-o_src="http://tayloredlocal.local/wp-content/uploads/2024/03/master_placeholder-416x277.png"
            data-o_height="277"
            data-o_width="416"
            data-o_srcset="http://tayloredlocal.local/wp-content/uploads/2024/03/master_placeholder-416x277.png 416w, http://tayloredlocal.local/wp-content/uploads/2024/03/master_placeholder-300x200.png 300w, http://tayloredlocal.local/wp-content/uploads/2024/03/master_placeholder.png 600w"
            data-o_sizes="(max-width: 416px) 100vw, 416px"
            data-o_title="master_placeholder"
            data-o_data-caption=""
            data-o_alt=""
            data-o_data-src="http://tayloredlocal.local/wp-content/uploads/2024/03/master_placeholder.png"
            data-o_data-large_image="http://tayloredlocal.local/wp-content/uploads/2024/03/master_placeholder.png"
            data-o_data-large_image_width="600"
            data-o_data-large_image_height="400" /></a
        >
        <img role="presentation" alt="placeholder" src="http://tayloredlocal.local/wp-content/uploads/2024/03/placeholder.png" class="zoomImg" style="position: absolute; top: -66.0797px; left: -273.379px; opacity: 0; width: 600px; height: 400px; border: none; max-width: none; max-height: none" />
      </div>
      <div onclick="onClickWTHook(event)" title="filter" data-name="woocommerce_single_product_image_thumbnail_html" class="debug-hook type-filter">woocommerce_single_product_image_thumbnail_html()</div>
      <div data-thumb="http://tayloredlocal.local/wp-content/uploads/2023/10/8610-60f6dfdd96458-100x100.png" data-thumb-alt="" class="woocommerce-product-gallery__image" style="width: 292.547px; margin-right: 0px; float: left; display: block">
        <a href="http://tayloredlocal.local/wp-content/uploads/2023/10/8610-60f6dfdd96458.png"
          ><img
            width="200"
            height="150"
            src="http://tayloredlocal.local/wp-content/uploads/2023/10/8610-60f6dfdd96458.png"
            class=""
            alt=""
            title="8610-60f6dfdd96458.png"
            data-caption=""
            data-src="http://tayloredlocal.local/wp-content/uploads/2023/10/8610-60f6dfdd96458.png"
            data-large_image="http://tayloredlocal.local/wp-content/uploads/2023/10/8610-60f6dfdd96458.png"
            data-large_image_width="200"
            data-large_image_height="150"
            decoding="async"
            draggable="false"
        /></a>
      </div>
      <div onclick="onClickWTHook(event)" title="filter" data-name="woocommerce_single_product_image_thumbnail_html" class="debug-hook type-filter">woocommerce_single_product_image_thumbnail_html()</div>
      <div data-thumb="http://tayloredlocal.local/wp-content/uploads/2023/10/b160-572a50313fa41-100x100.jpg" data-thumb-alt="" class="woocommerce-product-gallery__image" style="width: 292.547px; margin-right: 0px; float: left; display: block">
        <a href="http://tayloredlocal.local/wp-content/uploads/2023/10/b160-572a50313fa41.jpg"
          ><img
            width="200"
            height="155"
            src="http://tayloredlocal.local/wp-content/uploads/2023/10/b160-572a50313fa41.jpg"
            class=""
            alt=""
            title="b160-572a50313fa41.jpg"
            data-caption=""
            data-src="http://tayloredlocal.local/wp-content/uploads/2023/10/b160-572a50313fa41.jpg"
            data-large_image="http://tayloredlocal.local/wp-content/uploads/2023/10/b160-572a50313fa41.jpg"
            data-large_image_width="200"
            data-large_image_height="155"
            decoding="async"
            draggable="false"
        /></a>
      </div>
      <div onclick="onClickWTHook(event)" title="filter" data-name="woocommerce_single_product_image_thumbnail_html" class="debug-hook type-filter">woocommerce_single_product_image_thumbnail_html()</div>
      <div data-thumb="http://tayloredlocal.local/wp-content/uploads/2023/10/b626-60f6dfb982a8f-100x100.png" data-thumb-alt="" class="woocommerce-product-gallery__image" style="width: 292.547px; margin-right: 0px; float: left; display: block">
        <a href="http://tayloredlocal.local/wp-content/uploads/2023/10/b626-60f6dfb982a8f.png"
          ><img
            width="200"
            height="150"
            src="http://tayloredlocal.local/wp-content/uploads/2023/10/b626-60f6dfb982a8f.png"
            class=""
            alt=""
            title="b626-60f6dfb982a8f.png"
            data-caption=""
            data-src="http://tayloredlocal.local/wp-content/uploads/2023/10/b626-60f6dfb982a8f.png"
            data-large_image="http://tayloredlocal.local/wp-content/uploads/2023/10/b626-60f6dfb982a8f.png"
            data-large_image_width="200"
            data-large_image_height="150"
            decoding="async"
            loading="lazy"
            draggable="false"
        /></a>
      </div>
    </div>
  </div>
  <ol class="flex-control-nav flex-control-thumbs">
    <li>
      <img
        onload="this.width = this.naturalWidth; this.height = this.naturalHeight"
        src="http://tayloredlocal.local/wp-content/uploads/2024/03/placeholder-100x100.png"
        class="flex-active"
        draggable="false"
        width="100"
        height="100"
        data-o_src="http://tayloredlocal.local/wp-content/uploads/2024/03/master_placeholder-100x100.png"
      />
    </li>
    <li><img onload="this.width = this.naturalWidth; this.height = this.naturalHeight" src="http://tayloredlocal.local/wp-content/uploads/2023/10/8610-60f6dfdd96458-100x100.png" draggable="false" width="100" height="100" /></li>
    <li><img onload="this.width = this.naturalWidth; this.height = this.naturalHeight" src="http://tayloredlocal.local/wp-content/uploads/2023/10/b160-572a50313fa41-100x100.jpg" draggable="false" width="100" height="100" /></li>
    <li><img onload="this.width = this.naturalWidth; this.height = this.naturalHeight" src="http://tayloredlocal.local/wp-content/uploads/2023/10/b626-60f6dfb982a8f-100x100.png" draggable="false" width="100" height="100" /></li>
  </ol>
</div>
';
