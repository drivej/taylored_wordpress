<?php

require_once __DIR__ . '/get_western.php';

$WESTERN_ATTRIBUTES_CACHE = [];

function get_western_attributes_tally_from_product($product)
{
    $attribute_ids = [];

    foreach ($product['data']['items']['data'] as $item) {
        foreach ($item['attributevalues']['data'] as $attr) {
            if (!array_key_exists($attr['attributekey_id'], $attribute_ids)) {
                $attribute_ids[$attr['attributekey_id']] = 0;
            }
            $attribute_ids[$attr['attributekey_id']]++;
        }
    }
    return $attribute_ids;
}

function get_western_attributes_from_product($product) // wps_product
{
    global $WESTERN_ATTRIBUTES_CACHE;
    $attribute_ids = get_western_attributes_tally_from_product($product);
    $all_ids = array_keys($attribute_ids);
    $ids = array_filter($all_ids, fn($id) => !array_key_exists($id, $WESTERN_ATTRIBUTES_CACHE));

    $cursor = '';
    $data = [];

    if (count($ids) === 1) {
        // handle request for single item
        $res = get_western('attributekeys/' . implode(',', $ids));
        $res['data']['slug'] = sanitize_title($res['data']['name']);
        $WESTERN_ATTRIBUTES_CACHE[$ids[0]] = $res['data'];
        // $attributes[] = $res['data'];
    } else {
        // handle request for multiple items
        // gather data with pagination
        while (isset($cursor)) {
            $res = get_western('attributekeys/' . implode(',', $ids), ['page[size]' => 20, 'page[cursor]' => $cursor]);
            foreach ($res['data'] as $attr) {
                $attr['slug'] = sanitize_title($attr['name']);
                $WESTERN_ATTRIBUTES_CACHE[$attr['id']] = $attr;
            }
            array_push($data, ...$res['data']);
            if (isset($res['meta']['cursor']['next'])) {
                $cursor = $res['meta']['cursor']['next'];
            } else {
                unset($cursor);
            }
        }
    }

    $valid_ids = array_filter($all_ids, fn($id) => array_key_exists($id, $WESTERN_ATTRIBUTES_CACHE));
    return array_reduce($valid_ids, 'reduce_ids', []);

    // return array_map(fn($id) => $WESTERN_ATTRIBUTES_CACHE[$id], $valid_ids);
}

function reduce_ids($sum, $id)
{
    global $WESTERN_ATTRIBUTES_CACHE;
    $sum[$id] = $WESTERN_ATTRIBUTES_CACHE[$id];
    return $sum;
}
