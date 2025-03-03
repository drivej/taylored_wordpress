<?php
namespace CIStore\Suppliers;

function get_suppliers()
{
    return [
        [
            'key'            => 'wps',
            'name'           => 'Western Power Sports',
            'import_options' => [
                'products',
                'vehicles',
                'product_plp',
                'product_vehicles',
                // 'item_vehicles',
                'taxonomy',
                'patch',
            ],
        ],
        [
            'key'            => 't14',
            'name'           => 'Turn14',
            'import_options' => [
                'import',
            ],
        ],
    ];
}

function get_supplier($supplier_key)
{
    switch ($supplier_key) {
        case 'wps':
            include_once CI_STORE_PLUGIN . 'suppliers/wps/Supplier_WPS.php';
            return \Supplier_WPS::instance();
            break;

        case 't14':
            include_once CI_STORE_PLUGIN . 'suppliers/t14/Supplier_T14.php';
            return \Supplier_T14::instance();
            break;
    }
    return false;
}

// TODO: clean this up - we're using a global import version now
function get_supplier_import_version($supplier_key)
{
    return CI_IMPORT_VERSION;
    // switch ($supplier_key) {
    //     case 'wps':
    //         return '0.6';
    //         break;

    //     case 't14':
    //         return '0.3';
    //         break;
    // }
    // return '0.0';
}
