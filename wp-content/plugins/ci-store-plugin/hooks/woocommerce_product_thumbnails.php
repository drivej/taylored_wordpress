<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/debug_hook.php';

/*
array(
'title'                   => _wp_specialchars( get_post_field( 'post_title', $attachment_id ), ENT_QUOTES, 'UTF-8', true ),
'data-caption'            => _wp_specialchars( get_post_field( 'post_excerpt', $attachment_id ), ENT_QUOTES, 'UTF-8', true ),
'data-src'                => esc_url( $full_src[0] ),
'data-large_image'        => esc_url( $full_src[0] ),
'data-large_image_width'  => esc_attr( $full_src[1] ),
'data-large_image_height' => esc_attr( $full_src[2] ),
'class'                   => esc_attr( $main_image ? 'wp-post-image' : '' ),
),
$attachment_id,
$image_size,
$main_image

 */
// function custom_get_image_size_gallery_thumbnail($params, $attachment_id, $image_size, $main_image)
// {
//     debug_filter('woocommerce_gallery_image_html_attachment_image_params');
//     debug_data(['params' => $params, 'attachment_id' => $attachment_id, 'image_size' => $image_size, 'main_image' => $main_image]);
//     // return $size;
// }

// add_filter('woocommerce_gallery_image_html_attachment_image_params', 'custom_get_image_size_gallery_thumbnail', 10, 1);

// function custom_wp_get_attachment_image_attributes($attr, $attachment, $size)
// {

//     global $product;

//     $product_id = $product->get_id();

//     if ($product->get_meta('_ci_supplier_key')) {
//         return $attr;
//     }

//     debug_data([$product_id, 'attr' => $attr, 'attachment' => $attachment, 'size' => $size]);
//     return $attr;
// }

// add_filter('wp_get_attachment_image_attributes', 'custom_wp_get_attachment_image_attributes', 10, 3);

/*

woocommerce_product_thumbnails
woocommerce_product_thumbnails_columns
woocommerce_single_product_image_thumbnail_html

woocommerce_gallery_full_size
woocommerce_gallery_image_html_attachment_image_params
woocommerce_gallery_image_size
woocommerce_gallery_thumbnail_size
woocommerce_single_product_image_gallery_classes
 */
/*
function custom_product_thumbnails()
{
debug_hook('woocommerce_product_thumbnails');
// global $post;
// print_r(json_encode($post));
// return

global $product;

// Check if the product has variations
if ($product->is_type('variable')) {
$variation_ids = $product->get_children();
$images = [];

if (count($variation_ids) === 1) {
// this is a virtual simple product
foreach ($variation_ids as $variation_id) {

$variation = new WC_Product_Variation($variation_id);
$variation_images = $variation->get_meta('_ci_additional_images');// get_post_meta($variation_id, '_ci_additional_images');

if (is_serialized($variation_images)) {
$variation_images = unserialize($variation_images);
}
array_push($images, ...$variation_images);
// $images[]
// debug_data(['variation_images' => $variation_images]);
}
}
debug_data(['images' => $images]);
}

return;

// $variations = $product->get_available_variations();
// echo '<pre>'.json_encode($variations, JSON_PRETTY_PRINT).'</pre>';
// return;
if (false) {
// Display the variations
if (!empty($variations)) {
echo '<div class="product-variations d-flex flex-wrap">';
foreach ($variations as $variation) {
$variation_id = $variation['variation_id'];
$serialized_data = get_post_meta($variation_id, '_ci_additional_images', true);

if (is_serialized($serialized_data)) {
$additional_images = unserialize($serialized_data);
$src = '';

if ($additional_images !== false && !empty($additional_images) && is_array($additional_images)) {
// Replace the default variation image with the first additional image
$src = reset($additional_images);
} else {
$src = wc_placeholder_img_src();
}
} else {

$src = wc_placeholder_img_src();
}

// $img = get_post_meta($variation_id, '_ci_additional_images', true);
// $src = $img[0];
// print_r($src);
// continue;
$variation_attributes = $variation['attributes'];

// Customize the display of each variation
echo '<div class="variation">';
echo '<a href="' . esc_url(get_permalink($variation_id)) . '">'; // Link to the variation
echo '<span class="variation-title">' . esc_html(implode(', ', $variation_attributes)) . '</span>';
echo '<img title="custom_modify_product_thumbnails" class="product-thumbnail" width="100" height="100" src="' . $src . '" /></a>';
echo '</div>';
}
echo '</div>';
}
}
}
// deprecated!!!
add_action('woocommerce_product_thumbnails', 'custom_product_thumbnails', 10);
 */

// this has potential to set the list image to a remote image

// function offsite_product_images($image, $product, $size, $attr, $placeholder)
// {
//     debug_filter('offsite_product_images');

