<?php
    namespace CIStore\Hooks;

    use function CIStore\Suppliers\get_supplier_import_version;

    // add updated date at bottom of product so we can quickly see if it's stale

    function custom_woocommerce_after_single_product()
    {
        // error_log(__FUNCTION__);
        // global $post; // Get the current product
        global $product;

        if ($product instanceof \WC_Product) {
            $updated        = $product->get_meta('_ci_update_pdp', true);
            $supplier_key   = $product->get_meta('_ci_supplier_key', true);
            $import_version = get_supplier_import_version($supplier_key);

            if (! empty($updated)) {
                try {
                    // Convert the date string to a human-readable format
                    // Use JS so the date is in the user's timezone
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
                        Updated:
                        <script>
                            const product_updated = Date.parse('<?php echo $updated ?>');
                            if(product_updated){
                                document.write(new Date(Date.parse('<?php echo $updated ?>')).toLocaleString('en-CA', {year: 'numeric',month: 'long',day: 'numeric',hour: 'numeric',minute: '2-digit',second: '2-digit',hour12: false}));
                            } else {
                                document.write('00-00-0000');
                            }
                        </script>
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
