<?php

namespace WooDropship\Suppliers;

use WooDropship\Models\Shipment;
use WooDropship\Models\Shipments;
use WooDropship\Suppliers\Requests\Tucker as Request;

class Tucker extends Supplier implements Contract
{
    private $request;
    private $testing = true;
    public $slug = 'tucker';

    public function __construct()
    {
        $options = get_option("{$this->slug}_api_fields");
        $this->request = new Request($options, $this->testing);
    }

    public function stockCheck(array $items)
    {
        return $this->request->stockCheck([
            'item' => $this->filter('stock_check', $items),
        ]);
    }

    public function priceCheck(array $items)
    {
        return $this->request->priceCheck([
            'item' => $this->filter('price_check', $items),
        ]);
    }

    public function submitOrder(array $items, array $data): string
    {
        $this->action('pre_submit_order', $items, $data, $this);

        $firstName = $data['shipping_first_name'] ?? $data['billing_first_name'];
        $lastName = $data['shipping_last_name'] ?? $data['billing_last_name'];

        $orderData = $this->filter('order_data', [
            'name' => $firstName . ' ' . $lastName,
            'address1' => $data['shipping_address_1'] ?? $data['billing_address_1'],
            'address2' => $data['shipping_address_2'] ?? $data['billing_address_2'],
            'city' => $data['shipping_city'] ?? $data['billing_city'],
            'state' => $data['shipping_state'] ?? $data['billing_state'],
            'zip' => $data['shipping_postcode'] ?? $data['billing_postcode'],
            'submit' => $this->testing ? 'NO' : 'YES',
            'invoiceNote' => $data['order_comments'],
            'line' => $items,
        ], $this);

        $errors = [];

        $tuckerOrder = $this->filter("{$this->slug}_order", $this->request->submitOrder($orderData), $this);

        foreach ($tuckerOrder->orderline as $orderLine) {
            if ($orderLine->errormsg !== "") {
                $errors[$orderLine->itemnum] = $orderLine->errormsg;
            }
        }

        if (count($errors)) {
            throw new \Exception($this->filter('order_errors', implode("\n", $errors), $this));
        }

        $this->action('order_submitted', $tuckerOrder, $this);

        return $this->filter('order_number', $tuckerOrder->ordernum);
    }

    public function getShipments(array $orders): Shipments
    {
        $shipments = $this->request->getShipments([
            'ordernum' => $orders,
        ]);

        $orders = new Shipments();

        foreach ($shipments as $shipment) {
            $orders[$shipment->ordernum] = new Shipment(
                $shipment->ordernum,
                $shipment->shipmentline[0]->trackingnumbers[0]->carrier,
                $shipment->shipmentline[0]->trackingnumbers[0]->trackingnum
            );
        }

        return $orders;
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