//     return get_product_image($product);
//     return $image;

//     global $product;
//     $product_id = $product->get_id();
//     $images = $product->get_meta('_ci_additional_images');
//     if (is_serialized($images)) {
//         $images = unserialize($images);
//     }

//     // debug_data(['product_id'=>$product_id, 'image'=>$image,'product'=>$product, 'size'=>$size,'attr'=>$attr, 'placeholder'=>$placeholder]);

//     return $images[0];
//     return $placeholder;

// // if( get_field('thumbnail_url', $product->get_id() ) ){
// // $image = get_field('thumbnail_url', $product->get_id() );
// // }
// // return $image;
 
// }

// add_filter( 'woocommerce_product_get_image', 'offsite_product_images', 10, 5 );

function custom_single_product_image_thumbnail_html($html, $attachment_id)
{
    debug_filter('woocommerce_single_product_image_thumbnail_html');
    // $new_src = 'https://cdn.wpsstatic.com/images/200_max/dee2-609e874f00790.jpg';
    global $product;

    if ($product->get_meta('_ci_supplier_key')) {
        // return '';
    }

    return $html;
    // return $html;
    // return '<div class="hello">' . $html . '</div>';
    // $html = '<div class="woocommerce-product-gallery__image"><img src="' . esc_url($new_src) . '" alt=""></div>';

// $html = str_replace('http://tayloredlocal.local/wp-content/uploads/2024/03/placeholder.png', $new_src, $html);
    // $html = preg_replace('/http.*?placeholder\.png/', $new_src, $html);
    // print_r(['html' => $html]);
    // return $html;

    if (!$product->get_meta('_ci_supplier_key')) {
        return '<div style="border:5px solid blue;">' . $html . '</div>';
    }
    return $html;
    // return '<div style="border:5px solid blue;">'.$html.'</div>';

    $variation_ids = $product->get_children();
    $images = [];
    $htm = [];

    if (count($variation_ids)) {
        // this is a virtual simple product
        foreach ($variation_ids as $i => $variation_id) {

            $variation = new WC_Product_Variation($variation_id);
            // print_r($variation);
            $variation_images = $variation->get_meta('_ci_additional_images');
            if (is_serialized($variation_images)) {
                $variation_images = unserialize($variation_images);
            }

            array_push($images, ...$variation_images);

            // if($i===990){
            //     $thumb_src = resize_western_image($images[0]);
            //     $full_src = resize_western_image($images[0]);
            //     $htm[] = '<div data-thumb="' . $thumb_src . '" data-thumb-alt="" class="woocommerce-product-gallery__image" data-o_data-thumb="http://tayloredlocal.local/wp-content/uploads/2023/10/8610-60f6dfdd96458-100x100.png">
            //     <a href="' . $thumb_src . '" data-o_href="' . $full_src . '"
            //       ><img
            //         width="416"
            //         height="312"
            //         src="' . $full_src . '"
            //         class="wp-post-image"
            //         alt="IMG_6798"
            //         title="IMG_6798"
            //         data-caption=""
            //         data-src="' . $thumb_src . '"
            //         data-large_image="' . $full_src . '"
            //         data-large_image_width="2560"
            //         data-large_image_height="1920"
            //         decoding="async"
            //         data-o_src="' . $full_src . '"
            //         data-o_height="150"
            //         data-o_width="200"
            //         data-o_srcset=""
            //         data-o_sizes=""
            //         sizes="(max-width: 416px) 100vw, 416px"
            //         data-o_title="8610-60f6dfdd96458.png"
            //         data-o_data-caption=""
            //         data-o_alt=""
            //         data-o_data-src="' . $thumb_src . '"
            //         data-o_data-large_image="' . $full_src . '"
            //         data-o_data-large_image_width="200"
            //         data-o_data-large_image_height="150"
            //     /></a>
            //   </div>
            // </div>';
            // }

            // foreach ($variation_images as $src) {
            //     $thumb_src = resize_western_image($src);
            //     $full_src = resize_western_image($src);
            //     // $image_html = '<img width="150" height="225" src="' . $thumb_src . '" class="attachment-thumbnail size-thumbnail" alt="Image Description" />';
            //     // return '<div data-thumb="' . esc_url($thumb_src) . '" data-thumb-alt="' . esc_attr('product_image') . '" class="woocommerce-product-gallery__image"><a href="' . esc_url($full_src) . '">' . $image . '</a></div>';
            //     // $htm[] = '<div class="woocommerce-product-gallery__image"><img width="150" height="225" src="' . $thumb_src . '" class="attachment-thumbnail size-thumbnail" alt="Image Description" /></div>';

            //     $htm[] = '<div data-thumb="' . $thumb_src . '" data-thumb-alt="" class="woocommerce-product-gallery__image">
            //     <a href="' . $thumb_src . '"
            //       ><img
            //         width="200"
            //         height="150"
            //         src="' . $thumb_src . '"
            //         class=""
            //         alt=""
            //         title="8610-60f6dfdd96458.png"
            //         data-caption=""
            //         data-src="' . $thumb_src . '"
            //         data-large_image="' . $full_src . '"
            //         data-large_image_width="200"
            //         data-large_image_height="150"
            //         decoding="async"
            //     /></a>
            //   </div>';
            //     // print($html);
            // }
        }
    }

    return $html . implode('', $htm);

    debug_data($variation_ids);

    return '<div>helxlo ' . json_encode($variation_ids) . '</div>';
    return $html;
/*
$html = `<ol class="flex-control-nav flex-control-thumbs">`;
foreach ($images as $src) {
$thumb_src = resize_western_image($src);
$full_src = resize_western_image($src);
$html .= '<li><img onload="this.width = this.naturalWidth; this.height = this.naturalHeight" src="' . $thumb_src . '" class="flex-active" draggable="false" width="100" height="100" data-o_src="' . $full_src . '"></li>';
}
$html .= '</ol>';

return $html;

$html = array_map(function ($src) {
$thumb_src = resize_western_image($src);
$full_src = resize_western_image($src);
$image = '<img width="150" height="225" src="' . $thumb_src . '" class="attachment-thumbnail size-thumbnail" alt="Image Description">';
return '<div data-thumb="' . esc_url($thumb_src) . '" data-thumb-alt="' . esc_attr('product_image') . '" class="woocommerce-product-gallery__image"><a href="' . esc_url($full_src) . '">' . $image . '</a></div>';
}, $images);

return '<div>hello' . implode('', $html) . '</div>';

$variation_images = array();

// Loop through each variation and retrieve its images
foreach ($variation_ids as $variation_id) {
$variation = new WC_Product_Variation($variation_id);
$variation_gallery_image_ids = $variation->get_gallery_image_ids();
foreach ($variation_gallery_image_ids as $image_id) {
$variation_images[] = wp_get_attachment_url($image_id);
}
}

// print_r(json_encode(['product_id' => $product_id, 'html' => $html, 'attachment_id' => $attachment_id, 'variation' => $variation], JSON_PRETTY_PRINT));
// Get the image URL from your custom meta property
// $custom_image_url = get_post_meta($post_id, '_ci_additional_images', true);

$post_id = get_the_ID();
$serialized_data = get_post_meta($post_id, '_ci_additional_images', true);

if (is_serialized($serialized_data)) {
$additional_images = unserialize($serialized_data);

if (!empty($additional_images) && is_array($additional_images)) {
// Replace the default variation image with the first additional image
$src = reset($additional_images);
$html = '<img src="' . esc_url($src) . '" alt="" />';
// echo '<div class="woocommerce-variation single_variation"><div class="woocommerce-variation-thumbnail">' . '<img src="' . esc_url($src) . '" alt="' . esc_attr(get_the_title($variation_id)) . '" class="wp-post-image" /></div></div>';
}
} else {
if (wp_http_validate_url($serialized_data)) {
$src = $serialized_data;
$html = '<img src="' . esc_url($src) . '" alt="" />';
}
}

// If a custom image URL is found, replace the default thumbnail HTML
// if ($custom_image_url) {
//     $html = '<img src="' . esc_url($custom_image_url) . '" alt="" />';
// }

return $html;
 */
}

