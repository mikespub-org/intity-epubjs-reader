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
if (is_valid_path($path_info)) {
    send_reader($path_info, $config);
    return;
}
send_filelist($config);
