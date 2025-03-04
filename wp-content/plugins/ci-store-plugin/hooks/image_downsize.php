<?php
namespace CIStore\Hooks;

function custom_image_downsize($out, $id, $size)
{
    // TODO: other suppliers won't have this luxury
    $file = get_post_meta($id, '_wp_attached_file', true);
    // error_log(json_encode(['f' => __FUNCTION__, 'file' => $file, '$out' => $out, '$id' => $id, '$size' => $size], JSON_PRETTY_PRINT));
    $is_remote = strpos($file, 'http://') === 0 || strpos($file, 'https://') === 0;

    if ($is_remote) {
        if ($size == 'full') {
            $file = str_replace('/500_max/', '/1000_max/', $file);
            return [$file, 1000, 1000];
        }

        if ($size == 'woocommerce_thumbnail' || $size == [100, 100]) {
            $file = str_replace('/500_max/', '/200_max/', $file);
            return [$file, 200, 200];
        }

        // woocommerce_single
        return [$file, 500, 500];

    }
    return $out;
}
