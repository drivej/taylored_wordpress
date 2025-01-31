<?php

include_once CI_STORE_PLUGIN . 'suppliers/ImportManager.php';
include_once CI_STORE_PLUGIN . 'suppliers/t14/Supplier_T14.php';

class T14ImportManager extends CIStore\Suppliers\ImportManager
{
    /**
     * The single instance of the class.
     *
     * @var T14ImportManager
     */
    protected static $_instance = null;

    public function __construct()
    {
        parent::__construct('t14');
    }

    public static function instance()
    {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    public function custom_start($days, $page, $import_type)
    {
        return parent::start([
            'days'        => $days,
            'page'        => $page,
            'import_type' => $import_type,
        ]);
    }

    public function get_default_args()
    {
        $supplier = \Supplier_T14::instance();

        return [
            'days'        => 1,
            'page'        => 1,
            'import_type' => 'brands',
            'brands'      => $supplier->get_allowed_brand_ids(),
            'brand_index' => 0,
            'offset'      => 0,
            'limit'       => 24,
        ];
    }

    public function before_start($info)
    {
        // $this->log(__FUNCTION__, $info);
        $supplier = \Supplier_T14::instance();
        // $days     = $info['args']['days'] ?? $this->get_default_args()['days'];
        // $total    = $supplier->get_total_remote_products($days);
        // $this->log(['total' => $total]);
        // $brand_ids = $supplier->get_allowed_brand_ids();
        $brands_info = $supplier->get_brands_info();
        return ['total' => $brands_info['meta']['total']];
        // return [
        //     'total' => $brands_info['meta']['total'],
        //     'brands' => $brands_info['data'],
        //     'brand_index' => 0,
        //     'brand_id' => '',
        //     'brand_page' => 0
        // ];
    }

    public function do_process($info)
    {
        // $this->log(__FUNCTION__, $info);
        // $this->log('T14ImportManager::do_process() ' . json_encode($info['args']));
        $page        = $info['args']['page'];
        $next_page   = $page + 1;
        $import_type = $info['args']['import_type'] ?? 'brands';

        $brand_index = $info['args']['brand_index'];
        $brands      = $info['args']['brands'];
        $offset      = $info['args']['offset'];
        $limit       = $info['args']['limit'];
        $brand_id    = isset($brands[$brand_index]) ? $brands[$brand_index] : 0;
        // $brand_page  = $info['args']['brand_page'];

        $supplier = \Supplier_T14::instance();

        // if ($brand_page === 0) {
        // $page = $brand_page + 1;
        if ($import_type === 'brands') {

            $result = $supplier->import_brand($brand_id, $offset, $limit);

            if ($result['error']) {
                return [
                    'complete' => true,
                    'error'    => true,
                ];
            }

            $this->log($result);
            // error_log(json_encode(['result' => $result]));
            $count = $result['total'];
            $info['processed'] += $count;
            $this->log(__FUNCTION__, 'brand_index=', $brand_index, ' of ', count($brands), 'brand_id=', $brand_id, 'count=', $count, 'processed=', $info['processed']);

            if ($result['complete']) {
                $info['args']['brand_index']++;
                $info['args']['offset'] = 0;
            } else {
                $info['args']['offset'] += $limit;
            }
            // if ($count) {
            //     $items = $supplier->process_page($page);
            // }

            // if ($count === 0 || $items['meta']['total_pages'] === $brand_page) {
            //     // end of brand
            //     $info['args']['brand_index']++;
            //     $info['args']['brand_page'] = 1;
            // } else {
            //     $info['args']['brand_page']++;
            // }

            if ($brand_index > count($brands) - 1) {
                return [
                    'complete' => true,
                ];
            }

            return [
                // 'cursor' => $next_cursor,
                'processed' => $info['processed'],
                'progress'  => $info['total'] > 0 ? ($info['processed'] / $info['total']) : 0,
                'args'      => [
                     ...$info['args'],
                    // 'page' => $next_page,
                ],
            ];
        }

        if (is_numeric($page)) {
            $timer = new Timer();
            try {
                $days     = $info['args']['days'] ?? $this->get_default_args()['days'];
                $supplier = \Supplier_T14::instance();

                switch ($import_type) {
                    case 'import':
                    default:
                        $items = $supplier->import_products_page($page, $days);
                }

                $ids = array_map(fn($item) => $item['id'], $items['data'] ?? []);
                // $this->log(__FUNCTION__, ['cursor' => $items['meta']['cursor']]);
                $next_page = $items['meta']['cursor']['next'] ?? false;
                // $this->log(__FUNCTION__, ['type' => $import_type, 'cursor' => $cursor, 'next_cursor' => $next_cursor, 'date' => $updated_at, 'ids' => $ids]);
                $processed_delta = is_countable($items['data']) ? count($items['data']) : 0;
                $processed       = $info['processed'] + $processed_delta;
                $progress        = $info['total'] > 0 ? ($processed / $info['total']) : 0;

                $time = $timer->lap();
                $this->log(__FUNCTION__, json_encode(['time' => $time, 'total' => count($ids), 'type' => $import_type, 'days' => $days, 'next_page' => $next_page, 'ids' => $ids]));

                return [
                    // 'cursor' => $next_cursor,
                    'processed' => $processed,
                    'progress'  => $progress,
                    'args'      => [
                         ...$info['args'],
                        'page' => $next_page,
                    ],
                ];
            } catch (Exception $e) {
                $this->log(__FUNCTION__, 'ERROR', [
                    'message' => $e->getMessage(),
                    'code'    => $e->getCode(),
                    'line'    => $e->getLine(),
                    'file'    => $e->getFile(),
                    'trace'   => $e->getTraceAsString(),
                ]);
            }
        } else {
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
        $this->log('T14 Import Complete');
    }
}

trait Supplier_T14_ImportManager
{
    public function get_importer()
    {
        return T14ImportManager::instance();
    }
}