add_filter('woocommerce_single_product_image_thumbnail_html', 'custom_single_product_image_thumbnail_html', 10, 2);

/*

<ol class="flex-control-nav flex-control-thumbs">
<li><img onload="this.width = this.naturalWidth; this.height = this.naturalHeight" src="http://tayloredlocal.local/wp-content/uploads/2024/01/IMG_6798-scaled-100x100.jpg" class="flex-active" draggable="false" width="100" height="100" data-o_src="http://tayloredlocal.local/wp-content/uploads/2023/10/8610-60f6dfdd96458-100x100.png"></li>
<li><img onload="this.width = this.naturalWidth; this.height = this.naturalHeight" src="http://tayloredlocal.local/wp-content/uploads/2023/10/8610-60f6dfdd96458-100x100.png" draggable="false" width="100" height="100"></li>
<li><img onload="this.width = this.naturalWidth; this.height = this.naturalHeight" src="http://tayloredlocal.local/wp-content/uploads/2023/10/b160-572a50313fa41-100x100.jpg" draggable="false" width="100" height="100"></li>
<li><img onload="this.width = this.naturalWidth; this.height = this.naturalHeight" src="http://tayloredlocal.local/wp-content/uploads/2023/10/b626-60f6dfb982a8f-100x100.png" draggable="false" width="100" height="100"></li>
</ol>

 */
