<?php

include_once __DIR__ . './../utils/print_utils.php';
include_once __DIR__ . './../western/get_western_product.php';
include_once __DIR__ . './../western/import_western_product.php';
include_once __DIR__ . './../western/update_product_attributes.php';
include_once __DIR__ . './../utils/Report.php';

// function get_attribute_key_by_name($attributes, $attr_name)
// {
//     foreach ($attributes as $key => $attr) {
//         if ($attr->get_name() === $attr_name) {
//             return $key;
//         }
//     }
//     return null;
// }

// function delete_attribute($attributes, $attr_name, $report)
// {
//     $attr_key = get_attribute_key_by_name($attributes, $attr_name);
//     if (isset($attr_key)) {
//         $report->addLog('delete attribute' . $attr_name);
//         unset($attributes[$attr_key]);
//     }
//     return $attributes;
// }

// function delete_attributes($attributes, $attr_names, $report)
// {
//     foreach ($attr_names as $attr_name) {
//         foreach ($attributes as $key => $attr) {
//             if ($attr->get_name() === $attr_name) {
//                 unset($attributes[$key]);
//             }
//         }
//     }
//     return $attributes;
// }

// function insert_attribute($attributes, $attr, $report)
// {
//     $new_attribute = new WC_Product_Attribute();
//     $new_attribute->set_name($attr['name']);
//     $new_attribute->set_options($attr['options']);
//     $new_attribute->set_id(0);
//     $new_attribute->set_visible(1);
//     $new_attribute->set_variation(1);
//     $attr_slug = sanitize_title($attr['name']);
//     $attributes[$attr_slug] = $new_attribute;
//     $report->addLog('insert attribute ' . $attr['name']);
//     return $attributes;
// }

// function upsert_attribute($attributes, $attr, $report)
// {
//     $attr_key = get_attribute_key_by_name($attributes, $attr['name']);
//     if (isset($attr_key)) {
//         $needs_update = attribute_needs_update($attributes, $attr);
//         $report->addLog('attribute ' . $attr['name'] . ' needs_update=' . $needs_update);
//         if ($needs_update) {
//             $attributes[$attr_key]->set_options($attr['options']);
//         }
//     } else {
//         $attributes = insert_attribute($attributes, $attr, $report);
//     }
//     return $attributes;
// }

// function attribute_needs_update($attributes, $attr)
// {
//     $attr_key = get_attribute_key_by_name($attributes, $attr['name']);
//     $old_options = $attributes[$attr_key]->get_options();
//     $new_options = $attr['options'];
//     $diff = array_values(array_merge(array_diff($old_options, $new_options), array_diff($new_options, $old_options)));
//     return (bool) count($diff);
// }

// function get_wps_attributes($wps_product)
// {
//     $wps_attributes = $wps_product['data']['attributekeys']['data'];

//     foreach ($wps_product['data']['items']['data'] as $item) {
//         foreach ($item['attributevalues']['data'] as $attr) {
//             $attr_id = $attr['attributekey_id'];
//             // $attr_name = $wps_attributes[$attr_id];
//             if (!isset($wps_attributes[$attr_id]['options'])) {
//                 $wps_attributes[$attr_id]['options'] = [];
//             }
//             if (!in_array($attr['name'], $wps_attributes[$attr_id]['options'])) {
//                 $wps_attributes[$attr_id]['options'][] = $attr['name'];
//             }
//         }
//     }

//     $allow_attributes = array_reduce($wps_attributes, function ($sum, $attr) {
//         $sum[] = $attr;
//         return $sum;
//     }, []);

//     return $allow_attributes;
// }

