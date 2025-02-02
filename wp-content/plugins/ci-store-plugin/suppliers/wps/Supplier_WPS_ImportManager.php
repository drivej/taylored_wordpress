<?php

include_once CI_STORE_PLUGIN . 'suppliers/ImportManager.php';
include_once CI_STORE_PLUGIN . 'suppliers/wps/Supplier_WPS.php';
include_once CI_STORE_PLUGIN . 'utils/Timer.php';

class WPSImportManager extends CIStore\Suppliers\ImportManager
{
    /**
     * The single instance of the class.
     *
     * @var WPSImportManager
     */
    protected static $_instance = null;

    public function __construct($logger = null)
    {
        parent::__construct('wps', $logger);
    }

    public static function instance()
    {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    public function custom_start($updated_at, $cursor, $import_type)
    {
        return parent::start([
            'updated_at'  => $updated_at,
            'cursor'      => $cursor,
            'import_type' => $import_type,
        ]);
    }

    public function get_default_args()
    {
        return [
            'updated_at'  => '2023-01-01',
            'cursor'      => '',
            'import_type' => 'import',
        ];
    }

    public function before_start($info)
    {
        $supplier   = \Supplier_WPS::instance();
        $updated_at = $info['args']['updated_at'] ?? $this->get_default_args()['updated_at'];
        $total      = $supplier->get_total_remote_products($updated_at);
        return ['total' => $total];
    }

    public function do_process($info)
    {
        // $this->log(__FUNCTION__, 'start');
        // $this->log('WPSImportManager::do_process() ' . json_encode($info['args']));
        $cursor      = $info['args']['cursor'];
        $import_type = $info['args']['import_type'] ?? 'default';

        if (is_string($cursor)) {
            try {
                $timer      = new Timer();
                $updated_at = $info['args']['updated_at'] ?? $this->get_default_args()['updated_at'];
                $supplier   = \Supplier_WPS::instance();

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
                // $this->log(json_encode(['cursor' => $items['meta']['cursor']], JSON_PRETTY_PRINT));
                $next_cursor = $items['meta']['cursor']['next'] ?? false;
                // $this->log(__FUNCTION__, json_encode(['type' => $import_type, 'cursor' => $cursor, 'next_cursor' => $next_cursor, 'date' => $updated_at, 'ids' => $ids]));
                $processed_delta = is_countable($items['data']) ? count($items['data']) : 0;
                $processed       = $info['processed'] + $processed_delta;
                $progress        = $info['total'] > 0 ? ($processed / $info['total']) : 0;

                $time = $timer->lap();
                $this->log(__FUNCTION__, json_encode(['time' => $time, 'total' => count($ids), 'type' => $import_type, 'cursor' => $cursor, 'next_cursor' => $next_cursor, 'date' => $updated_at, 'ids' => $ids]));

                // $this->log(__FUNCTION__, 'end');
                return [
                    'cursor'    => $next_cursor,
                    'processed' => $processed,
                    'progress'  => $progress,
                    'args'      => [
                         ...$info['args'],
                        'cursor' => $next_cursor,
                    ],
                ];
            } catch (Exception $e) {
                $this->log(__FUNCTION__, 'ERROR');
                $this->log('Exception: ' . $e->getMessage());
                $this->log('Code: ' . $e->getCode());
                $this->log('File: ' . $e->getFile());
                $this->log('Line: ' . $e->getLine());
                $this->log('Stack trace: ' . $e->getTraceAsString());

                return [
                    'complete' => false,
                    'error'    => $e->getMessage(),
                ];
            }
        } else {
            $this->log(__FUNCTION__, 'complete');
            return [
                'complete' => true,
            ];
        }
    }

    public function get_auto_import_args()
    {
        $info = $this->get_info();

        if ($info['completed']) {
            $completed  = new \DateTime($info['completed']);
            $updated_at = $completed->format('Y-m-d');
            return [
                'updated_at'  => $updated_at,
                'cursor'      => '',
                'import_type' => 'import',
            ];
        }
        return [];
    }

    public function get_rerun_args()
    {
        $info = $this->get_info();
        $args = [
             ...($info['args'] ?? []),
            'cursor' => '',
        ];
        return $args;

    }

    public function on_complete($info)
    {
        $this->log('WPS Import Complete');
    }
}

trait Supplier_WPS_ImportManager
{
    private string $default_updated_at = '2023-01-01';
    // protected WPSImportManager $importer = WPSImportManager::instance($this->key);
    /**
     * @return WPSImportManager A new importer instance.
     */
    public function get_importer()
    {
        return WPSImportManager::instance();
    }
}
