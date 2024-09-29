<?php
/**
 * COPS (Calibre OPDS PHP Server) class file
 *
 * @author mikespub
 * @deprecated 3.1.0 use index.php/zipfs instead
 */

use SebLucas\Cops\Input\Request;
use SebLucas\Cops\Calibre\Book;

if (!empty($_SERVER['SCRIPT_NAME']) && str_contains($_SERVER['SCRIPT_NAME'], '/vendor/')) {
    echo "Unable to run in /vendor/ directory";
    return;
}
if (php_sapi_name() === 'cli') {
    return;
}
require_once __DIR__ . '/config.php';

// don't try to match path params here
$request = new Request(false);
$path = $request->path();
if (empty($path) || $path == '/') {
    Request::notFound();
}
$path = substr($path, 1);
$matches = [];
if (!preg_match('/^(\d+)\/(.+)$/', $path, $matches)) {
    Request::notFound();
}
$idData = $matches[1];
if (empty($idData)) {
    // this will call exit()
    $request->notFound();
}
$component = $matches[2];
if (empty($component)) {
    // this will call exit()
    $request->notFound();
}

try {
    $book = Book::getBookByDataId($idData, $request->database());
    if (!$book) {
        throw new Exception('Unknown data ' . $idData);
    }
    $epub = $book->getFilePath('EPUB', $idData);
    if (!$epub || !file_exists($epub)) {
        throw new Exception('Unknown file ' . $epub);
    }
    $zip = new ZipArchive();
    $res = $zip->open($epub, ZipArchive::RDONLY);
    if ($res !== true) {
        throw new Exception('Invalid file ' . $epub);
    }
    $res = $zip->locateName($component);
    if ($res === false) {
        throw new Exception('Unknown component ' . $component);
    }
    $expires = 60 * 60 * 24 * 14;
    header('Pragma: public');
    header('Cache-Control: maxage=' . $expires);
    header('Expires: ' . gmdate('D, d M Y H:i:s', time() + $expires) . ' GMT');

    echo $zip->getFromName($component);
    $zip->close();
} catch (Exception $e) {
    error_log($e);
    $request->notFound();
}
