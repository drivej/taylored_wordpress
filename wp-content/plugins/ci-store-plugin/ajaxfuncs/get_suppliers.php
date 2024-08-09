<?php

namespace CIStore\Ajax;

include_once CI_STORE_PLUGIN . 'suppliers/Suppliers.php';

function get_suppliers($params = [])
{
    return \CIStore\Suppliers\get_suppliers();
}
