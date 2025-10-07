<?php
require_once __DIR__ . '/vendor/autoload.php';

use App\Database;

$config = require __DIR__ . '/config.php';
$db = Database::getInstance($config);

echo "Analyzing swaps for anomalies...\n";

// Analysis window: last 10 minutes
$timeWindow = 10;

// Get recent swaps
$recentSwaps = $db->fetchAll(
    "SELECT * FROM swaps WHERE created_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)",
    [$timeWindow]
);

$swapCount = count($recentSwaps);
$uniqueTraders = count(array_unique(array_column($recentSwaps, 'sender')));

echo "Last {$timeWindow} min: {$swapCount} swaps, {$uniqueTraders} unique traders\n";

$alerts = [];

// Rule 1: High swap activity (pump warning)
if ($swapCount > 30) {
    $score = min(1.0, $swapCount / 50);
    $alerts[] = [
        'type' => 'PumpWarning',
        'description' => "High swap activity detected ({$swapCount} swaps in {$timeWindow} min)",
        'score' => $score
    ];
    echo "Alert: PumpWarning (score: {$score})\n";
}

// Rule 2: Low trader diversity with high volume (manipulation)
if ($uniqueTraders < 5 && $swapCount > 20) {
    $score = 1.0 - ($uniqueTraders / 10);
    $alerts[] = [
        'type' => 'Manipulation',
        'description' => "Low trader diversity with high volume ({$uniqueTraders} traders, {$swapCount} swaps)",
        'score' => $score
    ];
    echo "Alert: Manipulation (score: {$score})\n";
}

// Rule 3: Liquidity warning (simplified - based on large swaps)
// TODO: Implement proper liquidity add/remove event tracking
$largeSwaps = array_filter($recentSwaps, function($swap) {
    return ($swap['amount0_in'] + $swap['amount1_out']) > 1000; // Threshold
});

if (count($largeSwaps) > 5) {
    $score = 0.7;
    $alerts[] = [
        'type' => 'LiquidityWarning',
        'description' => "Multiple large swaps detected (" . count($largeSwaps) . " large transactions)",
        'score' => $score
    ];
    echo "Alert: LiquidityWarning (score: {$score})\n";
}

// Insert alerts into database
foreach ($alerts as $alert) {
    $db->insert(
        "INSERT INTO alerts (token_pair, alert_type, description, score, created_at) 
         VALUES (?, ?, ?, ?, NOW())",
        [
            $config['polygon']['pair_address'],
            $alert['type'],
            $alert['description'],
            $alert['score']
        ]
    );
}

// Write alerts to JSON file for quick access
$publicAlerts = $db->fetchAll(
    "SELECT * FROM alerts ORDER BY created_at DESC LIMIT 50"
);

$alertsFile = __DIR__ . '/public/alerts.json';
file_put_contents($alertsFile, json_encode($publicAlerts, JSON_PRETTY_PRINT));

echo "Analysis complete. Generated " . count($alerts) . " new alerts.\n";

// NOTE: ML integration point
// Example: $predictions = $mlService->detectAnomalies($recentSwaps);
