<?php
// phpcs:ignoreFile
/**
 * Copyright (c) Contento Interactive
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Plugin Name: WooCommerce Drop-ship Suppliers
 * Description: Custom integration to tie WooCommerce order completion to order submission within other dropship suppliers.
 * Author: Robert Lester
 * Author URI: https://github.com/roblesterjr04
 * Version: 1.0
 * 
 */
 
// if(session_status() !== PHP_SESSION_ACTIVE) session_start(); // TODO: do we need this?
 
require_once "vendor/autoload.php";

new WooDropship\Plugin;