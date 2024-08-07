<?php

namespace CIStore\Hooks;

// include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/get_product_image.php';
// include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/debug_hook.php';

// function custom_modify_product_image($image_html, $product, $size, $attr)
// {
//     debug_filter('woocommerce_product_get_image');

//     // if not a CI product, skip
//     if (!$product->get_meta('_ci_supplier_key')) {
//         return $image_html;
//     }

//     // $new_src = 'https://cdn.wpsstatic.com/images/200_max/dee2-609e874f00790.jpg';

//     // return '<img src="' . $new_src . '" />';

//     $src = get_product_image($product);
//     $alt = $product->get_name();
//     $custom_image_html = '<div class="custom-product-image">
//         <img
//             data-note="custom_modify_product_image"
//             src="' . $src . '"
//             class="wp-post-image"
//             alt="' . esc_attr($alt) . '"
//             decoding="async"
//             fetchpriority="high"
//             srcset=""
//             data-size="' . esc_attr(json_encode($size)) . '"
//             x-style="max-width:100%; max-height:100%; width:100%; object-fit:contain; object-position:center; aspect-ratio:1/1"
//         />
//     </div>';

//     // $custom_image_html = '<div class="custom-product-image">' . $image_html . '<img src="'.$src.'" /></div>';

//     return $custom_image_html;
// }

// add_filter('woocommerce_product_get_image', 'custom_modify_product_image', 10, 4);
// https://localhost:3000/assets/default-station-bg.png

function custom_image_downsize($out, $id, $size)
{
    $file = get_post_meta($id, '_wp_attached_file', true);
    $is_remote = strpos($file, 'http://') === 0 || strpos($file, 'https://') === 0;
    
    if($is_remote){
        // I guess this needs this format: url, width, height
        // .../woocommerce/includes/wc-template-functions.php::wc_get_gallery_image_html()
        return [$file, 600, 600];
    }

    // $meta = wp_get_attachment_metadata($id);
    // $info = wc_get_image_size($size);
    // $is_remote = (bool) get_post_meta($id, '_ci_remote_image', true);
    // $file = get_post_meta($id, '_wp_attached_file');
    // error_log('file1:' . json_encode($file));
    // $file = get_post_meta($id, '_wp_attached_file', true);
    // error_log('file2:' . json_encode($file2));
    // error_log('custom_image_downsize() ' . json_encode(['file' => $file, 'is_remote' => $is_remote, 'size_info' => $info, 'out' => $out, 'id' => $id, 'size' => $size, 'meta' => $meta], JSON_PRETTY_PRINT));
// return $test;
    // attachment_url_to_postid();

    // $file2 = isset($meta['file']) ? $meta['file'] : '';
    // $is_remote = strpos($file, 'http://') === 0 || strpos($file, 'https://') === 0;
    // if($is_remote){
    //     return [$file];
    // }

    // if ($is_remote) {
    //     // return $file;

    //     $supplier_key = get_post_meta($id, '_ci_supplier_key', true);
    //     if ($supplier_key) {
    //         $supplier = CI\Admin\get_supplier($supplier_key);
    //         if ($supplier) {
    //             $file = get_post_meta($id, '_wp_attached_file');
    //             if ($file) {
    //                 // get width/height info from size name
    //                 $info = wc_get_image_size($size);
    //                 $width = isset($info['width']) ? $info['width'] : null;
    //                 $file = $supplier->resize_image($file, $width);
    //             }
    //             error_log('file 2:' . json_encode($file));
    //             return $file;
    //         }
    //     }
    // }
    // return 'https://localhost:3000/assets/default-station-bg.png';
    
    return $out;
}

// add_filter('image_downsize', 'custom_image_downsize', 10, 3);

// function custom_post_thumbnail_url($file, $id, $size)
// {

//     $uploads = wp_get_upload_dir();
//     if (is_string($uploads)) {
//         // if (strpos($file, 'tayloredlocal') !== false) {
//         //     return str_replace($uploads, '', $file);
//         // }
//         if (strpos($file, 'wpsstatic') !== false) {
//             return str_replace($uploads, '', $file) . '?yyy';
//         }
//     }
//     return $file . '?xxx';

//     // return str_replace('http://tayloredlocal.local/wp-content/uploads/', '', $url);
//     // $url = 'https://cdn.wpsstatic.com/images/500_max/3e0d-65f8764c1ab7e.png';
//     // // return ['http://'.$size, 150, 150, false];
//     // if ($size === 'thumbnail') {
//     //     return [$url, 150, 150, false];
//     // }
//     // if ($size === 'post_thumbnail') {
//     //     return [$url, 150, 150, false];
//     // }
//     // return $url;
// }

// add_filter('post_thumbnail_url', 'custom_post_thumbnail_url', 10, 3);
