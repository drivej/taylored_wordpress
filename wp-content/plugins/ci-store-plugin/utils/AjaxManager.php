<?php

// namespace AjaxHandlers;
include_once CI_STORE_PLUGIN . 'ajax/index.php';

class AjaxManager
{
    protected $actions = [];

    public function __construct()
    {
        add_action('wp_ajax_ci_api_handlerx', array($this, 'handle_ajax')); //'handle_ajax_scheduled_events_api');

        // any function in the AjaxHandlers namespace is added as a ajax endpoint
        $allFunctions = get_defined_functions();

        foreach ($allFunctions['user'] as $functionName) {
            $reflectionFunction = new \ReflectionFunction($functionName);
            $functionNamespace = $reflectionFunction->getNamespaceName();

            if ($functionNamespace === 'AjaxHandlers') {
                $functionName = $reflectionFunction->getName();
                $parts = explode('\\', $functionName);
                $action = end($parts);
                $this->add($action, $functionName);
            }
        }

        // $this->add('get_actions', 'get_actions');
    }

    // public function get_actions()
    // {
    //     return $this->actions;
    // }

    /**
     * @param string $cmd
     * @param string $action
     */
    public function add($cmd, $action)
    {
        $this->actions[$cmd] = $action;
    }

    public static function get_param($key, $defaultValue = '', $parent = null)
    {
        $parent = isset($parent) ? $parent : $_GET;
        return isset($parent[$key]) ? $parent[$key] : $defaultValue;
    }

    public function handle_ajax()
    {
        $cmd = $this->get_param('cmd');
        if (is_callable($this->actions[$cmd])) {
            $result = call_user_func($this->actions[$cmd], $_GET);
            wp_send_json($result);
        } else {
            wp_send_json(['error' => 'cmd not found']);
        }
    }
}
