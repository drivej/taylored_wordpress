<?php
// TODO: not used yet??

class WPS_Item
{
    public $data = array(
        "id" => 0,
        "brand_id" => 0,
        "country_id" => 0,
        "product_id" => 0,
        "sku" => "",
        "name" => "",
        "list_price" => "",
        "standard_dealer_price" => "",
        "supplier_product_id" => "",
        "length" => 0,
        "width" => 0,
        "height" => 0,
        "weight" => 0,
        "upc" => null,
        "superseded_sku" => null,
        "status_id" => "STK",
        "status" => "STK",
        "unit_of_measurement_id" => 12,
        "has_map_policy" => false,
        "sort" => 0,
        "created_at" => "2000-01-01 00:00:00",
        "updated_at" => "2000-01-01 00:00:00",
        "published_at" => "2000-01-01 00:00:00",
        "product_type" => "Suspension",
        "mapp_price" => "0.00",
        "carb" => null,
        "propd1" => null,
        "propd2" => null,
        "prop_65_code" => null,
        "prop_65_detail" => null,
        "drop_ship_fee" => "",
        "drop_ship_eligible" => true,
    );

    public function __construct($json_object = null)
    {
        $this->data = array_merge($this->data, $json_object['data']);
    }
}
