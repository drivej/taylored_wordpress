<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInit0204bd9e4c1bff54b9812baa102f6e20
{
    public static $prefixLengthsPsr4 = array (
        'W' => 
        array (
            'WooDropship\\' => 12,
        ),
    );

    public static $prefixDirsPsr4 = array (
        'WooDropship\\' => 
        array (
            0 => __DIR__ . '/../..' . '/src',
        ),
    );

    public static $classMap = array (
        'Composer\\InstalledVersions' => __DIR__ . '/..' . '/composer/InstalledVersions.php',
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->prefixLengthsPsr4 = ComposerStaticInit0204bd9e4c1bff54b9812baa102f6e20::$prefixLengthsPsr4;
            $loader->prefixDirsPsr4 = ComposerStaticInit0204bd9e4c1bff54b9812baa102f6e20::$prefixDirsPsr4;
            $loader->classMap = ComposerStaticInit0204bd9e4c1bff54b9812baa102f6e20::$classMap;

        }, null, ClassLoader::class);
    }
}
