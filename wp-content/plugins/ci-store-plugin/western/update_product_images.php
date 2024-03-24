<?php

function update_product_images($woo_product, $wps_product, $report = null)
{
    $images = get_additional_images($wps_product);
    $serialized_images = serialize($images);
    $woo_product->update_meta_data('_ci_additional_images', $serialized_images);
}

function get_additional_images($wps_product)
{
    if (isset($wps_product['data']['items']['data'])) {
        $images = array_map('process_images', $wps_product['data']['items']['data']);
        $images = array_filter($images, 'filter_images');
        return $images;
    }
}

function process_images($item)
{
    if (isset($item['images']['data'])) {
        if (count($item['images']['data'])) {
            // show only the first image of each variation
            return build_western_image($item['images']['data'][0]);
        }
    }
    return null;
}

function filter_images($image)
{
    return isset($image);
}
