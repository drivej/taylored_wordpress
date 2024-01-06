<?php
/**
 * Get product image.
 *
 * @param WC_Product_Variable $product Product type. If used an invalid type a WC_Product_Simple instance will be returned.
 * @return string
 */
function get_product_image($product)
{
    $img = $product->get_meta('_ci_additional_images');
    $images = explode(',', $img);
    $src = null;

    if (count($images) && isset($images[0])) {
        $src = $images[0];
    }
    if (!$src) {
        $src = wc_placeholder_img_src();
    }
    return $src;
}
