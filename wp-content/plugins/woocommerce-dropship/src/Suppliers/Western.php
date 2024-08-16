<?php

namespace WooDropship\Suppliers;

use WooDropship\Models\Shipment;
use WooDropship\Models\Shipments;
use WooDropship\Suppliers\Requests\WesternAPI as Request;
use WooDropship\Suppliers\Settings\WesternSettings;

class Western extends Supplier implements Contract
{
    public $request;
    private $testing = true;
    private WesternSettings $settings;
    public $slug = 'wps';

    public function __construct()
    {
        $this->settings = new WesternSettings();
        $options = get_option("{$this->settings->slug}_api_fields");
        $this->request = new Request($options);
    }

    public function stockCheck(array $items)
    {
        return $items;
        // return ['test' => 1];
        // return $this->request->request(['path' => '/items/' . implode(',', $items)]);
        return $this->request->stockCheck([
            'item' => $this->filter('stock_check', $items),
        ]);
    }

    public function priceCheck(array $items)
    {
        error_log('priceCheck() ' . json_encode(['items' => $items]));
        return $items;
        return $this->request->priceCheck([
            'item' => $this->filter('price_check', $items),
        ]);
    }

    public function submitOrder(array $items, array $data): string
    {
        error_log('XX submitOrder() ' . json_encode(['items' => $items]));

        $this->action('pre_submit_order', $items, $data, $this);

        $firstName = $data['shipping_first_name'] ?? $data['billing_first_name'];
        $lastName = $data['shipping_last_name'] ?? $data['billing_last_name'];

        $poNumber = "woo_" . time();

        $cartData = $this->filter('order_data', [
            'po_number' => $poNumber,
            'ship_name' => $firstName . ' ' . $lastName,
            'ship_address1' => $data['shipping_address_1'] ?? $data['billing_address_1'],
            'ship_address2' => $data['shipping_address_2'] ?? $data['billing_address_2'],
            'ship_city' => $data['shipping_city'] ?? $data['billing_city'],
            'ship_state' => $data['shipping_state'] ?? $data['billing_state'],
            'ship_zip' => $data['shipping_postcode'] ?? $data['billing_postcode'],
            //'submit' => $this->testing ? 'NO' : 'YES',
            'comment1' => ($data['order_comments'] ?? '') . ' Order Submitted from WooCommerce.',
        ], $this);

        $errors = [];

        error_log(json_encode($cartData, JSON_PRETTY_PRINT));

        $wpsCart = $this->request->createCart($cartData);
        error_log(json_encode($wpsCart, JSON_PRETTY_PRINT));

        foreach ($items as $item) {
            $line = explode(',', $item);
            $atc = $this->request->addToCart($poNumber, $line[0], $line[1]);
            error_log(json_encode($atc), JSON_PRETTY_PRINT);
        }

        $wpsOrder = $this->request->submitOrder($poNumber);
        error_log(json_encode($wpsOrder), JSON_PRETTY_PRINT);

        /* foreach ($wpsOrder->orderline as $orderLine) {
        if ($orderLine->errormsg !== "") {
        $errors[$orderLine->itemnum] = $orderLine->errormsg;
        }
        }

        if (count($errors)) {
        throw new \Exception($this->filter('order_errors', implode("\n", $errors), $this));
        }
         */
        $this->action('order_submitted', $wpsOrder, $this);

        return $this->filter('order_number', $poNumber);
    }

    public function getShipments(array $orders): Shipments
    {
        $output = new Shipments();

        foreach ($orders as $order) {
            $shipment = $this->request->getShipments($order);

            foreach ($shipment->order_details as $details) {
                $output[$shipment->po_number] = new Shipment(
                    $details->order_number,
                    $details->ship_via,
                    $details->tracking_numbers[0] ?? ''
                );
            }

        }

        return $output;
    }

    public function stockThreshold()
    {
        return $this->filter('stock_threshold', $this->request->stockThreshold);
    }

    public function manageStock($default)
    {
        return false;
    }

}
