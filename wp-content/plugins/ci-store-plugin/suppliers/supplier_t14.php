<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Supplier.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/vendor/autoload.php';

use League\OAuth2\Client\Provider\AbstractProvider;
use League\OAuth2\Client\Provider\Exception\IdentityProviderException;
use League\OAuth2\Client\Provider\GenericProvider;

// Replace with your OAuth 2.0 provider's configuration
$provider = new GenericProvider([
    'clientId'                => 'df98c919f33c6144f06bcfc287b984f809e33322',
    'clientSecret'            => '021320311e77c7f7e661d697227f80ae45b548a9',
    'redirectUri'             => 'http://apitest.turn14.com',
    // 'urlAuthorize'            => 'https://authorization-server.com/authorize',
    'urlAccessToken'          => 'https://apitest.turn14.com/v1/token',
    // 'urlResourceOwnerDetails' => 'https://api.example.com/me',
]);

// Step 1: Authorization Request
$authorizationUrl = $provider->getAuthorizationUrl();

// Step 2: Redirect user to authorization URL
header('Location: ' . $authorizationUrl);
exit;

// Step 3: Handle authorization code (callback endpoint)
$code = $_GET['code'];
$accessToken = $provider->getAccessToken('authorization_code', [
    'code' => $code
]);

// Step 4: Access protected resources
try {
    // Use the access token to access protected resources
    $resourceOwner = $provider->getResourceOwner($accessToken);
    $userDetails = $resourceOwner->toArray();
    var_dump($userDetails);
} catch (IdentityProviderException $e) {
    // Handle errors
    echo $e->getMessage();
}

class Supplier_WPS extends Supplier
{
    public function __construct()
    {
        parent::__construct([
            'key' => 't14',
            'name' => 'Turn14',
            'supplierClass' => 'WooDropship\\Suppliers\\Turn14',
            'import_version' => '0.1',
        ]);
    }

    public function get_api($path, $params = [])
    {
        $clientId = 'df98c919f33c6144f06bcfc287b984f809e33322';
        $clientSecret = '021320311e77c7f7e661d697227f80ae45b548a9';

        $query_string = http_build_query($params);
        $remote_url = implode("/", ["http://api.wps-inc.com", trim($path, '/')]) . '?' . $query_string;
        $response = wp_safe_remote_request($remote_url, ['headers' => [
            'Authorization' => "Bearer aybfeye63PtdiOsxMbd5f7ZAtmjx67DWFAQMYn6R",
            'Content-Type' => 'application/json',
        ]]);
        if (is_wp_error($response)) {
            return ['error' => 'Request failed'];
        }
        $response_body = wp_remote_retrieve_body($response);
        $data = json_decode($response_body, true);
        if (isset($data['message'])) {
            $data['error'] = $data['message'];
        }
        return $data;
    }

    public function get_product($product_id)
    {
        // $params = [];
        // $params['include'] = implode(',', [
        //     'features', //
        //     'tags',
        //     'attributekeys',
        //     'attributevalues',
        //     'items',
        //     'items.images',
        //     'items.inventory',
        //     'items.attributevalues',
        //     'items.taxonomyterms',
        //     'taxonomyterms',
        //     'items:filter(status_id|NLA|ne)',
        // ]);
        // $product = $this->get_api('products/' . $product_id, $params);
        // if(isset($product['status_code']) && $product['status_code']===404){
        //     return null; // product doesn't exist
        // }
        // $product['data']['attributekeys']['data'] = get_western_attributes_from_product($product);
        return [];//$product;
    }
}
