<?php
/**
 * Get product image.
 *
 * @param WC_Product_Variable $product Product type. If used an invalid type a WC_Product_Simple instance will be returned.
 * @return string
 */
function get_product_image($product)
{
    $src = null;
    if (isset($product)) {
        $serialized_data = $product->get_meta('_ci_additional_images', true);
        $additional_images = unserialize($serialized_data);

        if (!empty($additional_images) && is_array($additional_images)) {
            $src = reset($additional_images);
            $src = str_replace('http://', 'https://', $src);
        } else {
            $src = wc_placeholder_img_src();
        }
    } else {
        $src = wc_placeholder_img_src();
    }
    return $src;
}
