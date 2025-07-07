<?php

namespace intity\App;

use ZipArchive;
use Exception;

/**
 * Summary of get_config
 * @param string $base
 * @return array<mixed>
 */
function get_config($base)
{
    $config = require __DIR__ . '/config.php';
    $config = fix_base_url($base, $config);
    return $config;
}

/**
 * Summary of fix_base_url
 * @param string $base
 * @param array<mixed> $config
 * @return array<mixed>
 */
function fix_base_url($base, $config)
{
    if (!empty($base) && $config['base_url'] !== $base) {
        if (str_ends_with($base, $config['base_url'])) {
            $config['dist_url'] = substr($base, 0, strlen($base) - strlen($config['base_url'])) . $config['dist_url'];
        } else {
            // If the base URL does not match, we assume dist_url is relative to the base URL
            $config['dist_url'] = $base . $config['dist_url'];
        }
        $config['base_url'] = $base;
    }
    return $config;
}

/**
 * Summary of is_valid_path
 * @param string $path
 * @return bool
 */
function is_valid_path($path)
{
    return !empty($path) && preg_match('~^/[0-9a-f]+$~', $path);
}

/**
 * Summary of send_filelist
 * @param array<mixed> $config
 * @return void
 */
function send_filelist($config)
{
    $filelist = '';
    if (is_array($config['files']) && count($config['files']) > 0) {
        foreach ($config['files'] as $hash => $file) {
            $name = basename($file);
            // Use hash of filepath as key to ensure uniqueness - do NOT include file extension in the link
            $filelist .= "<li><a href=\"{$config['base_url']}index.php/{$hash}\">{$name}</a></li>";
        }
    } else {
        $filelist = '<li>No files available</li>';
    }

    echo <<<_EOT
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{$config['title']}</title>
            <meta name="description" content="{$config['description']}">
        </head>
        <body>
            <div id="reader" class="reader">
                <h1>{$config['title']}</h1>
                <p>{$config['description']}</p>
                <div id="book-list">
                    <ul>
                        {$filelist}
                    </ul>
                </div>
                <p>Version: {$config['version']}</p>
            </div>
        </body>
        </html>
        _EOT;
}

/**
 * Summary of send_reader
 * @param string $path_info
 * @param array<mixed> $config
 * @return void
 */
function send_reader($path_info, $config)
{
    $hash = ltrim($path_info, '/');
    $file = $config['files'][$hash] ?? null;
    if (empty($file) || !file_exists($file)) {
        header($_SERVER['SERVER_PROTOCOL'] . ' 404 Not Found');
        echo "File not found: {$hash}";
        return;
    }
    // bookPath has a trailing slash to ensure it works with zipfs.php - do NOT include file extension in the link
    $bookPath = $config['base_url'] . 'zipfs.php/' . $hash . '/';
    $variables = [
        'title' => $config['title'],
        'description' => $config['description'],
        'version' => $config['version'],
        'base_url' => $config['base_url'],
        'dist' => rtrim($config['dist_url'], '/'),
        'bookPath' => $bookPath,
    ];
    render_template($config['template'], $variables);
}

/**
 * Summary of render_template
 * @param string $template
 * @param array<string> $variables
 * @return void
 */
function render_template($template, $variables)
{
    if (!file_exists($template)) {
        echo "Template not found: {$template}";
        return;
    }
    $contents = file_get_contents($template);
    $matches = [];
    if (preg_match_all('/{{(\w+)}}/', $contents, $matches)) {
        foreach ($matches[1] as $key) {
            if (isset($variables[$key])) {
                $contents = str_replace("{{{$key}}}", $variables[$key], $contents);
            } else {
                $contents = str_replace("{{{$key}}}", '', $contents);
            }
        }
    } else {
        // If no variables found, just return the template as is
    }
    echo $contents;
}

/**
 * Summary of send_component
 * @param string $zipfile
 * @param string $component
 * @throws \Exception
 * @return void
 */
function send_component($zipfile, $component)
{
    $zip = new ZipArchive();
    $res = $zip->open($zipfile, ZipArchive::RDONLY);
    if ($res !== true) {
        throw new Exception('Invalid file ' . htmlspecialchars($zipfile));
    }
    $res = $zip->locateName($component);
    if ($res === false) {
        throw new Exception('Unknown component ' . htmlspecialchars($component));
    }
    $expires = 60 * 60 * 24 * 14;
    header('Pragma: public');
    header('Cache-Control: maxage=' . $expires);
    header('Expires: ' . gmdate('D, d M Y H:i:s', time() + $expires) . ' GMT');

    echo $zip->getFromName($component);
    $zip->close();
}
