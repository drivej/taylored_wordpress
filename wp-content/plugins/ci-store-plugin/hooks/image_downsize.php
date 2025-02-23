<?php
namespace CIStore\Hooks;

function custom_image_downsize($out, $id, $size)
{
    $file      = get_post_meta($id, '_wp_attached_file', true);
    $is_remote = strpos($file, 'http://') === 0 || strpos($file, 'https://') === 0;

    if ($is_remote) {
        return [$file, 600, 600];
    }
    return $out;
}