function woo_repair_action($wps_product_id)
{
    if (!isset($wps_product_id) || empty($wps_product_id)) {
        return;
    }
    $report = new Report();

    $wps_product = get_western_product($wps_product_id);
    $sku = get_western_sku($wps_product['data']['id']);
    $woo_product_id = wc_get_product_id_by_sku($sku);
    $woo_product = wc_get_product($woo_product_id);

    $images = get_additional_images($wps_product);
    $serialized_images = serialize($images);
    printData(['images' => $images, 'serialized_images' => $serialized_images]);
    $woo_product->update_meta_data('_ci_additional_images', $serialized_images);
    $woo_product->save();

    $woo_product = wc_get_product($woo_product_id);
    $serialized_data = get_post_meta($woo_product_id, '_ci_additional_images', true);
    $additional_images = unserialize($serialized_data);
    printData(['type' => gettype($additional_images), 'additional_images' => $additional_images, 'is_array' => is_array($additional_images), 'empty' => !empty($additional_images)]);
    
    if (!empty($additional_images) && is_array($additional_images)) {
        $src = reset($additional_images); // Get the first image from the array
        print_r(['src'=>$src]);
        // return '<img title="custom_modify_cart_item_thumbnail" src="' . esc_url($src) . '" class="attachment-shop_thumbnail wp-post-image">';
    }
    return;

    printData(['sku' => $sku, 'woo_product_id' => $woo_product_id, 'woo_product' => $woo_product]);

    // import_western_product($wps_product_id, false, $report);

    // update_product_taxonomy($woo_product, $wps_product, $report);

    update_product_attributes($woo_product, $wps_product, $report);
    $woo_product->save();

    $woo_product = wc_get_product($woo_product_id);

    $additional_images = get_post_meta($woo_product_id, '_ci_additional_images', false);
    print_r(['type' => gettype($additional_images), 'additional_images' => $additional_images, 'is_array' => is_array($additional_images), 'empty' => !empty($additional_images)]);
    // Use the first additional image as the thumbnail
    if (!empty($additional_images) && is_array($additional_images)) {
        $src = $additional_images[0]; //reset($additional_images); // Get the first image from the array
        print_r(['src' => $src]);
        // return '<img title="custom_modify_cart_item_thumbnail" src="' . esc_url($src) . '" class="attachment-shop_thumbnail wp-post-image">';
    }
    // $src = '';

    printData($report);

    // if($report->getData('attribute_changes')){
    //     $woo_product->save();
    // }
    return;

    // $new_attributes = get_wps_attributes($wps_product);
    // $new_attributes_names = array_map(fn($a) => $a['name'], $new_attributes);

    // printData(['new_attributes_names' => $new_attributes_names]);
    // // $allow_attribute_names = array_keys($allow_attributes);
    // // $current_attribute_names = array_reduce($attributes, function ($s, $attr) {
    // //     $s[] = $attr->get_name();
    // //     return $s;
    // // }, []);

    // // $wps_product_id = $product->get_meta('_ci_product_id');
    // $has_variations = count($wps_product['data']['items']['data']) > 0;
    // $has_attributes = count($wps_product['data']['attributekeys']['data']) > 0;
    // $is_variable = $woo_product->is_type('variable');

    // // $new_attr = ['name' => 'Color', 'options' => ['red', 'blue', 'green']];

    // // update_product_attributes($woo_product, $wps_product, $report);
    // $attributes = $woo_product->get_attributes();

    // // foreach($attributes as $key => $attr){
    // //     $attributes[$key]->get_name()
    // // }

    // $current_attribute_names = array_map(fn($a) => $a->get_name(), array_values($attributes));
    // $deletes = array_values(array_diff($current_attribute_names, $new_attributes_names));
    // $attributes = delete_attributes($attributes, $deletes, $report);

    // printData(['current_attribute_names' => $current_attribute_names]);
    // printData(['deletes' => $deletes]);

    // // $current_attribute_names = array_reduce($attributes, function ($s, $attr) {
    // //     $s[] = $attr->get_name();
    // //     return $s;
    // // }, []);

    // foreach ($new_attributes as $new_attr) {
    //     $needs_update = attribute_options_needs_update($attributes, $new_attr);
    //     printData(['new_attr' => $new_attr, 'needs_update' => $needs_update]);
    //     $attributes = upsert_attribute($attributes, $new_attr, $report);
    // }

    // // $needs_update = attribute_needs_update($attributes, $new_attr);

    // // $attr_key = get_attribute_key_by_name($attributes, $new_attr['name']);
    // // printData(['attr_key' => $attr_key]);
    // // // $attr = ['name' => 'Color', 'options' => ['red', 'blue']];
    // // $report = new Report();
    // // $attributes = upsert_attribute($attributes, $new_attr, $report);

    // // printData(['needs_update' => $needs_update]);
    // printData($report);
    // // delete_attribute($attributes, 'Color');

    // // $new_attribute = new WC_Product_Attribute();
    // // $new_attribute->set_name($attr['name']);
    // // $new_attribute->set_options($attr['options']);
    // // $new_attribute->set_id(0);
    // // $new_attribute->set_visible(1);
    // // $new_attribute->set_variation(1);
    // // $attr_slug = sanitize_title($attr['name']);
    // // $attributes[$attr_slug] = $new_attribute;

    // // $key = 'color';
    // // unset($attributes[$key]);

    // // $woo_product->set_attributes($attributes);
    // // $woo_product->save();

    // printData([
    //     'sku' => $sku,
    //     'has_variations' => $has_variations,
    //     'has_attributes' => $has_attributes,
    //     'is_variable' => $is_variable,
    //     'wps_product' => $wps_product,
    //     'woo_product_id' => $woo_product_id,
    //     'attributes' => array_keys($attributes),
    //     'woo_product' => $woo_product->get_data(),
    // ]);

}

