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
        'pairs' => [
            [
                'name' => 'USDC/WETH',
                'address' => '0x853ee4b2a13f8a742d64c8f088be7ba2131f670d',
                'token0' => 'USDC',
                'token1' => 'WETH',
                'token0_address' => '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
                'token1_address' => '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
                'enabled' => true,
                'priority' => 1
            ],
            [
                'name' => 'MATIC/USDC',
                'address' => '0x6e7a5FAFcec6BB1e78bAE2A1F0B612012BF14827',
                'token0' => 'MATIC',
                'token1' => 'USDC',
                'token0_address' => '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
                'token1_address' => '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
                'enabled' => true,
                'priority' => 2
            ],
            [
                'name' => 'QUICK/USDC',
                'address' => '0x1f1e4c845183ef6d50e9609f16f6f9cae43bc9cb',
                'token0' => 'QUICK',
                'token1' => 'USDC',
                'token0_address' => '0xb5c064f955d8e7f38fe0460c556a72987494ee17',
                'token1_address' => '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
                'enabled' => true,
                'priority' => 3
            ]
        ]
    ],
    'app' => [
        'url' => $_ENV['APP_URL'] ?? 'http://localhost:8000',
        'jwt_secret' => $_ENV['JWT_SECRET'] ?? 'change-this-secret-key',
    ],
];
