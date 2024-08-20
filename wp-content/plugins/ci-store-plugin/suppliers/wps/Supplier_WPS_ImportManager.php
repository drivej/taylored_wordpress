<?php

include_once CI_STORE_PLUGIN . 'suppliers/ImportManager.php';
include_once CI_STORE_PLUGIN . 'suppliers/wps/Supplier_WPS.php';

class WPSImportManager extends CIStore\Suppliers\ImportManager {

    // protected $default_updated_at = '2023-01-01';
    // protected $default_args = ['updated_at' => '2023-01-01', 'cursor' => ''];

    public function __construct($logger = null)
    {
        parent::__construct('wps', $logger); //, ['updated_at' => '2023-01-01', 'cursor' => '']);
    }

    public function custom_start($updated_at, $cursor, $import_type)
    {
        $this->log('WPSImportManager::custom_start()');
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
            'import_type' => 'full',
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
        // $this->log('WPSImportManager::do_process() ' . json_encode($info['args']));
        $cursor = $info['args']['cursor'];

        if (is_string($cursor)) {
            try {
                $updated_at = $info['args']['updated_at'] ?? $this->get_default_args()['updated_at'];
                $supplier = \Supplier_WPS::instance();

                // $items = $supplier->get_products_page($cursor, 'basic', $updated_at);
                switch ($info['args']['import_type'] ?? '') {
                    case 'patch':
                        $items = $supplier->patch_products_page($cursor, $updated_at);
                        break;

                    default:
                        $items = $supplier->import_products_page($cursor, $updated_at);
                }

                $ids = array_map(fn($item) => $item['id'], $items['data'] ?? []);
                $next_cursor = $items['meta']['cursor']['next'] ?? false;
                $this->log('WPSImportManager::do_process() ' . json_encode(['type' => $info['args']['import_type'] ?? '', 'cursor' => $cursor, 'next_cursor' => $next_cursor, 'date' => $updated_at, 'ids' => $ids]));
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
                error_log('Exception: ' . $e->getMessage());
                error_log('Code: ' . $e->getCode());
                error_log('File: ' . $e->getFile());
                error_log('Line: ' . $e->getLine());
                error_log('Stack trace: ' . $e->getTraceAsString());
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