// switch($cmd.'xxx'){

//     case 'wps_import' :
//         $report = new Report();
//         import_western_product($item_id, true, $report);
//         printData($report);
//         break;

//     case 'wps_product' :
//         $product = get_western_product($item_id);
//         printData($product);
//         break;

//     case 'woo_repair' :
//         $product = get_western_product($item_id);
//         printData($product);
//         break;

//     case 'wp_post' :
//         // $product = get_western_product($item_id);
//         // $post_id = product_exists('wps', $item_id);

//         // $product = wc_get_product($item_id);
//         /*
//         $wps_product_id = $product->get_meta('_ci_product_id');
//         $wps_product = get_western_product($wps_product_id);
//         $has_variations = count($wps_product['data']['items']['data'])>0;
//         $is_variable = $product->is_type('variable');

//         $report = new Report();
//         update_product_attributes($product, $wps_product, $report);
//         update_product_variations($product, $wps_product, $report);

//         $save_product = $report->getData('save_product');
//         if($save_product){
//             $product->save();
//         }
//         */

//         // printData($product);
//         // return;

//         // if(false){
//         //     update_product_attributes($product, $wps_product, $report);
//         //     if($save_attributes){
//         //         $product->save();
//         //     }
//         //     printData($report);
//         // }

//         // $attributes = $product->get_attributes();

//         // printData([
//         //     // 'save_attributes'=>$save_attributes,
//         //     'type'=> $product->get_type(),
//         //     'children'=> $product->get_children(),
//         //     '_ci_product_id'=>$product->get_meta('_ci_product_id'),
//         //     'has_variations'=>$has_variations,
//         //     'is_variable'=>$is_variable,
//         //     'attrs' => count($attributes),
//         //     // 'new_attribute'=>$new_attribute->get_data(),
//         //     'keys'=>array_keys($attributes),
//         //     'attributes'=>array_map(fn($attr) => $attr->get_data(), $attributes)
//         //     // 'fred'=>$attributes['color']->get_data()
//         // ]);

//         $meta = null;
//         $this_post = null;
//         if(isset($item_id)){
//             $this_post = get_post($item_id);
//             $meta = get_post_meta($this_post->ID);
//         }
//         printData(['post'=>$this_post, 'meta'=>$meta]);

//         // printData($wps_product);
//         break;

//     default :

// }
