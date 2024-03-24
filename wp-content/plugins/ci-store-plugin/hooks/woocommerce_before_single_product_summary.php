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

    // $src = get_product_image($product);
    $variations = WooTools::get_variations($product);

    // $images = unserialize($product->get_meta('_ci_additional_images', true));

    $htm = '';
    $first_fullsize_src = '';
    $first_largesize_src = '';

    // debug_data($variations);

    // ci_error_log(__FILE__, __LINE__, json_encode($variations, JSON_PRETTY_PRINT));
    // TODO: This will only work for WPS

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
