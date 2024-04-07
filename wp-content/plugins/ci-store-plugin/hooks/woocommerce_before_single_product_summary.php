<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/debug_hook.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';

function custom_modify_before_single_product_summary()
{
    debug_hook('woocommerce_before_single_product_summary');

    print('<div class="ci-gallery" />');
    return;

    global $product;

    if (!$product->get_meta('_ci_supplier_key')) {
        return;
    }

    // remove built in gallery
    remove_action('woocommerce_before_single_product_summary', 'woocommerce_show_product_images', 20);

    $variations = WooTools::get_variations($product);
    $supplier = WooTools::get_product_supplier($product);
    $htm = '';
    $first_fullsize_src = '';
    $first_largesize_src = '';
    $has_images = false;
    $images = []; // key is $image;

    foreach ($variations as $variation) {
        foreach ($variation['images'] as $i => $image) {
            $has_images = true;
            $thumb_src = $supplier->resize_image($image, 200);
            $fullsize_src = $supplier->resize_image($image, 500);
            $largesize_src = $supplier->resize_image($image, 1000);

            if (!isset($images[$image])) {
                $images[$image] = ['skus' => []];
            }

            $images[$image]['skus'][] = $variation['supplier_sku'];

            // $htm .= '<div
            //   title="SKU: ' . $variation['supplier_sku'] . '"
            //   data-fullsize="' . $fullsize_src . '"
            //   data-largesize="' . $largesize_src . '"
            //   data-sku="' . $variation['supplier_sku'] . '"
            //   class="ci-gallery-thumbnail-container"
            // >';
            // $htm .= '<img class="ci-gallery-thumbnail" src="' . $thumb_src . '" />';
            // $htm .= '</div>';

            if ($i === 0) {
                $first_fullsize_src = $fullsize_src;
                $first_largesize_src = $largesize_src;
            }
        }
    }

    foreach ($images as $image => $info) {
        $thumb_src = $supplier->resize_image($image, 200);
        $fullsize_src = $supplier->resize_image($image, 500);
        $largesize_src = $supplier->resize_image($image, 1000);

        $htm .= '<div
              title="SKU: ' . $variation['supplier_sku'] . '"
              data-fullsize="' . $fullsize_src . '"
              data-largesize="' . $largesize_src . '"
              data-sku="' . implode(',', $info['skus']) . '"
              class="ci-gallery-thumbnail-container"
            >';
        $htm .= '<img class="ci-gallery-thumbnail" src="' . $thumb_src . '" />';
        $htm .= '</div>';
    }

    if (!$has_images) {
        $first_largesize_src = "";
        $first_fullsize_src = wc_placeholder_img_src();
    }

    print '
    <div class="ci-gallery">
        <div data-largeimg="' . $first_largesize_src . '" target="_blank" class="ci-gallery-hero-container">
          <img class="ci-gallery-hero" data-note="custom_modify_before_single_product_summary" src="' . $first_fullsize_src . '" />
          <div class="ci-left-arrow"></div>
          <div class="ci-right-arrow"></div>
        </div>
        <div class="hero-caption"></div>
        <div class="ci-gallery-thumbnails">
            ' . $htm . '
        </div>
    </div>';

}

// add_action('woocommerce_before_single_product_summary', 'custom_modify_before_single_product_summary');
