<?php

include_once __DIR__ . './../western/get_western_products_page.php';
include_once __DIR__ . './../western/western_utils.php';

function wps_page_action($item_id)
{   
    $products = get_western_products_page($item_id);
    echo '<table class="table"><tbody>';
    foreach ($products['data'] as $product) {
        $sku = get_western_sku($product['id']);
        $product_id = wc_get_product_id_by_sku($sku);
        $details_url = '?cmd=wps_product&page=ci-store-plugin-page-test&item_id=' . $product['id'];
        $import_url = '?cmd=wps_import&page=ci-store-plugin-page-test&item_id=' . $product['id'];
        $repair_url = '?cmd=woo_repair&page=ci-store-plugin-page-test&item_id=' . $product['id'];
        echo '<tr>
                <td>' . $product['id'] . '</td>
                <td>' . $product['name'] . '</td>
                <td>' . count($product['items']['data']) . ' items</td>
                <td>' . $sku . '</td>
                <td>' . $product_id . '</td>
                <td><a href="' . $details_url . '">details</a></td>
                <td><a href="' . $import_url . '">import</a></td>
                <td><a href="' . $repair_url . '">repair</a></td>
                <td><a href="/wp-admin/post.php?post=' . $product_id . '&action=edit">admin</a></td>
            </tr>';
    }
    echo '</tbody></table>';
    $prev = '?cmd=wps_page&page=ci-store-plugin-page-test&item_id=' . $products['meta']['cursor']['prev'];
    $next = '?cmd=wps_page&page=ci-store-plugin-page-test&item_id=' . $products['meta']['cursor']['next'];
    echo '<div class="btn-group"><a class="btn btn-secondary" href="' . $prev . '">prev page</a><a class="btn btn-secondary" href="' . $next . '">next page</a></div>';
}
