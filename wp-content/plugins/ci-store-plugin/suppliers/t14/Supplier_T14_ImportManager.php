<?php

include_once CI_STORE_PLUGIN . 'suppliers/ImportManager.php';
include_once CI_STORE_PLUGIN . 'suppliers/t14/Supplier_T14.php';

class T14ImportManager extends CIStore\Suppliers\ImportManager {

    public function __construct($logger = null)
    {
        parent::__construct('t14', $logger);
    }

    public function custom_start($days, $page, $import_type)
    {
        return parent::start([
            'days' => $days,
            'page' => $page,
            'import_type' => $import_type,
        ]);
    }

    public function get_default_args()
    {
        return [
            'days' => 1,
            'page' => 1,
            'import_type' => 'import',
        ];
    }

    public function before_start($info)
    {
        $supplier = \Supplier_T14::instance();
        $supplier->log('before_start()');
        $days = $info['args']['days'] ?? $this->get_default_args()['days'];
        $total = $supplier->get_total_remote_products($days);
        $supplier->log('before_start() $total');
        return ['total' => $total];
    }

    public function do_process($info)
    {
        $this->log('T14ImportManager::do_process() ' . json_encode($info['args']));
        $page = $info['args']['page'];
        $next_page = $page + 1;
        $import_type = $info['args']['import_type'] ?? 'default';

        return [
            // 'cursor' => $next_cursor,
            'processed' => 0,
            'progress' => 0,
            'args' => [
                 ...$info['args'],
                'page' => $next_page,
            ],
        ];

        if (is_numeric($page)) {
            try {
                $days = $info['args']['days'] ?? $this->get_default_args()['days'];
                $supplier = \Supplier_T14::instance();

                // $items = $supplier->get_products_page($cursor, 'basic', $updated_at);
                switch ($import_type) {
                    // case 'patch':
                    //     $items = $supplier->patch_products_page($cursor, $updated_at);
                    //     break;

                    case 'import':
                    default:
                        $items = $supplier->import_products_page($page, $days);
                }

                $ids = array_map(fn($item) => $item['id'], $items['data'] ?? []);
                $this->log(json_encode(['cursor' => $items['meta']['cursor']], JSON_PRETTY_PRINT));
                $next_page = $items['meta']['cursor']['next'] ?? false;
                $this->log('T14ImportManager::do_process() ' . json_encode(['type' => $import_type, 'cursor' => $cursor, 'next_cursor' => $next_cursor, 'date' => $updated_at, 'ids' => $ids]));
                $processed_delta = is_countable($items['data']) ? count($items['data']) : 0;
                $processed = $info['processed'] + $processed_delta;
                $progress = $info['total'] > 0 ? ($processed / $info['total']) : 0;

                return [
                    // 'cursor' => $next_cursor,
                    'processed' => $processed,
                    'progress' => $progress,
                    'args' => [
                         ...$info['args'],
                        'page' => $next_page,
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

    public function get_auto_import_args()
    {
        $info = $this->get_info();

        if ($info['completed']) {
            $completed = new \DateTime($info['completed']);
            $updated_at = $completed->format('Y-m-d');
            return [
                'updated_at' => $updated_at,
                'cursor' => '',
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
    // private string $default_updated_at = '2023-01-01';

    public function get_importer()
    {
        return new T14ImportManager($this->logger);
    }
}
