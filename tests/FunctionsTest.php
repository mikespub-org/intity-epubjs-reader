<?php

require_once dirname(__DIR__) . '/app/functions.php';

use PHPUnit\Framework\TestCase;

class FunctionsTest extends TestCase
{
    /** @var array<mixed> */
    private array $config;

    protected function setUp(): void
    {
        $this->config = require __DIR__ . '/config.test.php';
    }

    public function testGetConfig(): void
    {
        // Set up the environment
        $base = '/app/';

        // Call the function
        $config = intity\App\get_config($base);

        // Assert the output
        $this->assertIsArray($config);
    }

    public function testFixBaseUrl(): void
    {
        // Set up the environment
        $base = '/intity/app/';
        $config = $this->config;

        // Call the function
        $config = intity\App\fix_base_url($base, $config);

        // Assert the output
        $this->assertEquals($base, $config['base_url']);
    }

    public function testIsValidPath(): void
    {
        // Test a valid path
        $path = '/0ec42b3ea512677aaa60ac75551b1338';
        $this->assertTrue(intity\App\is_valid_path($path));

        // Test an invalid path
        $path = '/invalid-path';
        $this->assertFalse(intity\App\is_valid_path($path));
    }

    public function testSendFilelist(): void
    {
        // Set up the environment
        $config = $this->config;

        // Call the function
        ob_start();
        intity\App\send_filelist($config);
        $output = ob_get_clean();

        // Assert the output
        $this->assertStringContainsString('<li><a href="/app/index.php/0ec42b3ea512677aaa60ac75551b1338">quickstart.en.epub</a></li>', $output);
    }

    public function testRenderTemplate(): void
    {
        // Set up the environment
        $template = dirname(__DIR__) . '/assets/template.html';
        $variables = ['title' => 'Title', 'description' => 'Description'];

        // Call the function
        ob_start();
        intity\App\render_template($template, $variables);
        $output = ob_get_clean();

        // Assert the output
        $this->assertStringContainsString('Title', $output);
        $this->assertStringContainsString('Description', $output);
    }

    public function testSendReader(): void
    {
        // Set up the environment
        $path_info = '/0ec42b3ea512677aaa60ac75551b1338';
        $config = $this->config;

        // Call the function
        ob_start();
        intity\App\send_reader($path_info, $config);
        $output = ob_get_clean();

        // Assert the output
        $this->assertStringContainsString('const path = "/app/zipfs.php/0ec42b3ea512677aaa60ac75551b1338/";', $output);
    }
}
