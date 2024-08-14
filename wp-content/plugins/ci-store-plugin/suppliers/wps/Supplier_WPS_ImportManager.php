<?php

include_once CI_STORE_PLUGIN . 'suppliers/ImportManager.php';

class WPSImportManager extends CIStore\Suppliers\ImportManager {

    // protected $default_updated_at = '2023-01-01';
    // protected $default_args = ['updated_at' => '2023-01-01', 'cursor' => ''];

    public function __construct()
    {
        parent::__construct('wps'); //, ['updated_at' => '2023-01-01', 'cursor' => '']);
    }

    protected function get_default_args()
    {
        return ['updated_at' => '2023-01-01', 'cursor' => ''];
    }

    protected function before_start($info)
    {
        error_log('WPSImportManager::before_start() ' . json_encode($info['args']));
        $supplier = \Supplier_WPS::instance();
        $updated_at = $info['updated_at'] ?? $this->get_default_args()['updated_at'];
        $total = $supplier->get_total_remote_products($updated_at);
        return ['total' => $total, 'args' => ['updated_at' => $updated_at, 'cursor' => '']];
    }

    protected function do_process($info)
    {
        error_log('WPSImportManager::do_process() ' . json_encode($info['args']));
        $cursor = $info['args']['cursor'];

        if (is_string($cursor)) {
            $updated_at = $info['updated_at'] ?? $this->get_default_args()['updated_at'];
            $supplier = \Supplier_WPS::instance();

            $items = $supplier->get_products_page($cursor, 'basic', $updated_at);

            $ids = array_map(fn($item) => $item['id'], $items['data'] ?? []);
            $next_cursor = $items['meta']['cursor']['next'] ?? false;
            // error_log('WPSImportManager::do_process() ' . json_encode(['cursor' => $cursor, 'next_cursor' => $next_cursor, 'date' => $updated_at, 'ids' => $ids]));
            $processed_delta = is_countable($items['data']) ? count($items['data']) : 0;
            $processed = $info['processed'] + $processed_delta;
            $progress = $info['total'] > 0 ? ($processed / $info['total']) : 0;
            return [
                'cursor' => $next_cursor,
                'processed' => $processed,
                'progress' => $progress,
            ];
        } else {
            return [
                'complete' => true,
            ];
        }
    }
}

// trait Supplier_WPS_ImportManager
// {
//     protected WPSImportManager $importer = WPSImportManager::instance($this->key);
// }