<?php

include_once CI_STORE_PLUGIN . 'suppliers/ImportManager.php';
include_once CI_STORE_PLUGIN . 'suppliers/wps/Supplier_WPS.php';

class WPSImportManager extends CIStore\Suppliers\ImportManager {

    public function __construct($logger = null)
    {
        parent::__construct('wps', $logger);
    }

    public function custom_start($updated_at, $cursor, $import_type)
    {
        return parent::start([
            'updated_at' => $updated_at,
            'cursor' => $cursor,
            'import_type' => $import_type,
        ]);
    }

    protected function get_default_args()
    {
        return [
            'updated_at' => '2023-01-01',
            'cursor' => '',
            'import_type' => 'import',
        ];
    }

    protected function before_start($info)
    {
        $this->log('WPSImportManager::before_start() ' . json_encode($info['args']));
        $supplier = \Supplier_WPS::instance();
        $updated_at = $info['updated_at'] ?? $this->get_default_args()['updated_at'];
        $total = $supplier->get_total_remote_products($updated_at);
        $this->log('total=' . $total);
        return ['total' => $total]; //, 'args' => ['updated_at' => $updated_at, 'cursor' => '']];
    }

    protected function do_process($info)
    {
        $this->log('WPSImportManager::do_process() ' . json_encode($info['args']));
        $cursor = $info['args']['cursor'];
        $import_type = $info['args']['import_type'] ?? 'default';

        if (is_string($cursor)) {
            try {
                $updated_at = $info['args']['updated_at'] ?? $this->get_default_args()['updated_at'];
                $supplier = \Supplier_WPS::instance();

                // $items = $supplier->get_products_page($cursor, 'basic', $updated_at);
                switch ($import_type) {
                    case 'patch':
                        $items = $supplier->patch_products_page($cursor, $updated_at);
                        break;

                    case 'import':
                    default:
                        $items = $supplier->import_products_page($cursor, $updated_at);
                }

                $ids = array_map(fn($item) => $item['id'], $items['data'] ?? []);
                $next_cursor = $items['meta']['cursor']['next'] ?? false;
                $this->log('WPSImportManager::do_process() ' . json_encode(['type' => $import_type, 'cursor' => $cursor, 'next_cursor' => $next_cursor, 'date' => $updated_at, 'ids' => $ids]));
                $processed_delta = is_countable($items['data']) ? count($items['data']) : 0;
                $processed = $info['processed'] + $processed_delta;
                $progress = $info['total'] > 0 ? ($processed / $info['total']) : 0;
                return [
                    'cursor' => $next_cursor,
                    'processed' => $processed,
                    'progress' => $progress,
                    'args' => [
                         ...$info['args'],
                        'cursor' => $next_cursor,
                    ],
                ];
            } catch (Exception $e) {
                $this->log('!------ERROR------!');
                $this->log('Exception: ' . $e->getMessage());
                $this->log('Code: ' . $e->getCode());
                $this->log('File: ' . $e->getFile());
                $this->log('Line: ' . $e->getLine());
                $this->log('Stack trace: ' . $e->getTraceAsString());
            }
        } else {
            return [
                'complete' => true,
            ];
        }
    }
}

trait Supplier_WPS_ImportManager
{
    private string $default_updated_at = '2023-01-01';
    // protected WPSImportManager $importer = WPSImportManager::instance($this->key);

    public function get_importer()
    {
        // return WPSImportManager::instance($this->key);
        return new WPSImportManager($this->logger);
    }
}
