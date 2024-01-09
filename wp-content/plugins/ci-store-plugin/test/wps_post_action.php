<?php

include_once __DIR__ . './../utils/print_utils.php';

function wps_post_action($item_id)
{
    $meta = null;
    $this_post = null;
    if (isset($item_id)) {
        $this_post = get_post($item_id);
        $meta = get_post_meta($this_post->ID);
    }
    printData(['post' => $this_post, 'meta' => $meta]);
}
