<?php
require_once __DIR__ . '/../vendor/autoload.php';

use App\Database;
use App\SignatureVerifier;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$config = require __DIR__ . '/../config.php';
$db = Database::getInstance($config);
$verifier = new SignatureVerifier();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Route: GET /api/nonce
if ($uri === '/api/nonce' && $method === 'GET') {
    $address = $_GET['address'] ?? '';
    
    if (!preg_match('/^0x[a-fA-F0-9]{40}$/', $address)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid address']);
        exit;
    }
    
    $nonce = $verifier->generateNonce();
    
    $db->query(
        "INSERT INTO nonces (address, nonce, created_at) VALUES (?, ?, NOW())",
        [$address, $nonce]
    );
    
    $db->query("DELETE FROM nonces WHERE created_at < DATE_SUB(NOW(), INTERVAL 10 MINUTE)");
    
    echo json_encode(['nonce' => $nonce]);
    exit;
}

// Route: POST /api/auth/verify
if ($uri === '/api/auth/verify' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $address = $input['address'] ?? '';
    $message = $input['message'] ?? '';
    $signature = $input['signature'] ?? '';
    
    if (!$address || !$message || !$signature) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing parameters']);
        exit;
    }
    
    preg_match('/Nonce: ([a-f0-9]+)/', $message, $matches);
    $nonce = $matches[1] ?? '';
    
    $nonceRecord = $db->fetchOne(
        "SELECT * FROM nonces WHERE address = ? AND nonce = ? AND created_at > DATE_SUB(NOW(), INTERVAL 10 MINUTE)",
        [$address, $nonce]
    );
    
    if (!$nonceRecord) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired nonce']);
        exit;
    }
    
    if (!$verifier->verifySignature($message, $signature, $address)) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid signature']);
        exit;
    }
    
    $db->query("DELETE FROM nonces WHERE id = ?", [$nonceRecord['id']]);
    
    $payload = [
        'address' => $address,
        'iat' => time(),
        'exp' => time() + (24 * 60 * 60)
    ];
    
    $token = JWT::encode($payload, $config['app']['jwt_secret'], 'HS256');
    
    echo json_encode([
        'success' => true,
        'token' => $token,
        'address' => $address
    ]);
    exit;
}

// NEW: Route: GET /api/pairs - Get list of monitored pairs
if ($uri === '/api/pairs' && $method === 'GET') {
    $pairs = [];
    foreach ($config['polygon']['pairs'] as $pairConfig) {
        if ($pairConfig['enabled']) {
            $stats = $db->fetchOne(
                "SELECT total_swaps, unique_traders, last_updated FROM pair_stats WHERE pair_address = ?",
                [$pairConfig['address']]
            );
            
            $pairs[] = [
                'name' => $pairConfig['name'],
                'address' => $pairConfig['address'],
                'token0' => $pairConfig['token0'],
                'token1' => $pairConfig['token1'],
                'total_swaps' => $stats['total_swaps'] ?? 0,
                'unique_traders' => $stats['unique_traders'] ?? 0,
                'last_updated' => $stats['last_updated'] ?? null
            ];
        }
    }
    
    echo json_encode(['pairs' => $pairs]);
    exit;
}

// UPDATED: Route: GET /api/alerts (with optional pair filter)
if ($uri === '/api/alerts' && $method === 'GET') {
    $limit = $_GET['limit'] ?? 20;
    $pairAddress = $_GET['pair'] ?? null;
    
    if ($pairAddress) {
        $alerts = $db->fetchAll(
            "SELECT * FROM alerts WHERE pair_address = ? ORDER BY created_at DESC LIMIT ". (int)$limit,
            [$pairAddress]
        );
    } else {
        $alerts = $db->fetchAll(
            "SELECT * FROM alerts ORDER BY created_at DESC LIMIT ".(int)$limit
        );
    }
    
    echo json_encode(['alerts' => $alerts]);
    exit;
}

// UPDATED: Route: GET /api/stats (with optional pair filter)
if ($uri === '/api/stats' && $method === 'GET') {
    $pairAddress = $_GET['pair'] ?? null;
    
    if ($pairAddress) {
        // Stats for specific pair
        $swapCount = $db->fetchOne(
            "SELECT COUNT(*) as count FROM swaps WHERE pair_address = ?",
            [$pairAddress]
        )['count'] ?? 0;
        
        $traderCount = $db->fetchOne(
            "SELECT COUNT(DISTINCT sender) as count FROM swaps WHERE pair_address = ?",
            [$pairAddress]
        )['count'] ?? 0;
        
        $lastUpdate = $db->fetchOne(
            "SELECT MAX(created_at) as updated FROM swaps WHERE pair_address = ?",
            [$pairAddress]
        )['updated'] ?? '';
        
        $alertCount = $db->fetchOne(
            "SELECT COUNT(*) as count FROM alerts WHERE pair_address = ?",
            [$pairAddress]
        )['count'] ?? 0;
        
    } else {
        // Overall stats
        $swapCount = $db->fetchOne("SELECT COUNT(*) as count FROM swaps")['count'] ?? 0;
        $traderCount = $db->fetchOne("SELECT COUNT(DISTINCT sender) as count FROM swaps")['count'] ?? 0;
        $lastUpdate = $db->fetchOne("SELECT MAX(created_at) as updated FROM swaps")['updated'] ?? '';
        $alertCount = $db->fetchOne("SELECT COUNT(*) as count FROM alerts")['count'] ?? 0;
    }
    
    echo json_encode([
        'swaps' => (int)$swapCount,
        'traders' => (int)$traderCount,
        'alerts' => (int)$alertCount,
        'updated' => $lastUpdate
    ]);
    exit;
}

// UPDATED: Route: GET /api/swaps (with optional pair filter)
if ($uri === '/api/swaps' && $method === 'GET') {
    $limit = $_GET['limit'] ?? 50;
    $pairAddress = $_GET['pair'] ?? null;
    
    if ($pairAddress) {
        $swaps = $db->fetchAll(
            "SELECT * FROM swaps WHERE pair_address = ? ORDER BY block_number DESC LIMIT ".(int)$limit,
            [$pairAddress]
        );
    } else {
        $swaps = $db->fetchAll(
            "SELECT * FROM swaps ORDER BY block_number DESC LIMIT ".(int)$limit
        );
    }
    
    echo json_encode(['swaps' => $swaps]);
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Not found']);
