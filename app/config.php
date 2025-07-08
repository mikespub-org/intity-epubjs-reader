<?php

$config = [
    'title' => 'Intity Epub.js Reader',
    'description' => 'Epub.js Reader with zipfs.php',
    'version' => '2025.07.07',
    'template' => dirname(__DIR__) . '/assets/template.html',
    'base_url' => '/app/',
    'dist_url' => '/dist/',
    'libraries' => [
        'tests' => dirname(__DIR__) . '/tests',
        // Add more libraries here if needed
    ],
    'files' => [],
];

// Add all epub files from the libraries to the config
foreach ($config['libraries'] as $name => $dirpath) {
    if (is_dir($dirpath)) {
        $files = glob("{$dirpath}/*.epub");
        foreach ($files as $file) {
            // Use hash of filepath as key to ensure uniqueness - do NOT include file extension in the key
            $hash = hash('md5', $file, false);
            $config['files'][$hash] = $file;
        }
    }
}

return $config;
