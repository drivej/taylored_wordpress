<?php

include_once CI_STORE_PLUGIN . 'suppliers/ImportManager.php';
include_once CI_STORE_PLUGIN . 'suppliers/wps/Supplier_WPS.php';
include_once CI_STORE_PLUGIN . 'suppliers/wps/Supplier_WPS_Log.php';
include_once CI_STORE_PLUGIN . 'utils/Timer.php';

use function CIStore\Suppliers\WPS\wps_log;

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

    public function log(...$args)
    {
        wps_log(...$args);
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
            'import_type' => 'product',
        ];
    }

    public function before_start($info)
    {
        $supplier    = \Supplier_WPS::instance();
        $import_type = $info['args']['import_type'] ?? 'default';

        switch ($import_type) {
            case 'vehicles':
                $result = $supplier->get_api('vehicles', ['countOnly' => 'true']);
                $total  = $result['data']['count'] ?? -1;
                break;

            case 'item_vehicles':
                $result = $supplier->get_api('items', ['countOnly' => 'true']);
                $total  = $result['data']['count'] ?? -1;
                break;

            case 'patch':
            case 'product_vehicles':
            case 'products':
                $updated_at = $info['args']['updated_at'] ?? $this->get_default_args()['updated_at'];
                $total      = $supplier->get_total_remote_products($updated_at);
                break;

            default:
                $total = 0;

        }
        return ['total' => $total];
    }

    public function do_process($info)
    {
        // $this->log(__FUNCTION__, 'start');
        // $this->log('WPSImportManager::do_process() ' . json_encode($info['args']));
        $cursor      = $info['args']['cursor'] ?? '';
        $import_type = $info['args']['import_type'] ?? 'default';

        if (! is_string($cursor)) {
            $this->log(__FUNCTION__, 'Process complete.');
            return ['complete' => true];
        }

        try {
            $timer      = new Timer();
            $updated_at = isset($info['args']['updated_at']) ? $info['args']['updated_at'] : $this->get_default_args()['updated_at'];
            $supplier   = \Supplier_WPS::instance();
            $items      = [];
            $ids        = [];

            switch ($import_type) {
                case 'products':
                    $items = $supplier->import_products_page($cursor, $updated_at);
                    $ids   = $items['data'];
                    break;

                case 'patch':
                    $items = $supplier->patch_products_page($cursor, $updated_at);
                    $ids   = array_map(fn($item) => $item['id'], $items['data'] ?? []);
                    break;

                case 'vehicles':
                    $items = $supplier->import_vehicles_page($cursor);
                    $ids   = $items['data'];
                    break;

                case 'product_vehicles':
                    $items = $supplier->import_product_vehicles_page($cursor);
                    break;

                case 'item_vehicles':
                    $page  = $supplier->get_items_page($cursor, $updated_at);
                    $items = $supplier->import_item_vehicles($page);
                    break;

                case 'product_plp':
                    $items = $supplier->import_products_page($cursor, $updated_at);
                    $ids   = array_map(fn($item) => $item['id'], $items['data'] ?? []);
                    break;

                case 'taxonomy':
                    $items = $supplier->import_taxonomy_page($cursor, $updated_at);
                    $ids   = $items['data'];
                    break;
            }

            $next_cursor     = $items['meta']['cursor']['next'] ?? false;
            $processed_delta = isset($items['meta']['total']) ? $items['meta']['total'] : count($items['data'] ?? []);
            $processed       = $info['processed'] + $processed_delta;
            $progress        = $info['total'] > 0 ? ($processed / $info['total']) : 0;
            $time            = $timer->lap();

            $this->log(__FUNCTION__, json_encode([
                'rate'        => $processed_delta > 0 ? number_format($time / $processed_delta, 2) : 0,
                'time'        => number_format($time, 2),
                'total'       => $processed_delta,
                'type'        => $import_type,
                'cursor'      => $cursor,
                'next_cursor' => $next_cursor,
                'date'        => $updated_at,
                'ids'         => $ids,
            ]));

            unset($items, $ids);
            gc_collect_cycles();

            return [
                'cursor'    => $next_cursor,
                'processed' => $processed,
                'progress'  => $progress,
                'args'      => [ ...$info['args'], 'cursor' => $next_cursor],
            ];
        } catch (Exception $e) {
            $this->log(__FUNCTION__, 'ERROR');
            $this->log('Message: ' . $e->getMessage());
            $this->log('Code: ' . $e->getCode());
            $this->log('File: ' . $e->getFile() . ' Line: ' . $e->getLine());
            $this->log('Stack trace: ' . $e->getTraceAsString());

            return [
                'complete' => false,
                'error'    => $e->getMessage(),
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
                'import_type' => 'products',
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
