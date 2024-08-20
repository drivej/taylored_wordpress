<?php

namespace CIStore\Suppliers;

function get_suppliers()
{
    return [
        ['key' => 'wps', 'name' => 'Western Power Sports'],
        // ['key' => 't14', 'name' => 'Turn14'],
    ];
}

function get_supplier($supplier_key)
{
    switch ($supplier_key) {
        case 'wps':
            include_once CI_STORE_PLUGIN . 'suppliers/wps/Supplier_WPS.php';
            return \Supplier_WPS::instance();
            break;

        // case 't14':
        //     include_once CI_STORE_PLUGIN . 'suppliers/t14/Supplier_T14.php';
        //     return \Supplier_T14::instance();
        //     break;
    }
    return false;
}
