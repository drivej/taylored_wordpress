<?php
    namespace CIStore\Hooks;

    use function CIStore\Suppliers\get_supplier_import_version;

    // add updated date at bottom of product so we can quickly see if it's stale

    function custom_woocommerce_after_single_product()
    {
        // global $post; // Get the current product
        global $product;

        if ($product instanceof \WC_Product) {
            $updated        = $product->get_meta('_ci_update_pdp', true);
            $supplier_key   = $product->get_meta('_ci_supplier_key', true);
            $import_version   = $product->get_meta('_ci_import_version', true);
            // $import_version = get_supplier_import_version($supplier_key);

            if (! empty($updated)) {
                try {
                    // Convert the date string to a human-readable format
                    // Use JS so the date is in the user's timezone

                    $date           = new \DateTime($updated);
                    $formatted_date = $date->format('F j, Y, g:i A'); // Example: "January 26, 2025, 3:13 PM"
                ?>
                    <hr />
                    <small style="display:flex; justify-content:space-between;">
                        <div>
                            <?php echo strtoupper($supplier_key) ?>
                            &middot;
                            <?php echo $import_version ?>
                            &middot;
                            <?php echo $product->get_id() ?>
                        </div>
                        <div>
                            Updated:<?php echo $formatted_date ?>
                        </div>
                    </small>
                    <?php
                        } catch (\Exception $e) {
                                    }
                                } else {
                                    echo '<hr /><small>' . strtoupper($supplier_key) . ' &middot ' . $import_version . ' &middot ' . $product->get_id() . '</small>';
                                }
                            }
                        }