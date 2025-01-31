<?php
namespace CIStore\Hooks;

function custom_wp_get_attachment_url($url, $post_id)
{
    $meta      = get_post_meta($post_id);
    $file      = isset($meta['_wp_attached_file'][0]) ? $meta['_wp_attached_file'][0] : '';
    $is_remote = strpos($file, 'http://') === 0 || strpos($file, 'https://') === 0;
    if ($is_remote) {
        return $file;
    }
    return $url;
}
