<?php
// Load environment variables
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($key, $value) = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($value);
    }
}

return [
    'db' => [
        'dsn' => $_ENV['DB_DSN'] ?? 'mysql:host=localhost;dbname=trading_agent',
        'user' => $_ENV['DB_USER'] ?? 'root',
        'pass' => $_ENV['DB_PASS'] ?? '',
    ],
    'polygon' => [
        'rpc' => $_ENV['POLYGON_RPC'] ?? 'https://polygon-rpc.com',
        'pair_address' => $_ENV['PAIR_ADDRESS'] ?? '0x...',
    ],
    'app' => [
        'url' => $_ENV['APP_URL'] ?? 'http://localhost:8000',
        'jwt_secret' => $_ENV['JWT_SECRET'] ?? 'change-this-secret-key',
    ],
];
