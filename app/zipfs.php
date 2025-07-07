<?php

namespace intity\App;

if (!empty($_SERVER['SCRIPT_NAME']) && str_contains($_SERVER['SCRIPT_NAME'], '/vendor/')) {
    echo "Unable to run in /vendor/ directory";
    return;
}
if (php_sapi_name() === 'cli') {
    return;
}

require_once __DIR__ . '/functions.php';
$base = dirname($_SERVER['SCRIPT_NAME']) . '/';
$config = get_config($base);

$path_info = $_SERVER['PATH_INFO'] ?? '';

$matches = [];
if (empty($_SERVER['PATH_INFO']) || !preg_match('~^/([0-9a-f]+)/(.+)$~', $path_info, $matches)) {
    header($_SERVER['SERVER_PROTOCOL'] . ' 404 Not Found');
    echo "File not found: " . htmlspecialchars($path_info);
    return;
}
// bookPath has a trailing slash to ensure it works with zipfs.php - do NOT include file extension in the link
$hash = $matches[1];
$component = $matches[2];
$zipfile = $config['files'][$hash] ?? null;
if (!file_exists($zipfile) || empty($component)) {
    header($_SERVER['SERVER_PROTOCOL'] . ' 404 Not Found');
    echo "File not found: " . htmlspecialchars($path_info);
    return;
}
send_component($zipfile, $component);
