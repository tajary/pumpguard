<?php
require_once __DIR__ . '/../vendor/autoload.php';

use App\Database;
use App\SignatureVerifier;
use Firebase\JWT\JWT;
//use Firebase\JWT\Key;

$config = require __DIR__ . '/../config.php';
$db = Database::getInstance($config);
$verifier = new SignatureVerifier();

//~ header('Content-Type: application/json');
//~ header('Access-Control-Allow-Origin: *');
//~ header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
//~ header('Access-Control-Allow-Headers: Content-Type, Authorization');

//~ if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    //~ exit(0);
//~ }


$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';

// Set CORS headers
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, Authorization, X-Requested-With');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
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
    
    // Store nonce
    $db->query(
        "INSERT INTO nonces (address, nonce, created_at) VALUES (?, ?, NOW())",
        [$address, $nonce]
    );
    
    // Clean old nonces (older than 10 minutes)
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
    
    // Extract nonce from message
    preg_match('/Nonce: ([a-f0-9]+)/', $message, $matches);
    $nonce = $matches[1] ?? '';
    
    // Verify nonce exists
    $nonceRecord = $db->fetchOne(
        "SELECT * FROM nonces WHERE address = ? AND nonce = ? AND created_at > DATE_SUB(NOW(), INTERVAL 10 MINUTE)",
        [$address, $nonce]
    );
    
    if (!$nonceRecord) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired nonce']);
        exit;
    }
    
    // Verify signature
    if (!$verifier->verifySignature($message, $signature, $address)) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid signature']);
        exit;
    }
    
    // Delete used nonce
    $db->query("DELETE FROM nonces WHERE id = ?", [$nonceRecord['id']]);
    
    // Generate JWT
    $payload = [
        'address' => $address,
        'iat' => time(),
        'exp' => time() + (24 * 60 * 60) // 24 hours
    ];
    
    $token = JWT::encode($payload, $config['app']['jwt_secret'], 'HS256');
    
    echo json_encode([
        'success' => true,
        'token' => $token,
        'address' => $address
    ]);
    exit;
}

// Route: GET /api/alerts
if ($uri === '/api/alerts' && $method === 'GET') {
    $limit = $_GET['limit'] ?? 20;
    $alerts = $db->fetchAll(
        "SELECT * FROM alerts ORDER BY created_at DESC LIMIT 0, ". (int)$limit
    );
    
    echo json_encode(['alerts' => $alerts]);
    exit;
}

// Route: GET /api/stats
if ($uri === '/api/stats' && $method === 'GET') {
    $swapCount = $db->fetchOne("SELECT COUNT(*) as count FROM swaps")['count'] ?? 0;
    $traderCount = $db->fetchOne("SELECT COUNT(DISTINCT sender) as count FROM swaps")['count'] ?? 0;
    $lastUpdate = $db->fetchOne("SELECT MAX(created_at) as updated FROM swaps")['updated'] ?? '';
    
    echo json_encode([
        'swaps' => (int)$swapCount,
        'traders' => (int)$traderCount,
        'updated' => $lastUpdate
    ]);
    exit;
}

// Route: GET /api/swaps
if ($uri === '/api/swaps' && $method === 'GET') {
    $limit = $_GET['limit'] ?? 50;
    $swaps = $db->fetchAll(
        "SELECT * FROM swaps ORDER BY block_number DESC LIMIT ?",
        [(int)$limit]
    );
    
    echo json_encode(['swaps' => $swaps]);
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Not found']);
