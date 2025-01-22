<?php
/**
 * Plugin Name: CI Store Plugin
 * Plugin URI: http://www.contentointeractive.com
 * Description: Integrate store
 * Version: 1.0.0
 * Author: CI
 * Author URI: http://www.contentointeractive.com
 * License: GPL2
 */

define('CI_STORE_PLUGIN', plugin_dir_path(__FILE__));
define('CI_STORE_PLUGIN_FILE', __FILE__);
define('CI_ERROR_LOG_FILEPATH', CI_STORE_PLUGIN . 'logs/CI_ERROR_LOG.log');
define('CI_ERROR_LOG', CI_ERROR_LOG_FILEPATH);
define('CI_VERSION', '0.0.51'); // enqueued scripts get this version - update to bust the cache

require_once CI_STORE_PLUGIN . 'Plugin.php';

if (class_exists('CIStore\Plugin')) {
    new CIStore\Plugin();
}
