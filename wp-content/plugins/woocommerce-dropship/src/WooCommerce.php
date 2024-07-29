<?php

namespace WooDropship;

class WooCommerce
{

    private $cacheSeconds = 30;

    public function productQuantityRequested($quantity, $product_id)
    {
        return $quantity;
    }

    public function productIsInStock($is_in_stock, $product)
    {
        $supplier = $this->getObjectSupplier($product);
        if (!$supplier) {
            return $is_in_stock;
        }

        return $this->getDistributorQuantity($product) >= $supplier->stockThreshold(); // supplier stock threshold
    }

    public function productQuantity($localQty, $product)
    {
        $supplier = $this->getObjectSupplier($product);
        if (!$supplier) {
            return $localQty;
        }

        return $this->getDistributorQuantity($product);
    }

    private function getDistributorQuantity($product)
    {
        $sku = $product->get_sku();
        $supplier = $this->getObjectSupplier($product);

        return $this->cacheRemember("{$supplier->slug}_inv_" . $sku, function () use ($sku, $supplier) {
            return $supplier->stockCheck([
                $sku,
            ]);
        }, $this->cacheSeconds);
    }

    private function setDistributorPrice($product)
    {

    }

    public function productSku($sku, $product)
    {
		// TODO: use metadata for supplier id
        if (($ind = strpos($sku, '_')) !== false) {
            return substr($sku, $ind + 1);
        }
        return $sku;
    }

    private function cacheRemember($key, $whatToRemember, $exp = 600)
    {
        $existing = $_SESSION[$key] ?? false;
        if ($existing && (time() < $existing['exp'])) {
            return $existing['value'];
        }

        $value = $whatToRemember();

        $_SESSION[$key] = [
            'value' => $value,
            'exp' => time() + $exp,
            'time' => time(),
        ];

        return $value;
    }

    public function orderCreateSupplierOrder($order, $data)
    {

        $supplierOrderQueue = [];
        $success = [];

        foreach ($order->get_items() as $line) {
            $product = wc_get_product($line->get_product_id());

            $supplier = $this->getObjectSupplier($product);
            if (!$supplier) {
                continue;
            }

            if (empty($supplierOrderQueue[$supplier::class]['lines'])) {
                $supplierOrderQueue[$supplier::class]['lines'] = [];
            }

            $supplierOrderQueue[$supplier::class]['lines'][] = $product->get_sku() . ',' . $line->get_quantity();
            $supplierOrderQueue[$supplier::class]['instance'] = $supplier;
        }

        foreach ($supplierOrderQueue as $class => $supplierOrder) {
            $key = $supplierOrder['instance']->slug;
            $success[$key] = $supplierOrder['instance']->submitOrder($supplierOrder['lines'], $data);

            $order->update_meta_data("_supplier_class", $class);
        }

        foreach ($success as $supplierSlug => $orderNumber) {
            $order->update_meta_data("_{$supplierSlug}_order_id", $orderNumber);
        }

    }

    public function registerShippedStatus()
    {
        register_post_status('wc-shipped', [
            'label' => 'Order Shipped',
            'public' => true,
            'show_in_admin_status_list' => true,
            'show_in_admin_all_list' => true,
            'exclude_from_search' => false,
            'label_count' => _n_noop('Order Shipped (%s)', 'Order Shipped (%s)'),
        ]);

        register_post_status('wc-not-shipped', [
            'label' => 'Not Yet Shipped',
            'public' => true,
            'show_in_admin_status_list' => true,
            'show_in_admin_all_list' => true,
            'exclude_from_search' => false,
            'label_count' => _n_noop('Not Yet Shipped (%s)', 'Not Yet Shipped (%s)'),
        ]);
    }

    public function addShippedStatus($order_statuses)
    {
        $new_order_statuses = array();
        foreach ($order_statuses as $key => $status) {
            $new_order_statuses[$key] = $status;
            if ('wc-completed' === $key) {
                $new_order_statuses['wc-shipped'] = 'Order Shipped';
            }
        }
        return $new_order_statuses;
    }

    private function getObjectSupplier($item)
    {
        $supplierKey = $item->get_meta('_supplier_class', true) ?: false;

        if ($supplierKey && class_exists($supplierKey)) {
            return new $supplierKey();
        }

        return false;
    }

    public function getSupplier($supplierKey)
    {
        switch ($supplierKey) {
            case 'wps':
                return new \WooDropship\Suppliers\Western();
        }
        // if ($supplierKey && class_exists($supplierKey)) {
        //     return new $supplierKey();
        // }

        return false;
    }

    public function manageStock($manageStock, $product)
    {
        $supplier = $this->getObjectSupplier($product);
        return is_object($supplier) ? $supplier->manageStock($manageStock) : $manageStock;
    }

    public function updateShippedOrders()
    {
        $completedOrders = wc_get_orders([
            'status' => ['wc-completed'],
        ]);

        $supplierOrders = [];
        foreach ($completedOrders as $order) {
            $supplier = $this->getObjectSupplier($order);
            $class = $order->get_meta('_supplier_class', true);

            if (!isset($supplierOrders[$class])) {
                $supplierOrders[$class] = [];
            }

            $supplierOrders[$class][] = $order->get_meta("_{$supplier->slug}_order_id", true);
        }

        foreach ($supplierOrders as $supplierClass => $orders) {
            if (!class_exists($supplierClass)) {
                continue;
            }

            $supplier = new $supplierClass();
            $shipments = $supplier->getShipments($orders);

            foreach ($completedOrders as $wooOrder) {
                if (isset($shipments[$wooOrder->get_meta("_{$supplier->slug}_order_id", true)])) {
                    $shipment = $shipments[$wooOrder->get_meta("_{$supplier->slug}_order_id", true)];
                    $wooOrder->update_meta_data('_shipping_carrier', $shipment->getCarrier());
                    $wooOrder->update_meta_data('_shipping_tracking', $shipment->getTracking());
                    $wooOrder->update_status('wc-shipped', 'Order Shipped. ' . $shipment->getCarrier() . ':' . $shipment->getTracking(), true);
                }
            }
        }

    }
}
